import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { isToday, isThisWeek } from "date-fns";
import { Sidebar } from "@/components/diretoria/Sidebar";
import { TopBar } from "@/components/diretoria/TopBar";
import { MessageBubble } from "@/components/diretoria/MessageBubble";
import { Composer } from "@/components/diretoria/Composer";
import { ContextDrawer } from "@/components/diretoria/ContextDrawer";
import {
  AREAS,
  AreaId,
  AREA_TO_CHAT_TYPE,
  CHAT_TYPE_TO_AREA,
  ChatHistoryItem,
  CompanyContext,
  DEFAULT_CONTEXT,
  Message,
} from "@/lib/diretoria-data";
import { useAuth } from "@/lib/auth-context";
import {
  ApiCompany,
  ApiMessage,
  companiesApi,
  chatsApi,
  messagesApi,
} from "@/lib/api";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Group = "Hoje" | "Esta semana" | "Mês passado";

function dateToGroup(dateStr: string): Group {
  const d = new Date(dateStr);
  if (isToday(d)) return "Hoje";
  if (isThisWeek(d, { weekStartsOn: 1 })) return "Esta semana";
  return "Mês passado";
}

function apiToUiMessage(m: ApiMessage): Message {
  return {
    id: m.id,
    role: m.role === "system" ? "assistant" : m.role,
    content: m.content,
  };
}

function contextToCompanyData(ctx: CompanyContext): Partial<ApiCompany> {
  const descParts = [ctx.stage, ctx.size].filter(Boolean);
  return {
    name: ctx.name || "Minha empresa",
    description: descParts.join(" · ") || undefined,
    market: ctx.industry || undefined,
    valueProposition: ctx.offer || undefined,
    targetAudience: ctx.channels || undefined,
    icp: ctx.icp || undefined,
    benefits: ctx.goals || undefined,
  };
}

function companyToContext(c: ApiCompany): CompanyContext {
  const parts = c.description?.split(" · ") ?? [];
  return {
    name: c.name ?? "",
    industry: c.market ?? "",
    stage: parts[0] ?? "",
    size: parts[1] ?? "",
    offer: c.valueProposition ?? "",
    icp: c.icp ?? "",
    goals: c.benefits ?? "",
    channels: c.targetAudience ?? "",
  };
}

const Index = () => {
  const { token, user, logout } = useAuth();

  const [area, setArea] = useState<AreaId>("estrategia");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [desktopNavOpen, setDesktopNavOpen] = useState(false);

  const [company, setCompany] = useState<ApiCompany | null>(null);
  const [context, setContext] = useState<CompanyContext>(DEFAULT_CONTEXT);
  const [chatIdsByArea, setChatIdsByArea] = useState<Partial<Record<AreaId, string>>>({});
  const [threads, setThreads] = useState<Record<string, Message[]>>({});
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [homeInput, setHomeInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const areaMeta = AREAS.find((a) => a.id === area)!;
  const activeHistoryItem = history.find((h) => h.id === activeChatId);
  const activeTitle = activeHistoryItem?.title ?? "Nova conversa";
  const messages: Message[] = activeChatId ? (threads[activeChatId] ?? []) : [];
  const isHome = !activeChatId;

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Load companies and existing chats on mount
  useEffect(() => {
    if (!token) return;

    companiesApi
      .list(token)
      .then((list) => {
        if (list.length > 0) {
          setCompany(list[0]);
          setContext(companyToContext(list[0]));
        }
      })
      .catch(() => {});

    chatsApi
      .list(token)
      .then((chatList) => {
        const items: ChatHistoryItem[] = chatList.map((c) => ({
          id: c.id,
          area: CHAT_TYPE_TO_AREA[c.type] ?? "estrategia",
          title: c.company?.name ?? c.type,
          group: dateToGroup(c.createdAt),
        }));
        setHistory(items);

        const byArea: Partial<Record<AreaId, string>> = {};
        chatList.forEach((c) => {
          const a = CHAT_TYPE_TO_AREA[c.type];
          if (a) byArea[a] = c.id;
        });
        setChatIdsByArea(byArea);
      })
      .catch(() => {});
  }, [token]);

  const ensureCompany = async (): Promise<ApiCompany> => {
    if (company) return company;
    const created = await companiesApi.create(token!, { name: "Minha empresa" });
    setCompany(created);
    return created;
  };

  const loadMessagesForChat = async (chatId: string) => {
    if (threads[chatId]) return;
    try {
      const msgs = await messagesApi.list(token!, chatId);
      setThreads((prev) => ({
        ...prev,
        [chatId]: msgs.filter((m) => m.role !== "system").map(apiToUiMessage),
      }));
    } catch {}
  };

  const sendMessage = async (chatId: string, content: string) => {
    if (isLoading) return;
    const loadingId = `loading-${Date.now()}`;

    setThreads((prev) => ({
      ...prev,
      [chatId]: [
        ...(prev[chatId] ?? []),
        { id: crypto.randomUUID(), role: "user", content },
        { id: loadingId, role: "assistant", content: "", loading: true },
      ],
    }));
    setIsLoading(true);

    try {
      const response = await messagesApi.send(token!, chatId, content);
      setThreads((prev) => ({
        ...prev,
        [chatId]: prev[chatId]
          .filter((m) => m.id !== loadingId)
          .concat(apiToUiMessage(response)),
      }));
    } catch (err) {
      toast.error((err as Error).message || "Erro ao enviar mensagem");
      setThreads((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] ?? []).filter((m) => m.id !== loadingId),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const startConversation = async (targetArea: AreaId, firstMessage?: string) => {
    if (!token) return;
    try {
      const co = await ensureCompany();
      const chatType = AREA_TO_CHAT_TYPE[targetArea];
      let chatId = chatIdsByArea[targetArea];

      if (!chatId) {
        const chat = await chatsApi.getOrCreate(token, co.id, chatType);
        chatId = chat.id;
        setChatIdsByArea((prev) => ({ ...prev, [targetArea]: chatId }));

        const meta = AREAS.find((a) => a.id === targetArea)!;
        setHistory((prev) => [
          {
            id: chat.id,
            area: targetArea,
            title: firstMessage?.slice(0, 45) ?? meta.label,
            group: "Hoje",
          },
          ...prev.filter((h) => h.id !== chat.id),
        ]);
      } else {
        await loadMessagesForChat(chatId);
      }

      setArea(targetArea);
      setActiveChatId(chatId);
      setMobileNavOpen(false);

      if (firstMessage) {
        await sendMessage(chatId, firstMessage);
      }
    } catch (err) {
      toast.error((err as Error).message || "Erro ao iniciar conversa");
    }
  };

  const handleSend = async (text: string) => {
    if (!activeChatId) {
      await startConversation(area, text);
    } else {
      await sendMessage(activeChatId, text);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    const h = history.find((x) => x.id === chatId);
    if (h) setArea(h.area);
    setActiveChatId(chatId);
    setMobileNavOpen(false);
    await loadMessagesForChat(chatId);
  };

  const handleNew = () => {
    setActiveChatId(null);
    setMobileNavOpen(false);
  };

  const handleMenuToggle = () => {
    setMobileNavOpen((m) => !m);
    setDesktopNavOpen((d) => !d);
  };

  const submitHome = () => {
    const t = homeInput.trim();
    if (!t || isLoading) return;
    startConversation(area, t);
    setHomeInput("");
  };

  const handleContextSave = async (ctx: CompanyContext) => {
    setContext(ctx);
    const data = contextToCompanyData(ctx);
    try {
      if (company) {
        const updated = await companiesApi.update(token!, company.id, data);
        setCompany(updated);
      } else {
        const created = await companiesApi.create(token!, data);
        setCompany(created);
      }
      toast.success("Contexto salvo!");
    } catch (err) {
      toast.error((err as Error).message || "Erro ao salvar contexto");
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <TopBar
        area={area}
        onChange={setArea}
        onMenu={handleMenuToggle}
        showTabs={!isHome}
        userEmail={user?.email}
        onLogout={logout}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          history={history}
          activeId={activeChatId ?? ""}
          onSelect={handleSelectChat}
          onNew={handleNew}
          onOpenContext={() => setDrawerOpen(true)}
          area={area}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
          desktopOpen={desktopNavOpen}
        />

        <main className="flex flex-1 flex-col overflow-hidden">
          {isHome ? (
            <div className="flex flex-1 items-center justify-center px-4 py-8">
              <div className="w-full max-w-xl">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft md:p-10">
                  <p className="text-center text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    DiretorIA
                  </p>
                  <h1 className="mt-3 text-center font-display text-2xl font-semibold leading-tight text-balance md:text-3xl">
                    Por onde vamos começar?
                  </h1>

                  <div className="mt-6 flex flex-wrap justify-center gap-1.5">
                    {AREAS.map((a) => {
                      const active = a.id === area;
                      return (
                        <button
                          key={a.id}
                          onClick={() => setArea(a.id)}
                          className={cn(
                            "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary/60 text-foreground/70 hover:bg-secondary",
                          )}
                        >
                          {a.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex items-end gap-2 rounded-2xl border border-border bg-background p-2 focus-within:border-foreground/30">
                    <textarea
                      value={homeInput}
                      onChange={(e) => setHomeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          submitHome();
                        }
                      }}
                      rows={2}
                      placeholder={`Pergunte sobre ${areaMeta.label.toLowerCase()}…`}
                      className="max-h-40 min-w-0 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <button
                      onClick={submitHome}
                      aria-label="Enviar"
                      disabled={!homeInput.trim() || isLoading}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    {company ? (
                      <button
                        onClick={() => setDrawerOpen(true)}
                        className="underline-offset-4 hover:underline"
                      >
                        Contexto: {company.name}
                      </button>
                    ) : (
                      <button
                        onClick={() => setDrawerOpen(true)}
                        className="underline-offset-4 hover:underline"
                      >
                        Adicionar contexto da empresa
                      </button>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 md:space-y-8 md:px-6 md:py-10">
                  <header className="border-b border-border/60 pb-5 md:pb-6">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {areaMeta.label}
                    </p>
                    <h1 className="mt-1 font-display text-2xl font-semibold text-balance md:text-3xl">
                      {activeTitle}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">{areaMeta.tagline}</p>
                  </header>

                  {messages.map((m) => (
                    <MessageBubble
                      key={m.id}
                      message={m}
                      areaLabel={areaMeta.label}
                      onStarter={handleSend}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <Composer
                areaLabel={areaMeta.label}
                threadTitle={activeTitle}
                contextSaved={!!company}
                onSend={handleSend}
                disabled={isLoading}
              />
            </>
          )}
        </main>
      </div>

      <ContextDrawer
        open={drawerOpen}
        value={context}
        onClose={() => setDrawerOpen(false)}
        onSave={handleContextSave}
      />
    </div>
  );
};

export default Index;

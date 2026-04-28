import { Plus, Settings2, X } from "lucide-react";
import { ChatHistoryItem, AreaId } from "@/lib/diretoria-data";
import { cn } from "@/lib/utils";

interface SidebarProps {
  history: ChatHistoryItem[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onOpenContext: () => void;
  area: AreaId;
  mobileOpen: boolean;
  onMobileClose: () => void;
  desktopOpen?: boolean;
}

export const Sidebar = ({
  history,
  activeId,
  onSelect,
  onNew,
  onOpenContext,
  mobileOpen,
  onMobileClose,
  desktopOpen = true,
}: SidebarProps) => {
  const groups = ["Hoje", "Esta semana", "Mês passado"] as const;

  const handleSelect = (id: string) => {
    onSelect(id);
    onMobileClose();
  };

  const handleNew = () => {
    onNew();
    onMobileClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onMobileClose}
        className={cn(
          "fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full w-72 shrink-0 flex-col border-r border-border bg-surface px-4 py-5 transition-all",
          "md:static md:translate-x-0 md:py-6",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          desktopOpen ? "md:w-72 md:opacity-100" : "md:w-0 md:overflow-hidden md:border-r-0 md:p-0 md:opacity-0"
        )}
      >
        <div className="mb-1 flex items-center justify-between md:hidden">
          <span className="font-display text-lg font-semibold">Conversas</span>
          <button
            onClick={onMobileClose}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleNew}
          className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90 md:mt-0"
        >
          <Plus className="h-4 w-4" />
          Nova conversa
        </button>

        <nav className="mt-6 flex-1 space-y-6 overflow-y-auto scrollbar-thin pr-1 md:mt-8">
          {history.length === 0 ? (
            <p className="px-2 text-xs leading-relaxed text-muted-foreground">
              Suas conversas aparecerão aqui. Comece uma nova para iniciar.
            </p>
          ) : (
            groups.map((g) => {
              const items = history.filter((h) => h.group === g);
              if (!items.length) return null;
              return (
                <div key={g}>
                  <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {g}
                  </p>
                  <ul className="space-y-0.5">
                    {items.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => handleSelect(item.id)}
                          className={cn(
                            "w-full truncate rounded-lg px-3 py-2 text-left text-sm transition",
                            activeId === item.id
                              ? "bg-secondary font-medium text-foreground"
                              : "text-foreground/75 hover:bg-secondary/60"
                          )}
                        >
                          {item.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </nav>

        <button
          onClick={() => {
            onOpenContext();
            onMobileClose();
          }}
          className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground/80 transition hover:bg-secondary/60"
        >
          <Settings2 className="h-4 w-4" />
          Contexto da empresa
        </button>
      </aside>
    </>
  );
};

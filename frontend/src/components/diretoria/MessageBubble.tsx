import ReactMarkdown from "react-markdown";
import { Message } from "@/lib/diretoria-data";
import { cn } from "@/lib/utils";

interface Props {
  message: Message;
  areaLabel: string;
  onStarter?: (text: string) => void;
}

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:300ms]" />
    </span>
  );
}

export const MessageBubble = ({ message, areaLabel, onStarter }: Props) => {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end gap-2 md:gap-3">
        <div className="min-w-0 max-w-[680px] space-y-2">
          <p className="text-right text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Você
          </p>
          <div className="break-words rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-[15px] leading-relaxed text-primary-foreground shadow-bubble md:px-5 md:py-4">
            {message.content}
          </div>
        </div>
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground md:h-9 md:w-9">
          Eu
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 md:gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-display text-sm font-semibold text-primary-foreground md:h-9 md:w-9">
        D
      </div>
      <div className="min-w-0 max-w-[680px] flex-1 space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          DiretorIA · <span className="text-foreground/70">{areaLabel}</span>
        </p>

        {message.loading ? (
          <LoadingDots />
        ) : (
          <div className="prose prose-sm max-w-none text-foreground/90 prose-headings:text-foreground prose-headings:font-semibold prose-p:leading-relaxed prose-li:leading-relaxed prose-strong:text-foreground prose-code:text-foreground prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {message.insight && !message.loading && (
          <div className="rounded-xl border border-insight/30 bg-insight-soft px-4 py-3">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-insight">
              + Insight identificado
            </p>
            <p className="text-[14px] leading-relaxed text-foreground/85">{message.insight}</p>
          </div>
        )}

        {message.starters && !message.loading && (
          <div className="flex flex-wrap gap-2 pt-1">
            {message.starters.map((s) => (
              <button
                key={s}
                onClick={() => onStarter?.(s)}
                className={cn(
                  "rounded-full border border-border bg-card px-4 py-1.5 text-[13px] text-foreground/80 transition",
                  "hover:border-foreground/30 hover:bg-secondary/60",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

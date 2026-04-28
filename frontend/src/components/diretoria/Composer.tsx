import { ArrowUp } from "lucide-react";
import { useState } from "react";

interface Props {
  areaLabel: string;
  threadTitle: string;
  contextSaved: boolean;
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const Composer = ({ areaLabel, threadTitle, contextSaved, onSend, disabled }: Props) => {
  const [value, setValue] = useState("");

  const submit = () => {
    const t = value.trim();
    if (!t || disabled) return;
    onSend(t);
    setValue("");
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-3 px-4 pb-4 pt-2 md:px-6 md:pb-6">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground/75">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {areaLabel} ativa
        </span>
        <span className="hidden rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground/75 sm:inline">
          {threadTitle}
        </span>
        {contextSaved && (
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground/75">
            Contexto salvo
          </span>
        )}
      </div>

      <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft focus-within:border-foreground/30">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          disabled={disabled}
          placeholder={disabled ? "Aguardando resposta…" : "Escreva sua dúvida…"}
          className="max-h-40 min-w-0 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />
        <button
          onClick={submit}
          aria-label="Enviar"
          disabled={!value.trim() || disabled}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>

      <p className="hidden text-center text-xs text-muted-foreground sm:block">
        DiretorIA tem contexto das suas conversas anteriores
      </p>
    </div>
  );
};

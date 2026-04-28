import { X } from "lucide-react";
import { CompanyContext } from "@/lib/diretoria-data";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  value: CompanyContext;
  onClose: () => void;
  onSave: (v: CompanyContext) => Promise<void>;
}

const FIELDS: {
  key: keyof CompanyContext;
  label: string;
  placeholder: string;
  long?: boolean;
}[] = [
  { key: "name", label: "Nome da empresa", placeholder: "Ex.: Acme SaaS" },
  { key: "industry", label: "Setor / indústria", placeholder: "Ex.: SaaS B2B para finanças" },
  { key: "stage", label: "Estágio", placeholder: "Ex.: Product-market fit, escala inicial" },
  { key: "size", label: "Tamanho", placeholder: "Ex.: 12 pessoas, R$ 1.5M ARR" },
  {
    key: "offer",
    label: "Oferta principal",
    placeholder: "O que você vende e qual o resultado entregue",
    long: true,
  },
  {
    key: "icp",
    label: "ICP atual",
    placeholder: "Perfil ideal: setor, porte, cargo, dor",
    long: true,
  },
  {
    key: "goals",
    label: "Objetivos dos próximos 6 meses",
    placeholder: "Metas de receita, crescimento, retenção",
    long: true,
  },
  {
    key: "channels",
    label: "Canais ativos",
    placeholder: "Outbound, SEO, paid, parcerias…",
    long: true,
  },
];

export const ContextDrawer = ({ open, value, onClose, onSave }: Props) => {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(value), [value, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-border bg-background shadow-bubble transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Contexto
            </p>
            <h2 className="font-display text-2xl font-semibold">Sua empresa</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Quanto mais profundo o contexto, mais valiosa a orientação.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto scrollbar-thin px-6 py-6">
          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground/80">
                {f.label}
              </span>
              {f.long ? (
                <textarea
                  rows={3}
                  value={draft[f.key]}
                  onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full resize-none rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-foreground/30"
                />
              ) : (
                <input
                  type="text"
                  value={draft[f.key]}
                  onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-foreground/30"
                />
              )}
            </label>
          ))}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm text-foreground/70 hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar contexto"}
          </button>
        </footer>
      </aside>
    </>
  );
};

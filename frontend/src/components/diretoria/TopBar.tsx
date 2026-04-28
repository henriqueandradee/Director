import { LogOut, Menu } from "lucide-react";
import { AREAS, AreaId } from "@/lib/diretoria-data";
import { cn } from "@/lib/utils";

interface TopBarProps {
  area: AreaId;
  onChange: (a: AreaId) => void;
  onMenu: () => void;
  showTabs?: boolean;
  userEmail?: string;
  onLogout?: () => void;
}

function initials(email?: string) {
  if (!email) return "?";
  const parts = email.split("@")[0].split(/[._-]/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export const TopBar = ({
  area,
  onChange,
  onMenu,
  showTabs = true,
  userEmail,
  onLogout,
}: TopBarProps) => {
  return (
    <header className="border-b border-border/70 bg-background/60 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onMenu}
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-secondary"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          <span className="font-display text-lg font-semibold tracking-tight md:text-xl">
            DiretorIA
          </span>
        </div>

        {showTabs && (
          <nav className="hidden items-center gap-1 rounded-full bg-secondary/60 p-1 md:flex">
            {AREAS.map((a) => {
              const active = a.id === area;
              return (
                <button
                  key={a.id}
                  onClick={() => onChange(a.id)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-foreground/70 hover:text-foreground",
                  )}
                >
                  {a.label}
                </button>
              );
            })}
          </nav>
        )}
        {!showTabs && <div className="hidden md:block" />}

        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline">{userEmail}</span>
          <div
            title={userEmail}
            className="grid h-8 w-8 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
          >
            {initials(userEmail)}
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sair"
              className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {showTabs && (
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 scrollbar-thin md:hidden">
          {AREAS.map((a) => {
            const active = a.id === area;
            return (
              <button
                key={a.id}
                onClick={() => onChange(a.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-sm transition",
                  active
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-secondary/60 text-foreground/70",
                )}
              >
                {a.label}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
};

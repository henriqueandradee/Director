export type AreaId = "estrategia" | "marketing" | "vendas" | "receita";

export interface Area {
  id: AreaId;
  label: string;
  tagline: string;
  greeting: string;
  starters: string[];
}

export const AREAS: Area[] = [
  {
    id: "estrategia",
    label: "Estratégia",
    tagline: "Proposta de valor, ICP, posicionamento e crescimento.",
    greeting:
      "Olá. Vamos trabalhar na sua estratégia. Antes de tudo: para quem você resolve o problema? Me fale sobre o perfil de quem mais se beneficia — setor, tamanho da empresa, momento atual.",
    starters: ["Ainda não sei definir bem", "Tenho clientes mas quero refinar", "Já tenho clareza"],
  },
  {
    id: "marketing",
    label: "Marketing",
    tagline: "Funil, canais de aquisição, conteúdo e marca.",
    greeting:
      "Vamos desenhar seu marketing. Para começar, qual estágio do funil está mais frágil hoje: atração, ativação ou conversão?",
    starters: ["Falta tráfego qualificado", "Leads não convertem", "Quero estruturar o funil"],
  },
  {
    id: "vendas",
    label: "Vendas",
    tagline: "Discovery, pipeline, objeções e fechamento.",
    greeting:
      "Vamos falar de vendas. Como está estruturado seu processo comercial hoje — do primeiro contato ao fechamento?",
    starters: ["Não tenho processo", "Tenho processo mas trava", "Quero escalar o time"],
  },
  {
    id: "receita",
    label: "Receita",
    tagline: "Retenção, expansão, pricing e flywheel.",
    greeting:
      "Receita sustentável vem de retenção e expansão. Quais métricas você acompanha hoje: churn, NRR, LTV, payback?",
    starters: ["Não meço nada disso", "Meço churn apenas", "Tenho dashboard completo"],
  },
];

// Maps frontend AreaId to backend ChatType enum values
export const AREA_TO_CHAT_TYPE: Record<AreaId, "marketing" | "sales" | "revenue" | "business"> = {
  estrategia: "business",
  marketing: "marketing",
  vendas: "sales",
  receita: "revenue",
};

// Maps backend ChatType back to frontend AreaId
export const CHAT_TYPE_TO_AREA: Record<string, AreaId> = {
  business: "estrategia",
  marketing: "marketing",
  sales: "vendas",
  revenue: "receita",
};

export interface ChatHistoryItem {
  id: string;
  area: AreaId;
  title: string;
  group: "Hoje" | "Esta semana" | "Mês passado";
}

export type Role = "assistant" | "user";

export interface Message {
  id: string;
  role: Role;
  content: string;
  loading?: boolean;
  insight?: string;
  starters?: string[];
}

export interface CompanyContext {
  name: string;
  industry: string;
  stage: string;
  size: string;
  offer: string;
  icp: string;
  goals: string;
  channels: string;
}

export const DEFAULT_CONTEXT: CompanyContext = {
  name: "",
  industry: "",
  stage: "",
  size: "",
  offer: "",
  icp: "",
  goals: "",
  channels: "",
};

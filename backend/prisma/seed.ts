import { PrismaClient, ChatType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@diretoria.ai' },
    update: {},
    create: {
      email: 'demo@diretoria.ai',
      passwordHash,
    },
  });

  const company = await prisma.company.upsert({
    where: { id: 'seed-company-id' },
    update: {},
    create: {
      id: 'seed-company-id',
      userId: user.id,
      name: 'DiretorIA Demo',
      description: 'Plataforma SaaS de consultoria inteligente com IA para empresas',
      market: 'SaaS B2B - Tecnologia e Consultoria',
      targetAudience: 'Founders, CEOs e gestores de PMEs que querem escalar com estratégia',
      valueProposition: 'Acesso a consultores especialistas com IA 24/7 por uma fração do custo',
      problemsSolved: 'Falta de acesso a consultoria de qualidade, alto custo de consultores sênior, decisões baseadas em achismo',
      solutions: 'Chats especializados por área (marketing, vendas, receita, negócios) com IA treinada e contexto da empresa',
      benefits: 'Respostas estratégicas e acionáveis, disponibilidade 24/7, custo acessível, contexto personalizado',
      icp: 'Founder ou CEO de startup ou PME entre R$500k e R$10M ARR, com time enxuto e necessidade de escalar',
      persona: 'Carlos, 35 anos, CEO de SaaS B2B, time de 10 pessoas, faturamento de R$2M/ano, quer dobrar em 12 meses',
    },
  });

  const chatTypes: ChatType[] = ['marketing', 'sales', 'revenue', 'business'];

  for (const type of chatTypes) {
    await prisma.chat.upsert({
      where: {
        userId_companyId_type: {
          userId: user.id,
          companyId: company.id,
          type,
        },
      },
      update: {},
      create: {
        userId: user.id,
        companyId: company.id,
        type,
      },
    });
  }

  console.log('Seed concluído.');
  console.log('Usuário demo: demo@diretoria.ai / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

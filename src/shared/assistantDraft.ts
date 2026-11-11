export type AssistantDraft = {
  type: 'income' | 'expense';
  description: string;
  amount: number;
};

export function parseAssistantDraft(command: string): AssistantDraft | null {
  const text = command.trim().replace(/[.!?]$/u, '');
  const match =
    /^(?:eu\s+)?(?:acabei\s+de\s+)?(receita|despesa|gastei|gastar|paguei|pagar|recebi|receber)\s+(?:de\s+)?(?:R\$\s*)?(\d{1,9})(?:,\s*(\d{2}))?(?:\s+rea(?:l|is)(?:\s+e\s+(\d{1,2})\s+centavos?)?)?(?:\s+(?:hoje|agora))?\s+(?:em|no|na|com|de|do|da)\s+(.{1,100})$/iu.exec(
      text,
    );
  if (!match) return null;
  const [, type, reais, decimal, centavos, description] = match;
  if (decimal && centavos) return null;
  const amount = Number(reais) * 100 + Number(decimal ?? centavos ?? 0);
  const label = description.replace(/\s+(?:hoje|agora)$/iu, '').trim();
  if (amount <= 0 || !label || /\be\s+(?:R\$\s*)?\d/iu.test(label)) return null;
  return {
    type: ['receita', 'recebi', 'receber'].includes(type.toLowerCase())
      ? 'income'
      : 'expense',
    description: label,
    amount,
  };
}

const destinations = {
  inicio: 'home',
  extrato: 'entries',
  contas: 'accounts',
  cartoes: 'cards',
  relatorios: 'reports',
  'fluxo de caixa': 'cashFlow',
} as const;

export function parseAssistantDestination(
  command: string,
): (typeof destinations)[keyof typeof destinations] | null {
  const normalized = command
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
  const match =
    /^(?:abra|abre|abrir|mostre|mostrar|ver|quero ver)\s+(?:(?:o|a|os|as)\s+)?(.+?)[.!?]?$/.exec(
      normalized,
    );
  if (!match || !Object.prototype.hasOwnProperty.call(destinations, match[1]))
    return null;
  return destinations[match[1] as keyof typeof destinations];
}

export const assistantExamples = [
  { label: 'Mercado', command: 'Acabei de gastar 50 reais no mercado' },
  { label: 'Salário', command: 'Recebi 1500 reais de salário' },
  { label: 'Abrir extrato', command: 'abrir extrato' },
];

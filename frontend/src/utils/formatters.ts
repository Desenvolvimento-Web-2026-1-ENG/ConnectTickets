import type { StatusTicket, PrioridadeTicket } from '../types';

export const formatarData = (dataIso?: string): string => {
  if (!dataIso) return '-';
  try {
    const data = new Date(dataIso);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  } catch {
    return dataIso;
  }
};

export const getStatusConfig = (status: StatusTicket) => {
  switch (status) {
    case 'ABERTO':
      return {
        label: 'Aberto',
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-400'
      };
    case 'EM_ATENDIMENTO':
      return {
        label: 'Em Atendimento',
        bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        dot: 'bg-blue-400'
      };
    case 'RESOLVIDO':
      return {
        label: 'Resolvido',
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400'
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
        dot: 'bg-slate-400'
      };
  }
};

export const getPrioridadeConfig = (prioridade: PrioridadeTicket) => {
  switch (prioridade) {
    case 'CRITICA':
      return {
        label: 'Crítica',
        badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        badgeSolid: 'bg-rose-600 text-white'
      };
    case 'ALTA':
      return {
        label: 'Alta',
        badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
        badgeSolid: 'bg-orange-500 text-white'
      };
    case 'MEDIA':
      return {
        label: 'Média',
        badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
        badgeSolid: 'bg-yellow-500 text-slate-900'
      };
    case 'BAIXA':
      return {
        label: 'Baixa',
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        badgeSolid: 'bg-emerald-600 text-white'
      };
    default:
      return {
        label: prioridade,
        badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        badgeSolid: 'bg-slate-600 text-white'
      };
  }
};

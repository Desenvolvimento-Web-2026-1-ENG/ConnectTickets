export type StatusTicket = 'ABERTO' | 'EM_ATENDIMENTO' | 'RESOLVIDO';
export type PrioridadeTicket = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface Ticket {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: PrioridadeTicket;
  status: StatusTicket;
  clienteId: number;
  analistaId?: number;
  criadoEm: string;
  atualizadoEm: string;
}

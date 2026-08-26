import { PrioridadeTicket, StatusTicket } from '@entities/Ticket.js';

export interface CriarTicketDTO {
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: PrioridadeTicket;
  clienteId: number;
}

export interface AtribuirTicketDTO {
  analistaId: number;
}

export interface AlterarStatusTicketDTO {
  novoStatus: StatusTicket;
  usuarioId: number; // ID do analista que está solicitando a alteração de status
}

export interface FiltroTicketDTO {
  status?: StatusTicket;
  prioridade?: PrioridadeTicket;
  clienteId?: number;
  analistaId?: number;
}

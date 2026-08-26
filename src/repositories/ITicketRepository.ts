import { Ticket, PrioridadeTicket, StatusTicket } from '@entities/Ticket.js';

export interface FiltrosTicket {
  status?: StatusTicket;
  prioridade?: PrioridadeTicket;
  clienteId?: number;
  analistaId?: number;
}

export interface ITicketRepository {
  listar(filtros?: FiltrosTicket): Promise<Ticket[]>;
  buscarPorId(id: number): Promise<Ticket | undefined>;
  listarPendentes(prioridade?: PrioridadeTicket): Promise<Ticket[]>;
  criar(dados: Omit<Ticket, 'id'>): Promise<Ticket>;
  atualizar(id: number, dados: Partial<Ticket>): Promise<Ticket | undefined>;
  excluir(id: number): Promise<boolean>;
}

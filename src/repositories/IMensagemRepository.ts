import { Mensagem } from '@entities/Mensagem.js';

export interface IMensagemRepository {
  listarPorTicket(ticketId: number): Promise<Mensagem[]>;
  criar(dados: Omit<Mensagem, 'id'>): Promise<Mensagem>;
}

import { Mensagem } from '@entities/Mensagem.js';
import { IMensagemRepository } from '@repositories/IMensagemRepository.js';
import { ITicketRepository } from '@repositories/ITicketRepository.js';
import { IUsuarioRepository } from '@repositories/IUsuarioRepository.js';
import { CriarMensagemDTO } from './dtos/MensagemDTOs.js';

export class MensagemService {
  constructor(
    private mensagemRepository: IMensagemRepository,
    private ticketRepository: ITicketRepository,
    private usuarioRepository: IUsuarioRepository
  ) {}

  async listarPorTicket(ticketId: number): Promise<Mensagem[]> {
    if (!ticketId || isNaN(ticketId)) {
      throw new Error('ID de ticket inválido.');
    }

    const ticket = await this.ticketRepository.buscarPorId(ticketId);
    if (!ticket) {
      throw new Error(`Ticket com ID ${ticketId} não encontrado.`);
    }

    return this.mensagemRepository.listarPorTicket(ticketId);
  }

  async criar(ticketId: number, dto: CriarMensagemDTO): Promise<Mensagem> {
    if (!ticketId || isNaN(ticketId)) {
      throw new Error('ID de ticket inválido.');
    }

    if (!dto.conteudo || dto.conteudo.trim() === '') {
      throw new Error('O campo "conteudo" da mensagem é obrigatório.');
    }

    if (!dto.autorId || isNaN(dto.autorId)) {
      throw new Error('O campo "autorId" é obrigatório e deve ser um número.');
    }

    const ticket = await this.ticketRepository.buscarPorId(ticketId);
    if (!ticket) {
      throw new Error(`Ticket com ID ${ticketId} não encontrado.`);
    }

    if (ticket.status === 'RESOLVIDO') {
      throw new Error('Não é permitido adicionar novas mensagens a um ticket com status RESOLVIDO.');
    }

    const autor = await this.usuarioRepository.buscarPorId(dto.autorId);
    if (!autor) {
      throw new Error(`Usuário autor com ID ${dto.autorId} não encontrado.`);
    }

    return this.mensagemRepository.criar({
      ticketId,
      autorId: autor.id,
      autorPerfil: autor.perfil,
      conteudo: dto.conteudo.trim(),
      criadoEm: new Date().toISOString()
    });
  }
}

import { Ticket, PrioridadeTicket, StatusTicket } from '@entities/Ticket.js';
import { ITicketRepository } from '@repositories/ITicketRepository.js';
import { IUsuarioRepository } from '@repositories/IUsuarioRepository.js';
import { IMensagemRepository } from '@repositories/IMensagemRepository.js';
import { Mensagem } from '@entities/Mensagem.js';
import { Usuario } from '@entities/Usuario.js';
import {
  CriarTicketDTO,
  AtribuirTicketDTO,
  AlterarStatusTicketDTO,
  FiltroTicketDTO
} from './dtos/TicketDTOs.js';

export interface TicketDetalhado extends Ticket {
  cliente?: Usuario;
  analista?: Usuario;
  mensagens?: Mensagem[];
}

export class TicketService {
  constructor(
    private ticketRepository: ITicketRepository,
    private usuarioRepository: IUsuarioRepository,
    private mensagemRepository?: IMensagemRepository
  ) {}

  async listar(filtros?: FiltroTicketDTO): Promise<Ticket[]> {
    if (filtros?.prioridade) {
      const prioridadesValidas: PrioridadeTicket[] = ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'];
      if (!prioridadesValidas.includes(filtros.prioridade.toUpperCase() as PrioridadeTicket)) {
        throw new Error('Prioridade inválida. Use BAIXA, MEDIA, ALTA ou CRITICA.');
      }
    }

    if (filtros?.status) {
      const statusValidos: StatusTicket[] = ['ABERTO', 'EM_ATENDIMENTO', 'RESOLVIDO'];
      if (!statusValidos.includes(filtros.status.toUpperCase() as StatusTicket)) {
        throw new Error('Status inválido. Use ABERTO, EM_ATENDIMENTO ou RESOLVIDO.');
      }
    }

    return this.ticketRepository.listar(filtros);
  }

  async listarPendentes(prioridade?: PrioridadeTicket): Promise<Ticket[]> {
    if (prioridade) {
      const prioridadesValidas: PrioridadeTicket[] = ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'];
      if (!prioridadesValidas.includes(prioridade.toUpperCase() as PrioridadeTicket)) {
        throw new Error('Prioridade inválida. Use BAIXA, MEDIA, ALTA ou CRITICA.');
      }
    }
    return this.ticketRepository.listarPendentes(prioridade);
  }

  async buscarPorId(id: number): Promise<TicketDetalhado> {
    if (!id || isNaN(id)) {
      throw new Error('ID de ticket inválido.');
    }

    const ticket = await this.ticketRepository.buscarPorId(id);
    if (!ticket) {
      throw new Error(`Ticket com ID ${id} não encontrado.`);
    }

    const cliente = await this.usuarioRepository.buscarPorId(ticket.clienteId);
    let analista: Usuario | undefined;
    if (ticket.analistaId) {
      analista = await this.usuarioRepository.buscarPorId(ticket.analistaId);
    }

    let mensagens: Mensagem[] = [];
    if (this.mensagemRepository) {
      mensagens = await this.mensagemRepository.listarPorTicket(ticket.id);
    }

    return {
      ...ticket,
      cliente,
      analista,
      mensagens
    };
  }

  async criar(dto: CriarTicketDTO): Promise<Ticket> {
    if (!dto.titulo || dto.titulo.trim() === '') {
      throw new Error('O campo "titulo" é obrigatório.');
    }
    if (!dto.descricao || dto.descricao.trim() === '') {
      throw new Error('O campo "descricao" é obrigatório.');
    }
    if (!dto.categoria || dto.categoria.trim() === '') {
      throw new Error('O campo "categoria" é obrigatório.');
    }

    const prioridadesValidas: PrioridadeTicket[] = ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'];
    if (!dto.prioridade || !prioridadesValidas.includes(dto.prioridade.toUpperCase() as PrioridadeTicket)) {
      throw new Error('O campo "prioridade" deve ser BAIXA, MEDIA, ALTA ou CRITICA.');
    }

    if (!dto.clienteId || isNaN(dto.clienteId)) {
      throw new Error('O campo "clienteId" é obrigatório e deve ser um número.');
    }

    const usuario = await this.usuarioRepository.buscarPorId(dto.clienteId);
    if (!usuario) {
      throw new Error(`Usuário cliente com ID ${dto.clienteId} não encontrado.`);
    }

    if (usuario.perfil !== 'CLIENTE') {
      throw new Error('Apenas usuários com perfil CLIENTE têm permissão para abrir novos chamados.');
    }

    return this.ticketRepository.criar({
      titulo: dto.titulo.trim(),
      descricao: dto.descricao.trim(),
      categoria: dto.categoria.trim(),
      prioridade: dto.prioridade.toUpperCase() as PrioridadeTicket,
      status: 'ABERTO',
      clienteId: dto.clienteId,
      analistaId: undefined,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    });
  }

  async atribuir(ticketId: number, dto: AtribuirTicketDTO): Promise<Ticket> {
    if (!ticketId || isNaN(ticketId)) {
      throw new Error('ID de ticket inválido.');
    }
    if (!dto.analistaId || isNaN(dto.analistaId)) {
      throw new Error('O campo "analistaId" é obrigatório e deve ser um número.');
    }

    const ticket = await this.ticketRepository.buscarPorId(ticketId);
    if (!ticket) {
      throw new Error(`Ticket com ID ${ticketId} não encontrado.`);
    }

    if (ticket.status === 'RESOLVIDO') {
      throw new Error('Não é possível atribuir analista a um ticket com status RESOLVIDO.');
    }

    const analista = await this.usuarioRepository.buscarPorId(dto.analistaId);
    if (!analista) {
      throw new Error(`Usuário com ID ${dto.analistaId} não encontrado.`);
    }

    if (analista.perfil !== 'ANALISTA') {
      throw new Error('Apenas usuários com perfil ANALISTA podem ser atribuídos para atendimento de tickets.');
    }

    const novoStatus: StatusTicket = ticket.status === 'ABERTO' ? 'EM_ATENDIMENTO' : ticket.status;

    const ticketAtualizado = await this.ticketRepository.atualizar(ticketId, {
      analistaId: dto.analistaId,
      status: novoStatus
    });

    if (!ticketAtualizado) {
      throw new Error('Falha ao atualizar o ticket.');
    }

    return ticketAtualizado;
  }

  async alterarStatus(ticketId: number, dto: AlterarStatusTicketDTO): Promise<Ticket> {
    if (!ticketId || isNaN(ticketId)) {
      throw new Error('ID de ticket inválido.');
    }
    if (!dto.usuarioId || isNaN(dto.usuarioId)) {
      throw new Error('O campo "usuarioId" do solicitante é obrigatório.');
    }

    const usuario = await this.usuarioRepository.buscarPorId(dto.usuarioId);
    if (!usuario) {
      throw new Error(`Usuário solicitante com ID ${dto.usuarioId} não encontrado.`);
    }

    if (usuario.perfil !== 'ANALISTA') {
      throw new Error('Apenas usuários com perfil ANALISTA podem alterar o status do ticket.');
    }

    const ticket = await this.ticketRepository.buscarPorId(ticketId);
    if (!ticket) {
      throw new Error(`Ticket com ID ${ticketId} não encontrado.`);
    }

    if (ticket.status === 'RESOLVIDO') {
      throw new Error('Este ticket já está RESOLVIDO e não pode sofrer mais alterações de status.');
    }

    const statusValidos: StatusTicket[] = ['ABERTO', 'EM_ATENDIMENTO', 'RESOLVIDO'];
    const statusDesejado = dto.novoStatus ? (dto.novoStatus.toUpperCase() as StatusTicket) : undefined;
    if (!statusDesejado || !statusValidos.includes(statusDesejado)) {
      throw new Error('O campo "novoStatus" deve ser ABERTO, EM_ATENDIMENTO ou RESOLVIDO.');
    }

    if (ticket.status === statusDesejado) {
      return ticket;
    }

    // Regras de transição: ABERTO -> EM_ATENDIMENTO -> RESOLVIDO (ou ABERTO -> RESOLVIDO)
    const atual = ticket.status;
    if (atual === 'ABERTO' && statusDesejado !== 'EM_ATENDIMENTO' && statusDesejado !== 'RESOLVIDO') {
      throw new Error(`Transição de status inválida de ${atual} para ${statusDesejado}.`);
    }

    if (atual === 'EM_ATENDIMENTO' && statusDesejado !== 'RESOLVIDO' && statusDesejado !== 'ABERTO') {
      throw new Error(`Transição de status inválida de ${atual} para ${statusDesejado}.`);
    }

    const ticketAtualizado = await this.ticketRepository.atualizar(ticketId, {
      status: statusDesejado
    });

    if (!ticketAtualizado) {
      throw new Error('Falha ao atualizar o status do ticket.');
    }

    return ticketAtualizado;
  }

  async excluir(ticketId: number): Promise<void> {
    if (!ticketId || isNaN(ticketId)) {
      throw new Error('ID de ticket inválido.');
    }

    const ticket = await this.ticketRepository.buscarPorId(ticketId);
    if (!ticket) {
      throw new Error(`Ticket com ID ${ticketId} não encontrado.`);
    }

    await this.ticketRepository.excluir(ticketId);
  }
}

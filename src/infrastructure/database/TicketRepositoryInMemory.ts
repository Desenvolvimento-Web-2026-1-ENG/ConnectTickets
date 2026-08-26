import { Ticket, PrioridadeTicket } from '@entities/Ticket.js';
import { ITicketRepository, FiltrosTicket } from '@repositories/ITicketRepository.js';

export class TicketRepositoryInMemory implements ITicketRepository {
  private static tickets: Ticket[] = [
    {
      id: 1,
      titulo: 'Falha na conexão com a VPN corporativa',
      descricao: 'Não consigo acessar os servidores internos da filial após atualização do cliente VPN.',
      categoria: 'Redes',
      prioridade: 'ALTA',
      status: 'ABERTO',
      clienteId: 1,
      criadoEm: '2026-03-01T10:00:00.000Z',
      atualizadoEm: '2026-03-01T10:00:00.000Z'
    },
    {
      id: 2,
      titulo: 'Computador não liga após queda de energia',
      descricao: 'Gabinete não dá sinal de vida e a luz da fonte está apagada no setor financeiro.',
      categoria: 'Hardware',
      prioridade: 'CRITICA',
      status: 'EM_ATENDIMENTO',
      clienteId: 2,
      analistaId: 3,
      criadoEm: '2026-03-01T11:30:00.000Z',
      atualizadoEm: '2026-03-01T12:00:00.000Z'
    },
    {
      id: 3,
      titulo: 'Solicitação de licença do software CAD',
      descricao: 'Novo membro na equipe de engenharia necessita de chave de ativação para o software.',
      categoria: 'Software',
      prioridade: 'MEDIA',
      status: 'RESOLVIDO',
      clienteId: 1,
      analistaId: 4,
      criadoEm: '2026-02-28T09:00:00.000Z',
      atualizadoEm: '2026-02-28T16:00:00.000Z'
    },
    {
      id: 4,
      titulo: 'Redefinição de senha do portal de RH',
      descricao: 'Esqueci minha credencial de acesso ao sistema de folha de pagamento.',
      categoria: 'Acesso',
      prioridade: 'BAIXA',
      status: 'ABERTO',
      clienteId: 2,
      criadoEm: '2026-03-02T08:15:00.000Z',
      atualizadoEm: '2026-03-02T08:15:00.000Z'
    }
  ];

  private static nextId: number = 5;

  async listar(filtros?: FiltrosTicket): Promise<Ticket[]> {
    let resultado = [...TicketRepositoryInMemory.tickets];

    if (filtros) {
      if (filtros.status) {
        resultado = resultado.filter(
          (t) => t.status.toUpperCase() === filtros.status!.toUpperCase()
        );
      }
      if (filtros.prioridade) {
        resultado = resultado.filter(
          (t) => t.prioridade.toUpperCase() === filtros.prioridade!.toUpperCase()
        );
      }
      if (filtros.clienteId !== undefined) {
        resultado = resultado.filter((t) => t.clienteId === filtros.clienteId);
      }
      if (filtros.analistaId !== undefined) {
        resultado = resultado.filter((t) => t.analistaId === filtros.analistaId);
      }
    }

    return resultado;
  }

  async buscarPorId(id: number): Promise<Ticket | undefined> {
    return TicketRepositoryInMemory.tickets.find((t) => t.id === id);
  }

  async listarPendentes(prioridade?: PrioridadeTicket): Promise<Ticket[]> {
    let pendentes = TicketRepositoryInMemory.tickets.filter(
      (t) => t.status === 'ABERTO' || t.status === 'EM_ATENDIMENTO'
    );

    if (prioridade) {
      pendentes = pendentes.filter(
        (t) => t.prioridade.toUpperCase() === prioridade.toUpperCase()
      );
    }

    return pendentes;
  }

  async criar(dados: Omit<Ticket, 'id'>): Promise<Ticket> {
    const agora = new Date().toISOString();
    const novoTicket: Ticket = {
      id: TicketRepositoryInMemory.nextId++,
      titulo: dados.titulo,
      descricao: dados.descricao,
      categoria: dados.categoria,
      prioridade: dados.prioridade,
      status: dados.status || 'ABERTO',
      clienteId: dados.clienteId,
      analistaId: dados.analistaId,
      criadoEm: dados.criadoEm || agora,
      atualizadoEm: dados.atualizadoEm || agora
    };
    TicketRepositoryInMemory.tickets.push(novoTicket);
    return novoTicket;
  }

  async atualizar(id: number, dados: Partial<Ticket>): Promise<Ticket | undefined> {
    const index = TicketRepositoryInMemory.tickets.findIndex((t) => t.id === id);
    if (index === -1) {
      return undefined;
    }

    const ticketAtual = TicketRepositoryInMemory.tickets[index];
    const ticketAtualizado: Ticket = {
      ...ticketAtual,
      ...dados,
      id: ticketAtual.id, // ID não pode ser alterado
      atualizadoEm: new Date().toISOString()
    };

    TicketRepositoryInMemory.tickets[index] = ticketAtualizado;
    return ticketAtualizado;
  }

  async excluir(id: number): Promise<boolean> {
    const index = TicketRepositoryInMemory.tickets.findIndex((t) => t.id === id);
    if (index === -1) {
      return false;
    }
    TicketRepositoryInMemory.tickets.splice(index, 1);
    return true;
  }
}

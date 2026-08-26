import { Mensagem } from '@entities/Mensagem.js';
import { IMensagemRepository } from '@repositories/IMensagemRepository.js';

export class MensagemRepositoryInMemory implements IMensagemRepository {
  private static mensagens: Mensagem[] = [
    {
      id: 1,
      ticketId: 2,
      autorId: 2,
      autorPerfil: 'CLIENTE',
      conteudo: 'O incidente ocorreu logo após o trovão das 11h.',
      criadoEm: '2026-03-01T11:35:00.000Z'
    },
    {
      id: 2,
      ticketId: 2,
      autorId: 3,
      autorPerfil: 'ANALISTA',
      conteudo: 'Olá Mariana, assumi o chamado e estou a caminho da sua estação com uma nova fonte de teste.',
      criadoEm: '2026-03-01T12:05:00.000Z'
    },
    {
      id: 3,
      ticketId: 3,
      autorId: 4,
      autorPerfil: 'ANALISTA',
      conteudo: 'Licença liberada no painel administrativo e dados de login enviados por e-mail.',
      criadoEm: '2026-02-28T15:50:00.000Z'
    }
  ];

  private static nextId: number = 4;

  async listarPorTicket(ticketId: number): Promise<Mensagem[]> {
    return MensagemRepositoryInMemory.mensagens.filter((m) => m.ticketId === ticketId);
  }

  async criar(dados: Omit<Mensagem, 'id'>): Promise<Mensagem> {
    const novaMensagem: Mensagem = {
      id: MensagemRepositoryInMemory.nextId++,
      ticketId: dados.ticketId,
      autorId: dados.autorId,
      autorPerfil: dados.autorPerfil,
      conteudo: dados.conteudo,
      criadoEm: dados.criadoEm || new Date().toISOString()
    };
    MensagemRepositoryInMemory.mensagens.push(novaMensagem);
    return novaMensagem;
  }
}

export type PerfilUsuario = 'CLIENTE' | 'ANALISTA';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  criadoEm?: string;
}

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
  cliente?: Usuario;
  analista?: Usuario;
  mensagens?: Mensagem[];
}

export interface Mensagem {
  id: number;
  ticketId: number;
  autorId: number;
  autorPerfil: PerfilUsuario;
  conteudo: string;
  criadoEm: string;
}

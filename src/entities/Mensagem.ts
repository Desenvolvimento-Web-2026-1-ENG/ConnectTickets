import { PerfilUsuario } from './Usuario.js';

export interface Mensagem {
  id: number;
  ticketId: number;
  autorId: number;
  autorPerfil: PerfilUsuario;
  conteudo: string;
  criadoEm: string;
}

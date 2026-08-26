export type PerfilUsuario = 'CLIENTE' | 'ANALISTA';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  criadoEm?: string;
}

import { Usuario, PerfilUsuario } from '@entities/Usuario.js';

export interface IUsuarioRepository {
  listar(perfil?: PerfilUsuario): Promise<Usuario[]>;
  buscarPorId(id: number): Promise<Usuario | undefined>;
  buscarPorEmail(email: string): Promise<Usuario | undefined>;
  criar(dados: Omit<Usuario, 'id'>): Promise<Usuario>;
}

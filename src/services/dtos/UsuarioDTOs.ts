import { PerfilUsuario } from '@entities/Usuario.js';

export interface CriarUsuarioDTO {
  nome: string;
  email: string;
  perfil: PerfilUsuario;
}

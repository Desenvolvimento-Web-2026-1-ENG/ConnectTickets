import { Usuario, PerfilUsuario } from '@entities/Usuario.js';
import { IUsuarioRepository } from '@repositories/IUsuarioRepository.js';
import { CriarUsuarioDTO } from './dtos/UsuarioDTOs.js';

export class UsuarioService {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async listar(perfil?: PerfilUsuario): Promise<Usuario[]> {
    if (perfil && perfil !== 'CLIENTE' && perfil !== 'ANALISTA') {
      throw new Error("Perfil inválido. Use 'CLIENTE' ou 'ANALISTA'.");
    }
    return this.usuarioRepository.listar(perfil);
  }

  async buscarPorId(id: number): Promise<Usuario> {
    if (!id || isNaN(id)) {
      throw new Error('ID de usuário inválido.');
    }
    const usuario = await this.usuarioRepository.buscarPorId(id);
    if (!usuario) {
      throw new Error(`Usuário com ID ${id} não encontrado.`);
    }
    return usuario;
  }

  async criar(dto: CriarUsuarioDTO): Promise<Usuario> {
    if (!dto.nome || dto.nome.trim() === '') {
      throw new Error('O campo "nome" é obrigatório.');
    }
    if (!dto.email || dto.email.trim() === '') {
      throw new Error('O campo "email" é obrigatório.');
    }
    if (!dto.perfil || (dto.perfil !== 'CLIENTE' && dto.perfil !== 'ANALISTA')) {
      throw new Error('O campo "perfil" deve ser obrigatoriamente "CLIENTE" ou "ANALISTA".');
    }

    const emailExistente = await this.usuarioRepository.buscarPorEmail(dto.email.trim());
    if (emailExistente) {
      throw new Error(`Já existe um usuário cadastrado com o e-mail: ${dto.email}`);
    }

    return this.usuarioRepository.criar({
      nome: dto.nome.trim(),
      email: dto.email.trim().toLowerCase(),
      perfil: dto.perfil
    });
  }
}

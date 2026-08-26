import { Usuario, PerfilUsuario } from '@entities/Usuario.js';
import { IUsuarioRepository } from '@repositories/IUsuarioRepository.js';

export class UsuarioRepositoryInMemory implements IUsuarioRepository {
  private static usuarios: Usuario[] = [
    {
      id: 1,
      nome: 'Carlos Silva',
      email: 'carlos.silva@empresa.com',
      perfil: 'CLIENTE',
      criadoEm: '2026-01-15T08:00:00.000Z'
    },
    {
      id: 2,
      nome: 'Mariana Souza',
      email: 'mariana.souza@empresa.com',
      perfil: 'CLIENTE',
      criadoEm: '2026-01-20T09:30:00.000Z'
    },
    {
      id: 3,
      nome: 'Roberto Tech',
      email: 'roberto.tech@suporte.com',
      perfil: 'ANALISTA',
      criadoEm: '2026-01-10T07:45:00.000Z'
    },
    {
      id: 4,
      nome: 'Fernanda Help',
      email: 'fernanda.help@suporte.com',
      perfil: 'ANALISTA',
      criadoEm: '2026-01-12T10:15:00.000Z'
    }
  ];

  private static nextId: number = 5;

  async listar(perfil?: PerfilUsuario): Promise<Usuario[]> {
    if (perfil) {
      return UsuarioRepositoryInMemory.usuarios.filter(
        (u) => u.perfil.toUpperCase() === perfil.toUpperCase()
      );
    }
    return [...UsuarioRepositoryInMemory.usuarios];
  }

  async buscarPorId(id: number): Promise<Usuario | undefined> {
    return UsuarioRepositoryInMemory.usuarios.find((u) => u.id === id);
  }

  async buscarPorEmail(email: string): Promise<Usuario | undefined> {
    return UsuarioRepositoryInMemory.usuarios.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  async criar(dados: Omit<Usuario, 'id'>): Promise<Usuario> {
    const novoUsuario: Usuario = {
      id: UsuarioRepositoryInMemory.nextId++,
      ...dados,
      criadoEm: dados.criadoEm || new Date().toISOString()
    };
    UsuarioRepositoryInMemory.usuarios.push(novoUsuario);
    return novoUsuario;
  }
}

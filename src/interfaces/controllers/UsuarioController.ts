import { Request, Response } from 'express';
import { UsuarioService } from '@services/UsuarioService.js';
import { PerfilUsuario } from '@entities/Usuario.js';

export class UsuarioController {
  constructor(private usuarioService: UsuarioService) {}

  listar = async (req: Request, res: Response): Promise<void> => {
    try {
      const perfil = req.query.perfil as PerfilUsuario | undefined;
      const usuarios = await this.usuarioService.listar(perfil);
      res.status(200).json(usuarios);
    } catch (error: any) {
      res.status(400).json({ mensagem: error.message || 'Erro ao listar usuários.' });
    }
  };

  buscarPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const usuario = await this.usuarioService.buscarPorId(id);
      res.status(200).json(usuario);
    } catch (error: any) {
      if (error.message && error.message.includes('não encontrado')) {
        res.status(404).json({ mensagem: error.message });
      } else {
        res.status(400).json({ mensagem: error.message || 'Erro ao buscar usuário.' });
      }
    }
  };

  criar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nome, email, perfil } = req.body;
      const novoUsuario = await this.usuarioService.criar({ nome, email, perfil });
      res.status(201).json(novoUsuario);
    } catch (error: any) {
      res.status(400).json({ mensagem: error.message || 'Erro ao cadastrar usuário.' });
    }
  };
}

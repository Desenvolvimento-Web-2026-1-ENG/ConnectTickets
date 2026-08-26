import { Request, Response } from 'express';
import { MensagemService } from '@services/MensagemService.js';

export class MensagemController {
  constructor(private mensagemService: MensagemService) {}

  listarPorTicket = async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      const mensagens = await this.mensagemService.listarPorTicket(ticketId);
      res.status(200).json(mensagens);
    } catch (error: any) {
      if (error.message && error.message.includes('não encontrado')) {
        res.status(404).json({ mensagem: error.message });
      } else {
        res.status(400).json({ mensagem: error.message || 'Erro ao listar mensagens do ticket.' });
      }
    }
  };

  criar = async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      const { autorId, conteudo } = req.body;
      const novaMensagem = await this.mensagemService.criar(ticketId, {
        autorId: Number(autorId),
        conteudo
      });
      res.status(201).json(novaMensagem);
    } catch (error: any) {
      if (error.message && error.message.includes('não encontrado')) {
        res.status(404).json({ mensagem: error.message });
      } else {
        res.status(400).json({ mensagem: error.message || 'Erro ao adicionar mensagem no ticket.' });
      }
    }
  };
}

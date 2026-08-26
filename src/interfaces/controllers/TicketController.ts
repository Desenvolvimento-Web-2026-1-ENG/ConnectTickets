import { Request, Response } from 'express';
import { TicketService } from '@services/TicketService.js';
import { PrioridadeTicket, StatusTicket } from '@entities/Ticket.js';

export class TicketController {
  constructor(private ticketService: TicketService) {}

  listar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, prioridade, clienteId, analistaId } = req.query;

      const filtros = {
        status: status as StatusTicket | undefined,
        prioridade: prioridade as PrioridadeTicket | undefined,
        clienteId: clienteId ? parseInt(String(clienteId), 10) : undefined,
        analistaId: analistaId ? parseInt(String(analistaId), 10) : undefined
      };

      const tickets = await this.ticketService.listar(filtros);
      res.status(200).json(tickets);
    } catch (error: any) {
      res.status(400).json({ mensagem: error.message || 'Erro ao listar tickets.' });
    }
  };

  listarPendentes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { prioridade } = req.query;
      const pendentes = await this.ticketService.listarPendentes(
        prioridade as PrioridadeTicket | undefined
      );
      res.status(200).json(pendentes);
    } catch (error: any) {
      res.status(400).json({ mensagem: error.message || 'Erro ao listar tickets pendentes.' });
    }
  };

  buscarPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const ticket = await this.ticketService.buscarPorId(id);
      res.status(200).json(ticket);
    } catch (error: any) {
      if (error.message && error.message.includes('não encontrado')) {
        res.status(404).json({ mensagem: error.message });
      } else {
        res.status(400).json({ mensagem: error.message || 'Erro ao buscar ticket.' });
      }
    }
  };

  criar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { titulo, descricao, categoria, prioridade, clienteId } = req.body;
      const novoTicket = await this.ticketService.criar({
        titulo,
        descricao,
        categoria,
        prioridade,
        clienteId: Number(clienteId)
      });
      res.status(201).json(novoTicket);
    } catch (error: any) {
      res.status(400).json({ mensagem: error.message || 'Erro ao criar ticket.' });
    }
  };

  atribuir = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const { analistaId } = req.body;
      const ticketAtualizado = await this.ticketService.atribuir(id, {
        analistaId: Number(analistaId)
      });
      res.status(200).json(ticketAtualizado);
    } catch (error: any) {
      if (error.message && error.message.includes('não encontrado')) {
        res.status(404).json({ mensagem: error.message });
      } else {
        res.status(400).json({ mensagem: error.message || 'Erro ao atribuir analista ao ticket.' });
      }
    }
  };

  alterarStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const { novoStatus, usuarioId } = req.body;
      const ticketAtualizado = await this.ticketService.alterarStatus(id, {
        novoStatus,
        usuarioId: Number(usuarioId)
      });
      res.status(200).json(ticketAtualizado);
    } catch (error: any) {
      if (error.message && error.message.includes('não encontrado')) {
        res.status(404).json({ mensagem: error.message });
      } else {
        res.status(400).json({ mensagem: error.message || 'Erro ao alterar status do ticket.' });
      }
    }
  };

  excluir = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(String(req.params.id), 10);
      await this.ticketService.excluir(id);
      res.status(204).send();
    } catch (error: any) {
      if (error.message && error.message.includes('não encontrado')) {
        res.status(404).json({ mensagem: error.message });
      } else {
        res.status(400).json({ mensagem: error.message || 'Erro ao excluir ticket.' });
      }
    }
  };
}

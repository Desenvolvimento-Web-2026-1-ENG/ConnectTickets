import { TicketRepositoryInMemory } from '@infrastructure/database/TicketRepositoryInMemory.js';
import { UsuarioRepositoryInMemory } from '@infrastructure/database/UsuarioRepositoryInMemory.js';
import { MensagemRepositoryInMemory } from '@infrastructure/database/MensagemRepositoryInMemory.js';
import { TicketService } from '@services/TicketService.js';
import { TicketController } from '@interfaces/controllers/TicketController.js';

export class TicketFactory {
  static criar(): TicketController {
    const ticketRepository = new TicketRepositoryInMemory();
    const usuarioRepository = new UsuarioRepositoryInMemory();
    const mensagemRepository = new MensagemRepositoryInMemory();
    const ticketService = new TicketService(ticketRepository, usuarioRepository, mensagemRepository);
    return new TicketController(ticketService);
  }
}

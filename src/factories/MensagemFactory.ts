import { MensagemRepositoryInMemory } from '@infrastructure/database/MensagemRepositoryInMemory.js';
import { TicketRepositoryInMemory } from '@infrastructure/database/TicketRepositoryInMemory.js';
import { UsuarioRepositoryInMemory } from '@infrastructure/database/UsuarioRepositoryInMemory.js';
import { MensagemService } from '@services/MensagemService.js';
import { MensagemController } from '@interfaces/controllers/MensagemController.js';

export class MensagemFactory {
  static criar(): MensagemController {
    const mensagemRepository = new MensagemRepositoryInMemory();
    const ticketRepository = new TicketRepositoryInMemory();
    const usuarioRepository = new UsuarioRepositoryInMemory();
    const mensagemService = new MensagemService(mensagemRepository, ticketRepository, usuarioRepository);
    return new MensagemController(mensagemService);
  }
}

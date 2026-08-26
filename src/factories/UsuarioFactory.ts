import { UsuarioRepositoryInMemory } from '@infrastructure/database/UsuarioRepositoryInMemory.js';
import { UsuarioService } from '@services/UsuarioService.js';
import { UsuarioController } from '@interfaces/controllers/UsuarioController.js';

export class UsuarioFactory {
  static criar(): UsuarioController {
    const usuarioRepository = new UsuarioRepositoryInMemory();
    const usuarioService = new UsuarioService(usuarioRepository);
    return new UsuarioController(usuarioService);
  }
}

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Ticket,
  PlusCircle,
  Users,
  FileCode,
  UserCheck,
  ChevronDown,
  ShieldAlert,
  Headphones,
  User as UserIcon
} from 'lucide-react';
import { useUser } from '../context/UserContext';

export const Navbar: React.FC = () => {
  const { currentUser, setCurrentUser, usuarios } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getProfileBadge = (perfil: string) => {
    if (perfil === 'ANALISTA') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
          <Headphones className="w-3 h-3" />
          ANALISTA
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
        <UserIcon className="w-3 h-3" />
        CLIENTE
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Marca */}
          <div className="flex items-center gap-8">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-white bg-clip-text text-transparent">
                  ConnectTickets
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                  Helpdesk Portal P2
                </span>
              </div>
            </NavLink>

            {/* Links de Navegação */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Ticket className="w-4 h-4" />
                Dashboard / Chamados
              </NavLink>

              <NavLink
                to="/novo-ticket"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <PlusCircle className="w-4 h-4" />
                Novo Chamado
              </NavLink>

              <NavLink
                to="/usuarios"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Users className="w-4 h-4" />
                Usuários
              </NavLink>
            </nav>
          </div>

          {/* Seção Direita: Swagger UI + Seletor de Perfil Ativo */}
          <div className="flex items-center gap-3">
            
            {/* Link para o Swagger Docs */}
            <a
              href="http://localhost:3000/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir documentação interativa Swagger OpenAPI"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Swagger API</span>
            </a>

            {/* Seletor de Perfil / Usuário Ativo */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-left group"
                aria-expanded={dropdownOpen}
              >
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-blue-400 border border-slate-600">
                  {currentUser?.nome ? currentUser.nome.charAt(0) : 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                    {currentUser?.nome || 'Selecionar Usuário'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {currentUser?.email || ''}
                  </span>
                </div>
                {currentUser && getProfileBadge(currentUser.perfil)}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
              </button>

              {/* Menu Dropdown de Seleção de Usuário */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                      Alternar Perfil Ativo (Simulação)
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Alterne entre clientes e analistas para validar as regras e bloqueios de permissão.
                    </p>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {usuarios.map((u) => {
                      const isSelected = currentUser?.id === u.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setCurrentUser(u);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                            isSelected
                              ? 'bg-blue-600/20 text-white border border-blue-500/40'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="flex flex-col text-left">
                            <span className="font-medium text-slate-200">{u.nome}</span>
                            <span className="text-[10px] text-slate-400">{u.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getProfileBadge(u.perfil)}
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 mt-1 border-t border-slate-800 px-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Dica: Analistas podem assumir e resolver chamados. Clientes podem abrir e enviar mensagens.</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Barra de Navegação Mobile */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/60 text-xs">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium ${
                isActive ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400'
              }`
            }
          >
            <Ticket className="w-3.5 h-3.5" />
            Chamados
          </NavLink>
          <NavLink
            to="/novo-ticket"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium ${
                isActive ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400'
              }`
            }
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Novo Chamado
          </NavLink>
          <NavLink
            to="/usuarios"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium ${
                isActive ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400'
              }`
            }
          >
            <Users className="w-3.5 h-3.5" />
            Usuários
          </NavLink>
        </div>

      </div>
    </header>
  );
};

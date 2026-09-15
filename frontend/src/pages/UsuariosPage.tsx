import React, { useState } from 'react';
import {
  UserPlus,
  Headphones,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Mail,
  UserCheck,
  Search,
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import type { PerfilUsuario, Usuario } from '../types';
import { formatarData } from '../utils/formatters';

export const UsuariosPage: React.FC = () => {
  const { usuarios, recarregarUsuarios, currentUser, setCurrentUser } = useUser();

  // Estados do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState<PerfilUsuario>('CLIENTE');
  const [cadastrando, setCadastrando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Filtros
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<'TODOS' | 'CLIENTE' | 'ANALISTA'>('TODOS');

  // Submissão de novo usuário
  const handleCadastrarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemErro(null);
    setMensagemSucesso(null);

    if (!nome.trim()) {
      setMensagemErro('Informe o nome completo do usuário.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setMensagemErro('Informe um endereço de e-mail corporativo válido.');
      return;
    }

    setCadastrando(true);
    try {
      const payload = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        perfil
      };

      const response = await api.post<Usuario>('/usuarios', payload);
      const novoUsuario = response.data;

      setMensagemSucesso(`Usuário "${novoUsuario.nome}" cadastrado com sucesso como ${novoUsuario.perfil}!`);
      setNome('');
      setEmail('');
      setPerfil('CLIENTE');

      // Atualiza o contexto global e o seletor da Navbar
      await recarregarUsuarios();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axErr = err as { response?: { data?: { mensagem?: string } } };
        setMensagemErro(axErr.response?.data?.mensagem || 'Erro ao cadastrar usuário.');
      } else if (err instanceof Error) {
        setMensagemErro(err.message);
      } else {
        setMensagemErro('Erro de conexão ao salvar usuário.');
      }
    } finally {
      setCadastrando(false);
    }
  };

  // Contagens
  const totalClientes = usuarios.filter(u => u.perfil === 'CLIENTE').length;
  const totalAnalistas = usuarios.filter(u => u.perfil === 'ANALISTA').length;

  // Filtragem
  const usuariosFiltrados = usuarios.filter(u => {
    const matchAba = abaAtiva === 'TODOS' || u.perfil === abaAtiva;
    const matchBusca =
      !busca.trim() ||
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase()) ||
      String(u.id).includes(busca);
    return matchAba && matchBusca;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Administração & Acessos</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Gestão de Usuários
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Visualize os usuários cadastrados no Helpdesk, cadastre novos membros e alterne perfis ativos para simular o comportamento de clientes e analistas.
          </p>
        </div>

        {/* Indicadores de Usuários */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <UserIcon className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-medium">Clientes:</span>
            <strong className="text-emerald-400 font-bold">{totalClientes}</strong>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Headphones className="w-4 h-4 text-purple-400" />
            <span className="text-slate-300 font-medium">Analistas:</span>
            <strong className="text-purple-400 font-bold">{totalAnalistas}</strong>
          </div>
        </div>
      </div>

      {/* Grid: Formulário de Cadastro (Esquerda) + Lista de Usuários (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Formulário de Cadastro Rápido */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800 pb-3">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <span>Novo Usuário</span>
          </div>

          {mensagemSucesso && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{mensagemSucesso}</span>
            </div>
          )}

          {mensagemErro && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-in shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{mensagemErro}</span>
            </div>
          )}

          <form onSubmit={handleCadastrarUsuario} className="space-y-4">
            {/* Nome */}
            <div className="space-y-1.5">
              <label htmlFor="nome" className="block text-xs font-semibold text-slate-300">
                Nome Completo <span className="text-rose-500">*</span>
              </label>
              <input
                id="nome"
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Beatriz Lima"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300">
                E-mail Corporativo <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="beatriz.lima@empresa.com"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Perfil */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Perfil de Acesso <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPerfil('CLIENTE')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                    perfil === 'CLIENTE'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <UserIcon className="w-4 h-4 mb-1 text-emerald-400" />
                  <span>CLIENTE</span>
                  <span className="text-[10px] font-normal opacity-70 mt-0.5">Abre chamados</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPerfil('ANALISTA')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                    perfil === 'ANALISTA'
                      ? 'bg-purple-500/15 border-purple-500/50 text-purple-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Headphones className="w-4 h-4 mb-1 text-purple-400" />
                  <span>ANALISTA</span>
                  <span className="text-[10px] font-normal opacity-70 mt-0.5">Atende chamados</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={cadastrando}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all ${
                cadastrando ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {cadastrando ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Salvando usuário...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar Usuário</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800/80 flex items-start gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <span>O usuário é salvo diretamente no repositório da API e fica disponível instantaneamente no seletor de perfil da Navbar.</span>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Barra de Filtros e Busca de Usuários */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar usuários por nome, email ou ID..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Segmented Control */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setAbaAtiva('TODOS')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  abaAtiva === 'TODOS'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos ({usuarios.length})
              </button>
              <button
                type="button"
                onClick={() => setAbaAtiva('CLIENTE')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  abaAtiva === 'CLIENTE'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Clientes ({totalClientes})
              </button>
              <button
                type="button"
                onClick={() => setAbaAtiva('ANALISTA')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  abaAtiva === 'ANALISTA'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Analistas ({totalAnalistas})
              </button>
            </div>
          </div>

          {/* Lista de Cards de Usuário */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {usuariosFiltrados.map((u) => {
              const isAtivo = currentUser?.id === u.id;
              const isUserAnalista = u.perfil === 'ANALISTA';

              return (
                <div
                  key={u.id}
                  className={`bg-slate-900/90 rounded-2xl p-5 border shadow-sm transition-all duration-200 flex flex-col justify-between gap-4 ${
                    isAtivo
                      ? 'border-blue-500/60 shadow-blue-500/10 bg-slate-900'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border ${
                            isUserAnalista
                              ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          }`}
                        >
                          {u.nome.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <span>{u.nome}</span>
                            {isAtivo && (
                              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" title="Usuário Ativo no Navegador" />
                            )}
                          </h4>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span>{u.email}</span>
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isUserAnalista
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {u.perfil}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                      <span className="font-mono">ID: #{u.id}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-600" />
                        {u.criadoEm ? formatarData(u.criadoEm) : 'Cadastro inicial'}
                      </span>
                    </div>
                  </div>

                  {/* Botão de Troca Rápida de Sessão */}
                  <button
                    type="button"
                    onClick={() => setCurrentUser(u)}
                    disabled={isAtivo}
                    className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isAtivo
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 cursor-default'
                        : 'bg-slate-950 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-800 hover:border-blue-500'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{isAtivo ? 'Perfil Ativo na Sessão' : 'Simular Sessão como este Usuário'}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {usuariosFiltrados.length === 0 && (
            <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 p-6 text-slate-500 text-xs">
              Nenhum usuário encontrado correspondente ao filtro.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

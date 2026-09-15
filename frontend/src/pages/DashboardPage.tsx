import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  AlertCircle,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  PlusCircle,
  RefreshCw,
  User,
  Headphones,
  ArrowRight,
  Flame,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import type { Ticket } from '../types';
import { formatarData, getStatusConfig, getPrioridadeConfig } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const { usuarios, isAnalista } = useUser();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  // Filtros de busca
  const [statusFiltro, setStatusFiltro] = useState<string>('TODOS');
  const [prioridadeFiltro, setPrioridadeFiltro] = useState<string>('TODAS');
  const [apenasPendentes, setApenasPendentes] = useState<boolean>(false);
  const [buscaTexto, setBuscaTexto] = useState<string>('');

  // Carrega os tickets da API com base nos filtros
  const carregarTickets = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      let endpoint = '/tickets';
      const params: Record<string, string> = {};

      if (apenasPendentes) {
        endpoint = '/tickets/pendentes';
        if (prioridadeFiltro !== 'TODAS') {
          params.prioridade = prioridadeFiltro;
        }
      } else {
        if (statusFiltro !== 'TODOS') {
          params.status = statusFiltro;
        }
        if (prioridadeFiltro !== 'TODAS') {
          params.prioridade = prioridadeFiltro;
        }
      }

      const response = await api.get<Ticket[]>(endpoint, { params });
      setTickets(response.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar tickets da API';
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  }, [apenasPendentes, statusFiltro, prioridadeFiltro]);

  useEffect(() => {
    carregarTickets();
  }, [carregarTickets]);

  // Cálculos de métricas a partir dos tickets
  const totalGeral = tickets.length;
  const totalAbertos = tickets.filter(t => t.status === 'ABERTO').length;
  const totalEmAtendimento = tickets.filter(t => t.status === 'EM_ATENDIMENTO').length;
  const totalResolvidos = tickets.filter(t => t.status === 'RESOLVIDO').length;

  // Filtragem local por texto (busca rápida em tempo real)
  const ticketsExibidos = tickets.filter(t => {
    if (!buscaTexto.trim()) return true;
    const query = buscaTexto.toLowerCase();
    const matchTitulo = t.titulo.toLowerCase().includes(query);
    const matchDesc = t.descricao.toLowerCase().includes(query);
    const matchCat = t.categoria.toLowerCase().includes(query);
    const matchId = String(t.id).includes(query);
    return matchTitulo || matchDesc || matchCat || matchId;
  });

  const getNomeUsuario = (id?: number) => {
    if (!id) return 'Não atribuído';
    const user = usuarios.find(u => u.id === id);
    return user ? user.nome : `Usuário #${id}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header com Boas-vindas e Ação Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Painel de Atendimento Helpdesk</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Gestão de Chamados
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Acompanhe a fila de tickets em tempo real, filtre por status e prioridade, e realize atendimentos com histórico integrado.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={carregarTickets}
            title="Atualizar lista"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${carregando ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          
          <Link
            to="/novo-ticket"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Novo Chamado</span>
          </Link>
        </div>
      </div>

      {/* 4 Cards de Métricas no Topo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total */}
        <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-5 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total de Chamados</p>
              <p className="text-3xl font-extrabold text-white mt-1.5">{totalGeral}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Inbox className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Volume registrado na base</span>
          </div>
        </div>

        {/* Abertos */}
        <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-5 border border-amber-500/20 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-300 uppercase tracking-wider">Abertos (Triagem)</p>
              <p className="text-3xl font-extrabold text-amber-400 mt-1.5">{totalAbertos}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-300/80">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Aguardando atendimento inicial</span>
          </div>
        </div>

        {/* Em Atendimento */}
        <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-5 border border-blue-500/20 shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-300 uppercase tracking-wider">Em Atendimento</p>
              <p className="text-3xl font-extrabold text-blue-400 mt-1.5">{totalEmAtendimento}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-300/80">
            <Headphones className="w-3.5 h-3.5 text-blue-400" />
            <span>Com analista responsável</span>
          </div>
        </div>

        {/* Resolvidos */}
        <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-5 border border-emerald-500/20 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-300 uppercase tracking-wider">Resolvidos</p>
              <p className="text-3xl font-extrabold text-emerald-400 mt-1.5">{totalResolvidos}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-300/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chamados finalizados com sucesso</span>
          </div>
        </div>

      </div>

      {/* Barra de Filtros Dinâmicos */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Campo de Busca Rápida */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ID, título, categoria ou descrição..."
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Filtros em Dropdown */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Filtro por Status */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden lg:inline">Status:</span>
              <select
                value={statusFiltro}
                disabled={apenasPendentes}
                onChange={(e) => setStatusFiltro(e.target.value)}
                className={`text-xs rounded-xl px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-blue-500 transition-colors ${
                  apenasPendentes ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <option value="TODOS">Status: Todos</option>
                <option value="ABERTO">Aberto</option>
                <option value="EM_ATENDIMENTO">Em Atendimento</option>
                <option value="RESOLVIDO">Resolvido</option>
              </select>
            </div>

            {/* Filtro por Prioridade */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden lg:inline">Prioridade:</span>
              <select
                value={prioridadeFiltro}
                onChange={(e) => setPrioridadeFiltro(e.target.value)}
                className="text-xs rounded-xl px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="TODAS">Prioridade: Todas</option>
                <option value="CRITICA">Crítica</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Média</option>
                <option value="BAIXA">Baixa</option>
              </select>
            </div>

            {/* Botão de Filtro Rápido: Apenas Pendentes */}
            <button
              type="button"
              onClick={() => {
                setApenasPendentes(!apenasPendentes);
                if (!apenasPendentes) {
                  setStatusFiltro('TODOS');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                apenasPendentes
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apenas Pendentes</span>
            </button>

            {/* Limpar Filtros */}
            {(statusFiltro !== 'TODOS' || prioridadeFiltro !== 'TODAS' || apenasPendentes || buscaTexto) && (
              <button
                type="button"
                onClick={() => {
                  setStatusFiltro('TODOS');
                  setPrioridadeFiltro('TODAS');
                  setApenasPendentes(false);
                  setBuscaTexto('');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 underline px-2 py-1"
              >
                Limpar filtros
              </button>
            )}

          </div>

        </div>

        {/* Indicador de Filtro Ativo */}
        {apenasPendentes && (
          <div className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 flex items-center justify-between">
            <span>
              ⚡ Visualizando apenas chamados pendentes (status <strong>ABERTO</strong> ou <strong>EM_ATENDIMENTO</strong>) via <code>GET /tickets/pendentes</code>.
            </span>
          </div>
        )}
      </div>

      {/* Tratamento de Erro */}
      {erro && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{erro}</span>
          </div>
          <button
            type="button"
            onClick={carregarTickets}
            className="underline text-xs hover:text-rose-300"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Listagem de Chamados */}
      {carregando ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-3" />
          <p className="text-sm">Carregando chamados do sistema...</p>
        </div>
      ) : ticketsExibidos.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/80 p-8">
          <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">Nenhum chamado encontrado</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {buscaTexto || statusFiltro !== 'TODOS' || prioridadeFiltro !== 'TODAS' || apenasPendentes
              ? 'Nenhum ticket corresponde aos filtros selecionados. Tente redefinir os filtros.'
              : 'Não há chamados cadastrados na base de dados no momento.'}
          </p>
          <div className="mt-5">
            <Link
              to="/novo-ticket"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Criar Primeiro Chamado</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {ticketsExibidos.map((ticket) => {
            const statusCfg = getStatusConfig(ticket.status);
            const prioridadeCfg = getPrioridadeConfig(ticket.prioridade);
            const nomeCliente = getNomeUsuario(ticket.clienteId);
            const nomeAnalista = getNomeUsuario(ticket.analistaId);

            return (
              <div
                key={ticket.id}
                className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                {/* Lado Esquerdo: Identificação, Título e Descrição */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                      #TK-{String(ticket.id).padStart(3, '0')}
                    </span>
                    
                    {/* Badge de Status */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>

                    {/* Badge de Prioridade */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${prioridadeCfg.badge}`}>
                      {ticket.prioridade === 'CRITICA' && <Flame className="w-3 h-3" />}
                      Prioridade {prioridadeCfg.label}
                    </span>

                    {/* Categoria */}
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                      {ticket.categoria}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                    {ticket.titulo}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {ticket.descricao}
                  </p>

                  {/* Metadados: Cliente, Analista e Data */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5" title="Cliente solicitante">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Solicitante: <strong className="text-slate-300">{nomeCliente}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5" title="Analista responsável">
                      <Headphones className="w-3.5 h-3.5 text-slate-500" />
                      <span>Analista: <strong className={ticket.analistaId ? 'text-purple-300' : 'text-slate-500 font-normal'}>
                        {nomeAnalista}
                      </strong></span>
                    </div>

                    <div className="flex items-center gap-1.5" title="Data de abertura">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatarData(ticket.criadoEm)}</span>
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Botão de Ação */}
                <div className="shrink-0 flex items-center gap-2 self-stretch md:self-auto justify-end border-t md:border-t-0 border-slate-800/80 pt-3 md:pt-0">
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white font-medium text-xs border border-slate-700 hover:border-blue-500 transition-all shadow-sm"
                  >
                    <span>{isAnalista ? 'Atender / Detalhes' : 'Ver Detalhes'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  Headphones,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Trash2,
  UserPlus,
  RefreshCw,
  Flame,
  Lock,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import type { Ticket, Mensagem, StatusTicket } from '../types';
import { formatarData, getStatusConfig, getPrioridadeConfig } from '../utils/formatters';

export const TicketDetalhesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, usuarios, isAnalista } = useUser();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estados de ação do Analista
  const [executandoAcao, setExecutandoAcao] = useState<boolean>(false);
  const [mensagemAcao, setMensagemAcao] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [modalExcluirAberto, setModalExcluirAberto] = useState<boolean>(false);

  // Chat / Mensagens
  const [novoConteudo, setNovoConteudo] = useState<string>('');
  const [enviandoMensagem, setEnviandoMensagem] = useState<boolean>(false);

  const carregarDadosTicket = useCallback(async () => {
    if (!id) return;
    setCarregando(true);
    setErro(null);
    try {
      // 1. Busca detalhes do ticket
      const resTicket = await api.get<Ticket>(`/tickets/${id}`);
      setTicket(resTicket.data);

      // 2. Busca mensagens do ticket
      const resMensagens = await api.get<Mensagem[]>(`/tickets/${id}/mensagens`);
      setMensagens(resMensagens.data);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axErr = err as { response?: { data?: { mensagem?: string } } };
        setErro(axErr.response?.data?.mensagem || 'Ticket não encontrado.');
      } else {
        setErro('Erro ao comunicar com a API.');
      }
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    carregarDadosTicket();
  }, [carregarDadosTicket]);

  // Ação: Assumir Chamado (Analista)
  const handleAssumirChamado = async () => {
    if (!ticket || !currentUser || !isAnalista) return;
    setExecutandoAcao(true);
    setMensagemAcao(null);

    try {
      const response = await api.patch<Ticket>(`/tickets/${ticket.id}/atribuir`, {
        analistaId: currentUser.id
      });
      setTicket(response.data);
      setMensagemAcao({
        tipo: 'sucesso',
        texto: `Chamado atribuído com sucesso ao analista ${currentUser.nome}! Status alterado para EM ATENDIMENTO.`
      });
      // Recarrega mensagens caso tenha log
      const resMsg = await api.get<Mensagem[]>(`/tickets/${ticket.id}/mensagens`);
      setMensagens(resMsg.data);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { mensagem?: string } } }).response?.data?.mensagem
        : 'Erro ao assumir chamado.';
      setMensagemAcao({ tipo: 'erro', texto: msg || 'Falha na operação.' });
    } finally {
      setExecutandoAcao(false);
    }
  };

  // Ação: Alterar Status (Analista)
  const handleAlterarStatus = async (novoStatus: StatusTicket) => {
    if (!ticket || !currentUser || !isAnalista) return;
    setExecutandoAcao(true);
    setMensagemAcao(null);

    try {
      const response = await api.patch<Ticket>(`/tickets/${ticket.id}/status`, {
        novoStatus,
        usuarioId: currentUser.id
      });
      setTicket(response.data);
      setMensagemAcao({
        tipo: 'sucesso',
        texto: `Status do chamado alterado para ${novoStatus} com sucesso!`
      });
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { mensagem?: string } } }).response?.data?.mensagem
        : 'Erro ao alterar status.';
      setMensagemAcao({ tipo: 'erro', texto: msg || 'Falha ao alterar status.' });
    } finally {
      setExecutandoAcao(false);
    }
  };

  // Ação: Excluir Ticket (Analista ou Gestão)
  const handleExcluirTicket = async () => {
    if (!ticket) return;
    setExecutandoAcao(true);
    try {
      await api.delete(`/tickets/${ticket.id}`);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { mensagem?: string } } }).response?.data?.mensagem
        : 'Erro ao excluir chamado.';
      setMensagemAcao({ tipo: 'erro', texto: msg || 'Falha ao excluir.' });
      setModalExcluirAberto(false);
      setExecutandoAcao(false);
    }
  };

  // Ação: Enviar Mensagem no Chat
  const handleEnviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !currentUser || !novoConteudo.trim() || ticket.status === 'RESOLVIDO') return;

    setEnviandoMensagem(true);
    try {
      const response = await api.post<Mensagem>(`/tickets/${ticket.id}/mensagens`, {
        autorId: currentUser.id,
        conteudo: novoConteudo.trim()
      });

      setMensagens(prev => [...prev, response.data]);
      setNovoConteudo('');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { mensagem?: string } } }).response?.data?.mensagem
        : 'Erro ao enviar mensagem.';
      alert(`Falha ao enviar mensagem: ${msg}`);
    } finally {
      setEnviandoMensagem(false);
    }
  };

  const getNomeUsuario = (idUsuario?: number) => {
    if (!idUsuario) return 'Não atribuído';
    const u = usuarios.find(x => x.id === idUsuario);
    return u ? u.nome : `Usuário #${idUsuario}`;
  };

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="w-10 h-10 animate-spin text-blue-500 mb-3" />
        <p className="text-sm">Carregando dados do chamado #{id}...</p>
      </div>
    );
  }

  if (erro || !ticket) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Chamado não encontrado</h2>
        <p className="text-sm text-slate-400 mt-1">{erro || 'O chamado solicitado não existe ou foi removido.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a listagem</span>
        </Link>
      </div>
    );
  }

  const statusCfg = getStatusConfig(ticket.status);
  const prioridadeCfg = getPrioridadeConfig(ticket.prioridade);
  const isResolvido = ticket.status === 'RESOLVIDO';
  const nomeCliente = ticket.cliente?.nome || getNomeUsuario(ticket.clienteId);
  const emailCliente = ticket.cliente?.email || 'Sem e-mail';
  const nomeAnalista = ticket.analista?.nome || (ticket.analistaId ? getNomeUsuario(ticket.analistaId) : null);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Navegação Superior */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Chamados</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Atualizado em:</span>
          <span className="text-xs font-mono text-slate-300">{formatarData(ticket.atualizadoEm)}</span>
        </div>
      </div>

      {/* Alerta de Feedback de Ação */}
      {mensagemAcao && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between ${
            mensagemAcao.tipo === 'sucesso'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {mensagemAcao.tipo === 'sucesso' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{mensagemAcao.texto}</span>
          </div>
          <button
            type="button"
            onClick={() => setMensagemAcao(null)}
            className="text-xs underline opacity-80 hover:opacity-100"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Bloco Principal do Ticket */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        
        {/* Cabeçalho do Ticket */}
        <div className="p-6 sm:p-8 border-b border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                #TK-{String(ticket.id).padStart(3, '0')}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusCfg.bg}`}>
                <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label.toUpperCase()}
              </span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${prioridadeCfg.badge}`}>
                {ticket.prioridade === 'CRITICA' && <Flame className="w-3.5 h-3.5" />}
                PRIORIDADE {prioridadeCfg.label.toUpperCase()}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                {ticket.categoria}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Aberto em: {formatarData(ticket.criadoEm)}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {ticket.titulo}
          </h1>

          <div className="bg-slate-950/70 p-4 sm:p-5 rounded-xl border border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Descrição do Incidente / Solicitação:
            </h4>
            <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
              {ticket.descricao}
            </p>
          </div>

          {/* Cards de Solicitante e Analista Responsável */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Solicitante */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Cliente Solicitante</p>
                <p className="text-sm font-bold text-white">{nomeCliente}</p>
                <p className="text-xs text-slate-400">{emailCliente}</p>
              </div>
            </div>

            {/* Analista */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                nomeAnalista
                  ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                  : 'bg-slate-800 text-slate-500'
              }`}>
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Analista Responsável</p>
                {nomeAnalista ? (
                  <>
                    <p className="text-sm font-bold text-purple-300">{nomeAnalista}</p>
                    <p className="text-xs text-slate-400">{ticket.analista?.email || 'Em atendimento'}</p>
                  </>
                ) : (
                  <p className="text-xs text-amber-400 font-medium">Aguardando atribuição técnica</p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* PAINEL DE AÇÕES DO ANALISTA (Regra de Negócio P2) */}
        <div className="p-6 bg-slate-950/40 border-b border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Painel de Atendimento e Ciclo de Vida</span>
              </h3>
              <p className="text-xs text-slate-400">
                Controles para atribuição de responsável, transições de status e encerramento do chamado.
              </p>
            </div>

            {/* Botão de Excluir Chamado */}
            <button
              type="button"
              onClick={() => setModalExcluirAberto(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Chamado</span>
            </button>
          </div>

          {/* Bloqueio Visual para perfil CLIENTE */}
          {!isAnalista ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-200">
                  Acesso Restrito: Apenas Analistas de Suporte podem alterar o status ou assumir chamados.
                </p>
                <p className="text-amber-300/80">
                  Você está navegando como <strong>{currentUser?.nome}</strong> (Perfil: CLIENTE). Para testar o atendimento técnico, selecione um usuário com perfil <strong>ANALISTA</strong> no topo da Navbar.
                </p>
              </div>
            </div>
          ) : (
            /* Ações Habilitadas para ANALISTA */
            <div className="flex flex-wrap items-center gap-3 pt-1">
              
              {/* Botão: Assumir Chamado */}
              {!isResolvido && (
                <button
                  type="button"
                  disabled={executandoAcao || ticket.analistaId === currentUser?.id}
                  onClick={handleAssumirChamado}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    ticket.analistaId === currentUser?.id
                      ? 'bg-purple-900/30 text-purple-300 border border-purple-700/50 cursor-default'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 hover:scale-[1.02]'
                  } ${executandoAcao ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {ticket.analistaId === currentUser?.id
                      ? 'Chamado Atribuído a Você'
                      : 'Assumir Chamado (Atribuir a mim)'}
                  </span>
                </button>
              )}

              {/* Botão: Mudar para EM ATENDIMENTO */}
              {ticket.status === 'ABERTO' && (
                <button
                  type="button"
                  disabled={executandoAcao}
                  onClick={() => handleAlterarStatus('EM_ATENDIMENTO')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all"
                >
                  <Clock className="w-4 h-4" />
                  <span>Mudar para EM ATENDIMENTO</span>
                </button>
              )}

              {/* Botão: Resolver Chamado */}
              {!isResolvido && (
                <button
                  type="button"
                  disabled={executandoAcao}
                  onClick={() => handleAlterarStatus('RESOLVIDO')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 hover:scale-[1.02] transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Concluir e Marcar como RESOLVIDO</span>
                </button>
              )}

              {/* Status já Resolvido */}
              {isResolvido && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Este chamado foi finalizado e encerrado.</span>
                </div>
              )}

            </div>
          )}
        </div>

        {/* TIMELINE DE MENSAGENS / CHAT DE ATENDIMENTO */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Histórico de Mensagens e Interações ({mensagens.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={carregarDadosTicket}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Atualizar mensagens</span>
            </button>
          </div>

          {/* Lista de Mensagens */}
          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
            {mensagens.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Nenhuma mensagem registrada até o momento. Envie uma mensagem abaixo para iniciar a conversa técnica.
              </div>
            ) : (
              mensagens.map((msg) => {
                const isMsgAnalista = msg.autorPerfil === 'ANALISTA';
                const nomeAutor = getNomeUsuario(msg.autorId);

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMsgAnalista ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 border shadow-sm ${
                        isMsgAnalista
                          ? 'bg-purple-950/40 border-purple-800/40 text-purple-100 rounded-tr-none'
                          : 'bg-slate-800/80 border-slate-700/60 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {/* Autor e Perfil */}
                      <div className="flex items-center gap-2 mb-1.5 text-xs">
                        {isMsgAnalista ? (
                          <>
                            <span className="font-bold text-purple-300 flex items-center gap-1">
                              <Headphones className="w-3 h-3" />
                              {nomeAutor}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              ANALISTA
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="font-bold text-slate-200 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              {nomeAutor}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              CLIENTE
                            </span>
                          </>
                        )}
                        <span className="text-[10px] text-slate-400 ml-auto">
                          {formatarData(msg.criadoEm)}
                        </span>
                      </div>

                      {/* Conteúdo da Mensagem */}
                      <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.conteudo}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Campo de Envio de Nova Mensagem */}
          {isResolvido ? (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                <strong>Chamado Resolvido:</strong> O chat foi encerrado e não é permitido adicionar novas mensagens a este ticket.
              </span>
            </div>
          ) : (
            <form onSubmit={handleEnviarMensagem} className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  Respondendo como: <strong className="text-slate-200">{currentUser?.nome}</strong> ({currentUser?.perfil})
                </span>
                <span className="text-[11px] text-slate-500">
                  Visível para analistas e para o solicitante
                </span>
              </div>

              <div className="flex gap-2">
                <textarea
                  rows={2}
                  required
                  placeholder="Escreva sua resposta, esclarecimento técnico ou procedimento realizado..."
                  value={novoConteudo}
                  onChange={(e) => setNovoConteudo(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                />
                <button
                  type="submit"
                  disabled={enviandoMensagem || !novoConteudo.trim()}
                  className={`self-end flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all ${
                    enviandoMensagem || !novoConteudo.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

      {/* Modal de Confirmação de Exclusão */}
      {modalExcluirAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Excluir Chamado?</h3>
              <p className="text-xs text-slate-400">
                Tem certeza que deseja excluir o chamado <strong>#TK-{String(ticket.id).padStart(3, '0')} — &ldquo;{ticket.titulo}&rdquo;</strong>? Esta ação é irreversível e removerá todo o histórico de mensagens.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={executandoAcao}
                onClick={() => setModalExcluirAberto(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={executandoAcao}
                onClick={handleExcluirTicket}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-colors"
              >
                {executandoAcao ? (
                  <span>Excluindo...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirmar Exclusão</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

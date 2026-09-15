import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Send,
  Sparkles,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import type { PrioridadeTicket, Ticket } from '../types';

const CATEGORIAS_PADRAO = [
  'Redes',
  'Hardware',
  'Software',
  'Acesso',
  'Segurança',
  'Infraestrutura',
  'Outros'
];

export const NovoTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, usuarios, isAnalista } = useUser();

  const clientesDisponiveis = usuarios.filter(u => u.perfil === 'CLIENTE');

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Software');
  const [prioridade, setPrioridade] = useState<PrioridadeTicket>('MEDIA');
  const [clienteId, setClienteId] = useState<number>(() => {
    if (currentUser?.perfil === 'CLIENTE') return currentUser.id;
    return clientesDisponiveis[0]?.id || 1;
  });

  const [enviando, setEnviando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Sincroniza clienteId quando o usuário ativo mudar
  useEffect(() => {
    if (currentUser?.perfil === 'CLIENTE') {
      setClienteId(currentUser.id);
    } else if (clientesDisponiveis.length > 0 && !clientesDisponiveis.some(c => c.id === clienteId)) {
      setClienteId(clientesDisponiveis[0].id);
    }
  }, [currentUser, clientesDisponiveis, clienteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemErro(null);
    setMensagemSucesso(null);

    // Validações básicas de formulário
    if (!titulo.trim()) {
      setMensagemErro('Por favor, informe um título claro e objetivo para o chamado.');
      return;
    }
    if (!descricao.trim()) {
      setMensagemErro('Por favor, descreva detalhadamente a solicitação ou incidente.');
      return;
    }
    if (!clienteId) {
      setMensagemErro('Selecione um cliente solicitante válido para o chamado.');
      return;
    }

    setEnviando(true);

    try {
      const payload = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria: categoria.trim(),
        prioridade,
        clienteId: Number(clienteId)
      };

      const response = await api.post<Ticket>('/tickets', payload);
      const novoTicket = response.data;

      setMensagemSucesso(`Chamado #TK-${String(novoTicket.id).padStart(3, '0')} criado com sucesso! Redirecionando...`);

      // Redireciona para os detalhes do chamado recém-aberto
      setTimeout(() => {
        navigate(`/tickets/${novoTicket.id}`);
      }, 1200);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axErr = err as { response?: { data?: { mensagem?: string; erro?: string } } };
        const msgApi = axErr.response?.data?.mensagem || axErr.response?.data?.erro;
        setMensagemErro(msgApi || 'Falha ao registrar chamado. Verifique os dados e tente novamente.');
      } else if (err instanceof Error) {
        setMensagemErro(err.message);
      } else {
        setMensagemErro('Erro inesperado ao conectar com a API.');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Botão Voltar */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o Dashboard de Chamados</span>
        </Link>
      </div>

      {/* Header do Formulário */}
      <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Central de Ajuda & Atendimento</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Abertura de Novo Chamado
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Preencha os campos abaixo com o máximo de detalhes para agilizar o diagnóstico e resolução pela equipe técnica.
        </p>

        {/* Aviso de Perfil */}
        {isAnalista ? (
          <div className="mt-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-2.5">
            <UserCheck className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
            <div>
              <strong>Você está conectado como Analista ({currentUser?.nome}):</strong> Conforme a regra de negócio do Helpdesk, o chamado será registrado em nome do Cliente selecionado no formulário abaixo.
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Chamado vinculado à sua conta de cliente: <strong>{currentUser?.nome}</strong> ({currentUser?.email})</span>
          </div>
        )}
      </div>

      {/* Feedback de Sucesso */}
      {mensagemSucesso && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Feedback de Erro */}
      {mensagemErro && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3 animate-in shake">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{mensagemErro}</span>
        </div>
      )}

      {/* Formulário Principal */}
      <form onSubmit={handleSubmit} className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        
        {/* Título */}
        <div className="space-y-2">
          <label htmlFor="titulo" className="block text-sm font-semibold text-slate-200">
            Título do Chamado <span className="text-rose-500">*</span>
          </label>
          <input
            id="titulo"
            type="text"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Falha na conexão com a VPN corporativa"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          <p className="text-[11px] text-slate-400">
            Seja breve e claro ao resumir a falha ou necessidade técnica.
          </p>
        </div>

        {/* Linha dupla: Categoria e Prioridade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Categoria */}
          <div className="space-y-2">
            <label htmlFor="categoria" className="block text-sm font-semibold text-slate-200">
              Categoria <span className="text-rose-500">*</span>
            </label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {CATEGORIAS_PADRAO.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Prioridade */}
          <div className="space-y-2">
            <label htmlFor="prioridade" className="block text-sm font-semibold text-slate-200">
              Prioridade / Criticidade <span className="text-rose-500">*</span>
            </label>
            <select
              id="prioridade"
              value={prioridade}
              onChange={(e) => setPrioridade(e.target.value as PrioridadeTicket)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="BAIXA">🟢 Baixa — Dúvidas e solicitações sem urgência</option>
              <option value="MEDIA">🟡 Média — Problema pontual que permite trabalho</option>
              <option value="ALTA">🟠 Alta — Impacto expressivo em operações</option>
              <option value="CRITICA">🔴 Crítica — Bloqueio total / interrupção de serviço</option>
            </select>
          </div>

        </div>

        {/* Cliente Solicitante */}
        <div className="space-y-2">
          <label htmlFor="clienteId" className="block text-sm font-semibold text-slate-200">
            Cliente Solicitante <span className="text-rose-500">*</span>
          </label>
          <select
            id="clienteId"
            value={clienteId}
            onChange={(e) => setClienteId(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          >
            {clientesDisponiveis.map(cli => (
              <option key={cli.id} value={cli.id}>
                {cli.nome} ({cli.email})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">
            Apenas usuários com perfil <strong>CLIENTE</strong> podem figurar como solicitantes de chamados.
          </p>
        </div>

        {/* Descrição Detalhada */}
        <div className="space-y-2">
          <label htmlFor="descricao" className="block text-sm font-semibold text-slate-200">
            Descrição Detalhada do Problema <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="descricao"
            rows={5}
            required
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva o que aconteceu, mensagens de erro exibidas, setor afetado e qualquer procedimento já tentado..."
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-y"
          />
        </div>

        {/* Rodapé com Ações */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium text-center transition-colors"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={enviando}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] ${
              enviando ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {enviando ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Registrando chamado...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Abrir Chamado</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

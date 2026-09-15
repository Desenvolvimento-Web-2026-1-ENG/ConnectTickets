import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { NovoTicketPage } from './pages/NovoTicketPage';
import { TicketDetalhesPage } from './pages/TicketDetalhesPage';
import { UsuariosPage } from './pages/UsuariosPage';

export const App: React.FC = () => {
  return (
    <UserProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
          <Navbar />
          
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/novo-ticket" element={<NovoTicketPage />} />
              <Route path="/tickets/:id" element={<TicketDetalhesPage />} />
              <Route path="/usuarios" element={<UsuariosPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>ConnectTickets &copy; 2026 — Sistema de Gestão de Helpdesk e Atendimento (Avaliação P2)</p>
              <div className="flex items-center gap-4">
                <a
                  href="http://localhost:3000/api-docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-300 transition-colors"
                >
                  Swagger UI
                </a>
                <span>&bull;</span>
                <span className="text-slate-400 font-mono">v2.0.0-p2</span>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;

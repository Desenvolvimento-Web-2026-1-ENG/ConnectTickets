import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Usuario } from '../types';
import { api } from '../services/api';

interface UserContextType {
  currentUser: Usuario | null;
  setCurrentUser: (user: Usuario) => void;
  usuarios: Usuario[];
  carregandoUsuarios: boolean;
  recarregarUsuarios: () => Promise<void>;
  isAnalista: boolean;
  isCliente: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Fallback de usuários caso a API esteja temporariamente indisponível no primeiro render
const USUARIOS_FALLBACK: Usuario[] = [
  { id: 1, nome: 'Carlos Silva', email: 'carlos.silva@empresa.com', perfil: 'CLIENTE' },
  { id: 2, nome: 'Mariana Souza', email: 'mariana.souza@empresa.com', perfil: 'CLIENTE' },
  { id: 3, nome: 'Roberto Tech', email: 'roberto.tech@suporte.com', perfil: 'ANALISTA' },
  { id: 4, nome: 'Fernanda Help', email: 'fernanda.help@suporte.com', perfil: 'ANALISTA' }
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS_FALLBACK);
  const [currentUser, setCurrentUserState] = useState<Usuario | null>(USUARIOS_FALLBACK[0]);
  const [carregandoUsuarios, setCarregandoUsuarios] = useState<boolean>(true);

  const recarregarUsuarios = useCallback(async () => {
    try {
      const response = await api.get<Usuario[]>('/usuarios');
      if (Array.isArray(response.data) && response.data.length > 0) {
        setUsuarios(response.data);
        // Atualiza currentUser se ele ainda existir na lista nova ou se for o primeiro render
        setCurrentUserState(prev => {
          if (!prev) return response.data[0];
          const encontrado = response.data.find(u => u.id === prev.id);
          return encontrado || response.data[0];
        });
      }
    } catch (error) {
      console.warn('Não foi possível sincronizar usuários com a API no momento, usando cache local.', error);
    } finally {
      setCarregandoUsuarios(false);
    }
  }, []);

  useEffect(() => {
    recarregarUsuarios();
  }, [recarregarUsuarios]);

  const setCurrentUser = (user: Usuario) => {
    setCurrentUserState(user);
    localStorage.setItem('@connecttickets:user_id', String(user.id));
  };

  const isAnalista = currentUser?.perfil === 'ANALISTA';
  const isCliente = currentUser?.perfil === 'CLIENTE';

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        usuarios,
        carregandoUsuarios,
        recarregarUsuarios,
        isAnalista,
        isCliente
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser utilizado dentro de um UserProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, Club } from '../types';
import { api, CurrentUserSession } from '../services/api';
import { db } from '../services/db';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  club: Club | null;
  token: string | null;
  isLoading: boolean;
  loginStudent: (identifier: string, pass: string) => Promise<void>;
  loginClubPresident: (email: string, pass: string) => Promise<void>;
  loginSuperAdmin: (email: string, pass: string) => Promise<void>;
  registerStudent: (data: Parameters<typeof api.registerStudent>[0]) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
  switchDemoAccount: (role: UserRole, clubId?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<CurrentUserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [club, setClub] = useState<Club | null>(null);

  const syncClub = useCallback((currentUser: User | null) => {
    if (currentUser?.role === 'clubAdmin' && currentUser.clubId) {
      const c = db.getClubById(currentUser.clubId);
      setClub(c || null);
    } else {
      setClub(null);
    }
  }, []);

  const refreshUser = useCallback(() => {
    const active = api.getSession();
    if (active?.user) {
      const refreshed = db.findUserById(active.user.id);
      if (refreshed) {
        setSession({ user: refreshed, token: active.token });
        syncClub(refreshed);
      }
    }
  }, [syncClub]);

  useEffect(() => {
    const existing = api.getSession();
    if (existing) {
      setSession(existing);
      syncClub(existing.user);
    } else {
      // Default to demo student Fahim for frictionless first view, or let user start logged in
      const defaultStudent = db.findUserByEmailOrStudentId('fahim.cse@baust.edu.bd');
      if (defaultStudent) {
        const demoSession = {
          user: defaultStudent,
          token: 'demo_token_' + defaultStudent.id
        };
        api.setSession(demoSession);
        setSession(demoSession);
        syncClub(defaultStudent);
      }
    }
    setIsLoading(false);
  }, [syncClub]);

  const loginStudent = async (identifier: string, pass: string) => {
    const s = await api.loginStudent(identifier, pass);
    setSession(s);
    syncClub(s.user);
  };

  const loginClubPresident = async (email: string, pass: string) => {
    const s = await api.loginClubPresident(email, pass);
    setSession(s);
    syncClub(s.user);
  };

  const loginSuperAdmin = async (email: string, pass: string) => {
    const s = await api.loginSuperAdmin(email, pass);
    setSession(s);
    syncClub(s.user);
  };

  const registerStudent = async (data: Parameters<typeof api.registerStudent>[0]) => {
    await api.registerStudent(data);
  };

  const logout = () => {
    api.logout();
    setSession(null);
    setClub(null);
  };

  const switchDemoAccount = (targetRole: UserRole, targetClubId?: string) => {
    let targetUser: User | undefined;
    if (targetRole === 'superAdmin') {
      targetUser = db.findUserByEmailOrStudentId('asw@baust.edu.bd');
    } else if (targetRole === 'clubAdmin') {
      if (targetClubId === 'c2') {
        targetUser = db.findUserByEmailOrStudentId('robotics.president@baust.edu.bd');
      } else {
        targetUser = db.findUserByEmailOrStudentId('bcc.president@baust.edu.bd');
      }
    } else {
      targetUser = db.findUserByEmailOrStudentId('fahim.cse@baust.edu.bd');
    }

    if (targetUser) {
      const newSession: CurrentUserSession = {
        user: targetUser,
        token: 'quick_demo_' + targetUser.id
      };
      api.setSession(newSession);
      setSession(newSession);
      syncClub(targetUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        role: session?.user?.role || null,
        club,
        token: session?.token || null,
        isLoading,
        loginStudent,
        loginClubPresident,
        loginSuperAdmin,
        registerStudent,
        logout,
        refreshUser,
        switchDemoAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

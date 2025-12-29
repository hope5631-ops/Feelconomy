import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    userEmail: string | null;
    userName: string | null;
    userRole: string | null;
    login: (email: string, name: string, role: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    const login = (email: string, name: string, role: string) => {
        setIsAuthenticated(true);
        setUserEmail(email);
        setUserName(name);
        setUserRole(role);
    };

    const logout = () => {
        console.log('Logging out...');
        setIsAuthenticated(false);
        setUserEmail(null);
        setUserName(null);
        setUserRole(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userEmail, userName, userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

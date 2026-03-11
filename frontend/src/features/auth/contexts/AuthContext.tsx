import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, UserProfile } from '../../types';

const defaultUser: UserProfile = {
    id: 'usr_mock_123',
    username: 'admin',
    email: 'admin@orionex.id',
    full_name: 'Orionex Admin',
    is_superuser: true,
    app_permissions: {
        rolling_skeleton: {
            'finance': true,
            'sso': true,
            'monitoring': true,
            'utilities': true,
        }
    }
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Mock authentication delay
        const initAuth = setTimeout(() => {
            setUser(defaultUser);
            setToken('mock_token_xyz');
            setIsAuthenticated(true);
            setIsLoading(false);
        }, 800);

        return () => clearTimeout(initAuth);
    }, []);

    const logout = () => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        // In a real app, redirect to login
        window.location.reload();
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

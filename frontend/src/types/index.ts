import React from 'react';

export interface NavItem {
    id: string;
    label: string;
    icon?: React.ComponentType<any>;
    path?: string;
    children?: NavItem[];
    isOpen?: boolean;
}

export interface UserPermissions {
    [appSlug: string]: {
        [feature: string]: boolean;
    };
}

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    full_name?: string;
    picture?: string;
    is_superuser: boolean;
    app_permissions?: UserPermissions;
}

export interface AuthContextType {
    user: UserProfile | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => void;
}

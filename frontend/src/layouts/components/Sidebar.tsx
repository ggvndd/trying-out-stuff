import React, { useMemo, useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Menu,
    X,
    ChevronLeft,
    ChevronDown,
    ChevronRight,
    Settings,
    Briefcase,
    FileText
} from 'lucide-react';
import { NavItem } from '@/types';
import { useAuth } from '@/features/auth/contexts/AuthContext';

interface SidebarProps {
    isDarkMode: boolean;
    isCollapsed: boolean;
    isMobileMenuOpen: boolean;
    toggleSidebar: () => void;
    closeMobileMenu: () => void;
    onNavigate: (path: string) => void;
    currentPath: string;
}

// Ensure you replace this with the appropriate app slug for your new project
const APP_SLUG = 'template_app';

const Sidebar: React.FC<SidebarProps> = ({
    isDarkMode,
    isCollapsed,
    isMobileMenuOpen,
    toggleSidebar,
    closeMobileMenu,
    onNavigate,
    currentPath
}) => {
    const { user } = useAuth();
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

    // Boilerplate navigation structure
    const rawNavItems: NavItem[] = useMemo(() => [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        {
            id: 'feature-group',
            label: 'Feature Group',
            icon: Briefcase,
            children: [
                { id: 'example-page-1', label: 'Example Page', icon: FileText, path: '/example' }
            ]
        },
        { id: 'accounts', label: 'Chart of Accounts', icon: FileText, path: '/accounts' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
    ], []);

    const menuItems = useMemo(() => {
        if (!user) return [];

        const hasPermission = (itemId: string) => {
            // Basic access control logic - modify as needed for your app
            if (itemId === 'dashboard') return true;
            if (user.is_superuser) return true;
            const appPerms = user.app_permissions?.[APP_SLUG] as Record<string, boolean>;
            return appPerms && appPerms[itemId] === true;
        };

        const filterItems = (items: NavItem[]): NavItem[] => {
            return items.reduce((acc: NavItem[], item) => {
                if (item.children) {
                    const visibleChildren = filterItems(item.children);
                    if (visibleChildren.length > 0) {
                        acc.push({ ...item, children: visibleChildren });
                    }
                } else {
                    if (hasPermission(item.id)) {
                        acc.push(item);
                    }
                }
                return acc;
            }, []);
        };

        // For the boilerplate, we bypass the permission filter so all items are visible during development
        // Switch to `return filterItems(rawNavItems);` to enable dynamic permission checks
        return rawNavItems;
    }, [user, rawNavItems]);

    useEffect(() => {
        const newExpanded: Record<string, boolean> = { ...expandedItems };
        let changed = false;

        menuItems.forEach(item => {
            if (item.children) {
                const hasActiveChild = item.children.some(child => child.path === currentPath);
                if (hasActiveChild && !newExpanded[item.id]) {
                    newExpanded[item.id] = true;
                    changed = true;
                }
            }
        });

        if (changed) {
            setExpandedItems(newExpanded);
        }
    }, [currentPath, menuItems]);

    const toggleGroup = (id: string) => {
        if (isCollapsed) {
            toggleSidebar();
            setExpandedItems(prev => ({ ...prev, [id]: true }));
        } else {
            setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
        }
    };

    const handleItemClick = (item: NavItem) => {
        if (item.children) {
            toggleGroup(item.id);
        } else if (item.path) {
            onNavigate(item.path);
            if (window.innerWidth < 768) {
                closeMobileMenu();
            }
        }
    };

    const renderMenuItem = (item: NavItem, depth = 0) => {
        const isActive = item.path === currentPath;
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems[item.id];
        const isChildActive = hasChildren && item.children?.some(c => c.path === currentPath);
        const paddingLeft = depth > 0 ? (isCollapsed ? 0 : 2.5) : 1;

        return (
            <div key={item.id} className="w-full relative group">
                <button
                    onClick={() => handleItemClick(item)}
                    className={`
            w-[calc(100%-2rem)] mx-4 mb-2 flex items-center transition-all duration-300 rounded-lg border
            ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3'}
            py-3.5 font-display text-sm font-medium group
            ${isActive
                            ? 'bg-[#0030FF]/10 border-[#0030FF]/50 text-[#0030FF] dark:bg-[#0030FF]/20 dark:border-[#0030FF]/50 dark:text-white'
                            : isChildActive
                                ? 'text-[#0030FF] dark:text-white border-transparent'
                                : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                        }
          `}
                    style={{ paddingLeft: !isCollapsed && depth > 0 ? `${paddingLeft}rem` : undefined }}
                    title={isCollapsed ? item.label : undefined}
                >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''} gap-3 md:gap-3`}>
                        <div className={`transition-colors duration-300 ${isActive ? 'text-[#0030FF] dark:text-orionYellow' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                            {item.icon && <item.icon size={isCollapsed ? 22 : 18} />}
                        </div>
                        <span className={`${isCollapsed ? 'hidden' : 'block'} tracking-wide`}>{item.label}</span>
                    </div>

                    {!isCollapsed && hasChildren && (
                        <div className="text-slate-400">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                    )}
                </button>

                {isCollapsed && (
                    <div className="hidden md:block absolute left-full top-0 ml-2 p-2 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                        {item.label}
                    </div>
                )}

                {!isCollapsed && hasChildren && isExpanded && (
                    <div className="bg-slate-50/50 dark:bg-slate-800/20 mt-1 mb-2 rounded-xl mx-2 overflow-hidden py-1">
                        {item.children?.map(child => renderMenuItem(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className={`
            fixed inset-y-0 left-0 z-50 md:z-20
            bg-white dark:bg-[#0a0a2a] border-r border-slate-200 dark:border-slate-800/80 shadow-2xl
            flex flex-col transition-all duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            ${isCollapsed ? 'md:w-20' : 'md:w-72'}
            w-72 overflow-hidden
        `}
        >
            <div className={`h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800/80 transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0' : ''}`}>
                <div className={`flex items-center gap-2 ${isCollapsed ? 'md:hidden' : ''}`}>
                    <img
                        src={isDarkMode
                            ? "https://storage.orionex.id/orionex-storage/orionex_tiny_white.png"
                            : "https://storage.orionex.id/orionex-storage/orionex_tiny_white.png"
                        }
                        alt="Orionex"
                        className={`h-8 object-contain transition-opacity duration-200 ${!isDarkMode ? 'invert' : ''}`}
                    />
                </div>

                <button
                    onClick={toggleSidebar}
                    className="hidden md:block p-1 rounded-md text-slate-400 hover:text-orionBlue hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                    {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                </button>

                <button
                    onClick={closeMobileMenu}
                    className="md:hidden p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 scrollbar-hide overflow-x-hidden">
                {!isCollapsed && (
                    <div className="px-6 py-4 mb-2 text-[10px] font-display font-bold text-slate-500 tracking-widest uppercase">
                        Application Modules
                    </div>
                )}
                {menuItems.map(item => renderMenuItem(item))}
            </div>

            <div className="p-6 relative z-20">
                <div className={`bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 flex items-center gap-3 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${isCollapsed ? 'justify-center p-2' : ''}`}>
                    {user?.picture ? (
                        <img
                            src={user.picture}
                            alt="User"
                            className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#0030FF]/10 text-[#0030FF] dark:bg-[#0030FF]/20 dark:text-white border border-[#0030FF]/50 flex items-center justify-center font-bold text-xs shrink-0">
                            {user?.full_name ? user.full_name[0].toUpperCase() : user?.email?.[0].toUpperCase()}
                        </div>
                    )}

                    <div className={`flex flex-col overflow-hidden whitespace-nowrap ${isCollapsed ? 'hidden' : 'block'}`}>
                        <span className="text-sm font-display font-bold text-slate-900 dark:text-white truncate max-w-[140px]" title={user?.full_name || user?.email}>
                            {user?.full_name || user?.email?.split('@')[0] || 'User'}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {user?.is_superuser ? 'System Administrator' : 'Staff'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;

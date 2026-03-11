import React from 'react';
import { Bell, Home, Moon, Sun, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/AuthContext';

interface HeaderProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
    toggleMobileMenu: () => void;
    currentPath: string;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme, toggleMobileMenu, currentPath }) => {
    const { logout } = useAuth();

    const getPageTitle = () => {
        // Boilerplate page title logic
        if (currentPath === '/') return 'Dashboard';
        if (currentPath.startsWith('/example')) return 'Feature Group / Example Page';
        if (currentPath.startsWith('/settings')) return 'Settings';

        // Fallback logic for nested routes
        const pathParts = currentPath.split('/').filter(Boolean);
        if (pathParts.length > 0) {
            return pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
        }

        return 'Dashboard';
    };

    const title = getPageTitle();
    const isCompound = title.includes(' / ');
    const [category, page] = isCompound ? title.split(' / ') : ['', title];

    return (
        <header className="h-16 flex items-center justify-between px-4 md:px-6 sticky top-4 mx-4 mt-4 mb-4 lg:mx-8 z-10 transition-all duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg rounded-2xl">
            <div className="flex items-center gap-3 md:gap-0">
                <button
                    onClick={toggleMobileMenu}
                    className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <Menu size={24} />
                </button>

                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 font-sans">
                    <Home size={16} className="mr-2 hover:text-orionBlue cursor-pointer hidden sm:block transition-colors" />
                    <span className="mx-2 hidden sm:inline">/</span>

                    {isCompound ? (
                        <>
                            <span className="hidden sm:inline hover:text-slate-800 dark:hover:text-slate-200 transition-colors">{category}</span>
                            <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[150px] sm:max-w-none">{page}</span>
                        </>
                    ) : (
                        <span className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[150px] sm:max-w-none">{title}</span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl bg-slate-200/50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Toggle Theme"
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="relative cursor-pointer p-2 rounded-xl bg-slate-200/50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                    <Bell size={20} className="text-slate-600 dark:text-slate-300" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-orionBlue text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white dark:border-slate-900 shadow-sm">
                        1
                    </span>
                </div>

                <div className="h-6 w-px bg-slate-200 border-none dark:bg-white/10 mx-1"></div>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded-xl transition-all"
                    title="Sign Out"
                >
                    <LogOut size={18} />
                    <span className="hidden sm:inline font-sans">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Header;

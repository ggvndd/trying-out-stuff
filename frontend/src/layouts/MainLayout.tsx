import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '@/layouts/components/Sidebar';
import Header from '@/layouts/components/Header';

const MainLayout: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        const match = document.cookie.match(/(^| )ornx-theme=([^;]+)/);
        if (match) return match[2] === 'dark';
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
        return false;
    });
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [currentPath]);

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const next = !prev;
            const domainStr = window.location.hostname.includes('orionex.id') ? '; domain=.orionex.id' : '';
            document.cookie = `ornx-theme=${next ? 'dark' : 'light'}; path=/${domainStr}; max-age=31536000`;
            return next;
        });
    };
    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden font-sans">
            <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse pointer-events-none z-0"></div>

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <Sidebar
                isDarkMode={isDarkMode}
                isCollapsed={isSidebarCollapsed}
                isMobileMenuOpen={isMobileMenuOpen}
                toggleSidebar={toggleSidebar}
                closeMobileMenu={() => setIsMobileMenuOpen(false)}
                onNavigate={(path) => navigate(path)}
                currentPath={currentPath}
            />

            <div
                className={`flex-1 flex flex-col transition-all duration-300 ease-in-out h-screen overflow-hidden ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-72'} w-full`}
            >
                <Header
                    isDarkMode={isDarkMode}
                    toggleTheme={toggleTheme}
                    toggleMobileMenu={toggleMobileMenu}
                    currentPath={currentPath}
                />

                <main className="flex-1 overflow-x-hidden overflow-y-auto w-full relative z-10 px-4 md:px-8 pb-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;

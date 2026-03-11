import React from 'react';
import { Activity, Code } from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/AuthContext';

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6 lg:space-y-8">
            {/* Welcome Section */}
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-white/10 p-6 lg:p-8 rounded-3xl relative overflow-hidden group shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orionBlue/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none transition-all group-hover:bg-orionBlue/20"></div>
                <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-800 dark:text-white mb-2 relative z-10">
                    Welcome to the Orionex Template, {user?.full_name || user?.email?.split('@')[0] || 'Developer'}!
                </h1>
                <p className="text-sm lg:text-base text-slate-500 dark:text-slate-400 max-w-2xl mt-4">
                    This is your enterprise-grade ViteJS boilerplate. You are logged in with mock credentials as <span className="font-medium text-slate-700 dark:text-slate-300">{user?.email}</span>.
                </p>
                <p className="text-sm lg:text-base text-slate-500 dark:text-slate-400 max-w-2xl mt-2">
                    Use the domain-driven folder structure to scale your new application seamlessly. Add your module pages inside <code>src/features</code>, and remember to use lazy loading in <code>App.tsx</code> for route-level code splitting.
                </p>
                <div className="mt-8 flex gap-3 relative z-10">
                    <button className="px-6 py-3 bg-orionBlue text-white rounded-xl shadow-[0_0_20px_rgba(0,48,255,0.3)] hover:shadow-[0_0_25px_rgba(0,48,255,0.5)] hover:-translate-y-0.5 transition-all font-medium text-sm flex items-center gap-2">
                        Start Building <Code size={16} />
                    </button>
                </div>
            </div>

            {/* Empty State / Placeholder Content */}
            <div className="bg-transparent border-2 border-dashed border-slate-300 dark:border-white/10 rounded-3xl p-8 lg:p-12 flex flex-col items-center justify-center text-center hover:border-orionBlue/50 hover:bg-orionBlue/5 transition-all duration-300">
                <div className="w-16 h-16 bg-orionBlue/10 rounded-full flex items-center justify-center mb-4 relative">
                    <div className="absolute inset-0 bg-orionBlue/20 rounded-full blur-md animate-pulse"></div>
                    <Activity size={32} className="text-orionBlue relative z-10" />
                </div>
                <h3 className="text-xl font-display font-semibold text-slate-800 dark:text-white">Example Feature Module</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2 mb-6 text-sm lg:text-base font-sans">
                    Navigate to the Example Feature page from the sidebar to view dynamic routing capabilities. Replace this boilerplate content with your own actual business requirements.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;

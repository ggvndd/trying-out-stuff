import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} // Premium custom ease
            className="w-full h-full flex flex-col"
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;

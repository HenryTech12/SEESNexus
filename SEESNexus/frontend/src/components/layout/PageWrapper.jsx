import React from 'react';
import { motion } from 'framer-motion';

const PageWrapper = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`min-h-[calc(100vh-64px)] p-6 lg:p-10 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;

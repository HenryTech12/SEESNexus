import React from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-sees-void overflow-hidden">
      {/* Brand Panel */}
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-sees relative overflow-hidden">
        {/* Animated Background Pulse */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute w-[800px] h-[800px] bg-sees-mint rounded-full blur-[120px]"
        />

        <div className="relative z-10 text-center">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sees-glow">
            <span className="text-sees-mint font-black text-5xl">N</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">SEES NEXUS</h1>
          <p className="text-xl text-sees-mint/80 font-medium max-w-md">
            The digital ecosystem for engineering students at UNILAG.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6 opacity-40">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-sees-mint to-transparent" />
            <div className="h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
            <div className="h-[1px] bg-gradient-to-r from-transparent via-sees-mint to-transparent" />
          </div>
        </div>
      </div>

      {/* Form Area */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 bg-gradient-sees rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sees-glow">
              <span className="text-sees-mint font-black text-2xl">N</span>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-black text-white mb-2">{title}</h2>
            <p className="text-white/60">{subtitle}</p>
          </div>

          <div className="mt-8 glass-card p-8 border-sees-mint/10 bg-white/5">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;

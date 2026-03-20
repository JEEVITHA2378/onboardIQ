import React from 'react';
import { motion } from 'framer-motion';

export const GoldButton = ({ children, onClick, className = '', type = 'button', disabled = false }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden group bg-surface border border-gold-muted text-gold-light px-6 py-3 rounded-card transition-all ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gold-primary hover:shadow-gold-glow'}`}
    >
      <div className="absolute inset-0 bg-gold-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="relative z-10 font-mono text-sm tracking-wider uppercase">
        {children}
      </span>
    </motion.button>
  );
};

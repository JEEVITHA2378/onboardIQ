import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({ children, onClick, className = '', type = 'button', disabled = false, variant = 'primary' }) => {
  const baseClasses = "relative overflow-hidden font-body font-medium transition-all rounded-card flex items-center justify-center";
  
  let variantClasses = "";
  if (variant === 'primary') {
    variantClasses = "bg-primary-dark text-white hover:bg-[#1e293b] shadow-soft border border-transparent";
  } else if (variant === 'outline') {
    variantClasses = "bg-white text-primary-dark border border-border hover:bg-surface shadow-sm";
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} px-6 py-3 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </motion.button>
  );
};

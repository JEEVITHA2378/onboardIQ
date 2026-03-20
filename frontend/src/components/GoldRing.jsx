import React from 'react';
import { motion } from 'framer-motion';

export const GoldRing = ({ size = 64 }) => {
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
        className="absolute inset-0 rounded-full border-t-2 border-r-2 border-gold-primary opacity-70"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 4, ease: 'linear', repeat: Infinity }}
        className="absolute inset-2 rounded-full border-b-2 border-l-2 border-gold-muted opacity-50"
      />
      <div className="w-2 h-2 bg-gold-light rounded-full shadow-gold-glow" />
    </div>
  );
};

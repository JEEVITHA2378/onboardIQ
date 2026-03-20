import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const ReasoningCard = ({ title, description, status = 'success' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-surface border border-border rounded-card p-4 flex items-start gap-4 shadow-sm"
    >
      <div className="mt-0.5">
        {status === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-green" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber" />
        )}
      </div>
      <div>
        <h4 className="text-primary-dark font-semibold font-headline mb-1">{title}</h4>
        <p className="text-muted text-sm font-body leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

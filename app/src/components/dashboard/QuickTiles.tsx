import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { ElementType } from 'react';

export interface QuickTileProps {
  icon: ElementType;
  label: string;
  to: string;
}

export function QuickTile({ icon: Icon, label, to }: QuickTileProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link
        to={to}
        className="flex flex-col items-center justify-center gap-2 min-h-[80px] bg-bg-elevated border border-[rgba(90,94,117,0.2)] rounded-[10px] p-4 hover:border-[rgba(14,165,233,0.5)] hover:bg-accent-teal-glow transition-all duration-200"
      >
        <Icon className="w-6 h-6 text-accent-teal" />
        <span className="text-sm font-medium text-text-primary text-center">{label}</span>
      </Link>
    </motion.div>
  );
}

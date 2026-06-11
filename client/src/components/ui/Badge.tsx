import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'rust' | 'ink' | 'sprocket' | 'slate' | 'smoke';
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'ink' }) => {
  const colorMap = {
    rust: "bg-rust text-white",
    ink: "bg-ink text-chalk",
    sprocket: "bg-sprocket text-ink",
    slate: "bg-slate text-white",
    smoke: "bg-smoke text-ink border border-steel/20"
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-mono tracking-tight uppercase rounded-sm ${colorMap[color]}`}>
      {children}
    </span>
  );
};
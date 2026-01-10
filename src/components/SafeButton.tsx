"use client";

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface SafeButtonProps extends ButtonProps {
  children: React.ReactNode;
  to?: string;
}

const SafeButton: React.FC<SafeButtonProps> = ({ children, to, ...props }) => {
  // If 'to' prop is provided, render as a Link
  if (to) {
    return (
      <Link
        to={to}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
      >
        {children}
      </Link>
    );
  }

  // For regular buttons
  return (
    <Button {...props}>
      {children}
    </Button>
  );
};

export default SafeButton;
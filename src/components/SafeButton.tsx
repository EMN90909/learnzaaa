"use client";

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';

interface SafeButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const SafeButton: React.FC<SafeButtonProps> = ({ children, ...props }) => {
  // Ensure children is always wrapped in a single element
  const wrappedChildren = React.Children.count(children) > 1
    ? <span>{children}</span>
    : children;

  return (
    <Button {...props}>
      {wrappedChildren}
    </Button>
  );
};

export default SafeButton;
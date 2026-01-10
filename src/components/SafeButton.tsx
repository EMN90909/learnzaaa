"use client";

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';

interface SafeButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const SafeButton: React.FC<SafeButtonProps> = ({ children, asChild, ...props }) => {
  // Handle the asChild case specially
  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement;
    return React.cloneElement(child, {
      className: child.props.className,
      ...props,
    });
  }

  // For regular buttons, ensure children is always wrapped in a single element
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
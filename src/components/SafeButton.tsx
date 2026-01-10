"use client";

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';

interface SafeButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const SafeButton: React.FC<SafeButtonProps> = ({ children, asChild, ...props }) => {
  // If asChild is used, we need to ensure we have exactly one child
  if (asChild) {
    const childrenArray = React.Children.toArray(children);

    // If there are multiple children, wrap them in a single element
    if (childrenArray.length > 1) {
      const wrappedChild = (
        <span className="flex items-center gap-2">
          {children}
        </span>
      );

      // Clone the element and pass props
      return React.cloneElement(wrappedChild, {
        ...props,
        className: `${wrappedChild.props.className || ''} ${props.className || ''}`
      });
    }

    // If there's exactly one child, clone it with props
    const child = childrenArray[0] as React.ReactElement;
    return React.cloneElement(child, {
      ...props,
      className: `${child.props.className || ''} ${props.className || ''}`
    });
  }

  // For regular buttons, ensure children is always wrapped properly
  const wrappedChildren = React.Children.count(children) > 1
    ? <span className="flex items-center gap-2">{children}</span>
    : children;

  return (
    <Button {...props}>
      {wrappedChildren}
    </Button>
  );
};

export default SafeButton;
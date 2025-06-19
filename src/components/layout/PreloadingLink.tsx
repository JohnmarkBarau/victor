import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { usePreloadOnHover } from '../../hooks/usePreloadRoute';

interface PreloadingLinkProps extends LinkProps {
  to: string;
  preload?: boolean;
  children: React.ReactNode;
}

export function PreloadingLink({ 
  to, 
  preload = true, 
  children, 
  ...props 
}: PreloadingLinkProps) {
  const getPreloadHandler = usePreloadOnHover();

  const handleMouseEnter = preload ? getPreloadHandler(to) : undefined;

  return (
    <Link
      to={to}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </Link>
  );
}
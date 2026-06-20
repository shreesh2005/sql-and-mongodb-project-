import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6 border-b border-gray-100 dark:border-slate-800/60", className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ className, children, ...props }) => {
  return (
    <h3
      className={cn("text-lg font-bold leading-none tracking-tight text-gray-950 dark:text-slate-50", className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ className, children, ...props }) => {
  return (
    <p className={cn("text-xs text-gray-500 dark:text-slate-400 mt-1", className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ className, children, ...props }) => {
  return <div className={cn("p-6", className)} {...props}>{children}</div>;
};

export const CardFooter = ({ className, children, ...props }) => {
  return <div className={cn("flex items-center p-6 pt-0 border-t border-gray-100 dark:border-slate-800/60 mt-6", className)} {...props}>{children}</div>;
};


import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-lavender-600 text-white hover:bg-lavender-700 shadow-sm hover:shadow-md hover:shadow-lavender-500/20 hover:scale-[1.02]",
    secondary: "bg-white text-charcoal-700 border border-charcoal-200 hover:bg-charcoal-50 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md",
    ghost: "bg-transparent text-charcoal-600 hover:bg-charcoal-50"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="w-full space-y-2">
    {label && <label className="text-sm font-medium text-charcoal-700">{label}</label>}
    <input 
      className={`w-full px-4 py-2.5 bg-white border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-lavender-500 outline-none transition-all duration-200 shadow-sm ${className}`} 
      {...props} 
    />
  </div>
);

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }> = ({ children, className = '', ...props }) => (
  <div 
    className={`bg-white rounded-xl shadow-sm border border-charcoal-100 p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
);

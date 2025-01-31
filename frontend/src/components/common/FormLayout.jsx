import React from 'react';

export const FormSection = ({ children, className = "" }) => (
  <div className={`space-y-4 ${className}`}>
    {children}
  </div>
);

export const FormActions = ({ children, isDarkMode, isMobile }) => (
  <div className={`
    ${isMobile ? 'flex flex-col' : 'flex flex-row-reverse'} 
    gap-3 pt-6 mt-6
    border-t
    ${isDarkMode ? 'border-slate-700' : 'border-orange-200'}
  `}>
    {children}
  </div>
);

const FormLayout = ({ children, onSubmit, className = "" }) => (
  <form onSubmit={onSubmit} className={`space-y-6 ${className}`}>
    {children}
  </form>
);

export default FormLayout;

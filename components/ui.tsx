import React from 'react';

// ============================================
// BUTTON
// ============================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-500 shadow-lg shadow-indigo-500/25',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 focus:ring-slate-500',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-300 focus:ring-slate-500',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-base gap-2',
    lg: 'px-8 py-3.5 text-lg gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

// ============================================
// CARD
// ============================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  title, 
  subtitle,
  actions,
  noPadding = false,
}) => {
  return (
    <div className={`bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-3xl overflow-hidden ${className}`}>
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-bold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};

// ============================================
// INPUT
// ============================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-slate-900/60 border rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
          error ? 'border-rose-500' : 'border-slate-700'
        } ${className}`}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-rose-400">{error}</p>
      )}
    </div>
  );
};

// ============================================
// SELECT
// ============================================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className={`w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

// ============================================
// TOGGLE
// ============================================

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  description,
  checked,
  onChange,
}) => {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-slate-700 rounded-full peer-checked:bg-indigo-600 transition-colors" />
        <div className="absolute left-1 top-1 w-4 h-4 bg-slate-300 rounded-full transition-transform peer-checked:translate-x-5 peer-checked:bg-white" />
      </div>
      <div>
        <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
          {label}
        </div>
        {description && (
          <div className="text-xs text-slate-500 mt-0.5">{description}</div>
        )}
      </div>
    </label>
  );
};

// ============================================
// TOAST
// ============================================

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200',
    error: 'bg-rose-500/20 border-rose-500/50 text-rose-200',
    info: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-2xl border backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-right ${colors[type]}`}>
      <span className="text-lg">{icons[type]}</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        ✕
      </button>
    </div>
  );
};

// ============================================
// SECTION HEADER
// ============================================

interface SectionHeaderProps {
  icon?: string;
  title: string;
  color?: 'indigo' | 'purple' | 'teal' | 'blue' | 'amber';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  color = 'indigo',
}) => {
  const colors = {
    indigo: 'text-indigo-400 bg-indigo-500',
    purple: 'text-purple-400 bg-purple-500',
    teal: 'text-teal-400 bg-teal-500',
    blue: 'text-blue-400 bg-blue-500',
    amber: 'text-amber-400 bg-amber-500',
  };

  return (
    <h4 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${colors[color].split(' ')[0]}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${colors[color].split(' ')[1]}`} />
      {icon && <span>{icon}</span>}
      {title}
    </h4>
  );
};

// ============================================
// EMPTY STATE
// ============================================

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700/50">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-200 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
};

// ============================================
// PROGRESS BAR
// ============================================

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  className = '' 
}) => {
  return (
    <div className={`h-2 bg-slate-700/50 rounded-full overflow-hidden ${className}`}>
      <div 
        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
};

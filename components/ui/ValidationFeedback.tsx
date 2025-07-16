import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface ValidationFeedbackProps {
  isValid?: boolean;
  error?: string;
  warning?: string;
  showSuccess?: boolean;
  className?: string;
}

/**
 * ValidationFeedback component provides visual feedback for form validation
 */
export default function ValidationFeedback({ 
  isValid, 
  error, 
  warning, 
  showSuccess = true,
  className = '' 
}: ValidationFeedbackProps) {
  if (error) {
    return (
      <div className={`flex items-start space-x-2 mt-1 ${className}`}>
        <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
        <span className="text-sm text-red-400">{error}</span>
      </div>
    );
  }

  if (warning) {
    return (
      <div className={`flex items-start space-x-2 mt-1 ${className}`}>
        <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
        <span className="text-sm text-yellow-400">{warning}</span>
      </div>
    );
  }

  if (isValid && showSuccess) {
    return (
      <div className={`flex items-center space-x-2 mt-1 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-400" />
        <span className="text-sm text-green-400">Geçerli</span>
      </div>
    );
  }

  return null;
}

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  isValid?: boolean;
  error?: string;
  warning?: string;
  showSuccess?: boolean;
  inputClassName?: string;
  labelClassName?: string;
}

/**
 * ValidatedInput component with built-in validation feedback
 */
export function ValidatedInput({
  label,
  isValid,
  error,
  warning,
  showSuccess = true,
  className = '',
  inputClassName = '',
  labelClassName = '',
  ...inputProps
}: ValidatedInputProps) {
  const hasError = !!error;
  const hasWarning = !!warning;
  const inputBorderColor = hasError 
    ? 'border-red-500/50 focus:border-red-500' 
    : hasWarning 
    ? 'border-yellow-500/50 focus:border-yellow-500'
    : isValid 
    ? 'border-green-500/50 focus:border-green-500'
    : 'border-white/30 focus:border-blue-500';

  return (
    <div className={className}>
      <label className={`block text-sm font-medium text-white mb-2 ${labelClassName}`}>
        {label}
      </label>
      <input
        {...inputProps}
        className={`w-full px-4 py-2 bg-white/10 backdrop-blur-md border ${inputBorderColor} rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500/50 transition-all ${inputClassName}`}
      />
      <ValidationFeedback 
        isValid={isValid}
        error={error}
        warning={warning}
        showSuccess={showSuccess}
      />
    </div>
  );
}

interface ValidatedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  isValid?: boolean;
  error?: string;
  warning?: string;
  showSuccess?: boolean;
  options: { value: string; label: string }[];
  inputClassName?: string;
  labelClassName?: string;
}

/**
 * ValidatedSelect component with built-in validation feedback
 */
export function ValidatedSelect({
  label,
  isValid,
  error,
  warning,
  showSuccess = true,
  options,
  className = '',
  inputClassName = '',
  labelClassName = '',
  ...selectProps
}: ValidatedSelectProps) {
  const hasError = !!error;
  const hasWarning = !!warning;
  const inputBorderColor = hasError 
    ? 'border-red-500/50 focus:border-red-500' 
    : hasWarning 
    ? 'border-yellow-500/50 focus:border-yellow-500'
    : isValid 
    ? 'border-green-500/50 focus:border-green-500'
    : 'border-white/30 focus:border-blue-500';

  return (
    <div className={className}>
      <label className={`block text-sm font-medium text-white mb-2 ${labelClassName}`}>
        {label}
      </label>
      <select
        {...selectProps}
        className={`w-full px-4 py-2 bg-white/10 backdrop-blur-md border ${inputBorderColor} rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 transition-all ${inputClassName}`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ValidationFeedback 
        isValid={isValid}
        error={error}
        warning={warning}
        showSuccess={showSuccess}
      />
    </div>
  );
}

interface ValidatedCheckboxGroupProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  isValid?: boolean;
  error?: string;
  warning?: string;
  showSuccess?: boolean;
  className?: string;
  labelClassName?: string;
}

/**
 * ValidatedCheckboxGroup component for feature selection
 */
export function ValidatedCheckboxGroup({
  label,
  options,
  selectedValues,
  onChange,
  isValid,
  error,
  warning,
  showSuccess = true,
  className = '',
  labelClassName = ''
}: ValidatedCheckboxGroupProps) {
  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };

  return (
    <div className={className}>
      <label className={`block text-sm font-medium text-white mb-3 ${labelClassName}`}>
        {label}
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {options.map(option => (
          <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={() => handleToggle(option.value)}
              className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-white">{option.label}</span>
          </label>
        ))}
      </div>
      <ValidationFeedback 
        isValid={isValid}
        error={error}
        warning={warning}
        showSuccess={showSuccess}
      />
    </div>
  );
}
import React, { useState } from 'react';

const InputField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  className = '',
  prefix = null,
  suffix = null,
  textarea = false,
  rows = 3,
  showPasswordToggle = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const InputComponent = textarea ? 'textarea' : 'input';

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {prefix && (
          <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 text-gray-500">
            {prefix}
          </div>
        )}
        
        <InputComponent
          type={!textarea ? inputType : undefined}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={textarea ? rows : undefined}
          className={`
            w-full rounded-lg border transition-all duration-200
            ${prefix ? 'pl-10' : 'pl-4'}
            ${suffix || (type === 'password' && showPasswordToggle) ? 'pr-10' : 'pr-4'}
            ${textarea ? 'py-3' : 'py-2.5'}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#2bee6c] focus:ring-[#2bee6c]'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1
            ${textarea ? 'resize-y' : ''}
          `}
          required={required}
          {...props}
        />
        
        {suffix && (
          <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3 text-gray-500">
            {suffix}
          </div>
        )}
        
        {type === 'password' && showPasswordToggle && !textarea && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-0 bottom-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      </div>
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠️</span> {error}
        </p>
      )}
    </div>
  );
};

export default InputField;

import React from 'react';

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ id, label, checked, onChange }) => {
  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
      <label
        htmlFor={id}
        className={`w-full flex items-center justify-center text-center p-2 border rounded-lg cursor-pointer transition-all duration-200 ease-in-out ${
          checked
            ? 'bg-gray-900 border-gray-900 text-white shadow-sm'
            : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'
        }`}
      >
        <span className="text-sm font-medium">{label}</span>
      </label>
    </div>
  );
};

export default Checkbox;
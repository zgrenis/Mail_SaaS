import React from 'react';

const ActionCard = ({ title, description, icon, buttonText, onClick, variant = 'green' }) => {
  const themes = {
    green: {
      bgIcon: 'bg-green-100',
      button: 'bg-green-50 text-green-700 hover:bg-green-100',
      border: 'border-gray-100'
    },
    amber: {
      bgIcon: 'bg-amber-100',
      button: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
      border: 'border-gray-100'
    },
    red: {
      bgIcon: 'bg-red-100',
      button: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100',
      border: 'border-gray-100'
    }
  };

  const theme = themes[variant] || themes.green;

  return (
    <div className={`bg-white p-8 rounded-2xl shadow-sm border ${theme.border} hover:shadow-md transition-shadow flex flex-col h-full`}>
      <div className={`w-12 h-12 ${theme.bgIcon} rounded-lg flex items-center justify-center mb-4`}>
        <span className="text-xl">{icon}</span>
      </div>
      <h3 className={`text-lg font-bold mb-2 ${variant === 'red' ? 'text-red-600' : 'text-gray-800'}`}>
        {title}
      </h3>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed flex-grow">
        {description}
      </p>
      <button 
        onClick={onClick}
        className={`w-full py-3 font-bold rounded-xl transition-all active:scale-[0.98] cursor-pointer ${theme.button}`}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default ActionCard;
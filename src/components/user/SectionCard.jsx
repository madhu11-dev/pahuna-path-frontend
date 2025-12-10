const SectionCard = ({ children, className = '', hover = true }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${hover ? 'hover:shadow-md' : ''} transition-all ${className}`}>
      {children}
    </div>
  );
};

export default SectionCard;

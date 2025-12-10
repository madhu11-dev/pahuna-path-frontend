const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionText = "Get Started",
}) => {
  return (
    <div className="text-center py-16 bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300">
      {Icon && <Icon size={64} className="mx-auto text-gray-400 mb-4" />}
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">{title}</h2>
      {description && (
        <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && (
        <button
          onClick={action}
          className="bg-emerald-600 to-emerald-700 text-white px-8 py-3 rounded-lg hover:from-emerald-700 hover:to-emerald-800 shadow-md transition-all font-semibold"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

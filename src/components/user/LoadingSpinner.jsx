const LoadingSpinner = ({ size = "default", text = "Loading..." }) => {
  const sizeClasses = {
    small: "h-6 w-6",
    default: "h-10 w-10",
    large: "h-16 w-16",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`animate-spin rounded-full border-b-2 border-emerald-600 ${sizeClasses[size]}`}
      ></div>
      {text && <p className="text-gray-600 mt-4">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;

const StatusBadge = ({ status, type = "booking" }) => {
  const getBookingStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      checked_in: "bg-green-100 text-green-800 border-green-200",
      checked_out: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      unpaid: "bg-red-100 text-red-800 border-red-200",
      partial: "bg-orange-100 text-orange-800 border-orange-200",
      paid: "bg-green-100 text-green-800 border-green-200",
      refunded: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getTransactionStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const colorClass =
    type === "payment"
      ? getPaymentStatusColor(status)
      : type === "transaction"
      ? getTransactionStatusColor(status)
      : getBookingStatusColor(status);

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}
    >
      {status.replace(/_/g, " ").toUpperCase()}
    </span>
  );
};

export default StatusBadge;

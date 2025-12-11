import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  DollarSign ,
  Receipt,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getCookie, getUserTransactionsApi } from "../../apis/Api";
import EmptyState from "../../components/user/EmptyState";
import LoadingSpinner from "../../components/user/LoadingSpinner";
import PageContainer from "../../components/user/PageContainer";
import SectionCard from "../../components/user/SectionCard";
import StatusBadge from "../../components/user/StatusBadge";

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const token = getCookie("auth_token");
    if (!token) {
      toast.error("Please login to view transactions");
      navigate("/login");
      return;
    }

    fetchTransactions();
  }, [navigate]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await getUserTransactionsApi();
      if (response.data) {
        setTransactions(response.data);
        setPagination({
          current_page: response.current_page,
          last_page: response.last_page,
          total: response.total,
        });
      }
    } catch (error) {
      toast.error("Failed to load transactions");
      console.error(error);
    }
    setLoading(false);
  };

  const getTransactionIcon = (type) => {
    return type === "payment" ? ArrowUpRight : ArrowDownRight;
  };

  const getTransactionColor = (type) => {
    return type === "payment" ? "text-red-600" : "text-green-600";
  };

  const getTransactionBgColor = (type) => {
    return type === "payment" ? "bg-red-50" : "bg-green-50";
  };

  if (loading) {
    return (
      <PageContainer activePage="transactions">
        <LoadingSpinner text="Loading your transactions..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      activePage="transactions"
      title="Transaction History"
      subtitle="View all your payment and refund transactions"
      className="mt-4"
    >
      {transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No Transactions Yet"
          description="Your payment and refund history will appear here"
          action={() => navigate("/my-bookings")}
          actionText="View My bookings"
        />
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SectionCard>
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Receipt className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pagination?.total || 0}
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <ArrowUpRight className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      transactions.filter(
                        (t) =>
                          t.transaction_type === "payment" &&
                          t.status === "completed"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <ArrowDownRight className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Refunds</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      transactions.filter(
                        (t) =>
                          t.transaction_type === "refund" &&
                          t.status === "completed"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Transactions List */}
          <SectionCard>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              All Transactions
            </h2>
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const Icon = getTransactionIcon(transaction.transaction_type);
                const colorClass = getTransactionColor(
                  transaction.transaction_type
                );
                const bgClass = getTransactionBgColor(
                  transaction.transaction_type
                );

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`${bgClass} p-3 rounded-lg`}>
                        <Icon className={colorClass} size={20} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {transaction.transaction_type === "payment"
                              ? "Payment"
                              : "Refund (80%)"}
                          </h3>
                          <StatusBadge
                            status={transaction.status}
                            type="transaction"
                          />
                        </div>

                        {transaction.transaction_type === "refund" && (
                          <p className="text-sm text-green-700 font-medium mb-1">
                            Refunded Amount: Rs.{" "}
                            {parseFloat(transaction.amount).toFixed(2)}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="font-mono">
                            {transaction.transaction_id}
                          </span>
                        </div>

                        {transaction.booking && (
                          <p className="text-xs text-gray-500 mt-1">
                            Booking: {transaction.booking.booking_reference} -{" "}
                            {transaction.booking.accommodation?.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <p
                        className={`text-xl font-bold ${colorClass} flex items-center justify-end gap-1`}
                      >
                        {transaction.transaction_type === "payment" ? "-" : "+"}
                        <DollarSign  size={18} />
                        {parseFloat(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center justify-end gap-1 mt-1">
                        <Calendar size={12} />
                        {new Date(transaction.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </PageContainer>
  );
};

export default Transactions;

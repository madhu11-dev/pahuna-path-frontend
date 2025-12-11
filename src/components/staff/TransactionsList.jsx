import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Search, Filter, Calendar, CreditCard, ArrowUpRight, ArrowDownRight, IndianRupee, Download } from 'lucide-react';
import { getStaffTransactionsApi } from '../../apis/Api';

const TransactionsList = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    transaction_type: '',
    status: '',
    payment_method: '',
    search: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.transaction_type) params.transaction_type = filters.transaction_type;
      if (filters.status) params.status = filters.status;
      if (filters.payment_method) params.payment_method = filters.payment_method;
      if (filters.search) params.search = filters.search;

      const response = await getStaffTransactionsApi(params);
      if (response.transactions) {
        setTransactions(response.transactions.data || []);
        setStats(response.stats);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Unauthorized: You must be logged in as staff to view transactions');
        console.error('403 Forbidden: User is not staff or not logged in properly');
      } else {
        toast.error('Failed to load transactions');
      }
      console.error(error);
    }
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      transaction_type: '',
      status: '',
      payment_method: '',
      search: ''
    });
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.warning('No transactions to export');
      return;
    }

    // Define CSV headers
    const headers = [
      'Transaction ID',
      'Booking Reference',
      'Type',
      'Amount (Rs.)',
      'Status',
      'Payment Method',
      'Customer Name',
      'Customer Email',
      'Accommodation',
      'Date'
    ];

    // Convert transactions to CSV rows
    const rows = transactions.map(transaction => [
      transaction.transaction_id,
      transaction.booking?.booking_reference || 'N/A',
      transaction.transaction_type,
      parseFloat(transaction.amount).toFixed(2),
      transaction.status,
      transaction.payment_method?.toUpperCase() || 'N/A',
      transaction.user?.name || 'N/A',
      transaction.user?.email || 'N/A',
      transaction.booking?.accommodation?.name || 'N/A',
      new Date(transaction.created_at).toLocaleString()
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Transactions exported successfully');
  };

  const getTransactionIcon = (type) => {
    return type === 'payment' ? ArrowUpRight : ArrowDownRight;
  };

  const getTransactionColor = (type) => {
    return type === 'payment' ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionBgColor = (type) => {
    return type === 'payment' ? 'bg-green-50' : 'bg-red-50';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <ArrowUpRight className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900 flex items-center">
                  <IndianRupee size={20} />
                  {parseFloat(stats.total_payments || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <ArrowDownRight className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Refunds</p>
                <p className="text-2xl font-bold text-gray-900 flex items-center">
                  <IndianRupee size={20} />
                  {parseFloat(stats.total_refunds || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <IndianRupee className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Profit</p>
                <p className="text-2xl font-bold text-gray-900 flex items-center">
                  <IndianRupee size={20} />
                  {(parseFloat(stats.total_payments || 0) - parseFloat(stats.total_refunds || 0)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by transaction ID or booking ref..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Transaction Type */}
          <select
            value={filters.transaction_type}
            onChange={(e) => handleFilterChange('transaction_type', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="payment">Payment</option>
            <option value="refund">Refund</option>
          </select>

          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Payment Method */}
          <select
            value={filters.payment_method}
            onChange={(e) => handleFilterChange('payment_method', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Methods</option>
            <option value="khalti">Khalti</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
          </select>
        </div>

        <button
          onClick={clearFilters}
          className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear Filters
        </button>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">All Transactions</h2>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Download size={18} />
            Export
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No transactions found
            </div>
          ) : (
            transactions.map((transaction) => {
              const Icon = getTransactionIcon(transaction.transaction_type);
              const colorClass = getTransactionColor(transaction.transaction_type);
              const bgClass = getTransactionBgColor(transaction.transaction_type);

              return (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`${bgClass} p-3 rounded-lg`}>
                      <Icon className={colorClass} size={20} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {transaction.transaction_type === 'payment' ? 'Payment' : 'Refund'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(transaction.status)}`}>
                          {transaction.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-1">
                        <span className="font-mono">{transaction.transaction_id}</span>
                        <span className="flex items-center gap-1">
                          <CreditCard size={14} />
                          {transaction.payment_method?.toUpperCase()}
                        </span>
                      </div>

                      {transaction.booking && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Booking:</span> {transaction.booking.booking_reference}
                          {transaction.booking.accommodation && ` - ${transaction.booking.accommodation.name}`}
                        </div>
                      )}

                      {transaction.user && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Customer:</span> {transaction.user.name} ({transaction.user.email})
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <p className={`text-xl font-bold ${colorClass} flex items-center justify-end gap-1`}>
                        <IndianRupee size={18} />
                        {parseFloat(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center justify-end gap-1 mt-1">
                        <Calendar size={12} />
                        {new Date(transaction.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsList;

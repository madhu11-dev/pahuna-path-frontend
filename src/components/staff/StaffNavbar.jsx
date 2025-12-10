import { Hotel, Bed, Package, Calendar, Receipt } from 'lucide-react';

const tabs = [
  { key: 'hotels', label: 'Hotels', icon: Hotel },
  { key: 'rooms', label: 'Rooms', icon: Bed },
  { key: 'services', label: 'Services', icon: Package },
  { key: 'bookings', label: 'Bookings', icon: Calendar },
  { key: 'transactions', label: 'Transactions', icon: Receipt },
];

const StaffNavbar = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white border-b border-gray-200 mb-6">
      <div className="flex space-x-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StaffNavbar;

import { MapPin, UtensilsCrossed, Bookmark, User, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const navItems = [
    { key: 'explore', label: 'Explore', icon: Compass, route: '/explore' },
    { key: 'places', label: 'Places', icon: MapPin, route: '/feed' },
    { key: 'accommodations', label: 'Accommodations', icon: UtensilsCrossed, route: '/accommodations' },
    { key: 'bookings', label: 'Bookings', icon: Bookmark, route: '/feed' },
    { key: 'profile', label: 'Profile', icon: User, route: '/feed' },
];

const UserSidebar = ({ active }) => {
    const navigate = useNavigate();

    return (
        <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-20 bottom-0 overflow-y-auto">
            <nav className="p-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.key;

                    return (
                        <button
                            key={item.key}
                            onClick={() => navigate(item.route)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium capitalize">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
};

export default UserSidebar;


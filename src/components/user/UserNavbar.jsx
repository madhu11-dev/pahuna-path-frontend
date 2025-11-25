import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { toast } from 'react-toastify';
import { logoutUserApi } from '../../apis/Api.js';

const UserNavbar = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('Traveler');
    const [profilePicture, setProfilePicture] = useState('http://localhost:8090/images/default-profile.png');

    const getCookie = useCallback((name) => {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return null;
    }, []);

    useEffect(() => {
        const nameFromCookie = getCookie('user_name');
        setUsername(nameFromCookie || 'Traveler');

        const profilePictureFromCookie = getCookie('user_profile_picture');
        if (profilePictureFromCookie && profilePictureFromCookie !== 'null') {
            setProfilePicture(profilePictureFromCookie);
        }

        const tokenFromCookie = getCookie('auth_token');
        if (tokenFromCookie) {
            localStorage.setItem('token', tokenFromCookie);
        } else {
            localStorage.removeItem('token');
        }
    }, [getCookie]);

    const handleLogout = useCallback(async () => {
        try {
            // Call the backend logout API to invalidate the token
            await logoutUserApi();
            toast.success('Logged out successfully.');
        } catch (error) {
            // Even if the API call fails, we still want to clear local storage
            console.warn('Logout API call failed:', error);
            toast.info('You have been logged out.');
        } finally {
            // Clear all authentication data from cookies and localStorage
            ['auth_token', 'user_id', 'user_name', 'user_profile_picture'].forEach((cookieName) => {
                document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            });
            localStorage.removeItem('token');
            localStorage.removeItem('utype');
            navigate('/login');
        }
    }, [navigate]);

    return (
        <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
            <div className="px-6 py-1 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <img className='w-25 h-20' src='/logo.png' alt="Logo"></img>
                    <h1 className="text-2xl font-bold text-gray-900">Pahunapath</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 border border-gray-300 flex-shrink-0">
                            <img
                                src={profilePicture}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = "http://localhost:8090/images/default-profile.png";
                                }}
                            />
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 font-medium">
                            Welcome, <span className="text-gray-900 font-semibold">{username}</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default UserNavbar;



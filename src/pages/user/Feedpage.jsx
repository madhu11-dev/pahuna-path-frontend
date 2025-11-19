import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, MapPin, Star, UtensilsCrossed, Bookmark, User } from 'lucide-react';
import { newlocation, getPlaces, BASE_URL } from "../../apis/Api";
import { ToastContainer, toast } from "react-toastify";

const Feedpage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('places');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [username, setUsername] = useState('Traveler');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [newPost, setNewPost] = useState({
        place_name: '',
        caption: '',
        google_map_link: '',
        review: '',
        imageFiles: []
    });
    const fileInputRef = useRef(null);

    const placeholderImage = '/logo.png';

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

        const tokenFromCookie = getCookie('auth_token');
        if (tokenFromCookie) {
            localStorage.setItem('token', tokenFromCookie);
        } else {
            localStorage.removeItem('token');
        }
    }, [getCookie]);

    const resolveImageUrl = (imagePath) => {
        if (!imagePath) return placeholderImage;

        if (typeof imagePath !== 'string') {
            return placeholderImage;
        }

        if (imagePath.startsWith('http')) {
            return imagePath;
        }

        if (imagePath.startsWith('/')) {
            return `${BASE_URL}${imagePath}`;
        }

        return `${BASE_URL}/assets/images/${imagePath}`;
    };

    const normalizePlace = (place) => {
        const rawImages = Array.isArray(place.images)
            ? place.images
            : place.images
                ? [place.images]
                : [];
        const images = rawImages.map(resolveImageUrl);

        return {
            id: place.id,
            image: images[0] || placeholderImage,
            images,
            caption: place.caption,
            author: place.author || (place.user_id ? `User #${place.user_id}` : 'Traveler'),
            place: place.place_name,
            review: place.review ?? 0,
            location: place.place_name,
            locationlink: place.google_map_link || '#'
        };
    };

    useEffect(() => {
        const fetchPlaces = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getPlaces();
                const fetched = (response?.data || []).map(normalizePlace);
                setPosts(fetched);
            } catch (err) {
                console.error("Failed to fetch places:", err);
                setError('Unable to load places. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlaces();
    }, []);

    const handleLogout = useCallback(() => {
        ['auth_token', 'user_id', 'user_name'].forEach((cookieName) => {
            document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        });
        localStorage.removeItem('token');
        localStorage.removeItem('utype');
        toast.info('You have been logged out.');
        navigate('/login');
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newPost.place_name || !newPost.caption || !newPost.google_map_link) {
            toast.error('Please fill in all fields.');
            return;
        }

        if (!newPost.imageFiles.length) {
            toast.error('Please upload at least one image.');
            return;
        }

        const reviewValue = parseFloat(newPost.review);
        if (Number.isNaN(reviewValue) || reviewValue < 0 || reviewValue > 5) {
            toast.error('Review must be a number between 0 and 5.');
            return;
        }

        const formData = new FormData();
        formData.append('place_name', newPost.place_name);
        formData.append('caption', newPost.caption);
        formData.append('review', reviewValue.toString());
        formData.append('google_map_link', newPost.google_map_link);
        newPost.imageFiles.forEach((file) => formData.append('images[]', file));

        try {
            const response = await newlocation(formData);
            const createdPlace = response?.data ?? response;

            if (createdPlace) {
                toast.success("New place successfully shared!");

                const normalizedPost = normalizePlace({
                    ...createdPlace,
                    author: 'You'
                });

                setPosts((prev) => [normalizedPost, ...prev]);

                setShowModal(false);
                setNewPost({
                    place_name: '',
                    caption: '',
                    google_map_link: '',
                    review: '',
                    imageFiles: []
                });
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                alert("Failed to share place. Please try again.");
            }
        } catch (error) {
            console.error("Error while posting new place:", error);
            const responseMessage = error?.response?.data?.message;
            const validationMessage = Object.values(error?.response?.data?.errors ?? {})[0]?.[0];
            alert(responseMessage || validationMessage || "Something went wrong while posting the place.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
                <div className="px-6 py-1 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <img className='w-25 h-20' src='/logo.png'></img>
                        <h1 className="text-2xl font-bold text-gray-900">Pahunapath</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-sm sm:text-base text-gray-600 font-medium">
                            Welcome, <span className="text-gray-900 font-semibold">{username}</span>
                        </p>
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

            <div className="flex pt-20">

                <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-20 bottom-0 overflow-y-auto">
                    <nav className="p-4">
                        {['places', 'restaurants', 'bookings', 'profile'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeTab === tab ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {tab === 'places' && <MapPin className="w-5 h-5" />}
                                {tab === 'restaurants' && <UtensilsCrossed className="w-5 h-5" />}
                                {tab === 'bookings' && <Bookmark className="w-5 h-5" />}
                                {tab === 'profile' && <User className="w-5 h-5" />}
                                <span className="font-medium capitalize">{tab}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="ml-64 flex-1 px-8 py-6 max-w-4xl mx-auto">

                    {/* Upload new post */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-500 transition-colors"
                                >
                                    Share your favorite place...
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Modal for adding new post */}
                    {showModal && (
                        <div className=" inset-0 flex items-center justify-center z-50 p-6">
                            <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg">
                                <h2 className="text-xl font-semibold mb-4 text-gray-800">Share Your Favorite Place</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Place Name"
                                        value={newPost.place_name}
                                        onChange={(e) => setNewPost({ ...newPost, place_name: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2s p-4 mb-2"
                                    />
                                    <textarea
                                        placeholder="Caption"
                                        value={newPost.caption}
                                        onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2 mb-1"
                                        rows="3"
                                    />
                                    <div className="flex flex-col gap-2 mb-2">
                                        <label className="text-gray-600 font-medium">
                                            Upload Images
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            ref={fileInputRef}
                                            onChange={(e) =>
                                                setNewPost({
                                                    ...newPost,
                                                    imageFiles: Array.from(e.target.files || [])
                                                })
                                            }
                                            className="w-full border border-gray-300 rounded-lg p-2 mb-2"
                                        />
                                        {newPost.imageFiles.length > 0 && (
                                            <p className="text-sm text-gray-500">
                                                {newPost.imageFiles.length} file{newPost.imageFiles.length > 1 ? 's' : ''} selected
                                            </p>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Google Maps Link"
                                        value={newPost.google_map_link}
                                        onChange={(e) => setNewPost({ ...newPost, google_map_link: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2 mb-2"
                                    />
                                    <div className="flex flex-col gap-2 mb-2">
                                        <label className="text-gray-600 font-medium" htmlFor="review-input">
                                            Review (0-5)
                                        </label>
                                        <input
                                            id="review-input"
                                            type="number"
                                            min="0"
                                            max="5"
                                            step="0.1"
                                            placeholder="4.5"
                                            value={newPost.review}
                                            onChange={(e) => setNewPost({ ...newPost, review: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-gray-600">Quick Rating:</span>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                onClick={() => setNewPost({ ...newPost, review: star.toString() })}
                                                className={`w-6 h-6 cursor-pointer ${star <= Number(newPost.review) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                                        >
                                            Post
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Feed posts */}
                    <div className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}
                        {loading && (
                            <div className="p-4 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg">
                                Loading places...
                            </div>
                        )}
                        {!loading && posts.length === 0 && !error && (
                            <div className="p-8 bg-white border border-dashed border-gray-300 rounded-xl text-center text-gray-500">
                                No places have been shared yet. Be the first!
                            </div>
                        )}
                        {posts.map((post) => (
                            <article key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-4 flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{post.place}</h4>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {post.location}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex">
                                    <div className="w-2/3">
                                        <img
                                            src={post.image}
                                            alt={post.location}
                                            className="w-full h-96 object-cover"
                                        />
                                    </div>
                                    <div className="w-1/3 p-6 flex flex-col">
                                        <p className="text-gray-700 leading-relaxed mb-4">{post.caption}</p>

                                        <div className="mt-auto space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => {
                                                        const filled = i < Math.round(post.review ?? 0);
                                                        return (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">{post.review}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                                                    Explore
                                                </button>
                                            </div>
                                            <div className="flex gap-2">
                                                <a href={post.locationlink} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                    <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                                                        Go To Place
                                                    </button>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </main>
            </div>
            <ToastContainer />
        </div>
    );
}

export default Feedpage;
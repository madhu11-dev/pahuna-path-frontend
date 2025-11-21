import { useEffect, useRef, useState } from 'react';
import { Star, User, MapPin } from 'lucide-react';
import { newlocation, getPlaces } from "../../apis/Api";
import { ToastContainer, toast } from "react-toastify";
import UserSidebar from '../../components/user/UserSidebar';
import UserNavbar from '../../components/user/UserNavbar';
import { IMAGE_PLACEHOLDER, resolveImageUrl } from '../../utils/media';


const normalizePlace = (place) => {
    const rawImages = Array.isArray(place.images)
        ? place.images
        : place.images
            ? [place.images]
            : [];
    const images = rawImages.map(resolveImageUrl);

    return {
        id: place.id,
        name: place.place_name,
        description: place.caption,
        review: place.review ?? 0,
        mapLink: place.google_map_link || '#',
        location: place.place_name,
        author: place.author || (place.user_id ? `User #${place.user_id}` : 'Traveler'),
        image: images[0] || IMAGE_PLACEHOLDER,
        images,
    };
};

const Feedpage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [newPost, setNewPost] = useState({
        place_name: '',
        caption: '',
        google_map_link: '',
        review: '',
        imageFiles: []
    });
    const fileInputRef = useRef(null);

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
            <UserNavbar />

            <div className="flex pt-20">

                <UserSidebar active="places" />

                <main className="ml-64 flex-1 px-8 py-6 max-w-4xl mx-auto">

                    {/* Add place button */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Share a new place</h3>
                            <p className="text-sm text-gray-500">Help other travelers discover your favorite spot.</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                        >
                            <User className="w-5 h-5" />
                            <span>Add Place</span>
                        </button>
                    </div>

                    {/* Add place modal */}
                    {showModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
                            <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
                                <h2 className="text-xl font-semibold mb-4 text-gray-800">Share Your Favorite Place</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">Place Name *</label>
                                        <input
                                            type="text"
                                            placeholder="Place Name"
                                            value={newPost.place_name}
                                            onChange={(e) => setNewPost({ ...newPost, place_name: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-3"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">Caption *</label>
                                        <textarea
                                            placeholder="Share the story behind this place..."
                                            value={newPost.caption}
                                            onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-3"
                                            rows="3"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">Upload Images *</label>
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
                                            className="w-full border border-gray-300 rounded-lg p-3"
                                            required
                                        />
                                        {newPost.imageFiles.length > 0 && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                {newPost.imageFiles.length} file{newPost.imageFiles.length > 1 ? 's' : ''} selected
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">Google Maps Link *</label>
                                        <input
                                            type="url"
                                            placeholder="https://maps.google.com/..."
                                            value={newPost.google_map_link}
                                            onChange={(e) => setNewPost({ ...newPost, google_map_link: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-3"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">Review (0-5) *</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="5"
                                            step="0.1"
                                            placeholder="4.5"
                                            value={newPost.review}
                                            onChange={(e) => setNewPost({ ...newPost, review: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-3"
                                            required
                                        />
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-gray-600 text-sm">Quick Rating:</span>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    onClick={() => setNewPost({ ...newPost, review: star.toString() })}
                                                    className={`w-5 h-5 cursor-pointer ${star <= Number(newPost.review) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                        >
                                            Share Place
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Feed posts */}
                    <div className="space-y-6">
                        {/* loading */}
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

                        {/* show list of posts */}
                        {posts.map((post) => (
                            <article key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-4 flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{post.name}</h4>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {post.location}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col lg:flex-row">
                                    <div className="lg:w-2/3">
                                        <img
                                            src={post.image}
                                            alt={post.name}
                                            className="w-full h-80 object-cover"
                                        />
                                    </div>
                                    <div className="lg:w-1/3 p-6 flex flex-col">
                                        <p className="text-gray-700 leading-relaxed mb-4">{post.description}</p>

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
                                                <a href={post.mapLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                    <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                                                        Explore
                                                    </button>
                                                </a>
                                            </div>
                                            <div className="flex gap-2">
                                                <a href={post.mapLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                    <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                                                        View on Maps
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
import { useState } from 'react';
import { LogOut, MapPin, Image as ImageIcon, Star, UtensilsCrossed, Bookmark, User } from 'lucide-react';
import { newlocation } from "../../apis/Api";

const Feedpage = () => {
    const [activeTab, setActiveTab] = useState('places');
    const [posts, setPosts] = useState([
        {
            id: 1,
            image: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwsIGmltl3O2Hd9IIABzZou5xHliOTQOWMLmrN1ojz-IYhr-Mv9bUGCMQWmFWaApB7T1wLCk0NbwD90PQwKUL4o1MLLMnbeodDSnpOBVxx5eCsaOurtOCnCM_RYZ2oIldRwNbv-PQ=s847-k-no',
            location: 'M7MC+J55, Chandragiri 44600',
            locationlink: 'https://www.google.com/maps/place/Bhiradil+Park/@27.6840052,85.2704763,15z/data=!4m6!3m5!1s0x39eb2379e453e1df:0x925df5716caca3ae!8m2!3d27.6840052!4d85.2704763!16s%2Fg%2F11f632mmz8?entry=ttu&g_ep=EgoyMDI1MTEwOS4wIKXMDSoASAFQAw%3D%3D',
            caption: 'Most beautiful sunset I have ever witnessed. The blue domes against the golden sky created pure magic.',
            author: 'Sita Gautam',
            place: 'Bhiradil Park',
            rating: 4.8
        },
        {
            id: 2,
            image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800',
            location: 'Kyoto, Japan',
            locationlink: 'https://maps.app.goo.gl/VTWktJ7zPA78S68d6',
            caption: 'Walking through the Fushimi Inari shrine early morning. Thousands of torii gates creating an endless tunnel.',
            author: 'Michael Torres',
            place: 'Bhiradil Park',
            rating: 4.9
        }
    ]);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [newPost, setNewPost] = useState({
        place: '',
        caption: '',
        image: '',
        locationlink: '',
        rating: 0,
        authorid: 1
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newPost.place || !newPost.caption || !newPost.image || !newPost.locationlink) {
            alert('Please fill in all fields.');
            return;
        }

        try {
            // Prepare FormData (useful if your API expects multipart/form-data)
            const formDataToSend = new FormData();
            formDataToSend.append("place", newPost.place);
            formDataToSend.append("caption", newPost.caption);
            formDataToSend.append("image", newPost.image);
            formDataToSend.append("locationlink", newPost.locationlink);
            formDataToSend.append("rating", newPost.rating);

            // Send data to backend
            const response = await newlocation(formDataToSend);

            if (response.status === 200 || response.status === 201) {
                alert("New place successfully shared!");

                // Reset modal + form
                setShowModal(false);
                setNewPost({
                    place: '',
                    caption: '',
                    image: '',
                    locationlink: '',
                    rating: 0,
                    author: 'You'
                });
            } else {
                alert("Failed to share place. Please try again.");
            }
        } catch (error) {
            console.error("Error while posting new place:", error);
            alert("Something went wrong while posting the place.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
                <div className="px-6 py-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img className='w-25 h-20' src='https://img.notionusercontent.com/s3/prod-files-secure%2F216d903c-0d87-465d-a560-cf6430ae550c%2F5734a301-a916-4103-99a1-e467ee730991%2Fa-clean-and-minimal-logo-design-featurin_-9wbRjIfTDmxHWXT5bPqKQ_v-9kkumvQ2uk0chTWnJjHg-removebg-preview.png/size/w=1330?exp=1763024252&sig=E6_E_0SnC03-3KySTMn4ljJXkSw_hEvQf9KL9L5Lh5I&id=2a37fe74-ddc9-80cd-9edb-e42f134ca0e2&table=block'></img>
                        <h1 className="text-2xl font-bold text-gray-900">Pahunapath</h1>
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
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
                                        value={newPost.place}
                                        onChange={(e) => setNewPost({ ...newPost, place: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2s p-4 mb-2"
                                    />
                                    <textarea
                                        placeholder="Caption"
                                        value={newPost.caption}
                                        onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2 mb-1"
                                        rows="3"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Image URL"
                                        value={newPost.image}
                                        onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2 mb-2 "
                                    />
                                    <input
                                        type="text"
                                        placeholder="Google Maps Link"
                                        value={newPost.locationlink}
                                        onChange={(e) => setNewPost({ ...newPost, locationlink: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2 mb-2"
                                    />
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-gray-600">Rating:</span>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                onClick={() => setNewPost({ ...newPost, rating: star })}
                                                className={`w-6 h-6 cursor-pointer ${star <= newPost.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
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
                        {posts.map((post) => (
                            <article key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-4 flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h7 className="font-semibold text-gray-900">{post.author}</h7>
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
                                                        const filled = i < Math.floor(post.rating);
                                                        return (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">{post.rating}</span>
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
        </div>
    );
}

export default Feedpage;

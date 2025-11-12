import { useState } from 'react';
import { LogOut, MapPin, Image as ImageIcon, Star, Hotel, UtensilsCrossed, Bookmark, User } from 'lucide-react';

function App() {
    const [activeTab, setActiveTab] = useState('places');

    const posts = [
        {
            id: 1,
            image: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwsIGmltl3O2Hd9IIABzZou5xHliOTQOWMLmrN1ojz-IYhr-Mv9bUGCMQWmFWaApB7T1wLCk0NbwD90PQwKUL4o1MLLMnbeodDSnpOBVxx5eCsaOurtOCnCM_RYZ2oIldRwNbv-PQ=s847-k-no',
            location: 'M7MC+J55, Chandragiri 44600',
            locationlink: 'https://maps.app.goo.gl/VTWktJ7zPA78S68d6',
            caption: 'Most beautiful sunset I have ever witnessed. The blue domes against the golden sky created pure magic.',
            author: 'Sita Gautam',
            place: 'Bhiradil Park',
            authorAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
            rating: 4.8
        },
        {
            id: 2,
            image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800',
            location: 'Kyoto, Japan',
            caption: 'Walking through the Fushimi Inari shrine early morning. Thousands of torii gates creating an endless tunnel.',
            author: 'Michael Torres',
            authorAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
            rating: 4.9
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-8 h-8 text-emerald-600" />
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
                        <button
                            onClick={() => setActiveTab('places')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeTab === 'places' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            <MapPin className="w-5 h-5" />
                            <span className="font-medium">Places</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('restaurants')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeTab === 'restaurants' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            <UtensilsCrossed className="w-5 h-5" />
                            <span className="font-medium">Restaurants/Hotels</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeTab === 'bookings' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            <Bookmark className="w-5 h-5" />
                            <span className="font-medium">My Bookings</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeTab === 'profile' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            <User className="w-5 h-5" />
                            <span className="font-medium">Profile</span>
                        </button>
                    </nav>
                </aside>

                <main className="ml-64 flex-1 px-8 py-6 max-w-4xl mx-auto">
                    
                    {/* upload new post/location */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-500 transition-colors">
                                    Share your favorite place...
                                </button>
                                <div className="flex gap-3 mt-4">
                                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                        <ImageIcon className="w-4 h-4" />
                                        Photo
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                        <MapPin className="w-4 h-4" />
                                        Location
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feed post */}
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <article key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-4 flex items-center gap-3">
                                    <img
                                        src={post.authorAvatar}
                                        alt={post.author}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <h7 className="font-semibold text-gray-900">{post.author}</h7>
                                        <h3 className="font-semibold text-gray-900">{post.place}</h3>
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
                                                <span className="text-sm text-gray-500">{post.reviews}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                                                    Explore
                                                </button>
                                                <a href={post.locationlink} target="_blank" rel="noopener noreferrer">
                                                    <button className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
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

export default App;
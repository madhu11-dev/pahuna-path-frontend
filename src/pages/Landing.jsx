import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, MapPin, Building2, Star, BarChart3 } from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getDashboardStatsApi } from "../apis/Api";
// import { ImageReveal } from 'lightswind';


const Landing = () => {

    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_users: 0,
        total_visitors: 0,
        total_places: 0,
        total_hotels: 0, // Keep at 0 as requested
        total_reviews: 0
    });
    const [visitorGraphData, setVisitorGraphData] = useState([]);

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
    };

    useEffect(() => {
        const token = getCookie("auth_token");

        if (token) {
            navigate("/feed"); // already logged in -> redirect to feed page
        }
    }, [navigate]);

    // Fetch statistics for landing page
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getDashboardStatsApi();
                if (response.status) {
                    setStats({
                        ...response.data.stats,
                        total_hotels: 0 // Keep hotels at 0 as requested in todo
                    });
                    setVisitorGraphData(response.data.visitor_graph_data || []);
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
                // Set default empty data if API fails
                setStats({
                    total_users: 0,
                    total_visitors: 0,
                    total_places: 0,
                    total_hotels: 0,
                    total_reviews: 0
                });
            }
        };

        fetchStats();
    }, []);

    const heroImages = [
        "https://images.pexels.com/photos/1531660/pexels-photo-1531660.jpeg",
        "https://images.pexels.com/photos/1753027/pexels-photo-1753027.jpeg",
        "https://wallpapercat.com/w/full/f/7/0/632942-2560x1600-desktop-hd-nepal-background.jpg",
        "https://images.pexels.com/photos/1531660/pexels-photo-1531660.jpeg",
        "https://images.unsplash.com/photo-1700366776973-20bda63d5b1a?auto=format&fit=crop&q=80&w=1740",
    ];


    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [heroImages.length]);

    return (
        <div className="min-h-screen flex flex-col bg-white text-black overflow-x-hidden">
            {/* NAVBAR */}
            <nav className="absolute top-0 left-0 w-full flex flex-wrap items-center justify-between px-6 md:px-10 py-4 md:py-6 z-20 bg-transparent">
                <div className="flex items-center space-x-2 md:space-x-3">
                    <img
                        src="/logo.png"
                        alt="Pahunapath Logo"
                        className="h-10 w-auto md:h-14"
                    />
                    <h1 className="text-xl md:text-2xl font-extrabold text-white drop-shadow-md">
                        Pahunapath
                    </h1>
                </div>

                <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
                    <button
                        onClick={() => navigate("/login")}
                        className="font-semibold border border-white px-4 py-2 rounded-full hover:text-grey hover:bg-white text-emerald-500 transition"
                    >
                        Login
                    </button>

                    <button
                        onClick={() => navigate("/register")}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-full transition"
                    >
                        Sign Up
                    </button>
                </div>
            </nav>

            {/* HERO CAROUSEL */}
            <section className="relative w-full h-[90vh] md:h-[100vh] overflow-hidden">
                {heroImages.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        <img
                            src={img}
                            alt={`Nepal scenery ${index}`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0  bg-opacity-40"></div>
                    </div>
                ))}

                {/* HERO TEXT */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4 sm:px-8">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
                        Discover Hidden Nepal
                    </h1>
                    <p className="text-gray-100 text-base sm:text-lg md:text-xl max-w-2xl mb-8 leading-relaxed drop-shadow-md">
                        Find Nepal’s untouched trails, secret valleys, and authentic
                        cultural experiences shared by real travelers.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 md:px-10 py-3 md:py-4 rounded-full text-base md:text-lg transition-all duration-300 shadow-lg">
                        Start Exploring
                    </button>
                </div>
            </section>

            {/* STATISTICS SECTION */}
            <section className="px-6 md:px-12 lg:px-16 py-16 md:py-24 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        Our Community in Numbers
                    </h2>
                    <p className="text-gray-600 text-lg">
                        See how our community is growing and exploring Nepal together
                    </p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard
                        icon={Users}
                        title="Registered Users"
                        value={stats.total_users}
                        color="bg-blue-100 text-blue-700"
                    />
                    <StatCard
                        icon={Star}
                        title="Number of Visitors"
                        value={stats.total_visitors}
                        color="bg-green-100 text-green-700"
                    />
                    <StatCard
                        icon={MapPin}
                        title="Number of Places"
                        value={stats.total_places}
                        color="bg-purple-100 text-purple-700"
                    />
                    <StatCard
                        icon={Building2}
                        title="Number of Hotels"
                        value={stats.total_hotels}
                        color="bg-orange-100 text-orange-700"
                    />
                </div>

                {/* Reviews Count */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 bg-yellow-100 text-yellow-700 px-6 py-3 rounded-full">
                        <Star className="w-6 h-6" />
                        <span className="text-lg font-semibold">{stats.total_reviews} Reviews of Different Places</span>
                    </div>
                </div>

                {/* Graph */}
                {visitorGraphData.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                            Monthly Visitor Trends 2025
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={visitorGraphData}>
                                <CartesianGrid stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="month" 
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: '#f8f9fa',
                                        border: '1px solid #e9ecef',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="visits" 
                                    stroke="#22c55e" 
                                    strokeWidth={3}
                                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </section>

            {/* FEATURE SECTION */}
            <section className="px-6 md:px-12 lg:px-16 py-16 md:py-24 max-w-7xl mx-auto text-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard
                        icon="🌿"
                        title="Explore Hidden Places"
                        desc="Discover Nepal’s lesser-known destinations curated by travelers and locals alike."
                    />
                    <FeatureCard
                        icon="📸"
                        title="Share Your Gems"
                        desc="Don’t gatekeep — showcase your hidden trails, lakes, and viewpoints for others to enjoy."
                    />
                    <FeatureCard
                        icon="🗺️"
                        title="Get Directions Instantly"
                        desc="Integrated Google Maps lets you reach every location right from our site."
                    />
                    <FeatureCard
                        icon="🏨"
                        title="Stay, Eat & Rest"
                        desc="Find hostels, restaurants, and hotels within 5km of your favorite spots."
                    />
                </div>
            </section>

            {/* COMMUNITY CTA */}
            <section className="text-center mt-6 md:mt-10 max-w-4xl mx-auto px-6 pb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                    Built by Explorers, For Explorers 🌏
                </h2>
                <p className="text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed">
                    Pahunapath is more than a travel guide — it’s a growing community
                    uncovering the beauty of Nepal, one hidden gem at a time.
                </p>
                <button className="mt-8 bg-black text-white hover:bg-green-700 hover:text-white px-8 md:px-10 py-3 md:py-4 rounded-full text-base md:text-lg font-semibold transition-all duration-300">
                    Join the Movement
                </button>
            </section>


            {/* FOOTER */}
            <footer className="w-full bg-black text-white mt-20 py-16 px-6 md:px-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
                    {/* About */}
                    <div>
                        <h3 className="text-2xl font-bold mb-4 text-green-500">
                            Pahunapath
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            An open-source project built to connect travelers and locals,
                            helping everyone discover the unseen beauty of Nepal responsibly.
                        </p>
                    </div>

                    {/* Contributors */}
                    <div>
                        <h4 className="text-xl font-semibold mb-3 text-green-500">
                            Major Contributors
                        </h4>

                        <ul className="text-gray-300 space-y-2">
                            <li>• Madhu Chaudhary</li>
                            <li>• Rises Shrestha</li>
                            <li>• Spandan Bhattarai </li>
                            <li>• Suvani Basnet</li>
                        </ul>
                    </div>

                    {/* Open Source */}
                    <div>
                        <h4 className="text-xl font-semibold mb-3 text-green-500">
                            Open Source
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                            This project is open-source and community-driven.
                            Contributions are always welcome on our GitHub.
                        </p>
                        <a
                            href="#"
                            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-full transition-all"
                        >
                            View on GitHub
                        </a>
                    </div>
                </div>

                <hr className="my-10 border-gray-700 mt-5" />
                <p className="text-center text-gray-400 text-sm ">
                    © {new Date().getFullYear()} Pahunapath. Made in Nepal. Made for Nepal.
                </p>
            </footer>
        </div>
    );
};

// Feature card component
const FeatureCard = ({ icon, title, desc }) => (
    <div className="bg-white shadow-md rounded-2xl p-6 sm:p-8 text-center border border-gray-100 hover:shadow-2xl transition-all duration-300">
        <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{icon}</div>
        <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{title}</h3>
        <p className="text-gray-600 text-sm sm:text-base">{desc}</p>
    </div>
);

// Stats card component
const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white shadow-lg rounded-xl p-6 text-center border border-gray-100 hover:shadow-2xl transition-all duration-300">
        <div className={`p-3 ${color} rounded-full w-fit mx-auto mb-4`}>
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
);

export default Landing;

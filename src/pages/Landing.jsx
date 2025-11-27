import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlaceImagesApi } from "../apis/Api";
import { resolveImageUrl } from "../utils/media";

// Custom CSS for scrollbar hiding
const styles = `
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
`;

const Landing = () => {
  const navigate = useNavigate();
  const [placeImages, setPlaceImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  useEffect(() => {
    const token = getCookie("auth_token");

    if (token) {
      navigate("/feed");
    }
  }, [navigate]);

  useEffect(() => {
    fetchPlaceImages();
  }, []);

  const fetchPlaceImages = async () => {
    try {
      const response = await getPlaceImagesApi();
      if (response.status && response.images) {
        // Convert image paths to properly resolved URLs
        const resolvedImages = response.images.map((imagePath) => ({
          url: resolveImageUrl(imagePath),
        }));
        setPlaceImages(resolvedImages);
      }
    } catch (error) {
      console.error("Error fetching place images:", error);
    }
  };

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

  const nextSlide = () => {
    if (placeImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % placeImages.length);
    }
  };

  const prevSlide = () => {
    if (placeImages.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + placeImages.length) % placeImages.length
      );
    }
  };

  const getVisibleImages = () => {
    if (placeImages.length === 0) return [];
    const images = [];
    for (let i = 0; i < 4; i++) {
      const index = (currentImageIndex + i) % placeImages.length;
      images.push(placeImages[index]);
    }
    return images;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-black overflow-x-hidden">
      <style>{styles}</style>
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
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === current ? "opacity-100" : "opacity-0"
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
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 md:px-10 py-3 md:py-4 rounded-full text-base md:text-lg transition-all duration-300 shadow-lg"
          >
            Start Exploring
          </button>
        </div>
      </section>

      {/* EXPLORE SECTION */}
      <section className="px-6 md:px-12 lg:px-16 py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Explore Hidden Gems
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover breathtaking destinations across Nepal, from serene
              valleys to majestic peaks
            </p>
          </div>

          {/* Image Slider with Navigation */}
          {placeImages.length > 0 && (
            <div className="relative">
              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Image Container */}
              <div className="overflow-hidden rounded-2xl">
                <div className="flex gap-4 transition-transform duration-500 ease-in-out">
                  {getVisibleImages().map((image, index) => (
                    <div
                      key={currentImageIndex + index}
                      className="flex-shrink-0 w-1/4 cursor-pointer group"
                      onClick={() => navigate("/login")}
                    >
                      <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                        <img
                          src={image.url}
                          alt="Hidden gem in Nepal"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg bg-green-600 px-4 py-2 rounded-full">
                            Discover
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slide Indicators */}
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: Math.ceil(placeImages.length / 4) }).map(
                  (_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index * 4)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        Math.floor(currentImageIndex / 4) === index
                          ? "bg-green-600 w-8"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  )
                )}
              </div>
            </div>
          )}

          {/* Fallback message when no images */}
          {placeImages.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Loading amazing places...</p>
            </div>
          )}
        </div>
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
              This project is open-source and community-driven. Contributions
              are always welcome on our GitHub.
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
          © {new Date().getFullYear()} Pahunapath. Made in Nepal. Made for
          Nepal.
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

export default Landing;

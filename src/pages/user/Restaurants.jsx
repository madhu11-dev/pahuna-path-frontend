import React from "react";
import { useEffect, useRef, useState } from "react";
import {
  LogOut,
  MapPin,
  Star,
  UtensilsCrossed,
  Bookmark,
  User,
} from "lucide-react";
import { AiFillStar } from "react-icons/ai";
import { FaHeart } from "react-icons/fa";
import hotelImg1 from "../../assets/images/hotels/hotel1.png";
import hotelImg2 from "../../assets/images/hotels/hotel2.png";
import { useNavigate } from "react-router-dom";

const Restaurants = () => {
  const [activeTab, setActiveTab] = useState("restaurants");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({
    restaurants_name: "",
    description: "",
    google_map_link: "",
    review: "",
    imageFiles: [],
  });

  const hotels = [
    {
      image: hotelImg1,
      title: "Aarya Hotel and Spa - Eternal Heritage",
      location: "Thamel, Kathmandu",
      description:
        "Attractively located in the center of Kathmandu, Aarya Hotel and Spa - Eternal Heritage has air-conditioned rooms with free WiFi, free private parking and room service.",
    },
    {
      image: hotelImg2,
      title: "Lemon Tree Premier Budhanilkantha Kathmandu, Nepal",
      location: "Kathmandu",
      description:
        "Located in Kathmandu, a 16-minute walk from Sleeping Vishnu, Lemon Tree Premier Budhanilkantha provides accommodations with a garden, free private parking, a terrace and a restaurant.",
    },
  ];

  const handleSubmit = () => {};

  const handleBookNow = () => {
    navigate("/booknow");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="px-6 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              className="w-25 h-20"
              src="https://img.notionusercontent.com/s3/prod-files-secure%2F216d903c-0d87-465d-a560-cf6430ae550c%2F5734a301-a916-4103-99a1-e467ee730991%2Fa-clean-and-minimal-logo-design-featurin_-9wbRjIfTDmxHWXT5bPqKQ_v-9kkumvQ2uk0chTWnJjHg-removebg-preview.png/size/w=1330?exp=1763462242&sig=vV99sbMq9PIRMklElGaFHJy_ozgfu-RcsSV2hz0pJrg&id=2a37fe74-ddc9-80cd-9edb-e42f134ca0e2&table=block"
            ></img>
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
            {["places", "restaurants", "bookings", "profile"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeTab === tab
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab === "places" && <MapPin className="w-5 h-5" />}
                {tab === "restaurants" && (
                  <UtensilsCrossed className="w-5 h-5" />
                )}
                {tab === "bookings" && <Bookmark className="w-5 h-5" />}
                {tab === "profile" && <User className="w-5 h-5" />}
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
                  Share your restaurants place...
                </button>
              </div>
            </div>
          </div>

          {/* Modal for adding new post */}
          {showModal && (
            <div className=" inset-0 flex items-center justify-center z-50 p-6">
              <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Share Your Favorite Place
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Restaurant Name"
                    value={newPost.restaurants_name}
                    onChange={(e) =>
                      setNewPost({
                        ...newPost,
                        restaurants_name: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2s p-4 mb-2"
                  />
                  <textarea
                    placeholder="Description"
                    value={newPost.description}
                    onChange={(e) =>
                      setNewPost({ ...newPost, description: e.target.value })
                    }
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
                          imageFiles: Array.from(e.target.files || []),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 mb-2"
                    />
                    {newPost.imageFiles.length > 0 && (
                      <p className="text-sm text-gray-500">
                        {newPost.imageFiles.length} file
                        {newPost.imageFiles.length > 1 ? "s" : ""} selected
                      </p>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Google Maps Link"
                    value={newPost.google_map_link}
                    onChange={(e) =>
                      setNewPost({
                        ...newPost,
                        google_map_link: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 mb-2"
                  />
                  <div className="flex flex-col gap-2 mb-2">
                    <label
                      className="text-gray-600 font-medium"
                      htmlFor="review-input"
                    >
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
                      onChange={(e) =>
                        setNewPost({ ...newPost, review: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-600">Quick Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        onClick={() =>
                          setNewPost({ ...newPost, review: star.toString() })
                        }
                        className={`w-6 h-6 cursor-pointer ${
                          star <= Number(newPost.review)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
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
          {/* List of Resturants */}
          <div className="bg-gray-50 min-h-screen p-6">
            <h1 className="text-2xl font-bold mb-6">
              Kathmandu: 2 restaurants found
            </h1>

            <div className="max-w-6xl mx-auto space-y-6">
              {hotels.map((hotel, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow p-4 flex gap-4 border hover:shadow-lg transition"
                >
                  {/* Hotel Image */}
                  <div className="relative min-w-[240px] h-[180px]">
                    <img
                      src={hotel.image}
                      alt={hotel.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:scale-105 transition">
                      <FaHeart className="text-gray-500" />
                    </button>
                  </div>

                  {/* Text Content */}
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <h2 className="text-xl font-semibold text-emerald-700 hover:underline cursor-pointer">
                        {hotel.title}
                      </h2>

                      <div className="flex items-center gap-1 text-yellow-500 text-lg my-1">
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <AiFillStar key={i} />
                          ))}
                      </div>

                      <p className="text-gray-700 text-sm mt-2">
                        {hotel.description}
                      </p>
                    </div>
                  </div>

                  {/* Ratings + Button */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={handleBookNow}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-md mt-3 hover:bg-blue-700"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Restaurants;

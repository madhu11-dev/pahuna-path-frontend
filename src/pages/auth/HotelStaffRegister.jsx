import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerStaffApi } from "../../apis/Api";
import background from "../../assets/images/login-bg.png";

const HotelStaffRegister = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [hotelNameError, setHotelNameError] = useState("");
  const [profilePictureError, setProfilePictureError] = useState("");

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
  }, []);

  const handleName = (e) => {
    setName(e.target.value);
    if (e.target.value.trim() !== "") setNameError("");
  };

  const handleEmail = (e) => {
    setEmail(e.target.value);
    if (e.target.value.trim() !== "" && e.target.value.includes("@"))
      setEmailError("");
    else if (e.target.value.trim() === "") setEmailError("Email is required");
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
    if (e.target.value.trim() !== "" && e.target.value.length >= 6)
      setPasswordError("");
    else if (e.target.value.trim() === "")
      setPasswordError("Password is required");
    else setPasswordError("Password must be at least 6 characters");
  };

  const handleConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
    if (e.target.value === password) setConfirmPasswordError("");
    else setConfirmPasswordError("Passwords do not match");
  };

  const handleHotelName = (e) => {
    setHotelName(e.target.value);
    if (e.target.value.trim() !== "") setHotelNameError("");
  };

  const handleProfilePicture = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setProfilePictureError("File size must be less than 2MB");
        return;
      }
      if (
        !["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(
          file.type
        )
      ) {
        setProfilePictureError(
          "Please select a valid image file (JPEG, PNG, JPG, GIF)"
        );
        return;
      }
      setProfilePicture(file);
      setProfilePictureError("");

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
    setProfilePictureError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;

    if (name.trim() === "") {
      setNameError("Name is required");
      valid = false;
    }

    if (email.trim() === "" || !email.includes("@")) {
      setEmailError("Valid email is required");
      valid = false;
    }

    if (password.trim() === "" || password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    }

    if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match");
      valid = false;
    }

    if (hotelName.trim() === "") {
      setHotelNameError("Hotel name is required");
      valid = false;
    }

    if (!valid) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("hotel_name", hotelName);
    if (profilePicture) {
      formData.append("profile_picture", profilePicture);
    }

    registerStaffApi(formData)
      .then((response) => {
        toast.success(
          "Hotel staff account created! Please check your email for verification and wait for admin approval."
        );
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      })
      .catch((error) => {
        const errorMessage =
          error?.response?.data?.message || "Registration failed";
        toast.error(errorMessage);
      });
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Hotel Staff Registration
          </h2>
          <p className="text-gray-600 text-sm">
            Join as a hotel representative
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={handleName}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                nameError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {nameError && (
              <p className="text-red-500 text-xs mt-1">{nameError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={handleEmail}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                emailError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hotel/Accommodation Name *
            </label>
            <input
              type="text"
              placeholder="Hotel/Accommodation Name"
              value={hotelName}
              onChange={handleHotelName}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                hotelNameError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {hotelNameError && (
              <p className="text-red-500 text-xs mt-1">{hotelNameError}</p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePassword}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  passwordError ? "border-red-500" : "border-gray-300"
                }`}
              />
              {passwordError && (
                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={handleConfirmPassword}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  confirmPasswordError ? "border-red-500" : "border-gray-300"
                }`}
              />
              {confirmPasswordError && (
                <p className="text-red-500 text-xs mt-1">
                  {confirmPasswordError}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                {profilePicturePreview ? (
                  <img
                    src={profilePicturePreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture
              </label>
              <div className="flex items-center space-x-2">
                <input
                  id="profile-picture"
                  name="profile_picture"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicture}
                  className="hidden"
                />
                <label
                  htmlFor="profile-picture"
                  className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-md cursor-pointer transition-colors"
                >
                  Choose Photo
                </label>
                {profilePicture && (
                  <button
                    type="button"
                    onClick={removeProfilePicture}
                    className="px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-300 rounded-md transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              {profilePictureError && (
                <p className="text-red-500 text-xs mt-1">
                  {profilePictureError}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Register as Hotel Staff
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Sign In
            </button>
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Not a hotel representative?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Register as User
            </button>
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default HotelStaffRegister;

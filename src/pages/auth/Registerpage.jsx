import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerUserApi } from "../../apis/Api";
import background from "../../assets/images/login-bg.png";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [profilePictureError, setProfilePictureError] = useState("");

  const handleName = (e) => {
    setName(e.target.value);
    if (e.target.value.trim() !== "") setNameError("");
  };

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
  }, []);

  const handleEmail = (e) => {
    setEmail(e.target.value);
    if (e.target.value.trim() !== "" && e.target.value.includes("@"))
      setEmailError("");
    else if (e.target.value.trim() === "") setEmailError("Email is required");
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
    if (e.target.value.trim() !== "") setPasswordError("");
  };

  const handleConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
    if (e.target.value.trim() !== "" && e.target.value === password) {
      setConfirmPasswordError("");
    }
  };

  const handleProfilePicture = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      const maxSize = 2048 * 1024; // 2MB

      if (!allowedTypes.includes(file.type)) {
        setProfilePictureError('Please select a valid image file (JPEG, PNG, JPG, GIF)');
        return;
      }

      if (file.size > maxSize) {
        setProfilePictureError('Profile picture must be less than 2MB');
        return;
      }

      setProfilePictureError('');
      setProfilePicture(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
    setProfilePictureError('');
    // Clear the input
    const fileInput = document.getElementById('profile-picture');
    if (fileInput) fileInput.value = '';
  };

  var validate = () => {
    let isValid = true;

    if (name.trim() === "") {
      setNameError("Name is required");
      isValid = false;
    } else {
      setNameError("");
    }

    if (email.trim() === "" || !email.includes("@")) {
      setEmailError("Valid email is required");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (password.trim() === "") {
      setPasswordError("Password is required");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (confirmPassword.trim() === "") {
      setConfirmPasswordError("Confirm Password is required");
      isValid = false;
    } else if (confirmPassword.trim() !== password.trim()) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);

    if (profilePicture) {
      formData.append('profile_picture', profilePicture);
    }

    try {
      const res = await registerUserApi(formData);
      if (res?.status === false) {
        toast.error(res?.message || "Registration failed");
      } else {
        toast.success(res?.message || "Registered successfully!");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Network error. Please try again.");
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col justify-center py-12 sm:py-16"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <div className="relative sm:max-w-2xl lg:max-w-3xl mx-auto px-4">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-700 shadow-xl transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl opacity-90"></div>

        {/* Card */}
        <div className="relative bg-white shadow-2xl sm:rounded-3xl px-8 py-10 sm:px-12 sm:py-14 backdrop-blur-sm bg-opacity-95">
          <div className="max-w-xl mx-auto">
            <h1 className="text-3xl font-bold text-center text-green-600 mb-6">
              Register
            </h1>

            {/* Form */}
            <form className="space-y-8">
              {/* Profile Picture */}
              <div className="relative">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
                      {profilePicturePreview ? (
                        <img
                          src={profilePicturePreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
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
                          className="px-3 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {profilePictureError && (
                  <p className="text-red-500 text-sm mt-1">{profilePictureError}</p>
                )}
              </div>

              {/* Name */}
              <div className="relative mt-4">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="off"
                  onChange={handleName}
                  className="peer placeholder-transparent w-full h-10 border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-cyan-500"
                  placeholder="Name"
                />
                <label
                  htmlFor="name"
                  className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all
                    peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                    peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 
                    peer-focus:text-sm"
                >
                  Name *
                </label>
                {nameError && <p className="text-danger">{nameError}</p>}
              </div>



              {/* Email */}
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  onChange={handleEmail}
                  className="peer placeholder-transparent w-full h-10 border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-cyan-500"
                  placeholder="Email"
                />
                <label
                  htmlFor="email"
                  className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all
                    peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                    peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 
                    peer-focus:text-sm"
                >
                  Email Address *
                </label>
                {emailError && <p className="text-danger">{emailError}</p>}
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="off"
                  onChange={handlePassword}
                  className="peer placeholder-transparent w-full h-10 border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-cyan-500"
                  placeholder="Password"
                />
                <label
                  htmlFor="password"
                  className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all
                    peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                    peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 
                    peer-focus:text-sm"
                >
                  Password *
                </label>
                {passwordError && (
                  <p className="text-danger">{passwordError}</p>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="off"
                  onChange={handleConfirmPassword}
                  className="peer placeholder-transparent w-full h-10 border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-cyan-500"
                  placeholder="Password"
                />
                <label
                  htmlFor="password"
                  className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all
                    peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                    peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 
                    peer-focus:text-sm"
                >
                  Confirm Password *
                </label>
                {confirmPasswordError && (
                  <p className="text-danger">{confirmPasswordError}</p>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={handleSubmit}
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-700 text-white font-semibold rounded-md py-2 transition"
                >
                  Register
                </button>
              </div>
            </form>

            {/* Redirect */}
            <p className="text-center text-gray-600 mt-6">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold hover:underline"
              >
                Login Now
              </button>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default RegisterPage;

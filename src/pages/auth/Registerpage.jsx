import React, { useState } from "react";
import { registerUserApi } from "../../apis/Api";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import background from "../../assets/images/login-bg.png";
import logo from "../../assets/images/logo.png";

const RegisterPage = () => {
  const navigate = useNavigate();

  // Waits for toast to finish before resolving
  const notifyRegisterSuccess = () =>
    new Promise((resolve) =>
      toast.success("User Account Created!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        onClose: resolve, //Wait until toast closes
      })
    );

  const verificationNeeded = () =>
    new Promise((resolve) =>
      toast.info("Verification needed! Check your email for verification", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        onClose: resolve,
      })
    );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);

      const response = await registerUserApi(formDataToSend);

      if (response.status === true) {
        await notifyRegisterSuccess();   // Toast 1 → wait
        await verificationNeeded();      // Toast 2 → wait
        navigate("/login");              // Then navigate
      }
    } catch (err) {
      if (err.isAxiosError && err.response) {
        const data = err.response.data;
        if (data.errors) {
          const messages = Object.values(data.errors).flat().join(" ");
          setServerError(messages);
        } else {
          setServerError(data.message || "Registration failed. Try again.");
        }
      } else {
        setServerError("Network error. Try again.");
      }
    }
  };

return (
  <div
    className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
    style={{
      backgroundImage: `url(${background})`,
    }}
  >
    <div className="relative w-full max-w-sm">

      {/* Background blur (keeps the soft glow effect) */}
      <div className="absolute inset-0 bg-green-400/20 blur-xl rounded-3xl"></div>

      {/* Register Card with Shadow */}
      <div
        className="relative bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-white/60 
                   shadow-2xl shadow-green-300/40"
      >
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="w-16 h-16" />
        </div>

        <h1 className="text-xl font-bold text-center text-green-700 mb-5">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="peer w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg
                         focus:border-green-500 focus:ring-2 focus:ring-green-200
                         placeholder-transparent transition text-sm"
              placeholder="Name"
            />
            <label
              htmlFor="name"
              className="absolute left-3 -top-2.5 bg-white/95 px-1 text-xs text-gray-600
                         transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 
                         peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-green-600 peer-focus:text-xs rounded-lg"
            >
              Name
            </label>
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="peer w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg
                         focus:border-green-500 focus:ring-2 focus:ring-green-200
                         placeholder-transparent transition text-sm"
              placeholder="Email"
            />
            <label
              htmlFor="email"
              className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-gray-600
                         transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 
                         peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-green-600 peer-focus:text-xs rounded-lg"
            >
              Email Address
            </label>
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="peer w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg
                         focus:border-green-500 focus:ring-2 focus:ring-green-200
                         placeholder-transparent transition text-sm"
              placeholder="Password"
            />
            <label
              htmlFor="password"
              className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-gray-600
                         transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 
                         peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-green-600 peer-focus:text-xs rounded-lg"
            >
              Password
            </label>
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
          </div>

          {serverError && (
            <p className="text-red-500 text-center text-xs">{serverError}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold
                       py-2.5 text-sm rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            Register
          </button>
        </form>

        {/* Login text */}
        <p className="text-center text-gray-600 mt-4 text-sm">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-green-600 font-semibold hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>

    <ToastContainer />
  </div>
);



};

export default RegisterPage;

import React, { useState } from "react";
import { loginUserApi } from "../../apis/Api";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import background from "../../assets/images/login-bg.png";
import logo from "../../assets/images/logo.png";
import Cookies from "js-cookie";

const LoginPage = () => {
  const navigate = useNavigate();

  // Toast notification that returns a promise to wait

  const notifyLoginSuccess = () =>
    new Promise((resolve) =>
      toast.success("Login Successful!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        onClose: resolve,
      })
    );
    const setCookies = (token) =>{
      Cookies.set("auth_token", token, {
                expires: 7,
                secure: true,
                sameSite: "Strict"
            });
    }

  const [formData, setFormData] = useState({
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

      formDataToSend.append("email", formData.email);

      formDataToSend.append("password", formData.password);

      const response = await loginUserApi(formDataToSend);

      if (response.status === true) {
        setCookies(response.token);
        await notifyLoginSuccess(); // wait for toast

        navigate("/feed"); // then navigate to feed
      }
    } catch (err) {
      if (err.isAxiosError && err.response) {
        const data = err.response.data;

        if (data.errors) {
          const messages = Object.values(data.errors).flat().join(" ");

          setServerError(messages);
        } else {
          setServerError(data.message || "Login failed. Try again.");
        }
      } else {
        setServerError("Network error. Try again.");
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="relative w-full max-w-sm">
        {/* Soft background glow */}

        <div
          className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-700 shadow-xl
transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl opacity-90"
        ></div>

        {/* Login Card */}

        <div
          className="relative bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10
border border-white/60 shadow-2xl shadow-green-300/40 min-h-[500px] flex flex-col justify-center"
        >
          {/* Logo */}

          <div className="flex justify-center mb-4">
            <img src={logo} alt="Logo" className="w-16 h-16" />
          </div>

          <h1 className="text-3xl font-bold text-center text-green-600 mb-6">
            Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6 flex-1">
            {/* Email */}

            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="off"
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

peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-green-600 peer-focus:text-xs"
              >
                Email Address
              </label>

              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}

            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="off"
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
peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-green-600 peer-focus:text-xs"
              >
                Password
              </label>

              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Server Error */}

            {serverError && (
              <p className="text-red-500 text-center text-xs">{serverError}</p>
            )}

            {/* Login Button */}

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-700 text-white font-semibold
py-2.5 text-sm rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Login
            </button>
          </form>

          {/* Register Link */}

          <p className="text-center text-gray-600 mt-4 text-sm">
            Don’t have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-green-600 font-semibold hover:underline"
            >
              Register Now
            </button>
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default LoginPage;

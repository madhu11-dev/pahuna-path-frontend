import React, { useState } from "react";
import { loginUserApi } from "../../apis/Api";
import bg from "../../assets/images/login-bg.png";
import logo from "../../assets/images/logo.png";

const Loginpage = () => {
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
      console.log("Login successful:", response.data);
    } catch (err) {
      console.error(err);
      setServerError("Invalid email or password");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#e7f4ff]">
      {/* Left side */}
      <div className="w-1/2 relative flex items-center justify-center text-white">
        <img src={bg} alt="background" className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} />
        <div className="relative z-10 text-center px-10">
          <h1 className="text-5xl font-semibold mb-4 font-[cursive]">
            Pahuna Path
          </h1>
          <p className="text-lg max-w-md mx-auto leading-relaxed">
            Travel is the only purchase that enriches you in ways beyond
            material wealth.
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="w-1/2 flex items-center justify-center bg-white p-12 relative">
  {/* showing logo image in top-right */}
  <img src={logo} alt="logo" className="absolute top-8 right-12 h-30 w-30" />
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-bold text-blue-600 mb-2">Welcome</h2>
          <p className="text-gray-500 mb-8">Login with Email</p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email ID
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="pahunapath@gmail.com"
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-400 outline-none"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="************"
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-400 outline-none"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {serverError && (
              <p className="text-red-500 text-center mb-4">{serverError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md font-semibold transition-all"
            >
              LOGIN
            </button>
          </form>

          <p className="text-right text-sm text-blue-400 mt-2 cursor-pointer hover:underline">
            Forgot your password?
          </p>

          <p className="text-center text-gray-500 mt-8">
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-500 font-semibold">
              Register Now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loginpage;

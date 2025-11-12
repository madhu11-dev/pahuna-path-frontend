import React, { useState } from "react";
import { registerUserApi } from "../../apis/Api";
import bg from "../../assets/images/login-bg.png"; // Use your register background if different
import logo from "../../assets/images/logo.png";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      console.log("Registration successful:", response.data);
    } catch (err) {
      console.error(err);
      setServerError("Registration failed. Try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#e7f4ff]">
      {/* Left side */}
      <div className="w-1/2 relative flex items-center justify-center text-white">
        <img
          src={bg}
          alt="background"
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
        />
        <div className="relative z-10 text-center px-10">
          <h1 className="text-5xl font-semibold mb-4 font-[cursive]">
            Pahuna Path
          </h1>
          <p className="text-lg max-w-md mx-auto leading-relaxed">
              Where Every Path Tells a Local Story.
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="w-1/2 flex items-center justify-center bg-white p-12 relative">
        <img
          src={logo}
          alt="logo"
          className="absolute top-8 right-12 h-30 w-30"
        />
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-bold text-blue-600 mb-2">Register</h2>
          <p className="text-gray-500 mb-8">Create your account</p>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Pahuna Path"
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-400 outline-none"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
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
            <div className="mb-6 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="************"
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-sm text-blue-500 hover:underline"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
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
              REGISTER
            </button>
          </form>

          <p className="text-center text-gray-500 mt-8">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500 font-semibold">
              Login Now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

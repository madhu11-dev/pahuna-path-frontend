import React, { useState } from "react";
import { loginUserApi } from "../../apis/Api";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import background from "../../assets/images/login-bg.png";

const Loginpage = () => {
  const navigate = useNavigate();

  // const notifyLoginSuccess = () =>
  //   toast.success("Login Successful!", {
  //     position: "top-right",
  //     autoClose: 5000,
  //     hideProgressBar: false,
  //     closeOnClick: false,
  //     pauseOnHover: true,
  //     draggable: true,
  //     progress: undefined,
  //     theme: "colored",
  //   });

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

      console.log(formDataToSend);
      const response = await loginUserApi(formDataToSend);
      if (response.status === true) {
        // notifyLoginSuccess();
        setTimeout(() => navigate("/feed"), 2000);
      }
    } catch (err) {
      console.error(err);
      setServerError("Invalid email or password");
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
              Login
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email */}
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  value={formData.email}
                  onChange={handleChange}
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
                  Email Address
                </label>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
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
                  Password
                </label>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {serverError && (
                <p className="text-red-500 text-center">{serverError}</p>
              )}

              <div className="relative">
                <button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-700 text-white font-semibold rounded-md py-2 transition"
                >
                  Login
                </button>
              </div>
            </form>

            <p className="text-center text-gray-600 mt-6">
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-semibold hover:underline"
              >
                Register Now
              </button>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Loginpage;

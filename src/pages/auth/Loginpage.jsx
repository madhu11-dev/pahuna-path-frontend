import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginUserApi } from "../../apis/Api";
import background from "../../assets/images/login-bg.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  useEffect(() => {
    const token = getCookie("auth_token");
    const utype = localStorage.getItem("utype");

    if (token) {
      if (utype === "ADM") {
        navigate("/admin/dashboard"); // redirect admin to dashboard
      } else {
        navigate("/feed"); // redirect user to feed page
      }
    }
  }, [navigate]);

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

  const validate = () => {
    let isValid = true;

    if (email.trim() === "" || !email.includes("@")) {
      setEmailError("Valid email is required");
      isValid = false;
    }

    if (password.trim() === "") {
      setPasswordError("Password is required");
      isValid = false;
    }

    return isValid;
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");

    if (status) {
      toast.success(status);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const data = { email, password };
      const res = await loginUserApi(data);

      if (res.success === false) {
        toast.error(res.message);
      } else {
        // Set cookies for both users and admins
        document.cookie = `auth_token=${res.token}; path=/; max-age=${
          24 * 60 * 60
        }`;
        document.cookie = `user_id=${res.user["id"]}; path=/; max-age=${
          24 * 60 * 60
        }`;
        document.cookie = `user_name=${res.user["name"]}; path=/; max-age=${
          24 * 60 * 60
        }`;
        document.cookie = `user_profile_picture=${res.user["profile_picture_url"] || 'http://localhost:8090/images/default-profile.png'}; path=/; max-age=${
          24 * 60 * 60
        }`;
        localStorage.setItem("utype", res.user["utype"]);
        
        // Set admin-specific cookies if user is admin
        if (res.user["utype"] === "ADM") {
          document.cookie = `admin_token=${res.token}; path=/; max-age=${
            24 * 60 * 60
          }`;
          document.cookie = `admin_id=${res.user["id"]}; path=/; max-age=${
            24 * 60 * 60
          }`;
          document.cookie = `admin_name=${res.user["name"]}; path=/; max-age=${
            24 * 60 * 60
          }`;
          localStorage.setItem("admin_type", "ADMIN");
        }
        
        toast.success(res.message);
        
        // Redirect based on user type
        if (res.user["utype"] === "ADM") {
          navigate("/admin/dashboard"); // Redirect admin to dashboard
        } else {
          navigate("/feed"); // Redirect user to feed
        }
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
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="relative sm:max-w-2xl lg:max-w-3xl mx-auto px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-700 shadow-xl transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl opacity-90"></div>

        <div className="relative bg-white shadow-2xl sm:rounded-3xl px-8 py-10 sm:px-12 sm:py-14 backdrop-blur-sm bg-opacity-95">
          <div className="max-w-xl mx-auto">
            <h1 className="text-3xl font-bold text-center text-green-600 mb-6">
              Login
            </h1>

            <form className="space-y-8">
              {/* Email */}
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  value={email}
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
                  Email Address
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
                  value={password}
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
                  Password
                </label>
                {passwordError && (
                  <p className="text-danger">{passwordError}</p>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-green-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <button
                  onClick={handleSubmit}
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

export default LoginPage;

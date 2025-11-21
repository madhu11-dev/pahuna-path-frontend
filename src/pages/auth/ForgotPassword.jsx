import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { forgotPasswordApi } from "../../apis/Api";
import background from "../../assets/images/login-bg.png";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleEmail = (e) => {
    setEmail(e.target.value);
    if (e.target.value.trim() !== "" && e.target.value.includes("@")) {
      setEmailError("");
    }
  };

  const validate = () => {
    if (email.trim() === "" || !email.includes("@")) {
      setEmailError("Valid email is required");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const res = await forgotPasswordApi({ email });
      if (res?.status === false) {
        toast.error(res?.message || "Unable to send reset link");
      } else {
        toast.success(
          res?.message || "Password reset link sent to your email address."
        );
        setEmail("");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
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
              Forgot Password
            </h1>

            <p className="text-center text-gray-600 mb-8">
              Enter the email associated with your account and <br></br>{" "}
              we&apos;ll send you a link to reset your password.
            </p>

            <form className="space-y-8">
              <div className="relative">
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={handleEmail}
                  className="peer placeholder-transparent w-full h-10 border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-cyan-500"
                  placeholder="Email"
                />
                <label
                  htmlFor="forgot-email"
                  className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all
                             peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                             peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 
                             peer-focus:text-sm"
                >
                  Email Address
                </label>
                {emailError && <p className="text-danger">{emailError}</p>}
              </div>

              <div className="relative">
                <button
                  onClick={handleSubmit}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-500 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold rounded-md py-2 transition"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>

            <p className="text-center text-gray-600 mt-6">
              Remembered it?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold hover:underline"
              >
                Back to Login
              </button>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { resetPasswordApi } from "../../apis/Api";
import background from "../../assets/images/login-bg.png";
import { Check, X } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    if (!token || !email) {
      toast.error("Invalid or expired reset link.");
      navigate("/forgot-password");
    }
  }, [token, email, navigate]);

  const handlePassword = (e) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);

    const validation = {
      minLength: passwordValue.length >= 8,
      hasUpperCase: /[A-Z]/.test(passwordValue),
      hasLowerCase: /[a-z]/.test(passwordValue),
      hasNumber: /\d/.test(passwordValue),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue),
    };

    setPasswordValidation(validation);

    const allValid = Object.values(validation).every((v) => v === true);
    if (allValid) {
      setPasswordError("");
    }
  };

  const handleConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
    if (e.target.value.trim() !== "" && e.target.value === password) {
      setConfirmPasswordError("");
    }
  };

  const validate = () => {
    let isValid = true;

    if (password.trim() === "") {
      setPasswordError("Password is required");
      isValid = false;
    } else if (!Object.values(passwordValidation).every((v) => v === true)) {
      setPasswordError("Password does not meet all requirements");
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
    if (!token || !email) return;

    try {
      setIsSubmitting(true);
      const res = await resetPasswordApi({
        token,
        email,
        password,
        password_confirmation: confirmPassword,
      });

      if (res?.status === false) {
        toast.error(res?.message || "Unable to reset password");
      } else {
        toast.success(res?.message || "Password updated successfully.");
        setPassword("");
        setConfirmPassword("");
        // Delay navigation to show the success toast
        setTimeout(() => {
          navigate("/login");
        }, 1000);
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
              Reset Password
            </h1>

            <form className="space-y-8">
              <div className="relative">
                <input
                  id="new-password"
                  name="password"
                  type="password"
                  autoComplete="off"
                  value={password}
                  onChange={handlePassword}
                  className="peer placeholder-transparent w-full h-10 border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-cyan-500"
                  placeholder="Password"
                />
                <label
                  htmlFor="new-password"
                  className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all
                             peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                             peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 
                             peer-focus:text-sm"
                >
                  New Password
                </label>
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
                {password && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md space-y-1">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Password Requirements:</p>
                    <div className="space-y-1">
                      <p className={`text-xs flex items-center gap-2 ${passwordValidation.minLength ? "text-green-600" : "text-gray-500"}`}>
                        {passwordValidation.minLength ? <Check size={14} /> : <X size={14} />} At least 8 characters
                      </p>
                      <p className={`text-xs flex items-center gap-2 ${passwordValidation.hasUpperCase ? "text-green-600" : "text-gray-500"}`}>
                        {passwordValidation.hasUpperCase ? <Check size={14} /> : <X size={14} />} One uppercase letter
                      </p>
                      <p className={`text-xs flex items-center gap-2 ${passwordValidation.hasLowerCase ? "text-green-600" : "text-gray-500"}`}>
                        {passwordValidation.hasLowerCase ? <Check size={14} /> : <X size={14} />} One lowercase letter
                      </p>
                      <p className={`text-xs flex items-center gap-2 ${passwordValidation.hasNumber ? "text-green-600" : "text-gray-500"}`}>
                        {passwordValidation.hasNumber ? <Check size={14} /> : <X size={14} />} One number
                      </p>
                      <p className={`text-xs flex items-center gap-2 ${passwordValidation.hasSpecialChar ? "text-green-600" : "text-gray-500"}`}>
                        {passwordValidation.hasSpecialChar ? <Check size={14} /> : <X size={14} />} One special character
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="off"
                  value={confirmPassword}
                  onChange={handleConfirmPassword}
                  className="peer placeholder-transparent w-full h-10 border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-cyan-500"
                  placeholder="Confirm Password"
                />
                <label
                  htmlFor="confirm-password"
                  className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all
                             peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                             peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 
                             peer-focus:text-sm"
                >
                  Confirm Password
                </label>
                {confirmPasswordError && (
                  <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>
                )}
                {confirmPassword && confirmPassword === password && password && (
                  <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                    <Check size={16} /> Passwords match
                  </p>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={handleSubmit}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-500 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold rounded-md py-2 transition"
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>

            <p className="text-center text-gray-600 mt-6">
              Back to{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ResetPassword;

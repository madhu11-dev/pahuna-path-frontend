import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerStaffApi } from "../../apis/Api";
import background from "../../assets/images/login-bg.png";
import { Check, X } from "lucide-react";

const HotelStaffRegister = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

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
    if (e.target.value === password) setConfirmPasswordError("");
    else setConfirmPasswordError("Passwords do not match");
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

    if (password.trim() === "") {
      setPasswordError("Password is required");
      valid = false;
    } else if (!Object.values(passwordValidation).every((v) => v === true)) {
      setPasswordError("Password does not meet all requirements");
      valid = false;
    }

    if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match");
      valid = false;
    }

    if (!valid) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);

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

          <div className="space-y-4">
            <div>
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
              {password && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md space-y-1">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Password Requirements:</p>
                  <div className="space-y-0.5">
                    <p className={`text-xs flex items-center gap-1 ${passwordValidation.minLength ? "text-green-600" : "text-gray-500"}`}>
                      {passwordValidation.minLength ? <Check size={12} /> : <X size={12} />} At least 8 characters
                    </p>
                    <p className={`text-xs flex items-center gap-1 ${passwordValidation.hasUpperCase ? "text-green-600" : "text-gray-500"}`}>
                      {passwordValidation.hasUpperCase ? <Check size={12} /> : <X size={12} />} One uppercase letter
                    </p>
                    <p className={`text-xs flex items-center gap-1 ${passwordValidation.hasLowerCase ? "text-green-600" : "text-gray-500"}`}>
                      {passwordValidation.hasLowerCase ? <Check size={12} /> : <X size={12} />} One lowercase letter
                    </p>
                    <p className={`text-xs flex items-center gap-1 ${passwordValidation.hasNumber ? "text-green-600" : "text-gray-500"}`}>
                      {passwordValidation.hasNumber ? <Check size={12} /> : <X size={12} />} One number
                    </p>
                    <p className={`text-xs flex items-center gap-1 ${passwordValidation.hasSpecialChar ? "text-green-600" : "text-gray-500"}`}>
                      {passwordValidation.hasSpecialChar ? <Check size={12} /> : <X size={12} />} One special character
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
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
              {confirmPassword && confirmPassword === password && password && (
                <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                  <Check size={12} /> Passwords match
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

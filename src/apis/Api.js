import axios from "axios";

export const BASE_URL = "http://localhost:8090";

// Configure axios to include cookies with requests
axios.defaults.withCredentials = true;

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const getHeaders = (isFormData = false) => {
  const headers = {};

  // Try to get token from cookie first, then localStorage
  const tokenFromCookie = getCookie("auth_token");
  const tokenFromStorage = localStorage.getItem("token");
  const token = tokenFromCookie || tokenFromStorage;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

const axiosApi = async ({
  endpoint,
  method = "GET",
  data,
  isFormData = false,
}) => {
  try {
    const response = await axios({
      url: `${BASE_URL}${endpoint}`,
      method,
      headers: getHeaders(isFormData),
      data: isFormData ? data : data ? JSON.stringify(data) : undefined,
      withCredentials: true, // Include cookies in requests
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const post = (endpoint, data) => {
  const isFormData = data instanceof FormData;
  return axiosApi({ endpoint, method: "POST", data, isFormData });
};

const get = (endpoint) => axiosApi({ endpoint });
export const registerUserApi = (data) => post("/api/auth/register", data);
export const loginUserApi = (data) => post("/api/auth/login", data);
export const logoutUserApi = () => post("/api/auth/logout", {});
export const forgotPasswordApi = (data) =>
  post("/api/auth/forgot-password", data);
export const resetPasswordApi = (data) =>
  post("/api/auth/reset-password", data);
export const newlocation = (data) => post("/api/places", data);
export const getPlaces = () => get("/api/places");
export const newAccommodation = (data) => post("/api/accommodations", data);
export const getAccommodations = () => get("/api/accommodations");

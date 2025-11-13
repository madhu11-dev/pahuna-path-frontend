import axios from "axios";

const BASE_URL = "http://localhost:8090";

// Helper function to get headers
const getHeaders = (isFormData = false) => {
  const headers = {};
  const token = localStorage.getItem("token");

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

const axiosApi = async (endpoint, method = "GET", data = null, isFormData = false) => {
  try {
    const response = await axios({
      url: `${BASE_URL}${endpoint}`,
      method,
      headers: getHeaders(isFormData),
      data: isFormData ? data : data ? JSON.stringify(data) : null,
    });
    return response.data;
  } catch (error) {
    // Rethrow the original Axios error to preserve response
    throw error;
  }
};

// User APIs
export const registerUserApi = (data) => {
  const isFormData = data instanceof FormData;
  return axiosApi("/api/auth/register", "POST", data, isFormData);
};

export const loginUserApi = (data) => {
  const isFormData = data instanceof FormData;
  return axiosApi("/api/auth/login", "POST", data, isFormData);
};

// Location APIs
export const newlocation = (data) => {
  const isFormData = data instanceof FormData;
  return axiosApi("/api/addlocation", "POST", data, isFormData);
};

// Test API
export const testApi = () => {
  return axiosApi("/api/test", "GET");
};

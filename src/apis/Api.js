import axios from "axios";

export const BASE_URL = "http://localhost:8090";

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  if (!isFormData) headers["Content-Type"] = "application/json";

  return headers;
};

const axiosApi = async ({ endpoint, method = "GET", data, isFormData = false }) => {
  try {
    const response = await axios({
      url: `${BASE_URL}${endpoint}`,
      method,
      headers: getHeaders(isFormData),
      data: isFormData ? data : data ? JSON.stringify(data) : undefined,
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
export const newlocation = (data) => post("/api/places", data);
export const getPlaces = () => get("/api/places");
export const newAccommodation = (data) => post("/api/accommodations", data);
export const getAccommodations = () => get("/api/accommodations");



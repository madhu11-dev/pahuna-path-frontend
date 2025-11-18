import axios from "axios";

const BASE_URL = "http://localhost:8090";

const Api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const authConfig = {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
};

export const registerUserApi = (data) => Api.post("/api/auth/register", data);
export const loginUserApi = (data) => Api.post("/api/auth/login", data);
export const newlocation = (data) => Api.post("/api/places", data, authConfig);
export const getPlaces = () => Api.get("/api/places", authConfig);

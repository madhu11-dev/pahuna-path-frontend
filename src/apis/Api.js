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

// Generic fetch function with BASE_URL & safe JSON parsing
export const fetchApi = async (endpoint, options) => {
  const url = `${BASE_URL}${endpoint}`; // 🔥 prepend BASE_URL
  const response = await fetch(url, options);

  // If not ok, try to read the error as text
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error ${response.status}: ${text}`);
  }

  // Safely try to parse JSON
  try {
    return await response.json();
  } catch (err) {
    throw new Error("Invalid JSON response from server");
  }
};

// User APIs
export const registerUserApi = (data) => {
  const isFormData = data instanceof FormData;
  return fetchApi("/api/register", {
    method: "POST",
    headers: getHeaders(isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
};

// location APIs
export const newlocation = (data) => {
  const isFormData = data instanceof FormData;
  return fetchApi("/api/addlocation", {
    method: "POST",
    headers: getHeaders(isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
};

export const loginUserApi = (data) => {
  return fetchApi("/api/login", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
};

export const testApi = () => {
  return fetchApi("/api/test", {
    method: "GET",
    headers: getHeaders(),
  });
};

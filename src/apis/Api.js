import axios from "axios";

export const BASE_URL = "http://localhost:8090";

axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      localStorage.removeItem("token");
      localStorage.removeItem("admin_token");
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const getHeaders = (isFormData = false, isAdmin = false) => {
  const headers = {};

  let token;
  if (isAdmin) {
    const adminTokenFromCookie = getCookie("admin_token");
    const adminTokenFromStorage = localStorage.getItem("admin_token");
    token = adminTokenFromCookie || adminTokenFromStorage;
  } else {
    const tokenFromCookie = getCookie("auth_token");
    const tokenFromStorage = localStorage.getItem("token");
    token = tokenFromCookie || tokenFromStorage;
  }

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
  isAdmin = false,
}) => {
  try {
    const response = await axios({
      url: `${BASE_URL}${endpoint}`,
      method,
      headers: getHeaders(isFormData, isAdmin),
      data: isFormData ? data : data ? JSON.stringify(data) : undefined,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const post = (endpoint, data, isAdmin = false) => {
  const isFormData = data instanceof FormData;
  return axiosApi({ endpoint, method: "POST", data, isFormData, isAdmin });
};

const put = (endpoint, data, isAdmin = false) => {
  const isFormData = data instanceof FormData;
  return axiosApi({ endpoint, method: "PUT", data, isFormData, isAdmin });
};

const del = (endpoint, isAdmin = false) =>
  axiosApi({ endpoint, method: "DELETE", isAdmin });

const get = (endpoint, isAdmin = false) => axiosApi({ endpoint, isAdmin });
// Auth APIs
export const registerUserApi = (data) => post("/api/auth/register", data);
export const loginUserApi = (data) => post("/api/auth/login", data);
export const logoutUserApi = () => post("/api/auth/logout", {});
export const forgotPasswordApi = (data) =>
  post("/api/auth/forgot-password", data);
export const resetPasswordApi = (data) =>
  post("/api/auth/reset-password", data);

// Places APIs
export const createPlace = (data) => post("/api/places", data);
export const getPlaces = () => get("/api/places");
export const getPlace = (id) => get(`/api/places/${id}`);
export const updatePlace = (id, data) => put(`/api/places/${id}`, data);
export const deletePlace = (id) => del(`/api/places/${id}`);

// Reviews APIs
export const getPlaceReviews = (placeId) =>
  get(`/api/places/${placeId}/reviews`);
export const createPlaceReview = (placeId, data) =>
  post(`/api/places/${placeId}/reviews`, data);
export const updatePlaceReview = (placeId, reviewId, data) =>
  put(`/api/places/${placeId}/reviews/${reviewId}`, data);
export const deletePlaceReview = (placeId, reviewId) =>
  del(`/api/places/${placeId}/reviews/${reviewId}`);

// Accommodations APIs
export const newAccommodation = (data) => post("/api/accommodations", data);
export const getAccommodations = () => get("/api/accommodations");
export const getAccommodation = (id) => get(`/api/accommodations/${id}`);
export const payAccommodationVerificationFee = (accommodationId, data) =>
  post(`/api/accommodations/${accommodationId}/pay-verification`, data);

export const verifyVerificationPayment = (accommodationId, data) =>
  post(`/api/accommodations/${accommodationId}/pay-verification`, data);// Accommodation Reviews APIs
export const getAccommodationReviews = (accommodationId) =>
  get(`/api/accommodations/${accommodationId}/reviews`);
export const createAccommodationReview = (accommodationId, data) =>
  post(`/api/accommodations/${accommodationId}/reviews`, data);
export const updateAccommodationReview = (accommodationId, reviewId, data) =>
  put(`/api/accommodations/${accommodationId}/reviews/${reviewId}`, data);

// Staff APIs
export const registerStaffApi = (data) =>
  post("/api/auth/staff/register", data);
export const logoutStaffApi = () => post("/api/staff/logout", {});
export const getStaffStatusApi = () => get("/api/auth/staff/status");
export const getStaffDashboardDataApi = () => get("/api/staff/dashboard");
export const updateStaffProfileApi = (data) =>
  post("/api/staff/profile/update", data);
export const updateAccommodationApi = (id, data) => {
  // Use POST with _method=PUT for FormData compatibility
  const isFormData = data instanceof FormData;
  return axiosApi({
    endpoint: `/api/accommodations/${id}?_method=PUT`,
    method: "POST",
    data: data,
    isFormData: isFormData,
    isAdmin: false,
  });
};
export const deleteAccommodationApi = (id) => del(`/api/accommodations/${id}`);

// Admin APIs - using regular auth tokens
export const adminLogoutApi = () => post("/api/admin/logout", {});
export const getAdminInfoApi = () => get("/api/admin/me");
export const getDashboardStatsApi = () => get("/api/admin/dashboard/stats");
export const getAllUsersApi = () => get("/api/admin/users");
export const getAllPlacesApi = () => get("/api/admin/places");

export const deletePlaceApi = (placeId) => del(`/api/admin/places/${placeId}`);
export const deleteUserApi = (userId) => del(`/api/admin/users/${userId}`);
export const mergePlacesApi = (data) => post("/api/admin/places/merge", data);
export const verifyPlaceApi = (placeId) => {
  return axiosApi({
    endpoint: `/api/admin/places/${placeId}/verify`,
    method: "PATCH",
    isAdmin: false,
  });
};
export const getPendingAccommodationsApi = () =>
  get("/api/admin/accommodations/pending");
export const approveAccommodationApi = (accommodationId) => {
  return axiosApi({
    endpoint: `/api/admin/accommodations/${accommodationId}/approve`,
    method: "PATCH",
    isAdmin: false,
  });
};
export const rejectAccommodationApi = (accommodationId) =>
  del(`/api/admin/accommodations/${accommodationId}/reject`);

// Staff Management APIs
export const getAllStaffApi = () => get("/api/admin/staff");
export const getAllAccommodationsApi = () => get("/api/admin/accommodations");
export const verifyAccommodationApi = (accommodationId) => {
  return axiosApi({
    endpoint: `/api/admin/accommodations/${accommodationId}/verify`,
    method: "PATCH",
    isAdmin: false,
  });
};

// Get place images for landing page
export const getPlaceImagesApi = () => get("/api/places/images");

// Legacy support (keeping old names for compatibility)
export const newlocation = (data) => createPlace(data);

// Export utility functions
export { getCookie };

// User profile APIs
export const getUserProfileApi = () => get("/api/user");

export const updateUserProfileApi = (data) => {
  const isFormData = data instanceof FormData;
  if (isFormData) {
    try {
      data.append('_method', 'PATCH');
    } catch (e) {
      // ignore
    }
    return axiosApi({ endpoint: "/api/user", method: "POST", data, isFormData: true });
  }

  // Otherwise send JSON with PATCH
  return axiosApi({ endpoint: "/api/user", method: "PATCH", data, isFormData: false });
};

export const updateUserPasswordApi = (data) => post("/api/user/change-password", data);

// Room APIs
export const getRoomsApi = (accommodationId) => get(`/api/accommodations/${accommodationId}/rooms`);
export const createRoomApi = (accommodationId, data) => post(`/api/accommodations/${accommodationId}/rooms`, data);
export const updateRoomApi = (accommodationId, roomId, data) => {
  const isFormData = data instanceof FormData;
  return axiosApi({
    endpoint: `/api/accommodations/${accommodationId}/rooms/${roomId}?_method=PUT`,
    method: "POST",
    data: data,
    isFormData: isFormData,
    isAdmin: false,
  });
};
export const deleteRoomApi = (accommodationId, roomId) => del(`/api/accommodations/${accommodationId}/rooms/${roomId}`);
export const checkRoomAvailabilityApi = (accommodationId, roomId, data) => post(`/api/accommodations/${accommodationId}/rooms/${roomId}/availability`, data);

// Extra Services APIs
export const getExtraServicesApi = (accommodationId) => get(`/api/accommodations/${accommodationId}/services`);
export const createExtraServiceApi = (accommodationId, data) => post(`/api/accommodations/${accommodationId}/services`, data);
export const updateExtraServiceApi = (accommodationId, serviceId, data) => put(`/api/accommodations/${accommodationId}/services/${serviceId}`, data);
export const deleteExtraServiceApi = (accommodationId, serviceId) => del(`/api/accommodations/${accommodationId}/services/${serviceId}`);

// Booking APIs
export const getBookingsApi = () => get("/api/bookings");
export const getBookingApi = (bookingId) => get(`/api/bookings/${bookingId}`);
export const createBookingApi = (data) => post("/api/bookings", data);
export const updateBookingStatusApi = (bookingId, data) => {
  return axiosApi({
    endpoint: `/api/bookings/${bookingId}/status`,
    method: "PATCH",
    data: data,
    isFormData: false,
    isAdmin: false,
  });
};
export const cancelBookingApi = (bookingId, data) => {
  return axiosApi({
    endpoint: `/api/bookings/${bookingId}/cancel`,
    method: "PATCH",
    data: data,
    isFormData: false,
    isAdmin: false,
  });
};

// Payment APIs
export const verifyPaymentApi = (data) => post("/api/payments/verify", data);
export const initiateRefundApi = (bookingId, data) => post(`/api/payments/refund/${bookingId}`, data);
export const getBookingPaymentInfoApi = (bookingId) => get(`/api/payments/booking/${bookingId}`);

// Transaction APIs
export const getUserTransactionsApi = () => get("/api/transactions/user");
export const getStaffTransactionsApi = (params) => {
  let query = "/api/transactions/staff";
  if (params) {
    const queryParams = new URLSearchParams(params).toString();
    if (queryParams) query += `?${queryParams}`;
  }
  return get(query);
};
export const getTransactionDetailsApi = (transactionId) => get(`/api/transactions/${transactionId}`);

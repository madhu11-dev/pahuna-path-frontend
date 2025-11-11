const BASE_URL = "http://localhost:8080";

// Helper function to get headers
const getHeaders = (isFormData = false) => {
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
};

// Generic fetch function
const fetchApi = async (url, options = {}) => {
    try {
        const response = await fetch(`${BASE_URL}${url}`, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API request failed');
        }
        return response.json();
    } catch (error) {
        return Promise.reject(error);
    }
};

// User APIs
export const registerUserApi = (data) => {
    const isFormData = data instanceof FormData;
    return fetchApi('/api/user/create', {
        method: 'POST',
        headers: getHeaders(isFormData),
        body: isFormData ? data : JSON.stringify(data),
    });
};

export const loginUserApi = (data) => {
    return fetchApi('/api/user/login', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
};

export const testApi = () => {
    return fetchApi('/api/test', {
        method: 'GET',
        headers: getHeaders(),
    });
};

import { BASE_URL } from "../apis/Api";

export const IMAGE_PLACEHOLDER = '/logo.png';

export const resolveImageUrl = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') {
        return IMAGE_PLACEHOLDER;
    }

    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    if (imagePath.startsWith('/')) {
        return `${BASE_URL}${imagePath}`;
    }

    return `${BASE_URL}/storage/${imagePath}`;
};



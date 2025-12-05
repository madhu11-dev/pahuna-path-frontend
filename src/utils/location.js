/**
 * Calculate the distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Ensure all coordinates are numbers and valid
  const latitude1 = parseFloat(lat1);
  const longitude1 = parseFloat(lon1);
  const latitude2 = parseFloat(lat2);
  const longitude2 = parseFloat(lon2);

  // Validate coordinates
  if (
    isNaN(latitude1) ||
    isNaN(longitude1) ||
    isNaN(latitude2) ||
    isNaN(longitude2)
  ) {
    console.warn("Invalid coordinates provided to calculateDistance:", {
      lat1,
      lon1,
      lat2,
      lon2,
    });
    return null;
  }

  // If coordinates are exactly the same, distance is 0
  if (latitude1 === latitude2 && longitude1 === longitude2) {
    return 0;
  }

  const R = 6371; // Radius of Earth in kilometers

  // Convert degrees to radians
  const lat1Rad = latitude1 * (Math.PI / 180);
  const lon1Rad = longitude1 * (Math.PI / 180);
  const lat2Rad = latitude2 * (Math.PI / 180);
  const lon2Rad = longitude2 * (Math.PI / 180);

  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Return rounded distance to avoid floating point precision issues
  return Math.round(distance * 1000) / 1000; // Round to 3 decimal places
};

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
};

/**
 * Log actual user location and distance calculations for debugging
 * This should be removed after debugging
 */
export const logLocationAndDistances = (userLocation, places) => {
  if (!userLocation || !places || places.length === 0) {
    console.log("Missing user location or places data");
    return;
  }

  console.log("LOCATION SORTING DEBUG:");
  console.log(
    `👤 Your actual location: ${userLocation.latitude}, ${userLocation.longitude}`
  );
  console.log("\\n📍 Places sorted by distance:");

  // Create a copy and sort by distance
  const sortedPlaces = places
    .filter(
      (place) =>
        place.distanceFromUser !== null && place.distanceFromUser !== undefined
    )
    .sort((a, b) => a.distanceFromUser - b.distanceFromUser)
    .slice(0, 15); // Show top 15

  sortedPlaces.forEach((place, index) => {
    console.log(
      `${(index + 1).toString().padStart(2, " ")}. ${
        place.name
      }: ${place.distanceFromUser?.toFixed(2)}km at [${place.latitude}, ${
        place.longitude
      }]`
    );
  });

  if (sortedPlaces.length === 0) {
    console.log("No places found with valid distances");
  }
};

/**
 * Get user's current location with high precision
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>} User's coordinates with accuracy info
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    let bestPosition = null;
    let attempts = 0;
    const maxAttempts = 3;
    const acceptableAccuracy = 50; // meters

    const options = {
      enableHighAccuracy: true, // Use GPS if available
      timeout: 20000, // Allow more time for precise location
      maximumAge: 0, // Always get fresh location, no cache
    };

    const tryGetLocation = () => {
      attempts++;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // If this is the first position or it's more accurate than the previous one
          if (
            !bestPosition ||
            position.coords.accuracy < bestPosition.coords.accuracy
          ) {
            bestPosition = position;
          }

          // If we have acceptable accuracy or reached max attempts, resolve
          if (
            position.coords.accuracy <= acceptableAccuracy ||
            attempts >= maxAttempts
          ) {
            resolve({
              latitude: bestPosition.coords.latitude,
              longitude: bestPosition.coords.longitude,
              accuracy: bestPosition.coords.accuracy,
            });
          } else {
            // Try again for better accuracy
            setTimeout(tryGetLocation, 1000);
          }
        },
        (error) => {
          if (bestPosition) {
            // If we have a previous position, use it
            resolve({
              latitude: bestPosition.coords.latitude,
              longitude: bestPosition.coords.longitude,
              accuracy: bestPosition.coords.accuracy,
            });
          } else if (attempts >= maxAttempts) {
            // No position obtained after max attempts
            let errorMessage;
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Location access denied by user";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information is unavailable";
                break;
              case error.TIMEOUT:
                errorMessage = "Location request timed out";
                break;
              default:
                errorMessage =
                  "An unknown error occurred while retrieving location";
                break;
            }
            reject(new Error(errorMessage));
          } else {
            // Try again
            setTimeout(tryGetLocation, 1000);
          }
        },
        options
      );
    };

    // Start the first attempt
    tryGetLocation();
  });
};

/**
 * Get user's location with maximum precision (may take longer)
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>} User's most precise coordinates
 */
export const getHighPrecisionLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    let bestPosition = null;
    let watchId = null;
    let timeout = null;
    const maxTime = 30000; // 30 seconds max
    const targetAccuracy = 10; // 10 meters or better

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const finishWithBestPosition = () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (timeout) {
        clearTimeout(timeout);
      }

      if (bestPosition) {
        resolve({
          latitude: bestPosition.coords.latitude,
          longitude: bestPosition.coords.longitude,
          accuracy: bestPosition.coords.accuracy,
        });
      } else {
        reject(new Error("Unable to obtain high-precision location"));
      }
    };

    // Set maximum time limit
    timeout = setTimeout(() => {
      finishWithBestPosition();
    }, maxTime);

    // Watch position for continuous updates
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        // Keep the most accurate position
        if (
          !bestPosition ||
          position.coords.accuracy < bestPosition.coords.accuracy
        ) {
          bestPosition = position;
        }

        // If we reached target accuracy, finish early
        if (position.coords.accuracy <= targetAccuracy) {
          finishWithBestPosition();
        }
      },
      (error) => {
        if (!bestPosition) {
          reject(error);
        } else {
          finishWithBestPosition();
        }
      },
      options
    );
  });
};

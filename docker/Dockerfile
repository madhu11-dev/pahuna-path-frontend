# Base image
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose React’s default port
EXPOSE 3000

# Start React in development mode
CMD ["npm", "start"]

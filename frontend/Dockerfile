# Stage 1: Build Vite application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Define build arguments for Vite environment variables
ARG VITE_API_URL
ARG VITE_ML_URL

# Set environment variables so Vite can inject them at build time
ENV VITE_API_URL=${VITE_API_URL:-http://localhost:5000/api}
ENV VITE_ML_URL=${VITE_ML_URL:-http://localhost:8000}

# Build the production bundle
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine

# Copy our custom Nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to Nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

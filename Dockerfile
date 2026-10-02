# Stage 1: Build the Angular app
FROM node:latest AS builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

RUN npm install -g @angular/cli

# Copy the rest of the application code to the container
COPY . .

# Install dependencies and build the app
RUN npm install
RUN npm run build-prod-memory

# Stage 2: Create the final image
FROM nginx:alpine

# Copy the built Angular app from the previous stage
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Expose port 80 (the default Nginx port)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

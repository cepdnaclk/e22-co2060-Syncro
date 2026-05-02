# Use Node 20 Alpine for a lightweight image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Expose Vite's default dev server port
EXPOSE 5173

# Run the Vite dev server, accessible from outside the container
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5173"]

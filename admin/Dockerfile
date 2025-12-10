FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Install a simple static file server
RUN npm install -g serve

# Serve the 'dist' folder on port 5173
# The '-s' flag fixes the page refresh 404 issue (Single Page App)
CMD ["serve", "-s", "dist", "-l", "5173"]

EXPOSE 5173
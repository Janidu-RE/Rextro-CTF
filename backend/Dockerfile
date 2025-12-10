FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose the port your server runs on (5001)
EXPOSE 5001

# Command to run the application
# Ensure your package.json has a "start" script: "node server.js" or "node src/server.js"
CMD ["npm", "start"]
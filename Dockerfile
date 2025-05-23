# Use official Node.js image
FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV MONGO_URI=mongodb://mongo:27017/rental

# Expose port
EXPOSE 5000

# Command to run the application
CMD ["node", "server.js"]

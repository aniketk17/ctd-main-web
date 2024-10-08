# Use the official Node.js image based on Ubuntu as a base image
FROM node:18.19.1

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the wait-for-it.sh script into the container
COPY wait-for-it.sh /wait-for-it.sh

# Ensure wait-for-it.sh has executable permissions
RUN chmod +x /wait-for-it.sh

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Define the command to run your application
CMD ["node", "server.js"]
FROM node:18-alpine

# Install pdftohtml and other necessary packages
RUN apk add --no-cache poppler-utils

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "main.js"]

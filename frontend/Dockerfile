FROM node:20-alpine

# Set work directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project
COPY . .

# Expose port
EXPOSE 5173

# Run the application in dev mode with host access
CMD ["npm", "run", "dev", "--", "--host"]

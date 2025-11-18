FROM node:22
WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install root dependencies
RUN npm ci

# Copy frontend package files
COPY frontend/package*.json ./frontend/

# Install frontend dependencies
RUN npm ci --prefix frontend

# Copy all source files
COPY . .

# Build the frontend
RUN npm run build --prefix frontend

EXPOSE 3000
CMD ["npm", "start"]
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Expose port
EXPOSE 3000

# Start dev server since we are running in local dev/testing mode
CMD ["npm", "run", "dev"]

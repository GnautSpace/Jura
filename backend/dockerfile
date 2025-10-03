# Dockerfile for Node.js/Express backend
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
# Copy .env separately if needed for secrets
EXPOSE 8080
CMD ["npm", "start"]

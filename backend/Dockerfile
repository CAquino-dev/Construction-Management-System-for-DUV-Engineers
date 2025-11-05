FROM node:20-alpine

WORKDIR /app

# Copy only backend folder
COPY backend/package*.json ./
RUN npm install --production

COPY backend ./

EXPOSE 5000

CMD ["node", "server.js"]

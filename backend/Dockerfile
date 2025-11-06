FROM node:20-alpine

# Install necessary system dependencies for Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --production

COPY backend ./

EXPOSE 5000

CMD ["node", "server.js"]

FROM node:20-alpine

# Install Chromium and fonts for Puppeteer
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

FROM node:18-alpine

WORKDIR /app

# Install
RUN apk add --no-cache openssl

# Copy package.json files (*)
COPY package*.json ./

# Install dependencies //
RUN npm install

# Copy Prisma schema and other source files
COPY prisma ./prisma
COPY . .

# Generate Prisma Client << added ++
RUN npx prisma generate

# Build
RUN npm run build

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "dist/app.js"]

# By Frocode

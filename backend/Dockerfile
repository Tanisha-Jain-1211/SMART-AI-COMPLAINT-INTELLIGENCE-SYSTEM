FROM node:18-alpine

# Install openssl and other prisma dependencies
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including prisma devDependency)
RUN npm install

# Copy Prisma schema first to generate client and leverage build cache
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the backend files
COPY . .

# Copy and configure entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "start"]

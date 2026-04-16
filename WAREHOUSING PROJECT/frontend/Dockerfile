# Build stage
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build


# Production stage
FROM node:18

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist .

EXPOSE 5174

CMD ["serve", "-s", ".", "-l", "5174"]
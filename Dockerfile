FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN adduser -D appuser
USER appuser

EXPOSE 3001

CMD ["npm", "start"]

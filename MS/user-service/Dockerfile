FROM node:22
WORKDIR /app
copy package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD [ "node", "index.js" ]
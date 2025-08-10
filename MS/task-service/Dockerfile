FROM node:22
WORKDIR /app
copy package*.json ./
RUN npm install
COPY . .
EXPOSE 3002
CMD [ "node", "index.js" ]
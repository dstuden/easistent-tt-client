FROM node:18-bullseye as BUILD

RUN apt-get -y update && apt-get -y install build-essential

WORKDIR /app
COPY .env .
COPY package.json .
RUN npm i
COPY . .
RUN npm run build

FROM nginx as DEPLOY

RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/conf.d/

COPY --from=BUILD /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

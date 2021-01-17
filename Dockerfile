FROM node:10 as build-deps
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
COPY . ./
RUN npm run build


FROM nginx:1-alpine
COPY --from=build-deps /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
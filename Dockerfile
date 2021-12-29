FROM node:16-alpine
EXPOSE 80
COPY dist/ /HANA/dist/
COPY res/ /HANA/res/
COPY package.json yarn.lock tsconfig.json /HANA/
RUN apk update
WORKDIR /HANA
RUN yarn install --production
CMD yarn run run

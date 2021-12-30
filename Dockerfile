FROM node:16-alpine
EXPOSE 80
RUN apk add --update alpine-sdk cpulimit
RUN apk update
RUN addgroup execute
COPY dist/ /HANA/dist/
COPY res/ /HANA/res/
COPY package.json yarn.lock tsconfig.json /HANA/
WORKDIR /HANA
RUN yarn install --production
CMD yarn run run

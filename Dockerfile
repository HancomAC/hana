FROM node:16-alpine
EXPOSE 80

# Install Judgement Tool
RUN apk update
RUN apk add --update cpulimit

# Install C/C++
RUN apk add --update alpine-sdk

# Install Python3 & Pypy3
RUN apk add python3
RUN apk add pypy3 --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing \
                  --repository http://dl-cdn.alpinelinux.org/alpine/edge/main
RUN ln -s /pypy/bin/pypy3 /usr/bin/pypy3
RUN export LC_ALL=C.UTF-8
ENV LANG=C.UTF-8
ENV LANGUAGE=C.UTF-8

# Copy files & Install requirements
RUN addgroup execute
WORKDIR /HANA
COPY package.json yarn.lock /HANA/
RUN yarn install --production
COPY tsconfig.json /HANA/
COPY dist/ /HANA/dist/
COPY res/ /HANA/res/
CMD yarn run run

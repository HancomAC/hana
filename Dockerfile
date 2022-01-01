FROM alpine:latest
EXPOSE 80

RUN echo "https://dl-3.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories
RUN echo "https://dl-3.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories
RUN echo "https://dl-3.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories
RUN apk update

#Install node.js
RUN apk add nodejs npm
RUN npm install -g yarn typescript
RUN node --version
RUN npm --version
RUN yarn --version

# Install Judgement Tool
RUN apk add cpulimit

# Install C/C++
RUN apk add --update alpine-sdk

# Install Python3 & Pypy3
RUN apk add python3 pypy3
RUN ln -s /pypy/bin/pypy3 /usr/bin/pypy3
RUN export LC_ALL=C.UTF-8
ENV LANG=C.UTF-8
ENV LANGUAGE=C.UTF-8
RUN python3 --version
RUN pypy3 --version

# Install Java
RUN apk add openjdk11
RUN java -version

# Install Rust
RUN apk add rust
RUN rustc --version

# Install Go
RUN apk add go
RUN mkdir /tmp/gocache
RUN chmod 777 /tmp/gocache
ENV GOROOT /usr/lib/go
ENV GOCACHE /tmp/gocache
ENV PATH /go/bin:$PATH

# Copy files & Install requirements
RUN addgroup execute
WORKDIR /HANA
COPY package.json yarn.lock /HANA/
RUN yarn install --production
COPY tsconfig.json /HANA/
COPY res/ /HANA/res/
COPY include/ /include/
COPY dist/ /HANA/dist/
CMD yarn run run

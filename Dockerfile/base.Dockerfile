FROM alpine:latest

RUN apk update

#Install node.js
RUN apk add nodejs npm
RUN npm install -g yarn typescript
RUN node --version
RUN npm --version
RUN yarn --version

# Install Judgement Tool
COPY include/ /include/
RUN apk add cpulimit bash libc6-compat procps
RUN ln -s /lib/libc.musl-x86_64.so.1 /lib/ld-linux-x86-64.so.2

# Install C/C++
RUN apk add alpine-sdk

# Install Python3 & Pypy3
RUN apk add pypy3 python3-dev --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing \
                              --repository http://dl-cdn.alpinelinux.org/alpine/edge/main
RUN python3 -m ensurepip --default-pip
RUN ln -s /pypy/bin/pypy3 /usr/bin/pypy3
RUN export LC_ALL=C.UTF-8
ENV LANG=C.UTF-8
ENV LANGUAGE=C.UTF-8
RUN python3 --version
RUN pypy3 --version
RUN pip3 install -r /include/PYTHON/requirements.txt

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

# Install Kotlin
RUN wget https://github.com/JetBrains/kotlin/releases/download/v1.6.10/kotlin-native-linux-x86_64-1.6.10.tar.gz -O /tmp/kotlin.tar.gz
RUN mkdir /kotlin
RUN tar -xvzf /tmp/kotlin.tar.gz --directory /kotlin
RUN ln -s /kotlin/kotlin-native-linux-x86_64-1.6.10/bin/kotlinc-native /usr/bin/kotlinc-native
RUN ln -s /kotlin/kotlin-native-linux-x86_64-1.6.10/bin/run_konan /usr/bin/run_konan
RUN rm /tmp/kotlin.tar.gz

# Install Ruby
RUN apk add ruby
RUN ruby --version

# Install PHP
RUN apk add php7
RUN php --version

# Install .NET
RUN apk add bash icu-libs krb5-libs libgcc libintl libssl1.1 libstdc++ zlib
RUN apk add libgdiplus --repository https://dl-3.alpinelinux.org/alpine/edge/testing/
RUN wget https://dot.net/v1/dotnet-install.sh
RUN bash /dotnet-install.sh -c Current
RUN ln -s /root/.dotnet/dotnet /usr/local/bin/
RUN dotnet --version

# Install Lua
RUN apk add lua5.3
RUN luac5.3 -v
RUN lua5.3 -v

# Cleanup
RUN rm -rf /var/cache/apk/*
RUN rm -rf /root/.cache/yarn
RUN rm -rf /root/.cache/npm
RUN rm -rf /root/.cache/pip
RUN rm -rf /tmp

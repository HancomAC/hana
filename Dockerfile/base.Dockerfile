FROM ubuntu:20.04

RUN apt-get update
RUN apt-get install curl cpulimit software-properties-common time -y
COPY include/ /include/

#Install node.js
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash
RUN apt-get install nodejs -y
RUN node --version
RUN npm --version
RUN npm install -g yarn typescript
RUN yarn --version

# Install C/C++
RUN add-apt-repository ppa:ubuntu-toolchain-r/test
RUN apt-get update
RUN apt-get install gcc-11 g++-11 -y
RUN gcc-11 --version
RUN g++-11 --version


# Install Python3 & Pypy3
RUN add-apt-repository ppa:pypy/ppa
RUN apt-get update
RUN apt install pypy3 python3-pip -y
ENV LANG=C.UTF-8
ENV LANGUAGE=C.UTF-8
RUN python3 --version
RUN pypy3 --version
RUN export LC_ALL=C.UTF-8
RUN rm /usr/bin/gcc
RUN rm /usr/bin/g++
RUN ln -s /usr/bin/gcc-11 /usr/bin/gcc
RUN ln -s /usr/bin/g++-11 /usr/bin/g++
RUN python3 -m pip install -r /include/PYTHON/requirements.txt

# Install Java
RUN apt-get install openjdk-11-jdk -y
RUN javac -version
RUN java -version

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
RUN ln -s $HOME/.cargo/bin/rustc /usr/local/bin/rustc
RUN rustc --version

# Install Go
RUN apt-get install golang-go -y
RUN mkdir /tmp/gocache
RUN chmod 777 /tmp/gocache
ENV GOROOT /usr/lib/go
ENV GOCACHE /tmp/gocache
ENV PATH /go/bin:$PATH
RUN go version

# Install Kotlin
RUN apt-get install wget -y
RUN wget https://github.com/JetBrains/kotlin/releases/download/v1.6.10/kotlin-native-linux-x86_64-1.6.10.tar.gz -O /tmp/kotlin.tar.gz
RUN mkdir /kotlin
RUN tar -xvzf /tmp/kotlin.tar.gz --directory /kotlin
RUN ln -s /kotlin/kotlin-native-linux-x86_64-1.6.10/bin/kotlinc-native /usr/bin/kotlinc-native
RUN ln -s /kotlin/kotlin-native-linux-x86_64-1.6.10/bin/run_konan /usr/bin/run_konan
RUN rm /tmp/kotlin.tar.gz
RUN kotlinc-native -version

# Install Ruby
RUN apt-get install ruby-full -y
RUN ruby --version

# Install PHP
RUN apt-get install php -y
RUN php --version

# Install .NET
RUN curl --proto '=https' --tlsv1.2 -sSf -L https://dot.net/v1/dotnet-install.sh | bash -s -- -c Current
RUN ls /root/.dotnet
RUN ln -s /root/.dotnet/dotnet /usr/bin/dotnet
RUN dotnet --version

# Install Lua
RUN apt-get install lua5.3
RUN luac5.3 -v
RUN lua5.3 -v

# Cleanup
RUN rm -rf /var/cache/apk/*
RUN rm -rf /root/.cache/yarn
RUN rm -rf /root/.cache/npm
RUN rm -rf /root/.cache/pip
RUN rm -rf /tmp

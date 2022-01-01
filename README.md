# HANA

<img src="res/logo.png" width="200" alt="logo">

HANA is a PS Judgement Server that runs on Docker.

## Supported Languages

C, C++, Go, Java, Python3, Pypy3, Rust, Text

<details>
<summary>Build option</summary>

* C
```shell
gcc ${path}/Main.c -o ${path}/Main -O2 -Wall -lm --static -std=c99 -DONLINE_JUDGE
```

* C++
```shell
g++ ${path}/Main.cpp -o ${path}/Main -O2 -Wall -lm --static -pipe -std=c++17 -DONLINE_JUDGE
```

* Go
```shell
go build ${path}/Main.go
```

* Java
```shell
javac --release 11 -J-Xms1024m -J-Xmx1920m -J-Xss512m -encoding UTF-8 ${path}/Main.java
```

* Python3
```shell
python3 -m compileall -b ${path}
```

* Pypy3
```shell
pypy3 -m compileall -b ${path}
```

* Rust
```shell
rustc ${path}/Main.rs
```
</details>

## Installation

TBA

## Usage

You have to use both websocket and http request to use HANA.

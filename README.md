<p align="center"><img alt="logo" src="res/logo.png" width="200"></p>

<h1 align="center">HANA</h1>

[![Build Status](https://github.com/HancomAC/HANA/actions/workflows/.github/workflows/ci.yml/badge.svg)](https://github.com/HancomAC/HANA/actions/workflows/ci.yml)

HANA is a PS Judgement Server that runs on Docker.

## Supported Languages

C, C++, Go, Java, Python3, Pypy3, Rust, Text, JavaScript, TypeScript

<details>
<summary>Build option</summary>

-   C

```shell
gcc Main.c -o Main -O2 -Wall -lm --static -std=c99 -DONLINE_JUDGE
```

-   C++

```shell
g++ Main.cpp -o Main -O2 -Wall -lm --static -pipe -std=c++17 -DONLINE_JUDGE
```

-   Go

```shell
go build Main.go
```

-   Java

```shell
javac --release 11 -J-Xms1024m -J-Xmx1920m -J-Xss512m -encoding UTF-8 Main.java
```

-   Python3

```shell
python3 -m compileall -b ${path}
```

-   Pypy3

```shell
pypy3 -m compileall -b ${path}
```

-   Rust

```shell
rustc Main.rs
```

-   TypeScript

```shell
tsc Main.ts
```

</details>

## Installation

TBA

## Usage

You have to use both websocket and http request to use HANA.

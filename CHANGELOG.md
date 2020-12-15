# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 5.0.4 - 2020-12-15

### Changed

- Change client log levels from `trace` -> `info` and request log level from
  `trace` -> `debug`.

## 5.0.3 - 2020-12-14

### Changed

- Upgrade `@jupiterone/jupiter-managed-integration-sdk@^35.0.12`, which will
  enable ECS steps to be executed with a timeout longer than 150 minutes.

## 5.0.2 2020-12-08

### Changed

- Retry `504` responses

## 5.0.1 2020-11-10

### Changed

- Retry `500` responses

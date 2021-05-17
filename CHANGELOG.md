# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 6.0.1 - 2021-05-17

### Fixed

- Handle Tenable 404 errors on the `scans/scan_uuid/hosts/host_id` endpoint.

## 6.0.0 - 2021-05-14

### Changed

- The integration no longer uses the `/workbenches/assets` endpoint to get
  vulnerability information and now uses the asset export endpoint to get extra
  asset metadata information.

### Added

- Bulk export endpoints for vulnerabilities and assets

## 5.3.0 - 2021-05-12

### Changed

- Only retry 500 status code errors from tenable up to a maximum of 3 times
  irrespective of `retryMaxAttempts`
- Added additional logging the amount of scans and hosts in the scan details.

### Fixed

- Tenable client now correctly resets the retryDelay so that other status codes
  don't end up using the calculated retry delay from a 429 status code.

## 5.2.0 - 2021-05-05

## 5.1.0 - 2021-05-05

### Changed

- fetchAssetVulnerabilityInfo no longer throws error for status code 500,
  instead it's logged as a warning message
- synchronizeHosts no longer attempts to fetch host details if the scan is
  archived. Previously when it did the api would returns a 404.

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

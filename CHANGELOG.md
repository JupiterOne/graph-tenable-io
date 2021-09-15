# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Changed the `iterateVulnerabilities` method to fetch all open/reopened/fixed
  vulns. Previously, the integration iterated only vulns from the last 35 days.

## [8.0.0] - 2021-09-09

### Added

- Added support for ingesting the following **new** entities:

  | Resources | Entity `_type`  | Entity `_class` |
  | --------- | --------------- | --------------- |
  | Asset     | `tenable_asset` | `HostAgent`     |

- Added support for ingesting the following **new** relationships:

  | Source            | \_class | Target                          |
  | ----------------- | ------- | ------------------------------- |
  | `tenable_account` | **HAS** | `tenable_asset`                 |
  | `tenable_asset`   | **HAS** | `tenable_vulnerability_finding` |

- Added support for ingesting the following **new** mapped relationships:

  | Source                          | \_class | Target                          |
  | ------------------------------- | ------- | ------------------------------- |
  | `tenable_asset`                 | **IS**  | `<host>`                        |
  | `<host>`                        | **HAS** | `tenable_vulnerability_finding` |
  | `tenable_vulnerability_finding` | **IS**  | `<cve>`                         |

### Changed

- Upgraded `@jupiterone/integration-sdk-*@6.18.0`

### Remvoved

- Removed support for ingesting the following entities:

  | Resources     | Entity `_type`          | Entity `_class`         |
  | ------------- | ----------------------- | ----------------------- |
  | Scan          | `tenable_scan`          | `Assessment`, `Service` |
  | Vulnerability | `tenable_vulnerability` | `Vulnerability`         |

- Removed support for ingesting the following relationships:

  | Source                          | \_class        | Target                          |
  | ------------------------------- | -------------- | ------------------------------- |
  | `tenable_scan`                  | **IDENTIFIED** | `tenable_vulnerability_finding` |
  | `tenable_scan`                  | **IDENTIFIED** | `tenable_vulnerability`         |
  | `tenable_scan`                  | **SCANS**      | `<host>`                        |
  | `tenable_user`                  | **OWNS**       | `tenable_scan`                  |
  | `tenable_vulnerability_finding` | **IS**         | `vulnerability`                 |

- Removed support for ingesting the following mapped relationships:

  | Source         | \_class   | Target   |
  | -------------- | --------- | -------- |
  | `tenable_scan` | **SCANS** | `<host>` |

## 7.2.0 - 2021-07-20

### Added

- Added support for ingesting the following **new** mapped relationships:

  | Source         | \_class   | Target   |
  | -------------- | --------- | -------- |
  | `tenable_scan` | **SCANS** | `<host>` |

- Added `TenableClient.iterateAssets()` method. Made other asset export
  endpoints private.

## 7.1.4 - 2021-07-13

### Fixed

- Publish contents of `src`

## 7.1.3 - 2021-07-13

### Fixed

- Removed `prepack` script
- Run `yarn build` in github workflow
- Fixed structure of `/dist` for published package

## 7.1.0 - 2021-07-13

### Added

- Added `displayName` property to entities
- Imported client from `@jupiterone/tenable-client-nodejs`.
- Added `User-Agent` header to Tenable API calls.

## 7.0.0 - 2021-06-25

### Changed

- Adopted open-source `@jupiterone/integration-sdk-*` framework for execution
  environment.

## 6.0.2 - 2021-05-27

- Increase timeout for asset/vuln export
- Wait between status calls to asset/vuln export

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

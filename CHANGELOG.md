# v9.4.3 (Fri Sep 29 2023)

#### 🐛 Bug Fix

- Log duplicated key report [#239](https://github.com/JupiterOne/graph-tenable-io/pull/239) (gonzaloavalosribas@Gonzalos-MacBook-Pro.local)

#### Authors: 1

- Gonzalo Avalos Ribas ([@Gonzalo-Avalos-Ribas](https://github.com/Gonzalo-Avalos-Ribas))

---

# v9.4.2 (Wed Sep 27 2023)

#### 🐛 Bug Fix

- Add port number to the vulnerability key [#238](https://github.com/JupiterOne/graph-tenable-io/pull/238) (gonzaloavalosribas@Gonzalos-MacBook-Pro.local)

#### Authors: 1

- Gonzalo Avalos Ribas ([@Gonzalo-Avalos-Ribas](https://github.com/Gonzalo-Avalos-Ribas))

---

# v9.4.1 (Wed Sep 27 2023)

#### 🐛 Bug Fix

- Add postversion script [#237](https://github.com/JupiterOne/graph-tenable-io/pull/237) (gonzaloavalosribas@Gonzalos-MacBook-Pro.local)

#### Authors: 1

- Gonzalo Avalos Ribas ([@Gonzalo-Avalos-Ribas](https://github.com/Gonzalo-Avalos-Ribas))

---

# v9.4.0 (Mon Sep 25 2023)

#### 🚀 Enhancement

- Upgrade SDK - Upgrade to NODE 18 [#236](https://github.com/JupiterOne/graph-tenable-io/pull/236) (gonzaloavalosribas@Gonzalos-MacBook-Pro.local)

#### 🐛 Bug Fix

- Update integration-deployment.yml [#235](https://github.com/JupiterOne/graph-tenable-io/pull/235) ([@Nick-NCSU](https://github.com/Nick-NCSU))

#### Authors: 2

- Gonzalo Avalos Ribas ([@Gonzalo-Avalos-Ribas](https://github.com/Gonzalo-Avalos-Ribas))
- Nick Thompson ([@Nick-NCSU](https://github.com/Nick-NCSU))

---

# v9.3.9 (Thu Apr 27 2023)

#### 🐛 Bug Fix

- INT-7813 Integration deployments workflow
  [#233](https://github.com/JupiterOne/graph-tenable-io/pull/233)
  ([@jroblesx](https://github.com/jroblesx))

#### Authors: 1

- Jean R. Robles G. ([@jroblesx](https://github.com/jroblesx))

---

# v8.5.2 (Thu Apr 27 2023)

#### 🐛 Bug Fix

- INT-7813 Fix Adding auto versioning
  [#232](https://github.com/JupiterOne/graph-tenable-io/pull/232)
  ([@jroblesx](https://github.com/jroblesx))
- INT-7813 Adding auto versioning
  [#231](https://github.com/JupiterOne/graph-tenable-io/pull/231)
  ([@jroblesx](https://github.com/jroblesx))

#### Authors: 1

- Jean R. Robles G. ([@jroblesx](https://github.com/jroblesx))

---

## 9.3.6 - 2023-04-27

### Added

- Added `auto` package to help with builds, versioning and npm packaging.

## 9.3.5 - 2023-04-18

### Fixed

- New target added to create a relationship between
  `tenable_vulnerability_finding` and `vsphere_host`.

## 9.3.4 - 2023-02-22

### Fixed

- Duplicate keys errors.
- Disable steps that need permissions.
- Undeclared types error for mapped relationships.
- Request retry logic.

## 9.3.3 - 2023-02-21

### Changed

- Updated error handling and retry logic.

## 9.3.2 - 2023-02-20

### Added

- Add additional logging to `handleError`

## 9.3.1 - 2023-02-15

- rerelease of 9.3.0

## 9.3.0 - 2023-02-15

### Added

- Ingest `tenable_agent` entity and add relationship to `tenable_account`.

### Fixed

- Skip duplicate relationships.

## 9.2.0 - 2023-02-14

### Fixed

- Fixed `undeclared types encountered during execution`. Specific mapped
  relationships types for `azure_vm`, `google_compute_instance` and
  `aws_instance` have been made.

- The updated types are no longer being index metadata.

## 9.1.0 - 2023-02-06

### Added

- Added vulnerability filtering (by severity and state) using instance
  configuration

## 9.0.4 - 2023-02-06

### Changed

- no longer indexing metadata for relationships.

## 9.0.3 - 2023-02-03

### Removed

- removed the `output` property from the `rawData` of
  `tenable_vulnerability_finding`

## 9.0.2 - 2023-01-26

### Added

Added the following properties to `tenable_vulnerability_finding`: -
cvss3BaseScore - cvss3TemporalScore - cvssBaseScore - cvssTemporalScore -
cvss3Vector - cvssVector - hasPatch

## 9.0.1 - 2023-01-12

### Fixed

- `tenable_vulnerability_finding` now properly reflects the correct `severity`.

## 9.0.0 - 2022-11-01

- add `last_fixed` property to `tenable_vulnerability_finding` entities.
- add the following properties to the `tenable_vulnerability_finding`: `cve`,
  `cpe`, `description`, `recommendation`, `impact`.
- refactor Container Security to v2 as v1 has been deprecated.
- the following **new** entities have been added:

| Resources            | Entity `_type`                 | Entity `_class` |
| -------------------- | ------------------------------ | --------------- |
| Container Image      | `tenable_container_image`      | `Image`         |
| Container Repository | `tenable_container_repository` | `Repository`    |
| Service              | `tenable_scanner`              | `Service`       |

### Relationships

- the following **new** relationships have been added:

| Source Entity `_type`          | Relationship `_class` | Target Entity `_type`                |
| ------------------------------ | --------------------- | ------------------------------------ |
| `tenable_account`              | **PROVIDES**          | `tenable_scanner`                    |
| `tenable_account`              | **HAS**               | `tenable_container_image`            |
| `tenable_account`              | **HAS**               | `tenable_container_repository`       |
| `tenable_scanner`              | **SCANS**             | `tenable_container_image`            |
| `tenable_container_image`      | **HAS**               | `tenable_container_report`           |
| `tenable_container_image`      | **HAS**               | `tenable_container_finding`          |
| `tenable_container_image`      | **HAS**               | `tenable_container_malware`          |
| `tenable_container_image`      | **HAS**               | `tenable_container_unwanted_program` |
| `tenable_container_repository` | **HAS**               | `tenable_container_image`            |

## [8.5.1] 2022-08-05

- fix tenable_asset `firstSeen` and `lastSeen` properties to be human-readable

## [8.5.0] 2022-06-08

- move @jupiterone/tenable-client-nodejs to this repo
- add assetMacAddress and agentId to vulnerability entity

## [8.4.0] 2022-06-03

- add the following properties
  - on asset entity
    - tags
  - on vulnerability entity
    - assetHostname
    - assetIpv4
    - assetDeviceType
    - stigSeverity
    - vprScore
    - riskFactor
- add tests using vulnerability data form tenable vulnerability export api

## [8.3.9] 2022-05-24

- bump sdk to pull in more rawData trimming improvements

## [8.3.8] - 2022-05-17

- bump sdk to pull in new rawData trimming logic
- add rawData back to vulns and assets

## [8.3.7] - 2022-05-10

- remove `output` from the properties of `tenable_vulnerability_finding`
  entities

## [8.3.6] - 2022-05-06

- log large entities size characteristics to identify possible poison pill(s)
  from tenable api

## [8.3.5] - 2022-05-05

### Added

- `codeql-analysis` workflow
- `questions` workflow
- `jupiterone/questions/questions.yaml`

## [8.3.4] - 2022-05-04

- Limit raw data for vuln and assets

## [8.3.3] - 2022-05-03

- Updated `@jupiterone/integration-sdk-*` to `v8.13.1`
- fix breakage in test due to jest timers

## [8.3.2] - 2022-04-11

### Fixed

- Fixed a bug where datetime properties for `tenable_asset`s were strings
  instead of a parsed number.

## [8.3.1] - 2022-04-07

### Changed

- Updated `@jupiterone/integration-sdk-*` to `v8.9.0`
- Updated vulnerable packages
- ran prettier on project
- enforce prettier style in ci

## [8.3.0] - 2021-03-01

### Added

- Introduce exploit-related properties to the `Vulnerability` entity.

## [8.2.0] - 2021-12-08

### Changed

- Introduce the following integration config properties for configuring API
  timeouts
  - `assetApiTimeoutInMinutes`
  - `vulnerabilityApiTimeoutInMinutes`

## [8.1.1] - 2021-11-18

### Changed

- Import `@jupiterone/integration-sdk-core` from `peerDependencies`
- Updated `@jupiterone/integration-sdk-*` to `v7.0.0`

## [8.1.0] - 2021-10-28

### Changed

- Changed the project / package name from `@jupiterone/graph-tenable-cloud` to
  `@jupiterone/graph-tenable-io`. As a result, all versions from `v8.1.0` and
  _below_ can be imported using `@jupiterone/graph-tenable-cloud`, and all
  versions _above_ `v8.1.0` should be imported using
  `@jupiterone/graph-tenable-io`

## [8.1.0] - 2021-10-28

### Changed

- Set `skipTargetCreation: true` on mapped relationships to tenable hosts

## [8.0.4] - 2021-09-28

### Fixed

- Added `name` property to `tenable_vulnerability_finding` entities

## [8.0.3] - 2021-09-28

### Fixed

- Enabled `buildAssetVulnerabilityRelationships` step, which was accidentally
  disabled

## [8.0.2] - 2021-09-28

### Fixed

- Prevent duplicate keys for `tenable_vulnerability_finding_is_cve` mapped
  relationships

## [8.0.1] - 2021-09-16

### Fixed

- Prevent duplicate keys for `tenable_asset` entities
- Prevent duplicate keys for `tenable_vulnerability_finding` entities
- Prevent `Cannot read property 'map' of undefined` when iterating CVEs for
  `tenable_vulnerability_finding`

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

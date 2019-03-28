# Tenable Cloud

## Overview

JupiterOne provides a managed integration with [Tenable.io][1], the Cloud
Managed Tenable Platform. The integration connects directly to [Tenable Cloud
APIs][2] to obtain account metadata, vulnerability information, and application
scan results for ingestion into JupiterOne. Customers authorize access by
providing API keys to JupiterOne.

## Integration Instance Configuration

The integration is triggered by an event containing the information for a
specific integration instance.

## Entities

The following entity resources are ingested when the integration runs:

| Tenable Entity Resource | \_type : \_class of the Entity     |
| ----------------------- | ---------------------------------- |
| Account                 | `tenable_account` : `Account`      |
| Group                   | `tenable_user_group` : `UserGroup` |
| User                    | `tenable_user` : `User`            |

## Relationships

The following relationships are created/mapped:

| From                 | Type    | To                   |
| -------------------- | ------- | -------------------- |
| `tenable_account`    | **HAS** | `tenable_user_group` |
| `tenable_user_group` | **HAS** | `tenable_user`       |

[1]: https://www.tenable.com/products/tenable-io
[2]: https://cloud.tenable.com/api#/overview

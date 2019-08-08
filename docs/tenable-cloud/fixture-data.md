# Tenable Cloud Fixture Data

Nock was used to record API responses from Tenable.io. To update the recordings,
it is helpful to setup a Tenable demo account that includes elements the
integration is coded to ingest.

1. The Organization Admin user with role `Administrator`, created automatically
   when the Tenable.io organization/account is created
1. A container scan
   [with no vulnerabilities](https://snyk.io/blog/top-ten-most-popular-docker-images-each-contain-at-least-30-vulnerabilities/)
   1. [`docker login ...`](https://docs.tenable.com/cloud/containersecurity/Content/ContainerSecurity/LogIn.htm)
   1. `docker pull node:10.16.1-alpine` (may need to get more recent if this has
      vulns)
   1. `docker tag node:10.16.1-alpine registry.cloud.tenable.com/node/node:clean`
   1. `docker push registry.cloud.tenable.com/node/node:clean`
1. A container scan with vulnerabilities
1. A web app scan
1. A basic network port scan
1. A basic network port scan that is set to `No Access` for the default group
   (will not be visible to API user)
1. A basic network port scan that is never executed
1. An additional user with role `Basic` to serve as the API key account,
   limiting to read-only access of shared scans and all _Container Security_
   resources; the `Administrator` role allows access to all scans, but this is
   asking too much

The recorded data is used in the `TenableClient` tests, which ensure that
interesting bits of the response data are as expected, and ensure 100% of the
`TenableClient` code is executed. This allows the developer to see real
responses, pull in bits of data into the converter tests, and have some
confidence that response data is handled by the client.

To update the recorded API data, after creating a Tenable demo account and
adding the elements above:

1. Using the API keys of the `Basic` user, ensure you have `.env` defined with
   `TENABLE_LOCAL_EXECUTION_ACCESS_KEY=xxx` and
   `TENABLE_LOCAL_EXECUTION_SECRET_KEY=xxx`
1. Delete existing recorded data with `rm test/fixtures/*.json`
1. Run the `TenableClient` tests with
   `yarn jest --no-coverage src/tenable/TenableClient.test.ts`
1. IMPORTANT: remove any Personally Identifying Information from the recordings

You'll see that one or more requests fail because they depend on specific data
from the previously used demo account.

1. Update parameters in `TenableClient.test.ts` requests as necessary, using
   information from the completed recordings
1. Run the `TenableClient` tests again to get recordings of specific scans,
   container reports, etc.

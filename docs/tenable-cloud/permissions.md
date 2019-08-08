# Tenable Cloud Permissions

Tenable Cloud scans are created in the **Vulnerability Management** section,
which also ends up managing scans where the results are found in **Web App
Scanning**. These scans have fine grained control over their management and
visibility, and the **User Role** will impact visibility of scans.

**Basic** **Scan Operator** **Standard** **Scan Manager**

- Summaries of _shared_ scans are visible in the scans listing API
- Details of shared scans created by active Tenable.io features are visible in
  the scan details API (`403 Forbidden` is answered when requesting details on
  no-longer supported scans)

**Administrator**

- Summaries of _all_ scans are visible in the scans listing API
- Details of shared scans created by active Tenable.io features are visible in
  the scan details API (`403 Forbidden` is answered when requesting details on
  no-longer supported scans)

All _Container Security_ resources seem to be visible to every role. Test this
statement in the face of conflicting evidence.

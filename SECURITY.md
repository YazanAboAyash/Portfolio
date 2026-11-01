# Security Policy

## Overview

This policy covers reporting security vulnerabilities in the ColdByDefault portfolio repository and the website at coldbydefault.com. Yazan Abo-Ayash (@yazanaboayash) is the sole maintainer and handles security reports.

## Supported Versions

Security fixes are applied to the latest code on `main` and deployed to the website. Earlier releases do not receive separate security updates.

| Version          | Supported |
| ---------------- | --------- |
| Latest (`main`)  | Yes       |
| Earlier releases | No        |

## Reporting a Vulnerability

Report suspected vulnerabilities privately by email to [contact@yazan-abo-ayash.de](mailto:contact@yazan-abo-ayash.de). Do not include vulnerability details in public issues, pull requests, discussions, or the visitor feedback wall.

Include, where available:

- The affected URL, endpoint, or source file, and the commit or release tested.
- A description of the issue and its potential impact.
- Minimal reproduction steps or a proof of concept using a local environment and test data.
- Redacted screenshots or logs that help explain the issue.

Do not send credentials, tokens, personal data, or other secrets. Do not attempt exploitation against production infrastructure; use a local environment or request permission before testing the live website.

The maintainer will review reports and coordinate any clarification, remediation, and disclosure by email. Response and resolution times depend on availability and the issue's severity; no fixed timeline is guaranteed. Please coordinate public disclosure with the maintainer so a fix can be made available first.

## Security Audit History

| Date       | Type           | Status | Notes                         |
| ---------- | -------------- | ------ | ----------------------------- |
| 2026-02-16 | Internal Audit | ✅     | Security improvements applied |
| 2026-10-23 | Internal Audit | ✅     | Security improvements applied |

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [Prisma Security](https://www.prisma.io/docs/guides/database/advanced-database-tasks/sql-injection)

---

**Copyright © 2026 ColdByDefault. All Rights Reserved.**

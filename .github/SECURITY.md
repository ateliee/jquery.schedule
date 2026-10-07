# Security Policy

## Supported Versions

We actively support security updates for the following versions:

| Version                | Supported |
| ---------------------- | --------- |
| Latest release         | ✅         |
| Previous major release | ⚠️        |
| Older versions         | ❌         |

Security fixes are generally provided for the latest supported version.
If you are using an older version, please upgrade to a supported version whenever possible.

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not create a public GitHub issue or disclose the vulnerability publicly**.

Instead, report the vulnerability privately through one of the following methods:

* GitHub Security Advisories: **[Security Advisories](../../security/advisories/new)**
* If GitHub Security Advisories are not available, contact the project maintainers privately.

Please include as much of the following information as possible:

* A description of the vulnerability
* The affected version(s)
* Steps to reproduce the issue
* Proof-of-concept code or screenshots, if available
* The potential impact of the vulnerability
* Any suggested mitigation or remediation

Providing detailed reproduction steps will help us investigate and resolve the issue more quickly.

## What to Expect

After receiving a vulnerability report, we will:

1. Acknowledge receipt of the report as soon as reasonably possible.
2. Investigate and assess the reported vulnerability.
3. Determine the affected versions and severity.
4. Develop and test an appropriate fix.
5. Release a security update when applicable.
6. Coordinate public disclosure with the reporter when appropriate.

We ask that reporters allow us reasonable time to investigate and address the vulnerability before publicly disclosing it.

## Security Updates

Security fixes may be released as:

* A patch release
* A security advisory
* A temporary mitigation or workaround
* An update to the documentation

Users are encouraged to keep their dependencies and the project itself up to date.

## Scope

Examples of vulnerabilities that should be reported privately include:

* Authentication or authorization bypasses
* Remote code execution
* SQL injection
* Cross-site scripting (XSS)
* Cross-site request forgery (CSRF)
* Server-side request forgery (SSRF)
* Sensitive information disclosure
* Insecure direct object references (IDOR)
* Privilege escalation
* Cryptographic weaknesses
* Dependency vulnerabilities that directly affect this project
* Other issues that could compromise the confidentiality, integrity, or availability of the system

## Out of Scope

The following issues are generally outside the scope of this security policy:

* Vulnerabilities in third-party services that are not controlled by this project
* Issues that require physical access to a user's device or server
* Social engineering attacks against project maintainers or users
* Denial-of-service testing against production systems without prior authorization
* Automated vulnerability scans that generate excessive traffic
* Issues that do not have a meaningful security impact

If you are unsure whether an issue is in scope, please report it privately rather than disclosing it publicly.

## Responsible Disclosure

We ask security researchers to:

* Avoid accessing, modifying, or deleting data that does not belong to them.
* Avoid disrupting the availability of the service.
* Avoid accessing personal or confidential information beyond what is necessary to demonstrate the vulnerability.
* Stop testing and contact the maintainers if sensitive data is encountered.
* Give the maintainers reasonable time to investigate and remediate the issue before public disclosure.

We appreciate responsible security research and will make reasonable efforts to work with security researchers to understand and resolve reported vulnerabilities.

## Recognition

We appreciate the contributions of security researchers and users who responsibly report security vulnerabilities.

Where appropriate, we may acknowledge reporters in the relevant security advisory or release notes, with their permission.

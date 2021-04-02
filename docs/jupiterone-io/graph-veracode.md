# Veracode

## Overview

JupiterOne provides a managed integration with Veracode. The integration
connects directly to Veracode APIs to obtain Vulnerability and Finding metadata
and analyze resource relationships. Customers authorize access by creating an
API ID and secret in the their target Veracode account and providing those
credentials to JupiterOne.

## Veracode + JupiterOne Integration Benefits

- Visualize Veracode scans, cwes, vulnerabilities, and findings in the JupiterOne graph.
- Map Veracode findings to a code repo, project, or application in your JupiterOne account.
- Monitor Veracode cwes, findings, and vulnerabilities within the alerts app.
- Monitor changes to Veracode scans using JupiterOne alerts.

## How it Works

- JupiterOne periodically fetches Veracode scans, cwes, vulerabilities, and findings to update the graph.
- Write JupiterOne queries to review and monitor updates to the graph.
- Configure alerts to reduce the noise of findings.
- Configure alerts to take action when the JupiterOne graph changes.

## Requirements

- JupiterOne requires an API id and API secret used to authenticate with Veracode.
- You must have permission in JupiterOne to install new integrations.

## Integration Instance Configuration

The integration is triggered by an event containing the information for a
specific integration instance.

The integration instance configuration requires the customer's API ID and secret
to authenticate requests to the Veracode REST APIs. Veracode provides [detailed
instructions for obtaining these credentials][1].

## Entities

The following entity resources are ingested when the integration runs:

| Veracode Entity Resource | \_type : \_class of the Entity             |
| ------------------------ | ------------------------------------------ |
| Account                  | `veracode_account` : `Account`             |
| Scan Type                | `veracode_scan` : `Service`                |
| CWE                      | `cwe` : `Weakness`                         |
| Vulnerability            | `veracode_vulnerability` : `Vulnerability` |
| Finding                  | `veracode_finding` : `Finding`             |

## Relationships

The following relationships are created/mapped:

### Intra-Instance

| From                     | Type           | To                       |
| ------------------------ | -------------- | ------------------------ |
| `veracode_account`       | **HAS**        | `veracode_scan`          |
| `veracode_scan`          | **IDENTIFIED** | `veracode_vulnerability` |
| `veracode_vulnerability` | **EXPLOITS**   | `cwe`                    |
| `veracode_finding`       | **IS**         | `veracode_vulnerability` |

### Extra-Instance / Mapped

| From                           | Type        | To                                                                                                                                                                                                 |
| ------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CodeRepo/Project/Application` | **HAS/HAD** | `veracode_finding` <br> Note: This is mapped automatically only when the name of the Veracode Application the finding belongs to matches the name of a CodeRepo/Project/Application in JupiterOne. |

[1]:
  https://help.veracode.com/reader/lsoDk5r2cv~YrwLQSI7lfw/6UdIc6di0T5_Lo6qTHTpNA

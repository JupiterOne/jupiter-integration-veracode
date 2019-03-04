import { IntegrationInstance } from "@jupiterone/jupiter-managed-integration-sdk";
import {
  AccountEntity,
  AccountServiceRelationship,
  CWEEntityMap,
  FindingEntity,
  ServiceEntity,
  ServiceVulnerabilityRelationship,
} from "./types";

interface CWEReference {
  name: string;
  url: string;
}

interface CWEData {
  id: string;
  name: string;
  description: string;
  references: CWEReference[];
  recommendation: string;
  remediation_effort: number;
  severity: number;
}

interface FindingStatus {
  status: string;
  reopened: boolean;
  resolution: string;
  resolution_status: string;
  found_date: string;
  resolved_date?: string;
  reopened_date?: string;
  modified_date: string;
}

export interface FindingData {
  cvss?: number;
  cwe: CWEData;
  description?: string;
  exploitability: number;
  finding_status: FindingStatus;
  guid: string;
  severity: number;
  scan_type: string;
}

interface ApplicationProfile {
  name: string;
}

export interface ApplicationData {
  guid: string;
  profile: ApplicationProfile;
}

interface FromFindings {
  cweMap: CWEEntityMap;
  findingEntities: FindingEntity[];
}

export function fromFindings(
  findings: FindingData[],
  application: ApplicationData,
): FromFindings {
  const cweMap: CWEEntityMap = {};
  const findingEntities: FindingEntity[] = [];

  for (const finding of findings) {
    cweMap[finding.cwe.id] = {
      _class: "Weakness",
      _key: finding.cwe.id.toString(),
      _type: "cwe",
      description: finding.cwe.description,
      displayName: finding.cwe.name,
      id: finding.cwe.id,
      name: finding.cwe.name,
      recommendation: finding.cwe.recommendation,
      references: finding.cwe.references.map(r => r.url),
      remediationEffort: finding.cwe.remediation_effort,
      severity: finding.cwe.severity,
    };

    findingEntities.push({
      _class: "Vulnerability",
      _key: finding.guid,
      _type: "veracode_finding",
      category: "application",
      cvss: finding.cvss,
      cwe: finding.cwe.id,
      description: finding.description,
      displayName: finding.cwe.name, // We're using the name of the weakness because Veracode provides no other name.
      exploitability: finding.exploitability,
      impacts: [application.profile.name],
      name: finding.cwe.name,
      public: false,
      scanType: finding.scan_type,
      severity: finding.severity,

      open: finding.finding_status.status === "OPEN",
      reopened: finding.finding_status.reopened,
      resolution: finding.finding_status.resolution,
      resolutionStatus: finding.finding_status.resolution_status,

      foundDate: finding.finding_status.found_date,
      modifiedDate: finding.finding_status.modified_date,
      reopenedDate: finding.finding_status.reopened_date,
      resolvedDate: finding.finding_status.resolved_date,
    });
  }

  return { cweMap, findingEntities };
}

export function toAccountEntity(instance: IntegrationInstance): AccountEntity {
  return {
    _class: "Account",
    _key: instance.id,
    _type: "veracode_account",
    displayName: instance.name,
    name: instance.name,
  };
}

export function toServiceEntity(scanType: string): ServiceEntity {
  return {
    _class: "Service",
    _key: `veracode_scan_${scanType}`,
    _type: "veracode_scan",
    category: "software",
    displayName: scanType,
    name: scanType,
  };
}

export function toAccountServiceRelationship(
  accountEntity: AccountEntity,
  serviceEntity: ServiceEntity,
): AccountServiceRelationship {
  return {
    _class: "HAS",
    _key: `${accountEntity._key}|has|${serviceEntity._key}`,
    _type: "veracode_account_has_service",

    _fromEntityKey: accountEntity._key,
    _toEntityKey: serviceEntity._key,
  };
}

export function toServiceVulnerabilityRelationship(
  serviceEntity: ServiceEntity,
  findingEntity: FindingEntity,
): ServiceVulnerabilityRelationship {
  return {
    _class: "IDENTIFIED",
    _key: `${serviceEntity._key}|identified|${findingEntity._key}`,
    _type: "veracode_scan_identified_finding",

    _fromEntityKey: serviceEntity._key,
    _toEntityKey: findingEntity._key,
  };
}

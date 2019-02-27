import { IntegrationInstance } from "@jupiterone/jupiter-managed-integration-sdk";
import {
  AccountEntity,
  AccountServiceRelationship,
  ApplicationEntity,
  FindingEntity,
  ServiceEntity,
  ServiceVulnerabilityRelationship,
} from "./types";

interface CWEReference {
  name: string;
  url: string;
}

interface CWE {
  name: string;
  description: string;
  references: CWEReference[];
  recommendation: string;
}

export interface FindingData {
  guid: string;
  severity: number;
  exploitability: number;
  cwe: CWE;
  cvss?: number;
  scan_type: string;
}

export function toFindingEntities(
  findings: FindingData[],
  application: string,
): FindingEntity[] {
  const entities = new Array<FindingEntity>();
  for (const finding of findings) {
    entities.push({
      _class: "Vulnerability",
      _key: finding.guid,
      _type: "veracode_finding",
      category: "application",
      cvss: finding.cvss,
      description: finding.cwe.description,
      displayName: finding.cwe.name,
      exploitability: finding.exploitability,
      impacts: [application],
      name: finding.cwe.name,
      public: false,
      recommendation: finding.cwe.recommendation,
      references: finding.cwe.references.map(r => r.url),
      scanType: finding.scan_type,
      severity: finding.severity,
    });
  }
  return entities;
}

interface ApplicationProfile {
  name: string;
}

export interface ApplicationData {
  guid: string;
  profile: ApplicationProfile;
}

export function toApplicationEntities(
  applications: ApplicationData[],
): ApplicationEntity[] {
  const entities = new Array<ApplicationEntity>();
  for (const application of applications) {
    entities.push({
      guid: application.guid,
      name: application.profile.name,
    });
  }
  return entities;
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
    _class: "PROVIDES",
    _key: `${accountEntity._key}|provides|${serviceEntity._key}`,
    _type: "veracode_account_provides_service",

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

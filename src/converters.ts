import {
  IntegrationInstance,
  RelationshipDirection,
} from "@jupiterone/jupiter-managed-integration-sdk";
import {
  AccountEntity,
  AccountServiceRelationship,
  CWEEntity,
  CWEEntityMap,
  FindingEntity,
  FindingEntityMap,
  ServiceEntity,
  ServiceEntityMap,
  ServiceVulnerabilityRelationship,
  VulnerabilityCWERelationship,
  VulnerabilityEntity,
  VulnerabilityEntityMap,
  VulnerabilityFindingRelationship,
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

interface FindingSource {
  module: string;
  file_name: string;
  file_line_number: string;
  file_path: string;
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
  finding_source: FindingSource;
}

interface FindingCategory {
  id: string;
  name: string;
  description: string;
}

export interface FindingData {
  cvss?: number;
  cwe: CWEData;
  description?: string;
  exploitability: number;
  finding_status: { [applicationId: string]: FindingStatus };
  finding_category: FindingCategory;
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
  vulnerabilities: VulnerabilityEntity[];

  cweMap: CWEEntityMap;
  findingMap: FindingEntityMap;
  serviceMap: ServiceEntityMap;
}

export function fromFindings(
  findings: FindingData[],
  application: ApplicationData,
): FromFindings {
  const cweMap: CWEEntityMap = {};
  const vulnerabilityMap: VulnerabilityEntityMap = {};
  const serviceMap: ServiceEntityMap = {};
  const findingMap: FindingEntityMap = {};

  for (const finding of findings) {
    vulnerabilityMap[finding.finding_category.id] = toVulnerabilityEntity(
      finding,
    );

    cweMap[finding.cwe.id] = toCWEEntity(finding);
    serviceMap[finding.scan_type] = toServiceEntity(finding);

    findingMap[finding.finding_category.id] =
      findingMap[finding.finding_category.id] || [];
    findingMap[finding.finding_category.id].push(
      toFindingEntity(finding, application),
    );
  }

  return {
    vulnerabilities: Object.values(vulnerabilityMap),

    cweMap,
    findingMap,
    serviceMap,
  };
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

function toServiceEntity(finding: FindingData): ServiceEntity {
  return {
    _class: "Service",
    _key: `veracode_scan_${finding.scan_type}`,
    _type: "veracode_scan",
    category: "software",
    displayName: finding.scan_type,
    name: finding.scan_type,
  };
}

function toCWEEntity(finding: FindingData): CWEEntity {
  return {
    _class: "Weakness",
    _key: finding.cwe.id,
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
}

function toVulnerabilityEntity(finding: FindingData): VulnerabilityEntity {
  return {
    _class: "Vulnerability",
    _key: finding.finding_category.id,
    _type: "veracode_vulnerability",
    category: "application",
    cvss: finding.cvss,
    cwe: finding.cwe.id,
    description: finding.description,
    displayName: finding.finding_category.name,
    exploitability: finding.exploitability,
    id: finding.finding_category.id,
    name: finding.finding_category.name,
    public: false,
    scanType: finding.scan_type,
    severity: finding.severity,
  };
}

function toFindingEntity(
  finding: FindingData,
  application: ApplicationData,
): FindingEntity {
  const findingStatus = finding.finding_status[application.guid];

  return {
    _class: "Vulnerability",
    _key: finding.guid,
    _type: "veracode_finding",

    impacts: application.profile.name,

    open: findingStatus.status === "OPEN",
    reopened: findingStatus.reopened,
    resolution: findingStatus.resolution,
    resolutionStatus: findingStatus.resolution_status,

    foundDate: findingStatus.found_date,
    modifiedDate: findingStatus.modified_date,
    reopenedDate: findingStatus.reopened_date,
    resolvedDate: findingStatus.resolved_date,

    sourceFileLineNumber: findingStatus.finding_source.file_line_number,
    sourceFileName: findingStatus.finding_source.file_name,
    sourceFilePath: findingStatus.finding_source.file_path,
    sourceModule: findingStatus.finding_source.module,
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
  vulnerabilityEntity: VulnerabilityEntity,
): ServiceVulnerabilityRelationship {
  return {
    _class: "IDENTIFIED",
    _key: `${serviceEntity._key}|identified|${vulnerabilityEntity._key}`,
    _type: "veracode_scan_identified_finding",

    _fromEntityKey: serviceEntity._key,
    _toEntityKey: vulnerabilityEntity._key,
  };
}

export function toVulnerabilityCWERelationship(
  vulnerabilityEntity: VulnerabilityEntity,
  cweEntity: CWEEntity,
): VulnerabilityCWERelationship {
  return {
    _class: "EXPLOITS",
    _key: `${vulnerabilityEntity._key}|exploits|${cweEntity._key}`,
    _type: `veracode_finding_exploits_cwe`,

    _fromEntityKey: vulnerabilityEntity._key,
    _toEntityKey: cweEntity._key as string,

    _mapping: {
      relationshipDirection: RelationshipDirection.FORWARD,
      sourceEntityKey: vulnerabilityEntity._key,
      targetEntity: cweEntity,
      targetFilterKeys: [["id", "_type"]],
    },

    displayName: "EXPLOITS",
  };
}

export function toVulnerabilityFindingRelationship(
  vulnerabilityEntity: VulnerabilityEntity,
  findingEntity: FindingEntity,
): VulnerabilityFindingRelationship {
  return {
    _class: "IS",
    _key: `${findingEntity._key}|is|${vulnerabilityEntity._key}`,
    _type: "veracode_finding_is_veracode_vulnerability",

    _fromEntityKey: findingEntity._key,
    _toEntityKey: vulnerabilityEntity._key,
  };
}

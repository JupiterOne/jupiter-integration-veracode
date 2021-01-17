import {
  EntityFromIntegration,
  RelationshipFromIntegration,
  RelationshipMapping,
} from "@jupiterone/jupiter-managed-integration-sdk";

export interface VeracodeIntegrationInstanceConfig {
  veracodeApiId: string;
  veracodeApiSecret: string;
}

export interface AccountEntity extends EntityFromIntegration {
  name: string;
}

export interface ServiceEntityMap {
  [scanType: string]: ServiceEntity;
}

export interface ServiceEntity extends EntityFromIntegration {
  category: string;
  name: string;
}

export interface VulnerabilityEntityMap {
  [id: string]: VulnerabilityEntity;
}

export interface VulnerabilityEntity extends EntityFromIntegration {
  id: string;
  cwe: string;

  createdOn: number;

  name: string;
  description?: string;
  category: string;
  scanType: string;

  cvss?: number;
  numericExploitability: number;
  exploitability: string;
  numericSeverity: number;
  severity: string;

  public: boolean;
}

export interface FindingEntityMap {
  [vulnerabilityId: string]: FindingEntity[];
}

export interface FindingEntity extends EntityFromIntegration {
  name: string;

  targets: string;

  open: boolean;
  reopened: boolean;
  resolution: string;
  resolutionStatus: string;
  numericSeverity: number;
  severity: string;
  numericExploitability: number;
  exploitability: string;
  scanType: string;

  createdOn: number;
  foundDate: number;
  modifiedDate: number;
  reopenedDate?: number;
  resolvedDate?: number;

  sourceModule: string;
  sourceFileName: string;
  sourceFileLineNumber: string;
  sourceFilePath: string;
}

export interface CWEEntityMap {
  [id: string]: CWEEntity;
}

export interface CWEEntity extends EntityFromIntegration {
  id: string;
  description: string;
  name: string;
  recommendation: string;
  references: string[];
  remediationEffort: number;
  severity: number;
}

export type AccountServiceRelationship = RelationshipFromIntegration;

export type ServiceVulnerabilityRelationship = RelationshipFromIntegration;

export type ServiceFindingRelationship = RelationshipFromIntegration;

export type VulnerabilityFindingRelationship = RelationshipFromIntegration;

export interface VulnerabilityCWERelationship
  extends RelationshipFromIntegration {
  _mapping: RelationshipMapping;
}

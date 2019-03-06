import {
  EntityFromIntegration,
  RelationshipFromIntegration,
  RelationshipMapping,
  TargetEntityProperties,
} from "@jupiterone/jupiter-managed-integration-sdk";

export interface VeracodeIntegrationInstanceConfig {
  veracodeApiId: string;
  veracodeApiSecret: string;
}

export interface AccountEntity extends EntityFromIntegration {
  name: string;
}

export interface ServiceEntity extends EntityFromIntegration {
  category: string;
  name: string;
}

export interface FindingEntity extends EntityFromIntegration {
  category: string;
  cvss?: number;
  cwe: string;
  description?: string;
  exploitability: number;
  impacts: string[];
  name: string;
  public: boolean;
  severity: number;
  scanType: string;

  open: boolean;
  reopened: boolean;
  resolution: string;
  resolutionStatus: string;

  foundDate: string;
  modifiedDate: string;
  reopenedDate?: string;
  resolvedDate?: string;
}

export interface CWEEntityMap {
  [id: string]: CWEEntity;
}

export interface CWEEntity extends TargetEntityProperties {
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

export interface FindingCWERelationship extends RelationshipFromIntegration {
  _mapping: RelationshipMapping;
}

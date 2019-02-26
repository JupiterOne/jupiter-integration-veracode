import {
  EntityFromIntegration,
  RelationshipFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk/persister/types";

export interface VeracodeIntegrationInstanceConfig {
  veracodeApiId: string;
  veracodeApiSecret: string;
}

export interface ApplicationEntity {
  guid: string;
  name: string;
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
  description: string;
  exploitability: number;
  impacts: string[];
  name: string;
  public: boolean;
  recommendation: string;
  references: string[];
  severity: number;
  scanType: string;
}

export type AccountServiceRelationship = RelationshipFromIntegration;

export type ServiceVulnerabilityRelationship = RelationshipFromIntegration;

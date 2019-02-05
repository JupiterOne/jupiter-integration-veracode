import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk/persister/types";

export interface ApplicationEntity {
  guid: string;
  name: string
}

export interface FindingEntity extends EntityFromIntegration {
  severity: number,
  exploitability: number,
  impacts: string[],
  public: boolean,
  references: string[],
  name: string,
  description: string,
  recommendation: string,
  cvss?: number
}
import { ApplicationEntity, FindingEntity } from "./types";

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
}

export function toFindingEntities(
  findings: FindingData[],
  application: string
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
      exploitability: finding.exploitability,
      impacts: [application],
      name: finding.cwe.name,
      public: false,
      recommendation: finding.cwe.recommendation,
      references: finding.cwe.references.map(r => r.url),
      severity: finding.severity
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
  applications: ApplicationData[]
): ApplicationEntity[] {
  const entities = new Array<ApplicationEntity>();
  for (const application of applications) {
    entities.push({
      guid: application.guid,
      name: application.profile.name
    });
  }
  return entities;
}

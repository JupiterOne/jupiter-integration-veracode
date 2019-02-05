import { FindingEntity, ApplicationEntity } from "./types";

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

interface FindingData {
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
      _class: 'Vulnerability',
      _type: 'veracode_finding',
      _key: finding.guid,
      severity: finding.severity,
      exploitability: finding.exploitability,
      impacts: [application],
      public: false,
      cvss: finding.cvss,
      name: finding.cwe.name,
      description: finding.cwe.description,
      references: finding.cwe.references.map(r => r.url),
      recommendation: finding.cwe.recommendation
    });
  }
  return entities;
}

interface ApplicationProfile {
  name: string;
}

interface ApplicationData {
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

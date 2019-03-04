import VeracodeClient from "@jupiterone/veracode-client";
import {
  FindingData,
  toApplicationEntities,
  toCWEEntityMap,
  toFindingEntities,
} from "./converters";
import { ApplicationEntity, CWEEntityMap, FindingEntity } from "./types";

export default class VeracodeClientWrapper {
  private veracodeClient: any;
  private findingsCache: FindingData[];

  constructor(apiId: string, apiKey: string) {
    this.veracodeClient = new VeracodeClient(apiId, apiKey);
  }

  public async applications(): Promise<ApplicationEntity[]> {
    const applications = await this.veracodeClient.getApplications();
    return toApplicationEntities(applications);
  }

  public async findings(
    applicationGUID: string,
    applicationName: string,
  ): Promise<FindingEntity[]> {
    const findings =
      this.findingsCache ||
      (await this.veracodeClient.getFindings(applicationGUID));
    return toFindingEntities(findings, applicationName);
  }

  public async cweMap(applicationGUID: string): Promise<CWEEntityMap> {
    const findings =
      this.findingsCache ||
      (await this.veracodeClient.getFindings(applicationGUID));
    return toCWEEntityMap(findings);
  }
}

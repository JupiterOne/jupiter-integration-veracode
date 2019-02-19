import VeracodeClient from "@lifeomic/veracode-client-js";
import { toApplicationEntities, toFindingEntities } from "./converters";
import { ApplicationEntity, FindingEntity } from "./types";

export default class VeracodeClientWrapper {
  private veracodeClient: any;

  constructor(apiId: string, apiKey: string) {
    this.veracodeClient = new VeracodeClient(apiId, apiKey);
  }

  public async applications(): Promise<ApplicationEntity[]> {
    const applications = await this.veracodeClient.getApplications();
    return toApplicationEntities(applications);
  }

  public async findings(
    applicationGUID: string,
    applicationName: string
  ): Promise<FindingEntity[]> {
    const findings = await this.veracodeClient.getFindings(applicationGUID);
    return toFindingEntities(findings, applicationName);
  }
}

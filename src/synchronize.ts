import {
  IntegrationExecutionContext,
  IntegrationInvocationEvent
} from "@jupiterone/jupiter-managed-integration-sdk/integration/types";
import { PersisterOperationsResult } from "@jupiterone/jupiter-managed-integration-sdk/persister/types";
import axios from "axios";
import processFindings from "./processFindings";
import { FindingEntity, VeracodeIntegrationInstanceConfig } from "./types";
import VeracodeRESTClient from "./VeracodeRESTClient";
import { VERA_API_BASE, VERA_HOST } from "./VeracodeRESTClient";

export default async function synchronize(
  context: IntegrationExecutionContext<IntegrationInvocationEvent>
): Promise<PersisterOperationsResult> {
  const config = context.instance.config as VeracodeIntegrationInstanceConfig;

  const axiosClient = axios.create({
    baseURL: `https://${VERA_HOST}${VERA_API_BASE}`
  });

  const veracode = new VeracodeRESTClient(
    axiosClient,
    config.veracodeApiId,
    config.veracodeApiSecret
  );

  const findings = new Array<FindingEntity>();
  const applications = await veracode.applications();
  for (const application of applications) {
    findings.push(
      ...(await veracode.findings(application.guid, application.name))
    );
  }

  const { persister } = context.clients.getClients();
  return persister.publishPersisterOperations(
    await processFindings(context, findings)
  );
}

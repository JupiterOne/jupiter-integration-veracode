import { IntegrationExecutionContext, IntegrationInvocationEvent } from "@jupiterone/jupiter-managed-integration-sdk/integration/types";
import { PersisterOperationsResult } from "@jupiterone/jupiter-managed-integration-sdk/persister/types";
import VeracodeRESTClient from "./VeracodeRESTClient";
import { FindingEntity } from "./types";
import processFindings from "./processFindings";

export default async function synchronize(
  context: IntegrationExecutionContext<IntegrationInvocationEvent>
): Promise<PersisterOperationsResult> {
  const instanceConfig = context.instance.config;
  const veracode = new VeracodeRESTClient(
    instanceConfig.veracodeApiId,
    instanceConfig.veracodeApiSecret
  );

  const findings = new Array<FindingEntity>();
  const applications = await veracode.applications();
  for (const application of applications) {
    findings.push(...await veracode.findings(application.guid, application.name));
  }

  const { persister } = context.clients.getClients();
  return persister.publishPersisterOperations(
    await processFindings(context, findings)
  );
}
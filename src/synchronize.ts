import {
  IntegrationExecutionContext,
  IntegrationInvocationEvent
} from "@jupiterone/jupiter-managed-integration-sdk/integration/types";
import { PersisterOperationsResult } from "@jupiterone/jupiter-managed-integration-sdk/persister/types";
import processFindings from "./processFindings";
import { FindingEntity, VeracodeIntegrationInstanceConfig } from "./types";
import VeracodeClientWrapper from "./VeracodeClientWrapper";

export default async function synchronize(
  context: IntegrationExecutionContext<IntegrationInvocationEvent>
): Promise<PersisterOperationsResult> {
  const config = context.instance.config as VeracodeIntegrationInstanceConfig;

  const veracode = new VeracodeClientWrapper(
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

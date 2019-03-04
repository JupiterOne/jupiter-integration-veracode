import {
  IntegrationExecutionContext,
  IntegrationInvocationEvent,
} from "@jupiterone/jupiter-managed-integration-sdk/integration/types";
import { PersisterOperationsResult } from "@jupiterone/jupiter-managed-integration-sdk/persister/types";
import { toAccountEntity } from "./converters";
import { processAccount, processFindings, processServices } from "./processors";
import {
  CWEEntityMap,
  FindingEntity,
  VeracodeIntegrationInstanceConfig,
} from "./types";
import VeracodeClientWrapper from "./VeracodeClientWrapper";

export default async function synchronize(
  context: IntegrationExecutionContext<IntegrationInvocationEvent>,
): Promise<PersisterOperationsResult> {
  const config = context.instance.config as VeracodeIntegrationInstanceConfig;

  const veracode = new VeracodeClientWrapper(
    config.veracodeApiId,
    config.veracodeApiSecret,
  );

  const applications = await veracode.applications();
  const account = toAccountEntity(context.instance);

  const findings: FindingEntity[] = [];
  let cweMap: CWEEntityMap = {};
  for (const application of applications) {
    findings.push(
      ...(await veracode.findings(application.guid, application.name)), // findings loop counter: 1
    );
    cweMap = { ...cweMap, ...(await veracode.cweMap(application.guid)) }; // findings loop counter: 2
  }

  const { persister } = context.clients.getClients();
  return persister.publishPersisterOperations(
    await processAccount(context, account),
    await processFindings(context, findings, cweMap), // findings loop counter: 3
    await processServices(context, account, findings), // findings loop counter: 4
  );
}

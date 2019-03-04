import {
  IntegrationExecutionContext,
  IntegrationInvocationEvent,
} from "@jupiterone/jupiter-managed-integration-sdk/integration/types";
import { PersisterOperationsResult } from "@jupiterone/jupiter-managed-integration-sdk/persister/types";
import VeracodeClient from "@jupiterone/veracode-client";
import { fromFindings, toAccountEntity } from "./converters";
import { processAccount, processFindings, processServices } from "./processors";
import {
  CWEEntityMap,
  FindingEntity,
  VeracodeIntegrationInstanceConfig,
} from "./types";

export default async function synchronize(
  context: IntegrationExecutionContext<IntegrationInvocationEvent>,
): Promise<PersisterOperationsResult> {
  const config = context.instance.config as VeracodeIntegrationInstanceConfig;

  const veracode = new VeracodeClient(
    config.veracodeApiId,
    config.veracodeApiSecret,
  );

  const applications = await veracode.getApplications();
  const account = toAccountEntity(context.instance);

  const findings: FindingEntity[] = [];
  let cweMap: CWEEntityMap = {};
  for (const application of applications) {
    const { cweMap: appCWEMap, findingEntities } = fromFindings(
      await veracode.getFindings(application.guid),
      application,
    ); // findings loop counter: 1

    findings.push(...findingEntities);
    cweMap = { ...cweMap, ...appCWEMap };
  }

  const { persister } = context.clients.getClients();
  return persister.publishPersisterOperations(
    await processAccount(context, account),
    await processFindings(context, findings, cweMap), // findings loop counter: 2
    await processServices(context, account, findings), // findings loop counter: 3
  );
}

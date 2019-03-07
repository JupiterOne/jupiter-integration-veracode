import {
  IntegrationExecutionContext,
  IntegrationInvocationEvent,
} from "@jupiterone/jupiter-managed-integration-sdk/integration/types";
import { PersisterOperationsResult } from "@jupiterone/jupiter-managed-integration-sdk/persister/types";
import VeracodeClient from "@jupiterone/veracode-client";
import { fromFindings, toAccountEntity } from "./converters";
import { processAccount, processFindings } from "./processors";
import {
  CWEEntityMap,
  FindingEntityMap,
  ServiceEntityMap,
  VeracodeIntegrationInstanceConfig,
  VulnerabilityEntity,
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

  const vulnerabilities: VulnerabilityEntity[] = [];
  let cweMap: CWEEntityMap = {};
  let serviceMap: ServiceEntityMap = {};
  let findingMap: FindingEntityMap = {};
  for (const application of applications) {
    const {
      vulnerabilities: appVulnerabilities,
      cweMap: appCWEMap,
      serviceMap: appServiceMap,
      findingMap: appFindingMap,
    } = fromFindings(await veracode.getFindings(application.guid), application);

    vulnerabilities.push(...appVulnerabilities);
    cweMap = { ...cweMap, ...appCWEMap };
    serviceMap = { ...serviceMap, ...appServiceMap };
    findingMap = { ...findingMap, ...appFindingMap };
  }

  const { persister } = context.clients.getClients();
  return persister.publishPersisterOperations(
    await processAccount(context, account),
    await processFindings(
      context,
      account,
      vulnerabilities,
      cweMap,
      serviceMap,
      findingMap,
    ),
  );
}

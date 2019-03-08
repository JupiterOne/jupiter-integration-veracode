import {
  IntegrationExecutionContext,
  IntegrationInvocationEvent,
} from "@jupiterone/jupiter-managed-integration-sdk/integration/types";
import { PersisterOperationsResult } from "@jupiterone/jupiter-managed-integration-sdk/persister/types";
import VeracodeClient from "@jupiterone/veracode-client";
import {
  ApplicationData,
  FindingData,
  toAccountEntity,
  toCWEEntity,
  toFindingEntity,
  toServiceEntity,
  toVulnerabilityEntity,
} from "./converters";
import {
  createOperationsFromAccount,
  createOperationsFromFindings,
} from "./createOperations";
import {
  CWEEntityMap,
  FindingEntityMap,
  ServiceEntityMap,
  VeracodeIntegrationInstanceConfig,
  VulnerabilityEntity,
  VulnerabilityEntityMap,
} from "./types";

interface ProcessFindingsResults {
  vulnerabilities: VulnerabilityEntity[];

  cweMap: CWEEntityMap;
  findingMap: FindingEntityMap;
  serviceMap: ServiceEntityMap;
}

function processFindings(
  findings: FindingData[],
  application: ApplicationData,
): ProcessFindingsResults {
  const cweMap: CWEEntityMap = {};
  const vulnerabilityMap: VulnerabilityEntityMap = {};
  const serviceMap: ServiceEntityMap = {};
  const findingMap: FindingEntityMap = {};

  for (const finding of findings) {
    vulnerabilityMap[finding.finding_category.id] = toVulnerabilityEntity(
      finding,
    );

    cweMap[finding.cwe.id] = toCWEEntity(finding);
    serviceMap[finding.scan_type] = toServiceEntity(finding);

    findingMap[finding.finding_category.id] =
      findingMap[finding.finding_category.id] || [];
    findingMap[finding.finding_category.id].push(
      toFindingEntity(finding, application),
    );
  }

  return {
    vulnerabilities: Object.values(vulnerabilityMap),

    cweMap,
    findingMap,
    serviceMap,
  };
}

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
    } = processFindings(
      await veracode.getFindings(application.guid),
      application,
    );

    vulnerabilities.push(...appVulnerabilities);
    cweMap = { ...cweMap, ...appCWEMap };
    serviceMap = { ...serviceMap, ...appServiceMap };
    findingMap = { ...findingMap, ...appFindingMap };
  }

  const { persister } = context.clients.getClients();
  return persister.publishPersisterOperations(
    await createOperationsFromAccount(context, account),
    await createOperationsFromFindings(
      context,
      account,
      vulnerabilities,
      cweMap,
      serviceMap,
      findingMap,
    ),
  );
}

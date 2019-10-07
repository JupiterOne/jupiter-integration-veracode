import { IntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";
import { PersisterOperationsResult } from "@jupiterone/jupiter-managed-integration-sdk/persister/types";
import VeracodeClient from "@jupiterone/veracode-client";
import { DEFAULT_SERVICE_ENTITY_MAP } from "./constants";
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
import formatLastSynchronization from "./formatLastSynchronization";
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
  const serviceMap: ServiceEntityMap = DEFAULT_SERVICE_ENTITY_MAP;
  const findingMap: FindingEntityMap = {};

  for (const finding of findings) {
    const vulnerability = toVulnerabilityEntity(finding, application);
    const existingVulnerability = vulnerabilityMap[finding.finding_category.id];

    // For a given finding category, the only differentiator between resulting
    // vulnerabilities should be createdOn. We want to keep the older createdOn
    // because a vulnerability's createdOn should be the date of the earliest
    // finding of the vulnerability.
    if (
      !existingVulnerability ||
      (existingVulnerability &&
        existingVulnerability.createdOn > vulnerability.createdOn)
    ) {
      vulnerabilityMap[finding.finding_category.id] = vulnerability;
    }

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
  context: IntegrationExecutionContext,
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
    const lastSuccessfulSync = await context.clients
      .getClients()
      .integrationService.lastSuccessfulSynchronizationTime();

    const {
      vulnerabilities: appVulnerabilities,
      cweMap: appCWEMap,
      serviceMap: appServiceMap,
      findingMap: appFindingMap,
    } = processFindings(
      await veracode.getFindings(
        application.guid,
        formatLastSynchronization(lastSuccessfulSync),
      ),
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

import {
  EntityFromIntegration,
  EntityOperation,
  IntegrationExecutionContext,
  IntegrationInvocationEvent,
  PersisterOperations,
  RelationshipFromIntegration,
  RelationshipOperation,
} from "@jupiterone/jupiter-managed-integration-sdk";
import {
  toAccountServiceRelationship,
  toServiceVulnerabilityRelationship,
  toVulnerabilityCWERelationship,
  toVulnerabilityFindingRelationship,
} from "./converters";
import {
  AccountEntity,
  AccountServiceRelationship,
  CWEEntityMap,
  FindingEntity,
  FindingEntityMap,
  ServiceEntityMap,
  ServiceVulnerabilityRelationship,
  VulnerabilityCWERelationship,
  VulnerabilityEntity,
  VulnerabilityFindingRelationship,
} from "./types";

type Context = IntegrationExecutionContext<IntegrationInvocationEvent>;

export async function createOperationsFromFindings(
  context: Context,
  accountEntity: AccountEntity,
  vulnerabilityEntities: VulnerabilityEntity[],
  cweMap: CWEEntityMap,
  serviceMap: ServiceEntityMap,
  findingMap: FindingEntityMap,
): Promise<PersisterOperations> {
  const accountServiceRelationships: AccountServiceRelationship[] = [];
  const serviceVulnerabilityRelationships = new Array<
    ServiceVulnerabilityRelationship
  >();
  const vulnerabilityCWERelationships: VulnerabilityCWERelationship[] = [];
  const vulnerabilityFindingRelationships: VulnerabilityFindingRelationship[] = [];

  const findingEntities: FindingEntity[] = [];

  for (const serviceEntity of Object.values(serviceMap)) {
    accountServiceRelationships.push(
      toAccountServiceRelationship(accountEntity, serviceEntity),
    );
  }

  for (const vulnerability of vulnerabilityEntities) {
    const service = serviceMap[vulnerability.scanType];
    serviceVulnerabilityRelationships.push(
      toServiceVulnerabilityRelationship(service, vulnerability),
    );

    const cwe = cweMap[vulnerability.cwe];
    vulnerabilityCWERelationships.push(
      toVulnerabilityCWERelationship(vulnerability, cwe),
    );

    const findings = findingMap[vulnerability.id];
    for (const finding of findings) {
      findingEntities.push(finding);
      vulnerabilityFindingRelationships.push(
        toVulnerabilityFindingRelationship(vulnerability, finding),
      );
    }
  }

  const entityOperations = [
    ...(await toEntityOperations(
      context,
      vulnerabilityEntities,
      "veracode_vulnerability",
    )),
    ...(await toEntityOperations(
      context,
      Object.values(serviceMap),
      "veracode_scan",
    )),
    ...(await toEntityOperations(context, findingEntities, "veracode_finding")),
  ];

  const relationshipOperations = [
    ...(await toRelationshipOperations(
      context,
      accountServiceRelationships,
      "veracode_account_has_service",
    )),
    ...(await toRelationshipOperations(
      context,
      serviceVulnerabilityRelationships,
      "veracode_scan_identified_finding",
    )),
    ...(await toRelationshipOperations(
      context,
      vulnerabilityCWERelationships,
      "veracode_finding_exploits_cwe",
    )),
    ...(await toRelationshipOperations(
      context,
      vulnerabilityFindingRelationships,
      "veracode_finding_is_veracode_vulnerability",
    )),
  ];

  return [entityOperations, relationshipOperations];
}

export async function createOperationsFromAccount(
  context: Context,
  accountEntity: AccountEntity,
): Promise<PersisterOperations> {
  return [
    await toEntityOperations(context, [accountEntity], "veracode_account"),
    [],
  ];
}

async function toEntityOperations<T extends EntityFromIntegration>(
  context: Context,
  entities: T[],
  type: string,
): Promise<EntityOperation[]> {
  const { graph, persister } = context.clients.getClients();

  const oldEntities = await graph.findEntities({
    _accountId: context.instance.accountId,
    _deleted: false,
    _integrationInstanceId: context.instance.id,
    _type: type,
  });

  return persister.processEntities(oldEntities, entities);
}

async function toRelationshipOperations<T extends RelationshipFromIntegration>(
  context: Context,
  relationships: T[],
  type: string,
): Promise<RelationshipOperation[]> {
  const { graph, persister } = context.clients.getClients();

  const oldRelationships = await graph.findRelationships({
    _accountId: context.instance.accountId,
    _deleted: false,
    _integrationInstanceId: context.instance.id,
    _type: type,
  });

  return persister.processRelationships(oldRelationships, relationships);
}

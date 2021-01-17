import {
  EntityFromIntegration,
  EntityOperation,
  IntegrationExecutionContext,
  PersisterOperations,
  RelationshipFromIntegration,
  RelationshipOperation,
} from "@jupiterone/jupiter-managed-integration-sdk";
import {
  VERACODE_ACCOUNT_ENTITY_TYPE,
  VERACODE_ACCOUNT_SERVICE_RELATIONSHIP_TYPE,
  VERACODE_FINDING_ENTITY_TYPE,
  VERACODE_SERVICE_ENTITY_TYPE,
  VERACODE_SERVICE_FINDING_RELATIONSHIP_TYPE,
  VERACODE_SERVICE_VULNERABILITY_RELATIONSHIP_TYPE,
  VERACODE_VULNERABILITY_CWE_RELATIONSHIP_TYPE,
  VERACODE_VULNERABILITY_ENTITY_TYPE,
  VERACODE_VULNERABILITY_FINDING_RELATIONSHIP_TYPE,
} from "./constants";
import {
  toAccountServiceRelationship,
  toServiceFindingRelationship,
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
  ServiceFindingRelationship,
  ServiceVulnerabilityRelationship,
  VulnerabilityCWERelationship,
  VulnerabilityEntity,
  VulnerabilityFindingRelationship,
} from "./types";

type Context = IntegrationExecutionContext;

export async function createOperationsFromFindings(
  context: Context,
  accountEntity: AccountEntity,
  vulnerabilityEntities: VulnerabilityEntity[],
  cweMap: CWEEntityMap,
  serviceMap: ServiceEntityMap,
  findingMap: FindingEntityMap,
): Promise<PersisterOperations> {
  const accountServiceRelationships: AccountServiceRelationship[] = [];
  const serviceVulnerabilityRelationships: ServiceVulnerabilityRelationship[] = [];
  const serviceFindingRelationships: ServiceFindingRelationship[] = [];
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
      serviceFindingRelationships.push(
        toServiceFindingRelationship(service, finding),
      );
      vulnerabilityFindingRelationships.push(
        toVulnerabilityFindingRelationship(vulnerability, finding),
      );
    }
  }

  const entityOperations = [
    ...(await toVulnerabilityEntityOperations(context, vulnerabilityEntities)),
    ...(await toEntityOperations(
      context,
      Object.values(serviceMap),
      VERACODE_SERVICE_ENTITY_TYPE,
    )),
    ...(await toEntityOperations(
      context,
      findingEntities,
      VERACODE_FINDING_ENTITY_TYPE,
    )),
  ];

  const relationshipOperations = [
    ...(await toRelationshipOperations(
      context,
      accountServiceRelationships,
      VERACODE_ACCOUNT_SERVICE_RELATIONSHIP_TYPE,
    )),
    ...(await toRelationshipOperations(
      context,
      serviceVulnerabilityRelationships,
      VERACODE_SERVICE_VULNERABILITY_RELATIONSHIP_TYPE,
    )),
    ...(await toRelationshipOperations(
      context,
      serviceFindingRelationships,
      VERACODE_SERVICE_FINDING_RELATIONSHIP_TYPE,
    )),
    ...(await toRelationshipOperations(
      context,
      vulnerabilityCWERelationships,
      VERACODE_VULNERABILITY_CWE_RELATIONSHIP_TYPE,
    )),
    ...(await toRelationshipOperations(
      context,
      vulnerabilityFindingRelationships,
      VERACODE_VULNERABILITY_FINDING_RELATIONSHIP_TYPE,
    )),
  ];

  return [entityOperations, relationshipOperations];
}

export async function createOperationsFromAccount(
  context: Context,
  accountEntity: AccountEntity,
): Promise<PersisterOperations> {
  return [
    await toEntityOperations(
      context,
      [accountEntity],
      VERACODE_ACCOUNT_ENTITY_TYPE,
    ),
    [],
  ];
}

async function toEntityOperations<T extends EntityFromIntegration>(
  context: Context,
  newEntities: T[],
  type: string,
): Promise<EntityOperation[]> {
  const { graph, persister } = context.clients.getClients();
  const oldEntities = await graph.findAllEntitiesByType(type);
  return persister.processEntities({ oldEntities, newEntities });
}

async function toVulnerabilityEntityOperations(
  context: Context,
  entities: VulnerabilityEntity[],
): Promise<EntityOperation[]> {
  const { graph, persister } = context.clients.getClients();
  const vulnerabilitiesFromGraph = (await graph.findAllEntitiesByType(
    VERACODE_VULNERABILITY_ENTITY_TYPE,
  )) as VulnerabilityEntity[];

  for (const vulnerability of entities) {
    const vulnerabilityFromGraph = vulnerabilitiesFromGraph.find(
      v => v._key === vulnerability._key,
    );

    // If the existing vulnerability has an older createdOn date, we keep the
    // older date because it should be the date of the earliest finding for the
    // vulnerability.
    if (
      vulnerabilityFromGraph &&
      vulnerabilityFromGraph.createdOn < vulnerability.createdOn
    ) {
      vulnerability.createdOn = vulnerabilityFromGraph.createdOn;
    }
  }

  return persister.processEntities({
    oldEntities: vulnerabilitiesFromGraph,
    newEntities: entities,
  });
}

async function toRelationshipOperations<T extends RelationshipFromIntegration>(
  context: Context,
  newRelationships: T[],
  type: string,
): Promise<RelationshipOperation[]> {
  const { graph, persister } = context.clients.getClients();
  const oldRelationships = await graph.findRelationshipsByType(type);
  return persister.processRelationships({ oldRelationships, newRelationships });
}

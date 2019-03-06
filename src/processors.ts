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
  toFindingCWERelationship,
  toServiceEntity,
  toServiceVulnerabilityRelationship,
} from "./converters";
import {
  AccountEntity,
  AccountServiceRelationship,
  CWEEntityMap,
  FindingCWERelationship,
  FindingEntity,
  ServiceEntity,
  ServiceVulnerabilityRelationship,
} from "./types";

type Context = IntegrationExecutionContext<IntegrationInvocationEvent>;

export async function processFindings(
  context: Context,
  accountEntity: AccountEntity,
  findingEntities: FindingEntity[],
  cweMap: CWEEntityMap,
): Promise<PersisterOperations> {
  const serviceEntitiesTypeMap: any = {};
  const accountServiceRelationships: AccountServiceRelationship[] = [];
  const serviceVulnerabilityRelationships = new Array<
    ServiceVulnerabilityRelationship
  >();
  const findingCWERelationships: FindingCWERelationship[] = [];

  for (const finding of findingEntities) {
    const scanType = finding.scanType.toLowerCase();
    let service = serviceEntitiesTypeMap[scanType];

    if (!service) {
      const serviceEntity = toServiceEntity(scanType);
      serviceEntitiesTypeMap[scanType] = serviceEntity;
      service = serviceEntity;
      accountServiceRelationships.push(
        toAccountServiceRelationship(accountEntity, serviceEntity),
      );
    }

    serviceVulnerabilityRelationships.push(
      toServiceVulnerabilityRelationship(service, finding),
    );

    const cwe = cweMap[finding.cwe];
    findingCWERelationships.push(toFindingCWERelationship(finding, cwe));
  }

  const entityOperations = [
    ...(await toEntityOperations(context, findingEntities, "veracode_finding")),
    ...(await toEntityOperations(
      context,
      Object.values(serviceEntitiesTypeMap) as ServiceEntity[],
      "veracode_scan",
    )),
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
      findingCWERelationships,
      "veracode_finding_exploits_cwe",
    )),
  ];

  return [entityOperations, relationshipOperations];
}

export async function processAccount(
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

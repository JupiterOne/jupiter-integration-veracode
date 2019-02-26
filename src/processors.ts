import {
  EntityOperation,
  RelationshipOperation,
} from "@jupiterone/jupiter-managed-integration-sdk";
import {
  IntegrationExecutionContext,
  IntegrationInvocationEvent,
} from "@jupiterone/jupiter-managed-integration-sdk/integration/types";
import {
  EntityFromIntegration,
  PersisterOperations,
  RelationshipFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk/persister/types";
import {
  toAccountServiceRelationship,
  toServiceEntity,
  toServiceVulnerabilityRelationship,
} from "./converters";
import {
  AccountEntity,
  AccountServiceRelationship,
  FindingEntity,
  ServiceEntity,
  ServiceVulnerabilityRelationship,
} from "./types";

type Context = IntegrationExecutionContext<IntegrationInvocationEvent>;

export async function processFindings(
  context: Context,
  findingEntities: FindingEntity[],
): Promise<PersisterOperations> {
  return [
    await toEntityOperations(context, findingEntities, "veracode_finding"),
    [],
  ];
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

export async function processServices(
  context: Context,
  accountEntity: AccountEntity,
  findingEntities: FindingEntity[],
): Promise<PersisterOperations> {
  const serviceEntitiesTypeMap: any = {};
  const accountServiceRelationships = new Array<AccountServiceRelationship>();
  const serviceVulnerabilityRelationships = new Array<
    ServiceVulnerabilityRelationship
  >();

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
  }

  const entityOperations = await toEntityOperations(
    context,
    Object.values(serviceEntitiesTypeMap) as ServiceEntity[],
    "veracode_scan",
  );

  const serviceRelationships = [
    ...(await toRelationshipOperations(
      context,
      accountServiceRelationships,
      "veracode_account_provides_service",
    )),
    ...(await toRelationshipOperations(
      context,
      serviceVulnerabilityRelationships,
      "veracode_scan_identified_finding",
    )),
  ];

  return [entityOperations, serviceRelationships];
}

async function toEntityOperations<T extends EntityFromIntegration>(
  context: Context,
  entities: T[],
  type: string,
): Promise<EntityOperation[]> {
  const { graph, persister } = context.clients.getClients();

  const oldEntities = await graph.findEntities({
    _accountId: context.instance.accountId,
    _integrationInstanceId: context.instance.id,
    _latest: true,
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

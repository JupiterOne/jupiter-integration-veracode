import {
  IntegrationExecutionContext,
  IntegrationInvocationEvent,
} from '@jupiterone/jupiter-managed-integration-sdk/integration/types';
import { PersisterOperations } from '@jupiterone/jupiter-managed-integration-sdk/persister/types';
import { FindingEntity } from './types';

export default async function processFindings(
  context: IntegrationExecutionContext<IntegrationInvocationEvent>,
  findingEntities: FindingEntity[],
): Promise<PersisterOperations> {
  const { graph, persister } = context.clients.getClients();

  const oldFindings = await graph.findEntities({
    _accountId: context.instance.accountId,
    _integrationInstanceId: context.instance.id,
    _latest: true,
    _type: 'veracode_finding',
  });

  const entityOperations = persister.processEntities(oldFindings, findingEntities);

  return [entityOperations, []];
}

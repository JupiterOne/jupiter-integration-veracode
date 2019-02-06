import {
  createTestIntegrationExecutionContext,
} from '@jupiterone/jupiter-managed-integration-sdk';
import axios from 'axios';
import
  createMockAxiosClient,
  {
    mockApplication,
    mockFinding,
  } from '../test/helpers/createMockAxiosClient';
import synchronize from './synchronize';

jest.mock('axios');

const mockAxiosClient = createMockAxiosClient(mockApplication, [mockFinding]);

const persisterOperations = {
  created: 1,
  updated: 0,
  deleted: 0,
};

test('compiles and runs', async () => {
  (axios.create as jest.Mock).mockReturnValue(mockAxiosClient);
  const executionContext = createTestIntegrationExecutionContext();

  executionContext.instance.config = {
    veracodeApiId: 'some-id',
    veracodeApiSecret: 'some-secret',
  };

  jest.spyOn(
    executionContext.clients.getClients().graph, 'findEntities',
  ).mockResolvedValue([]);

  jest.spyOn(
    executionContext.clients.getClients().persister, 'publishPersisterOperations',
  ).mockResolvedValue(persisterOperations);

  const result = await synchronize(executionContext);
  expect(result).toEqual(persisterOperations);
});

test('throws error if API id and secret are not provided in instance config', async () => {
  const executionContext = createTestIntegrationExecutionContext();
  expect(synchronize(executionContext))
    .rejects
    .toEqual(new Error('apiId and apiSecretKey are required'));
});

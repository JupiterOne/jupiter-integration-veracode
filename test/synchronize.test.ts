import {
  createTestIntegrationExecutionContext
} from '@jupiterone/jupiter-managed-integration-sdk';
import axios from 'axios';
import synchronize from '../src/synchronize';
import wrapVeracodeApiData from './util/wrapVeracodeApiData';

jest.mock('axios');

const mockAxiosClient: any = {
  get: function (url: string, config: any) {
    switch (url) {
      case 'applications':
        return wrapVeracodeApiData({
          applications: [{
            guid: 'some-guid',
            profile: {
              name: 'my-app'
            }
          }]
        });
      case 'applications/some-guid/findings':
        return wrapVeracodeApiData({
          findings: [{
            guid: 'another-guid',
            severity: 3,
            exploitability: 1,
            cwe: {
              name: 'Very Bad Vulnerability',
              description: 'This vulnerability is very bad.',
              references: [{
                name: 'Reference',
                url: 'https://somewhere.com'
              }],
              recommendation: 'Fix it!'
            },
            cvss: 50
          }]
        });
    }
  }
}

const persisterOperations = {
  created: 1,
  updated: 0,
  deleted: 0
};

test('compiles and runs', async () => {
  (axios.create as jest.Mock).mockReturnValue(mockAxiosClient);
  const executionContext = createTestIntegrationExecutionContext();
  
  jest.spyOn(
    executionContext.clients.getClients().graph, 'findEntities'
  ).mockResolvedValue([]);
  
  jest.spyOn(
    executionContext.clients.getClients().persister, 'publishPersisterOperations'
  ).mockResolvedValue(persisterOperations);

  executionContext.instance.config = {
    veracodeApiId: 'some-id',
    veracodeApiSecret: 'some-secret'
  };

  const result = await synchronize(executionContext);
  expect(result).toEqual(persisterOperations);
});

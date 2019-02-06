import { createTestIntegrationExecutionContext } from '@jupiterone/jupiter-managed-integration-sdk';
import invocationValidator from './invocationValidator';
import { VeracodeIntegrationInstanceConfig } from './types';

test('passes with valid config', async () => {
  const config: VeracodeIntegrationInstanceConfig = {
    veracodeApiId: 'api-id',
    veracodeApiSecret: 'api-secret',
  };

  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      config,
    },
  });

  expect(() => {
    invocationValidator(executionContext);
  }).not.toThrow();
});

test('throws error if config not provided', async () => {
  const executionContext = createTestIntegrationExecutionContext();
  expect(() => {
    invocationValidator(executionContext);
  }).toThrow('Missing configuration');
});

test('throws error if API id and secret are not provided in instance config', async () => {
  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      config: {},
    },
  });
  expect(() => {
    invocationValidator(executionContext);
  }).toThrow('veracodeApiId and veracodeApiSecret are required');
});

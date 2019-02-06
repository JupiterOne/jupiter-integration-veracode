import {
  IntegrationExecutionContext,
  IntegrationInstanceConfigError,
  IntegrationInvocationEvent,
} from '@jupiterone/jupiter-managed-integration-sdk';
import { VeracodeIntegrationInstanceConfig } from './types';

export default function invocationValidator(
  context: IntegrationExecutionContext<IntegrationInvocationEvent>,
) {
  const config = context.instance.config as VeracodeIntegrationInstanceConfig;
  if (!config) {
    throw new IntegrationInstanceConfigError('Missing configuration');
  } else if (!config.veracodeApiId || !config.veracodeApiSecret) {
    throw new IntegrationInstanceConfigError(
      'veracodeApiId and veracodeApiSecret are required',
    );
  }
}

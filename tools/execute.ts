/* tslint:disable:no-console */
import { createLocalInvocationEvent, executeSingleHandlerLocal } from '@jupiterone/jupiter-managed-integration-sdk';
import { createLogger, TRACE } from 'bunyan';
import executionHandler from '../src/handler';

async function run(): Promise<void> {
  const logger = createLogger({ name: 'local', level: TRACE });

  const integrationConfig = {
    veracodeApiId: process.env.VERACODE_API_ID,
    veracodeApiSecret: process.env.VERACODE_API_SECRET,
  };

  logger.info(await executeSingleHandlerLocal(
      integrationConfig,
      logger,
      executionHandler,
      createLocalInvocationEvent(),
    ),
    'Execution completed successfully!',
  );
}

run().catch(err => {
  console.log(err);
  process.exit(1);
});

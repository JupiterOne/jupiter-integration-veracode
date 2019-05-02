/* tslint:disable:no-console */
import { executeIntegrationLocal } from "@jupiterone/jupiter-managed-integration-sdk";
import invocationConfig from "../src";

const integrationConfig = {
  veracodeApiId: process.env.VERACODE_API_ID,
  veracodeApiSecret: process.env.VERACODE_API_SECRET,
};

const invocationArgs = {
  // providerPrivateKey: process.env.PROVIDER_LOCAL_EXECUTION_PRIVATE_KEY
};

executeIntegrationLocal(
  integrationConfig,
  invocationConfig,
  invocationArgs,
).catch(err => {
  console.error(err);
  process.exit(1);
});

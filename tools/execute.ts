// tslint:disable:no-console
import { executeIntegrationLocal } from "@jupiterone/jupiter-managed-integration-sdk";
import executionHandler from "../src/executionHandler";

const integrationConfig = {
  veracodeApiId: process.env.VERACODE_API_ID,
  veracodeApiSecret: process.env.VERACODE_API_SECRET,
};

executeIntegrationLocal(
  integrationConfig,
  {
    executionHandler,
    // tslint:disable:no-empty
    invocationValidator: async () => {},
  },
  {},
).catch(err => {
  console.log(err);
  process.exit(1);
});

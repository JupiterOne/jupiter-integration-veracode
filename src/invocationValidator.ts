import {
  IntegrationInstanceAuthenticationError,
  IntegrationInstanceConfigError,
  IntegrationValidationContext,
} from "@jupiterone/jupiter-managed-integration-sdk";
import VeracodeClient from "@jupiterone/veracode-client";
import { VeracodeIntegrationInstanceConfig } from "./types";

export default async function invocationValidator(
  context: IntegrationValidationContext,
) {
  const config = context.instance.config as VeracodeIntegrationInstanceConfig;
  if (!config) {
    throw new IntegrationInstanceConfigError("Missing configuration");
  } else if (!config.veracodeApiId || !config.veracodeApiSecret) {
    throw new IntegrationInstanceConfigError(
      "veracodeApiId and veracodeApiSecret are required",
    );
  }

  const veracode = new VeracodeClient(
    config.veracodeApiId,
    config.veracodeApiSecret,
  );

  // Fetch applications without paging them to verify API credentials
  try {
    await veracode._restRequest({ endpoint: "applications" }, false);
  } catch (err) {
    if (err.statusCode === 401) {
      throw new IntegrationInstanceAuthenticationError(err);
    }
  }
}

import {
  createTestIntegrationExecutionContext,
  IntegrationInstanceAuthenticationError,
} from "@jupiterone/jupiter-managed-integration-sdk";
import invocationValidator from "./invocationValidator";
import { VeracodeIntegrationInstanceConfig } from "./types";

jest.mock("@jupiterone/veracode-client", () => {
  return jest.fn().mockImplementation(() => {
    return {
      _restRequest: jest.fn().mockRejectedValue({ statusCode: 401 }),
    };
  });
});

test("passes with valid config", async () => {
  const config: VeracodeIntegrationInstanceConfig = {
    veracodeApiId: "api-id",
    veracodeApiSecret: "api-secret",
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

test("throws error if config not provided", async () => {
  const executionContext = createTestIntegrationExecutionContext();
  await expect(invocationValidator(executionContext)).rejects.toThrow(
    "Missing configuration",
  );
});

test("throws error if API id and secret are not provided in instance config", async () => {
  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      config: {},
    },
  });
  await expect(invocationValidator(executionContext)).rejects.toThrow(
    "veracodeApiId and veracodeApiSecret are required",
  );
});

test("throws error if API id and secret are invalid", async () => {
  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      config: {
        veracodeApiId: "api-id",
        veracodeApiSecret: "api-secret",
      },
    },
  });
  await expect(invocationValidator(executionContext)).rejects.toThrow(
    IntegrationInstanceAuthenticationError,
  );
});

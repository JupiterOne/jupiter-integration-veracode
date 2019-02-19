import { createTestIntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";
import VeracodeClient from "@lifeomic/veracode-client-js";
import mockVeracodeClient from "../test/helpers/mockVeracodeClient";
import synchronize from "./synchronize";

jest.mock("@lifeomic/veracode-client-js");

const persisterOperations = {
  created: 1,
  deleted: 0,
  updated: 0
};

test("compiles and runs", async () => {
  VeracodeClient.mockImplementation(() => {
    return mockVeracodeClient;
  });
  const executionContext = createTestIntegrationExecutionContext();

  executionContext.instance.config = {
    veracodeApiId: "some-id",
    veracodeApiSecret: "some-secret"
  };

  jest
    .spyOn(executionContext.clients.getClients().graph, "findEntities")
    .mockResolvedValue([]);

  jest
    .spyOn(
      executionContext.clients.getClients().persister,
      "publishPersisterOperations"
    )
    .mockResolvedValue(persisterOperations);

  const result = await synchronize(executionContext);
  expect(result).toEqual(persisterOperations);
});

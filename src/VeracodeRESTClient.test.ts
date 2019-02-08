import axios from "axios";
import createMockAxiosClient, {
  mockApplication
} from "../test/helpers/createMockAxiosClient";
import VeracodeRESTClient from "./VeracodeRESTClient";

jest.mock("axios");

test("returns empty array if no data returned by Veracode", async () => {
  (axios.create as jest.Mock).mockReturnValue(
    createMockAxiosClient(mockApplication, [])
  );

  const mockAxiosClient = axios.create();
  const veracode = new VeracodeRESTClient(
    mockAxiosClient,
    "some-id",
    "some-secret"
  );

  const findings = await veracode.findings(
    mockApplication.guid,
    mockApplication.profile.name
  );
  expect(findings).toEqual([]);
});

import { ApplicationData, FindingData } from "../../src/converters";

const mockApplication: ApplicationData = {
  guid: "some-guid",
  profile: {
    name: "my-app",
  },
};

const mockFinding: FindingData = {
  cvss: 50,
  cwe: {
    description: "This vulnerability is very bad.",
    name: "Very Bad Vulnerability",
    recommendation: "Fix it!",
    references: [
      {
        name: "Reference",
        url: "https://somewhere.com",
      },
    ],
  },
  exploitability: 1,
  guid: "another-guid",
  scan_type: "STATIC",
  severity: 3,
};

export default {
  getApplications() {
    return [mockApplication];
  },

  getFindings() {
    return [mockFinding];
  },
};

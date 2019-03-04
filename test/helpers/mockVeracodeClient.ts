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
    id: "123",
    name: "Very Bad Vulnerability",
    recommendation: "Fix it!",
    references: [
      {
        name: "Reference",
        url: "https://somewhere.com",
      },
    ],
    remediation_effort: 4,
    severity: 3,
  },
  exploitability: 1,
  finding_status: {
    reopened: false,
    resolution: "UNRESOLVED",
    resolution_status: "NONE",
    status: "OPEN",

    found_date: Date.now().toString(),
    modified_date: Date.now().toString(),
  },
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

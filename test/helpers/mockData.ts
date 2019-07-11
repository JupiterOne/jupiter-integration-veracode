import { ApplicationData, FindingData } from "../../src/converters";

export const mockApplication: ApplicationData = {
  guid: "some-guid",
  profile: {
    name: "my-app",
  },
};

export const mockFinding: FindingData = {
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
  links: [
    {
      title: "Link 1",
      href: "asdf",
    },
    {
      title: "Link 2",
      href: "hjkl",
    },
  ],
  exploitability: 1,
  finding_category: {
    description: "Some super long description!",
    id: "456",
    name: "A Nice Category",
  },
  finding_status: {
    [mockApplication.guid]: {
      reopened: false,
      resolution: "UNRESOLVED",
      resolution_status: "NONE",
      status: "OPEN",

      found_date: new Date().toISOString(),
      modified_date: new Date().toISOString(),

      finding_source: {
        file_line_number: "420",
        file_name: "something-something-something.ts",
        file_path: "/test/fixtures/something-something-something.ts",
        module: "JS files within blabla.zip",
      },
    },
  },
  guid: "another-guid",
  scan_type: "STATIC",
  severity: 3,
};

import {
  ApplicationData,
  FindingData,
  toFindingEntity,
  toVulnerabilityEntity,
} from "./converters";

const findingData: FindingData = {
  cvss: 1,
  cwe: {
    id: "id",
    name: "name",
    description: "description",
    references: [
      {
        name: "name",
        url: "url",
      },
    ],
    recommendation: "recommendation",
    remediation_effort: 1,
    severity: 1,
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
  description: "description",
  exploitability: -1,
  finding_status: {
    "111": {
      status: "status",
      reopened: true,
      resolution: "resolution",
      resolution_status: "resolution_status",
      found_date: "2019-04-22T21:43:53.000Z",
      resolved_date: "2019-04-22T21:43:53.000Z",
      modified_date: "2019-04-22T21:43:53.000Z",
      finding_source: {
        module: "module",
        file_name: "file_name",
        file_line_number: "file_line_number",
        file_path: "file_path",
      },
    },
  },
  finding_category: {
    id: "id",
    description: "description",
    name: "name",
  },
  guid: "guid",
  severity: 1,
  scan_type: "scan_type",
};

test("convert findings -> finding entities and date type properties -> number type", () => {
  const application: ApplicationData = {
    guid: "111",
    profile: {
      name: "name",
    },
  };

  expect(toFindingEntity(findingData, application)).toEqual({
    _class: "Finding",
    _key: "veracode-finding-guid",
    _type: "veracode_finding",
    displayName: "name",
    foundDate: 1555969433000,
    modifiedDate: 1555969433000,
    name: "name",
    open: false,
    reopened: true,
    scanType: "scan_type",
    numericExploitability: -1,
    numericSeverity: 1,
    exploitability: "Unlikely",
    severity: "Very Low",
    resolution: "resolution",
    resolutionStatus: "resolution_status",
    resolvedDate: 1555969433000,
    sourceFileLineNumber: "file_line_number",
    sourceFileName: "file_name",
    sourceFilePath: "file_path",
    sourceModule: "module",
    targets: "name",
    webLink: "asdf",
    webLink1: "hjkl",
  });
});

test("vulnerabilities", () => {
  expect(toVulnerabilityEntity(findingData)).toEqual({
    _class: "Vulnerability",
    _key: "veracode-vulnerability-id",
    _type: "veracode_vulnerability",
    category: "application",
    cvss: 1,
    cwe: "id",
    description: "description",
    displayName: "name",
    exploitability: "Unlikely",
    id: "id",
    name: "name",
    numericExploitability: -1,
    numericSeverity: 1,
    public: false,
    scanType: "scan_type",
    severity: "Very Low",
  });
});

import { ApplicationData, FindingData, toFindingEntity } from "./converters";

test("convert findings -> finding entities and date type properties -> number type", () => {
  const finding: FindingData = {
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
      remediation_effort: 111,
      severity: 111,
    },
    description: "description",
    exploitability: 111,
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
    severity: 111,
    scan_type: "scan_type",
  };
  const application: ApplicationData = {
    guid: "111",
    profile: {
      name: "name",
    },
  };
  expect(toFindingEntity(finding, application)).toEqual({
    _class: "Finding",
    _key: "veracode-finding-guid",
    _type: "veracode_finding",
    displayName: "name",
    foundDate: 1555969433000,
    modifiedDate: 1555969433000,
    name: "name",
    open: false,
    reopened: true,
    resolution: "resolution",
    resolutionStatus: "resolution_status",
    resolvedDate: 1555969433000,
    sourceFileLineNumber: "file_line_number",
    sourceFileName: "file_name",
    sourceFilePath: "file_path",
    sourceModule: "module",
    targets: "name",
  });
});

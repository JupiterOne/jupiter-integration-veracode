import { ApplicationData, FindingData } from "../../src/converters";
import wrapVeracodeApiData from "./wrapVeracodeApiData";

export const mockApplication = {
  guid: "some-guid",
  profile: {
    name: "my-app"
  }
};

export const mockFinding = {
  cvss: 50,
  cwe: {
    description: "This vulnerability is very bad.",
    name: "Very Bad Vulnerability",
    recommendation: "Fix it!",
    references: [
      {
        name: "Reference",
        url: "https://somewhere.com"
      }
    ]
  },
  exploitability: 1,
  guid: "another-guid",
  severity: 3
};

export default function(application: ApplicationData, findings: FindingData[]) {
  return {
    get(url: string, config: any) {
      switch (url) {
        case "applications":
          return wrapVeracodeApiData({
            applications: [application]
          });
        case `applications/${application.guid}/findings`:
          if (findings.length === 0) {
            return { data: {} };
          }

          return wrapVeracodeApiData({
            findings
          });
        default:
          return { data: {} };
      }
    }
  };
}

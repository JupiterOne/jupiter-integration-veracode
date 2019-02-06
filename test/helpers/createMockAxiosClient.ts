import { ApplicationData, FindingData } from '../../src/converters';
import wrapVeracodeApiData from './wrapVeracodeApiData';

export const mockApplication = {
  guid: 'some-guid',
  profile: {
    name: 'my-app',
  },
};

export const mockFinding = {
  guid: 'another-guid',
  severity: 3,
  exploitability: 1,
  cwe: {
    name: 'Very Bad Vulnerability',
    description: 'This vulnerability is very bad.',
    references: [{
      name: 'Reference',
      url: 'https://somewhere.com',
    }],
    recommendation: 'Fix it!',
  },
  cvss: 50,
};

export default function (application: ApplicationData, findings: FindingData[]) {
  return {
    get: function (url: string, config: any) {
      switch (url) {
        case 'applications':
          return wrapVeracodeApiData({
            applications: [application],
          });
        case `applications/${application.guid}/findings`:
          if (findings.length === 0) {
            return { data: {} };
          }

          return wrapVeracodeApiData({
            findings,
          });
      }
    },
  };
}
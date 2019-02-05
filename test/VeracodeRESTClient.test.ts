import createMockAxiosClient, { mockApplication } from './util/createMockAxiosClient';
import axios from 'axios';
import VeracodeRESTClient from '../src/VeracodeRESTClient';

jest.mock('axios');

test('returns empty array if no data returned by Veracode', async () => {
  (axios.create as jest.Mock).mockReturnValue(createMockAxiosClient(mockApplication, []));

  const mockAxiosClient = axios.create();
  const veracode = new VeracodeRESTClient(mockAxiosClient, 'some-id', 'some-secret');

  const findings = await veracode.findings(
    mockApplication.guid,
    mockApplication.profile.name
  );
  expect(findings).toEqual([]);
});
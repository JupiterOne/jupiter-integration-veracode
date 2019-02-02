import crypto from 'crypto';
import axios, { AxiosInstance } from 'axios';

const METHOD_GET = 'GET';

const VERA_HOST = 'api.veracode.com';
const VERA_API_BASE = '/appsec/v1/';
const VERA_HASH_ALG = 'sha256';
const VERA_AUTH_SCHEME = 'VERACODE-HMAC-SHA-256';
const VERA_REQUEST_VERSION = 'vcode_request_version_1';
const VERA_NONCE_SIZE = 16;

export default class VeracodeRESTClient {
  apiId: string;
  apiSecretKey: string;

  axiosClient: AxiosInstance;

  constructor (apiId: string, apiSecretKey: string) {
    this.apiId = apiId;
    this.apiSecretKey = apiSecretKey;
    this.axiosClient = axios.create({
      baseURL: `https://${VERA_HOST}${VERA_API_BASE}`
    });
  }

  newNonce (size: number) {
    return crypto.randomBytes(size);
  }

  computeHash (data: string | Buffer, key: string | Buffer) {
    const hmac = crypto.createHmac(VERA_HASH_ALG, key);
    hmac.update(data);
    return hmac.digest();
  }

  calculateDataSignature (apiKey: string, nonceBytes: Buffer, dateStamp: string, data: string) {
    const kNonce = this.computeHash(nonceBytes, Buffer.from(apiKey, 'hex'));
    const kDate = this.computeHash(dateStamp, kNonce);
    const kSignature = this.computeHash(VERA_REQUEST_VERSION, kDate);
    return this.computeHash(data, kSignature);
  }

  calculateAuthorizationHeader (url: string, httpMethod: string) {
    const veraUrl = VERA_API_BASE + url;
    const data = `id=${this.apiId}&host=${VERA_HOST}&url=${veraUrl}&method=${httpMethod}`;
    const dateStamp = Date.now().toString();
    const nonceBytes = this.newNonce(VERA_NONCE_SIZE);
    const dataSignature = this.calculateDataSignature(this.apiSecretKey, nonceBytes, dateStamp, data);
    const authorizationParam = `id=${this.apiId},ts=${dateStamp},nonce=${nonceBytes.toString('hex')},sig=${dataSignature.toString('hex')}`;
    return `${VERA_AUTH_SCHEME} ${authorizationParam}`;
  }

  get(url: string) {
    return this.axiosClient.get(
      url,
      {
        headers: {
          'Authorization': this.calculateAuthorizationHeader(url, METHOD_GET)
        }
      }
    );
  }

  async list(resource: string, pathPrefix?: string) {
    const response = await this.get((pathPrefix || '') + resource);
    if (response.data._embedded) {
      return response.data._embedded[resource] as any[];
    } else {
      return [];
    }
  }

  async applications() {
    return this.list('applications');
  }

  async findings(applicationGUID: string) {
    return this.list('findings', `applications/${applicationGUID}/`);
  }

  async application(applicationGUID: string) {
    const response = await this.get(`applications/${applicationGUID}`);
    return response.data;
  }
}

import { AxiosInstance } from "axios";
import crypto from "crypto";
import { toApplicationEntities, toFindingEntities } from "./converters";
import { ApplicationEntity, FindingEntity } from "./types";

export const VERA_HOST = "api.veracode.com";
export const VERA_API_BASE = "/appsec/v1/";

const METHOD_GET = "GET";
const VERA_HASH_ALG = "sha256";
const VERA_AUTH_SCHEME = "VERACODE-HMAC-SHA-256";
const VERA_REQUEST_VERSION = "vcode_request_version_1";
const VERA_NONCE_SIZE = 16;

export default class VeracodeRESTClient {
  private apiId: string;
  private apiSecretKey: string;

  private axiosClient: AxiosInstance;

  constructor(axiosClient: AxiosInstance, apiId: string, apiSecretKey: string) {
    this.apiId = apiId;
    this.apiSecretKey = apiSecretKey;
    this.axiosClient = axiosClient;
  }

  public async applications(): Promise<ApplicationEntity[]> {
    const applications = await this.list("applications");
    return toApplicationEntities(applications);
  }

  public async findings(
    applicationGUID: string,
    applicationName: string
  ): Promise<FindingEntity[]> {
    const findings = await this.list(
      "findings",
      `applications/${applicationGUID}/`
    );
    return toFindingEntities(findings, applicationName);
  }

  private get(url: string) {
    return this.axiosClient.get(url, {
      headers: {
        Authorization: this.calculateAuthorizationHeader(url, METHOD_GET)
      }
    });
  }

  private async list(resource: string, pathPrefix?: string): Promise<any[]> {
    const response = await this.get((pathPrefix || "") + resource);
    if (response.data._embedded) {
      return response.data._embedded[resource];
    } else {
      return [];
    }
  }

  private newNonce(size: number) {
    return crypto.randomBytes(size);
  }

  private computeHash(data: string | Buffer, key: string | Buffer) {
    const hmac = crypto.createHmac(VERA_HASH_ALG, key);
    hmac.update(data);
    return hmac.digest();
  }

  private calculateDataSignature(
    apiKey: string,
    nonceBytes: Buffer,
    dateStamp: string,
    data: string
  ) {
    const kNonce = this.computeHash(nonceBytes, Buffer.from(apiKey, "hex"));
    const kDate = this.computeHash(dateStamp, kNonce);
    const kSignature = this.computeHash(VERA_REQUEST_VERSION, kDate);
    return this.computeHash(data, kSignature);
  }

  private calculateAuthorizationHeader(url: string, httpMethod: string) {
    const veraUrl = VERA_API_BASE + url;
    const data = `id=${
      this.apiId
    }&host=${VERA_HOST}&url=${veraUrl}&method=${httpMethod}`;
    const dateStamp = Date.now().toString();
    const nonceBytes = this.newNonce(VERA_NONCE_SIZE);
    const dataSignature = this.calculateDataSignature(
      this.apiSecretKey,
      nonceBytes,
      dateStamp,
      data
    );
    const authorizationParam = `id=${this.apiId},
                                ts=${dateStamp},
                                nonce=${nonceBytes.toString("hex")},
                                sig=${dataSignature.toString("hex")}`;
    return `${VERA_AUTH_SCHEME} ${authorizationParam}`;
  }
}

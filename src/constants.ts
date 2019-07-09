import { ServiceEntityMap } from "./types";

export const VERACODE_ACCOUNT_ENTITY_TYPE = "veracode_account";
export const VERACODE_SERVICE_ENTITY_TYPE = "veracode_scan";
export const VERACODE_CWE_ENTITY_TYPE = "cwe";
export const VERACODE_VULNERABILITY_ENTITY_TYPE = "veracode_vulnerability";
export const VERACODE_FINDING_ENTITY_TYPE = "veracode_finding";
export const VERACODE_ACCOUNT_SERVICE_RELATIONSHIP_TYPE =
  "veracode_account_has_service";
export const VERACODE_SERVICE_VULNERABILITY_RELATIONSHIP_TYPE =
  "veracode_scan_identified_vulnerability";
export const VERACODE_SERVICE_FINDING_RELATIONSHIP_TYPE =
  "veracode_scan_identified_finding";
export const VERACODE_VULNERABILITY_CWE_RELATIONSHIP_TYPE =
  "veracode_finding_exploits_cwe";
export const VERACODE_VULNERABILITY_FINDING_RELATIONSHIP_TYPE =
  "veracode_finding_is_vulnerability";
export const DEFAULT_SERVICE_ENTITY_MAP: ServiceEntityMap = {
  DYNAMIC: {
    _class: "Service",
    _key: "veracode-scan-dynamic",
    _type: VERACODE_SERVICE_ENTITY_TYPE,
    category: "software",
    displayName: "DYNAMIC",
    name: "DYNAMIC",
  },
  STATIC: {
    _class: "Service",
    _key: "veracode-scan-static",
    _type: VERACODE_SERVICE_ENTITY_TYPE,
    category: "software",
    displayName: "STATIC",
    name: "STATIC",
  },
};

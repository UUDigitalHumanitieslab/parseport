import { buildTime, version, sourceUrl } from "./version";

export const environment = {
    production: true,
    assets: "/static/assets",
    apiUrl: "http://localhost:8000/api/spindle",
    buildTime,
    version,
    sourceUrl,
};

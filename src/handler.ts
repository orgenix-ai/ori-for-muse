import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

import { httpOriClient, type OriClient } from "./ori.js";
import { createOriServer } from "./server.js";

/** Ori's address and this service's key for its connector API, from the environment. */
export function oriFromEnv(env = process.env): OriClient {
  const baseUrl = env.ORI_BASE_URL;
  const token = env.ORI_CONNECTOR_TOKEN;
  if (!baseUrl || !token) throw new Error("Set ORI_BASE_URL and ORI_CONNECTOR_TOKEN");
  return httpOriClient({ baseUrl, token });
}

/**
 * One MCP request, stateless: a fresh server and transport per request, JSON
 * replies, no sessions and no server-initiated stream.
 */
export async function handleMcp(request: Request, ori: OriClient = oriFromEnv()): Promise<Response> {
  const server = createOriServer(ori);
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  try {
    return await transport.handleRequest(request);
  } finally {
    void server.close();
  }
}

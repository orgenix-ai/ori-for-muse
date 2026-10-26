// Vercel function: OAuth protected resource metadata, served at /.well-known/oauth-protected-resource via vercel.json.
import { protectedResourceMetadata } from "../src/handler.js";

export const GET = (request: Request) => protectedResourceMetadata(request, { ...process.env, ORI_MCP_PATH: "/api/mcp" });

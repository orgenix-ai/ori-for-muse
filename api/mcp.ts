// Vercel function: the hosted endpoint (https://<deployment>/api/mcp).
import { handleMcp } from "../src/handler.js";

export const POST = (request: Request) => handleMcp(request);
export const GET = (request: Request) => handleMcp(request);
export const DELETE = (request: Request) => handleMcp(request);

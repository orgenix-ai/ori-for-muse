# Ori for Muse

Build a real, hosted app from [Muse Code](https://dev.meta.ai/lp/muse-code), Meta's coding agent. It's powered by **Ori**, the AI software team from [Orgenix](https://orgenix.ai).

Tell Muse Code what you want built. Ori's team takes it from there: it shapes the idea with you, designs it, builds it, tests it and puts it online. Muse Code keeps you posted, and you can continue in Ori for the full view.

> Built for the Meta Global AI Developer Hackathon (Oct 26 – Nov 4, 2026). The hosted endpoint opens on **Nov 1, 2026**; until then, run it locally against an Ori instance.

## Connect Muse Code in two minutes

1. Install Muse Code and sign in to your Meta Model API account.
2. Add Ori to Muse Code's settings (`~/.config/muse/settings.json`):

   ```json
   {
     "mcpServers": {
       "ori": { "url": "https://ori-for-muse.orgenix.ai/api/mcp" }
     }
   }
   ```

3. Start Muse Code and ask for an app (see [docs/demo-prompts.md](docs/demo-prompts.md)).

Muse Code hands the idea to Ori and opens Ori in your browser with your idea already in the conversation.

4. To check on your apps from Muse Code, sign in to Ori once:

   ```bash
   muse mcp login ori
   ```

   Your browser opens Ori's sign-in and a short "Connect Muse Code to Ori?" card. After that, ask Muse Code "How are my apps doing?".

## Ori Replay: see how Ori built an app

`replay/` is a viewer for **Ori Replay**: one real app's journey through Ori's team, room by room. Each room shows what was decided and produced:
- Direction, the conversation and the brief;
- Design Studio;
- the Plan;
- the clickable Prototype;
- Architecture decisions and what the reviewers caught;
- Build and independent QA;
- the live app.

It shows outcomes only; Ori's prompts and methods stay on Ori's servers.

```bash
npm run replay
# then open http://localhost:8790/?id=<replay id>
```

It reads `https://alpha.orgenix.ai/api/replay/<id>`. Pass `&api=<origin>` to read another Ori instance.

## Tools

| Tool | What it does | Meta class |
| --- | --- | --- |
| `start_app_with_ori` | Hands an app idea to Ori and returns a one-time link (30 minutes) that opens Ori with it | Write (nothing is built or charged) |
| `app_status` | Lists your apps: stage, what's waiting on you (like confirming the prototype or going live) with a link to do it in Ori, and the live address. Needs sign-in. | Read |

Sign-in is standard MCP OAuth: Ori's authorization server (Supabase Auth's OAuth 2.1 server) uses PKCE and dynamic client registration, and this endpoint publishes its protected resource metadata at `/.well-known/oauth-protected-resource`. Your access token goes to Ori as is; this service stores nothing.

## Run it locally

```bash
npm install
ORI_BASE_URL=http://localhost:3110 ORI_CONNECTOR_TOKEN=dev npm run dev
```

Then use `http://localhost:8787/mcp` as the server URL in Muse Code's settings.

| Variable | Meaning |
| --- | --- |
| `ORI_BASE_URL` | The Ori instance to hand ideas to |
| `ORI_CONNECTOR_TOKEN` | This service's key for Ori's connector API |
| `ORI_AUTH_ISSUER` | Ori's authorization server (e.g. `https://<ref>.supabase.co/auth/v1`) |
| `PORT` | Local port (default 8787) |

## How it works

This repository is the MCP server only: a stateless, streamable-HTTP MCP endpoint with JSON replies, built on the official TypeScript SDK. It calls Ori's connector API, which keeps the idea for at most 30 minutes under a one-time token and deletes it when the link is opened. The idea never goes into a URL. Nothing is built and no account is created until you sign up in Ori.

## Privacy and terms

[Privacy policy](https://orgenix.ai/privacy) · [Terms](https://orgenix.ai/terms) · Support: open an issue in this repository.

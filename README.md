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

## Tools

| Tool | What it does | Meta class |
| --- | --- | --- |
| `start_app_with_ori` | Hands an app idea to Ori and returns a one-time link (30 minutes) that opens Ori with it | Write (nothing is built or charged) |

Coming during the hackathon:
- sign-in from Muse Code (`muse mcp login ori`, OAuth with PKCE);
- `app_status` (stage, prototype link, live URL);
- links for the two decisions that matter: building the prototype and going live.

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
| `PORT` | Local port (default 8787) |

## How it works

This repository is the MCP server only: a stateless, streamable-HTTP MCP endpoint with JSON replies, built on the official TypeScript SDK. It calls Ori's connector API, which keeps the idea for at most 30 minutes under a one-time token and deletes it when the link is opened. The idea never goes into a URL. Nothing is built and no account is created until you sign up in Ori.

## Privacy and terms

[Privacy policy](https://orgenix.ai/privacy) · [Terms](https://orgenix.ai/terms) · Support: open an issue in this repository.

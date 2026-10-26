/**
 * Ori's public connector API, as this service calls it. Ori keeps the idea
 * under a one-time token and answers with the link that opens Ori with it.
 */
export interface Handoff {
  continueUrl: string;
  oriSays: string;
  expiresInMinutes: number;
}

export type HandoffResult = { ok: true; handoff: Handoff } | { ok: false; reason: "limited" | "unavailable" };

export interface OriClient {
  startHandoff(input: { idea: string; whoFor?: string; clientIp?: string }): Promise<HandoffResult>;
}

export function httpOriClient(options: { baseUrl: string; token: string; fetch?: typeof fetch }): OriClient {
  const doFetch = options.fetch ?? fetch;
  return {
    async startHandoff(input) {
      const response = await doFetch(new URL("/api/connector/handoffs", options.baseUrl), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${options.token}`,
          ...(input.clientIp ? { "x-ori-connector-client-ip": input.clientIp } : {}),
        },
        body: JSON.stringify({ idea: input.idea, who_for: input.whoFor }),
        signal: AbortSignal.timeout(15_000),
      });
      if (response.status === 429) return { ok: false, reason: "limited" };
      if (!response.ok) return { ok: false, reason: "unavailable" };
      const body = (await response.json()) as { continue_url: string; ori_says: string; expires_in_minutes: number };
      return {
        ok: true,
        handoff: { continueUrl: body.continue_url, oriSays: body.ori_says, expiresInMinutes: body.expires_in_minutes },
      };
    },
  };
}

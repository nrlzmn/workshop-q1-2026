import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Env }>();

app.use("/*", cors());

app.post("/api/workers-ai", async (c) => {
	try {
		const { prompt } = await c.req.json();
		console.log('[Workers AI] Request received:', { prompt });
		
		const messages = [
			{ role: "system", content: "You are a helpful assistant" },
			{ role: "user", content: prompt }
		];

		const response = await c.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
			messages
		});

		console.log('[Workers AI] Response:', JSON.stringify(response));
		return c.json(response);
	} catch (error) {
		console.error('[Workers AI] Error:', error);
		return c.json({ error: String(error) }, 500);
	}
});

app.post("/api/ai-gateway", async (c) => {
	try {
		const { prompt } = await c.req.json();
		const accountId = c.env.CLOUDFLARE_ACCOUNT_ID;
		const gatewayId = c.env.AI_GATEWAY_ID;
		const apiTokenAIG = c.env.AI_GATEWAY_AUTH_TOKEN;
		
		console.log('[AI Gateway] Request received:', { prompt, accountId, gatewayId, hasAIGToken: !!apiTokenAIG });
		
		const messages = [
			{ role: "system", content: "You are a helpful assistant" },
			{ role: "user", content: prompt }
		];

		const requestBody = {
			model: "workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast",
			messages
		};

		const url = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/compat/chat/completions`;
		console.log('[AI Gateway] Fetching URL:', url);
		console.log('[AI Gateway] Request body:', JSON.stringify(requestBody));

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"cf-aig-authorization": `Bearer ${apiTokenAIG}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(requestBody)
		});

		console.log('[AI Gateway] Response status:', response.status, response.statusText);
		console.log('[AI Gateway] Response headers:', Object.fromEntries(response.headers.entries()));

		const data = await response.json() as Record<string, any>;
		console.log('[AI Gateway] Response data:', JSON.stringify(data));
		
		const headersObj = {
			'cf-ai-req-id': response.headers.get('cf-ai-req-id'),
			'cf-aig-cache-status': response.headers.get('cf-aig-cache-status'),
			'cf-aig-event-id': response.headers.get('cf-aig-event-id'),
			'cf-aig-log-id': response.headers.get('cf-aig-log-id'),
			'cf-aig-step': response.headers.get('cf-aig-step'),
		};
		
		return c.json({ ...data, headers: headersObj });
	} catch (error) {
		console.error('[AI Gateway] Error:', error);
		return c.json({ error: String(error) }, 500);
	}
});

app.get("/api/gateway-metrics", async (c) => {
	try {
		const accountId = c.env.CLOUDFLARE_ACCOUNT_ID;
		const gatewayId = c.env.AI_GATEWAY_ID;
		const apiToken = c.env.AI_GATEWAY_AUTH_TOKEN;

		if (!apiToken) {
			return c.json({ 
				id: gatewayId,
				cache_ttl: 0,
				collect_logs: true,
				rate_limiting_limit: 0,
				rate_limiting_interval: 0,
				log_management: 0
			});
		}

		const response = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai-gateway/gateways/${gatewayId}`,
			{
				headers: {
					"Authorization": `Bearer ${apiToken}`,
					"Content-Type": "application/json",
				}
			}
		);

		const data = await response.json() as {
			success?: boolean;
			result?: {
				id?: string;
				cache_ttl?: number;
				collect_logs?: boolean;
				rate_limiting_limit?: number;
				rate_limiting_interval?: number;
				log_management?: number;
			};
		};
		
		if (data.success && data.result) {
			return c.json({
				id: data.result.id,
				cache_ttl: data.result.cache_ttl,
				collect_logs: data.result.collect_logs,
				rate_limiting_limit: data.result.rate_limiting_limit,
				rate_limiting_interval: data.result.rate_limiting_interval,
				log_management: data.result.log_management
			});
		}

		return c.json({ 
			id: gatewayId,
			cache_ttl: 0,
			collect_logs: true,
			rate_limiting_limit: 0,
			rate_limiting_interval: 0,
			log_management: 0
		});
	} catch (error) {
		return c.json({ error: String(error) }, 500);
	}
});

export default app;

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	prod_d1_tutorial: D1Database;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const { pathname } = new URL(request.url);

		if (pathname === '/api/beverages') {
			const { results } = await env.prod_d1_tutorial.prepare('SELECT * FROM Customers WHERE CompanyName = ?').bind('Bs Beverages').run();
			return Response.json(results);
		}

		return new Response('Call /api/beverages to see everyone who works at Bs Beverages');
	},
} satisfies ExportedHandler<Env>;

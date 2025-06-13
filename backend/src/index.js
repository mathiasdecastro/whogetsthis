export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const {pathname} = url;

		await setupDB(env.DB);

		if (pathname === '/items' && request.method === 'GET') {
			const items = await env.DB.prepare('SELECT * FROM items').all();

			return new Response(JSON.stringify(items.results), {
				headers: {"Content-Type": "application/json"},
			});
		}

		if (pathname === '/items' && request.method === 'POST') {
			try {
				const data = await request.json();

				if (!data.name)
					return new Response('Missing "name" field', { status: 400 });

				await env.DB.prepare(`INSERT INTO items (name) VALUES (?)`).bind(data.name).run();

				return new Response("Item created", {status: 200});
			} catch {
				return new Response('Invalid JSON', {status: 400});
			}
		}

		if (pathname === '/items' && request.method === 'DELETE') {
			const id = pathname.split('/').slice(2);

			if (!id)
				return new Response('Missing id', { status: 400 });

			await env.DB.prepare(`DELETE FROM items WHERE id = ?`).bind(id).run();

			return new Response("Item deleted", {status: 200});
		}

		return new Response('Not Found', {status: 404});
	}
};

async function setupDB(db) {
	await db.prepare(`
		CREATE TABLE IF NOT EXISTS items (
			id INTEGER PRIMARY KEY,
			name TEXT NOT NULL
		)
	`).run();
}

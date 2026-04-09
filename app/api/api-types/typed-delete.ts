import type { apiEndpoints, ApiPath } from "../api-types/end-points";

export async function typedDelete<K extends ApiPath>(
	path: K,
	body?: unknown
): Promise<apiEndpoints[K]> {
	const res = await fetch(`/api/${path}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body: body === undefined ? undefined : JSON.stringify(body),
	});

	if (!res.ok) {
		throw new Error("API error");
	}

	return res.json();
}

import type { apiEndpoints, ApiPath } from "../api-types/end-points";

export async function typedPost<K extends ApiPath>(
    path: K,
    body?: unknown
): Promise<apiEndpoints[K]> {
    const res = await fetch(`/api/${path}`, {
        method: "POST",
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

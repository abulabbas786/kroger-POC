import type { apiEndpoints, ApiPath } from "../api-types/end-points";

export async function typedFetch<K extends ApiPath>(
    path: K,
    params?: any
): Promise<apiEndpoints[K]> {
    const query = params
        ? "?" + new URLSearchParams(params).toString()
        : "";

    const res = await fetch(`/api/${path}${query}`);

    if (!res.ok) {
        const errorText = (await res.text()).trim();
        throw new Error(errorText || `API error (${res.status})`);
    }

    return res.json();
}

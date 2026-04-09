import * as customerService from "../services/customerService";

export async function loader({ request }: any) {
    try {
        const url = new URL(request.url);
        const name = url.searchParams.get("name") ?? undefined;

        const customers = await customerService.list(name);
        return Response.json(customers);
    } catch (error: any) {
        return Response.json({ error: error?.message ?? "Server error" }, { status: 500 });
    }
}

export async function action({ request }: any) {
    try {
    if (request.method === "POST") {
        const body = await request.json().catch(() => null);
        const name = body?.name?.toString().trim();

        if (!name) {
            return Response.json({ error: "Invalid payload" }, { status: 400 });
        }

        await customerService.create(name);
        return Response.json({ success: true });
    }

    if (request.method === "PUT") {
        const body = await request.json().catch(() => null);
        const id = Number(body?.id);
        const name = body?.name?.toString().trim();

        if (!Number.isInteger(id) || id <= 0 || !name) {
            return Response.json({ error: "Invalid payload" }, { status: 400 });
        }

        await customerService.update(id, name);

        return Response.json({ success: true });
    }

    if (request.method === "DELETE") {
        const body = await request.json().catch(() => null);
        const id = Number(body?.id);

        if (!Number.isInteger(id) || id <= 0) {
            return Response.json({ error: "Invalid id" }, { status: 400 });
        }

        await customerService.remove(id);

        return Response.json({ success: true });
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 });
    } catch (error: any) {
        return Response.json({ error: error?.message ?? "Server error" }, { status: 500 });
    }
}
import { useState } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import { typedFetch } from "../api/api-types/typed-Fetch";
import { typedDelete } from "../api/api-types/typed-delete";
import { typedPost } from "../api/api-types/typed-post";
import { typedPut } from "~/api/api-types/typed-put";


export async function clientLoader({ request }: any) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name")?.trim();

  try {
    const customers = await typedFetch("customers", name ? { name } : undefined);
    if (!customers || customers.length === 0) {
      return { customers: [], notFound: true, error: "" };
    }

    return { customers, notFound: false, error: "" };
  } catch (error: any) {
    return {
      customers: [],
      notFound: false,
      error: error?.message ?? "Unable to load customers right now."
    };
  }
}

export default function Welcome() {
  const { customers, notFound, error } = useLoaderData() as any;
  const revalidator = useRevalidator();
  const [editedName, setEditedName] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const onEdit = (id: number, name: string) => {
    setSelectedCustomerId(id);
    setEditedName(name);
  };

  const onUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCustomerId || !editedName.trim()) {
      return;
    }

    await typedPut("customers", { id: selectedCustomerId, name: editedName.trim() });
    setEditedName("");
    setSelectedCustomerId(null);
    revalidator.revalidate();
  };

  const onAdd = async () => {
    if (!editedName.trim()) {
      return;
    }

    await typedPost("customers", { name: editedName.trim() });
    setEditedName("");
    setSelectedCustomerId(null);
    revalidator.revalidate();
  };

  const onDelete = async (id: number) => {
    await typedDelete("customers", { id });

    if (selectedCustomerId === id) {
      setSelectedCustomerId(null);
      setEditedName("");
    }

    revalidator.revalidate();
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <section className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 rounded-2xl bg-white p-4 shadow-md">
        <form onSubmit={onUpdate} className="flex w-full items-center gap-3">
          <input
            type="text"
            placeholder="Edit name"
            value={editedName}
            onChange={(event) => setEditedName(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Update
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
          >
            Add
          </button>
        </form>
        {
          notFound && <p style={{ color: "red" }}>No Customer Found</p>
        }
        {
          error && <p style={{ color: "red" }}>{error}</p>
        }
        {customers.map((c: any) => (
          <div key={c.id} className="flex w-full justify-between gap-2">
            <div className="text-black">{c.name}</div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => onEdit(c.id, c.name)} className="rounded-lg bg-blue-400 px-3 py-2 font-semibold text-white hover:bg-blue-700">Edit</button>
              <button type="button" onClick={() => onDelete(c.id)} className="rounded-lg bg-red-500 px-3 py-2 font-semibold text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        ))}
      </section>

    </main >

  );
}



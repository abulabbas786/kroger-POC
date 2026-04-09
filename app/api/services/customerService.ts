import { query } from '../db.js';

export interface Customer {
  id: number;
  name: string;
}

export async function list(name?: string): Promise<Customer[]> {
  let sql = 'SELECT id, name FROM "user" ORDER BY id ASC';
  const params: any[] = [];

  if (name) {
    sql = 'SELECT id, name FROM "user" WHERE name ILIKE $1 ORDER BY id ASC';
    params.push(`%${name}%`);
  }

  const result = await query<Customer>(sql, params);
  return result.rows;
}

export async function create(name: string): Promise<Customer> {
  if (!name || name.trim() === '') {
    throw new Error('Name is required');
  }

  const sql = 'INSERT INTO "user" (name) VALUES ($1) RETURNING id, name';
  const result = await query<Customer>(sql, [name.trim()]);
  return result.rows[0];
}

export async function update(id: number, name: string): Promise<Customer> {
  if (!id || !name || name.trim() === '') {
    throw new Error('ID and name are required');
  }

  const sql = 'UPDATE "user" SET name = $1 WHERE id = $2 RETURNING id, name';
  const result = await query<Customer>(sql, [name.trim(), id]);

  if (result.rows.length === 0) {
    throw new Error(`Customer with ID ${id} not found`);
  }

  return result.rows[0];
}

export async function remove(id: number): Promise<void> {
  if (!id) {
    throw new Error('ID is required');
  }

  const sql = 'DELETE FROM "user" WHERE id = $1';
  const result = await query(sql, [id]);

  if (result.rowCount === 0) {
    throw new Error(`Customer with ID ${id} not found`);
  }
}
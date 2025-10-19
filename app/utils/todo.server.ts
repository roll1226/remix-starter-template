// app/utils/todo.server.ts
import type { D1Database } from "@cloudflare/workers-types";
import {
  convertD1RowsToTodos,
  convertD1RowToTodo,
  validateCreateTodo,
  validateTodoId,
  validateUpdateTodo,
  type D1TodoRow,
} from "~/schemas/todo";
import {
  deleteTodoById,
  fetchAllTodos,
  fetchTodoById,
  insertTodo,
  updateTodoById,
} from "~/utils/db.server";

export async function getAllTodos(db: D1Database) {
  const rows = await fetchAllTodos(db);
  return convertD1RowsToTodos(rows as unknown as D1TodoRow[]);
}

export async function getTodoDetail(db: D1Database, idStr: string) {
  const paramValidation = validateTodoId({ id: idStr });
  if (!paramValidation.success) return { error: "Invalid TodoId", status: 400 };

  const id = paramValidation.data.id;
  const rows = await fetchTodoById(db, id);
  if (rows.length === 0) return { error: "Todo not found", status: 404 };

  return convertD1RowToTodo(rows[0] as unknown as D1TodoRow);
}

export async function createTodo(db: D1Database, body: unknown) {
  const validation = validateCreateTodo(body);
  if (!validation.success)
    return {
      error: "Validation failed",
      details: validation.error.format(),
      status: 400,
    };

  const { Title, IsComplete } = validation.data;
  const rows = await insertTodo(db, Title, IsComplete);
  return convertD1RowToTodo(rows[0] as unknown as D1TodoRow);
}

export async function updateTodo(db: D1Database, idStr: string, body: unknown) {
  const paramValidation = validateTodoId({ id: idStr });
  if (!paramValidation.success)
    return {
      error: "Invalid TodoId",
      details: paramValidation.error.format(),
      status: 400,
    };

  const validation = validateUpdateTodo(body);
  if (!validation.success)
    return {
      error: "Validation failed",
      details: validation.error.format(),
      status: 400,
    };

  const { Title, IsComplete } = validation.data;
  const id = paramValidation.data.id;
  const rows = await updateTodoById(db, id, { Title, IsComplete });

  if (!rows?.length) return { error: "Todo not found", status: 404 };
  return convertD1RowToTodo(rows[0] as unknown as D1TodoRow);
}

export async function deleteTodo(db: D1Database, idStr: string) {
  const paramValidation = validateTodoId({ id: idStr });
  if (!paramValidation.success)
    return {
      error: "Invalid TodoId",
      details: paramValidation.error.format(),
      status: 400,
    };

  const id = paramValidation.data.id;
  const rows = await fetchTodoById(db, id);
  if (rows.length === 0) return { error: "Todo not found", status: 404 };

  await deleteTodoById(db, id);
  return { message: "Todo deleted successfully" };
}

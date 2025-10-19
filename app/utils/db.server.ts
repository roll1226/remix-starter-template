import type { D1Database } from "@cloudflare/workers-types";

// todo.server.tsで使用される低レベルデータベース関数

export async function fetchAllTodos(
  db: D1Database
): Promise<Record<string, unknown>[]> {
  const { results } = await db
    .prepare("SELECT * FROM Todos ORDER BY TodoId")
    .run();
  return results;
}

export async function fetchTodoById(
  db: D1Database,
  id: number
): Promise<Record<string, unknown>[]> {
  const { results } = await db
    .prepare("SELECT * FROM Todos WHERE TodoId = ?")
    .bind(id)
    .run();
  return results;
}

export async function insertTodo(
  db: D1Database,
  title: string,
  isComplete: boolean
): Promise<Record<string, unknown>[]> {
  const { results } = await db
    .prepare("INSERT INTO Todos (Title, IsComplete) VALUES (?, ?) RETURNING *")
    .bind(title, isComplete ? 1 : 0)
    .run();
  return results;
}

export async function updateTodoById(
  db: D1Database,
  id: number,
  data: { Title?: string; IsComplete?: boolean }
): Promise<Record<string, unknown>[] | null> {
  const { Title, IsComplete } = data;

  // 更新フィールドを構築
  const updates = [];
  const binds = [];

  if (Title !== undefined) {
    updates.push("Title = ?");
    binds.push(Title);
  }

  if (IsComplete !== undefined) {
    updates.push("IsComplete = ?");
    binds.push(IsComplete ? 1 : 0);
  }

  if (updates.length === 0) {
    // 更新するフィールドがない場合はnullを返す
    return null;
  }

  binds.push(id);

  const { results } = await db
    .prepare(
      `UPDATE Todos SET ${updates.join(", ")} WHERE TodoId = ? RETURNING *`
    )
    .bind(...binds)
    .run();

  return results;
}

export async function deleteTodoById(
  db: D1Database,
  id: number
): Promise<void> {
  await db.prepare("DELETE FROM Todos WHERE TodoId = ?").bind(id).run();
}

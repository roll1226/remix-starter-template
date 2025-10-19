"use strict";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import {
  convertD1RowsToTodos,
  convertD1RowToTodo,
  validateCreateTodo,
  validateTodoId,
  validateUpdateTodo,
  type D1TodoRow,
} from "~/schemas/todo";

// GET リクエストのハンドラー
export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = (context.cloudflare as any).env;
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // Todos一覧取得
    if (pathname === "/api/todos") {
      const { results } = await env.prod_d1_tutorial
        .prepare("SELECT * FROM Todos ORDER BY TodoId")
        .run();

      // D1結果を型安全に変換
      const validatedTodos = convertD1RowsToTodos(
        results as unknown as D1TodoRow[]
      );

      return json(validatedTodos);
    }

    // Todo詳細取得（TodoId指定）
    const todoDetailMatch = pathname.match(/^\/api\/todos\/(\d+)$/);
    if (todoDetailMatch) {
      // パラメータのバリデーション
      const paramValidation = validateTodoId({ id: todoDetailMatch[1] });
      if (!paramValidation.success) {
        return json(
          {
            error: "Invalid TodoId",
            details: paramValidation.error.format(),
          },
          { status: 400 }
        );
      }

      const todoId = paramValidation.data.id;

      const { results } = await env.prod_d1_tutorial
        .prepare("SELECT * FROM Todos WHERE TodoId = ?")
        .bind(todoId)
        .run();

      if (results.length === 0) {
        return json({ error: "Todo not found" }, { status: 404 });
      }

      // D1結果を型安全に変換
      const todo = convertD1RowToTodo(results[0] as unknown as D1TodoRow);

      return json(todo);
    }

    // Beverages（既存の処理）
    if (pathname === "/api/beverages") {
      const { results } = await env.prod_d1_tutorial
        .prepare("SELECT * FROM Customers WHERE CompanyName = ?")
        .bind("Bs Beverages")
        .run();

      return json(results);
    }

    return json({ message: "API endpoint not found" }, { status: 404 });
  } catch (error) {
    console.error("Database query failed:", error);
    return json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

// POST, PUT, DELETE などのリクエストのハンドラー
export async function action({ request, context }: ActionFunctionArgs) {
  const env = (context.cloudflare as any).env;
  const method = request.method;
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // Todo新規作成（POST）
    if (method === "POST" && pathname === "/api/todos") {
      const body = await request.json();

      // 共有Zodバリデーション
      const validationResult = validateCreateTodo(body);
      if (!validationResult.success) {
        return json(
          {
            error: "Validation failed",
            details: validationResult.error.format(),
          },
          { status: 400 }
        );
      }

      const { Title, IsComplete } = validationResult.data;

      const { results } = await env.prod_d1_tutorial
        .prepare(
          "INSERT INTO Todos (Title, IsComplete) VALUES (?, ?) RETURNING *"
        )
        .bind(Title, IsComplete ? 1 : 0)
        .run();

      // D1結果を型安全に変換
      const createdTodo = convertD1RowToTodo(
        results[0] as unknown as D1TodoRow
      );

      return json(createdTodo, { status: 201 });
    }

    // Todo更新（PUT）
    const todoUpdateMatch = pathname.match(/^\/api\/todos\/(\d+)$/);
    if (method === "PUT" && todoUpdateMatch) {
      const todoId = parseInt(todoUpdateMatch[1], 10);

      // パラメータのバリデーション
      const paramValidation = validateTodoId({ id: todoUpdateMatch[1] });
      if (!paramValidation.success) {
        return json(
          {
            error: "Invalid TodoId",
            details: paramValidation.error.format(),
          },
          { status: 400 }
        );
      }

      const body = await request.json();

      // リクエストボディのバリデーション
      const validationResult = validateUpdateTodo(body);
      if (!validationResult.success) {
        return json(
          {
            error: "Validation failed",
            details: validationResult.error.format(),
          },
          { status: 400 }
        );
      }

      const { Title, IsComplete } = validationResult.data;

      // 既存のTodoが存在するかチェック
      const { results: existingTodo } = await env.prod_d1_tutorial
        .prepare("SELECT * FROM Todos WHERE TodoId = ?")
        .bind(todoId)
        .run();

      if (existingTodo.length === 0) {
        return json({ error: "Todo not found" }, { status: 404 });
      }

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

      binds.push(todoId);

      const { results } = await env.prod_d1_tutorial
        .prepare(
          `UPDATE Todos SET ${updates.join(", ")} WHERE TodoId = ? RETURNING *`
        )
        .bind(...binds)
        .run();

      // D1結果を型安全に変換
      const updatedTodo = convertD1RowToTodo(
        results[0] as unknown as D1TodoRow
      );

      return json(updatedTodo);
    }

    // Todo物理削除（DELETE）
    const todoDeleteMatch = pathname.match(/^\/api\/todos\/(\d+)$/);
    if (method === "DELETE" && todoDeleteMatch) {
      // パラメータのバリデーション
      const paramValidation = validateTodoId({ id: todoDeleteMatch[1] });
      if (!paramValidation.success) {
        return json(
          {
            error: "Invalid TodoId",
            details: paramValidation.error.format(),
          },
          { status: 400 }
        );
      }

      const todoId = paramValidation.data.id;

      // 既存のTodoが存在するかチェック
      const { results: existingTodo } = await env.prod_d1_tutorial
        .prepare("SELECT * FROM Todos WHERE TodoId = ?")
        .bind(todoId)
        .run();

      if (existingTodo.length === 0) {
        return json({ error: "Todo not found" }, { status: 404 });
      }

      await env.prod_d1_tutorial
        .prepare("DELETE FROM Todos WHERE TodoId = ?")
        .bind(todoId)
        .run();

      return json({ message: "Todo deleted successfully" });
    }

    return json(
      { method, pathname, message: "Action not implemented" },
      { status: 501 }
    );
  } catch (error) {
    console.error("Action failed:", error);
    return json({ error: "Action failed" }, { status: 500 });
  }
}

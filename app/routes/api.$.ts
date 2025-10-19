import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import {
  validateCreateTodo,
  validateTodoId,
  validateUpdateTodo,
  type Todo,
} from "~/schemas/todo";

// GET リクエストのハンドラー
export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // Todos一覧取得
    if (pathname === "/api/todos") {
      const { results } = await env.prod_d1_tutorial
        .prepare("SELECT * FROM Todos ORDER BY TodoId")
        .run();

      // レスポンスデータの型安全化
      const validatedTodos: Todo[] = (results as any[]).map((todo) => ({
        TodoId: todo.TodoId,
        Title: todo.Title,
        IsComplete: Boolean(todo.IsComplete),
      }));

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

      // レスポンスデータの型安全化
      const todo = results[0] as any;
      const validatedTodo: Todo = {
        TodoId: todo.TodoId,
        Title: todo.Title,
        IsComplete: Boolean(todo.IsComplete),
      };

      return json(validatedTodo);
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
  const env = context.cloudflare.env;
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

      // レスポンスデータの型安全化
      const createdTodo = results[0] as any;
      const validatedTodo: Todo = {
        TodoId: createdTodo.TodoId,
        Title: createdTodo.Title,
        IsComplete: Boolean(createdTodo.IsComplete),
      };

      return json(validatedTodo, { status: 201 });
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

      // レスポンスデータの型安全化
      const updatedTodo = results[0] as any;
      const validatedTodo: Todo = {
        TodoId: updatedTodo.TodoId,
        Title: updatedTodo.Title,
        IsComplete: Boolean(updatedTodo.IsComplete),
      };

      return json(validatedTodo);
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

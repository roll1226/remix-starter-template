// app/routes/api.todos.ts
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import {
  createTodo,
  deleteTodo,
  getAllTodos,
  getTodoDetail,
  updateTodo,
} from "~/utils/todo.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.prod_d1_tutorial;
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname === "/api/todos") {
    const todos = await getAllTodos(db);
    return json(todos);
  }

  const match = pathname.match(/^\/api\/todos\/(\d+)$/);
  if (match) {
    const todo = await getTodoDetail(db, match[1]);
    if ("error" in todo) return json(todo, { status: todo.status });
    return json(todo);
  }

  return json({ error: "Not found" }, { status: 404 });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const db = context.cloudflare.env.prod_d1_tutorial;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  if (method === "POST" && pathname === "/api/todos") {
    const body = await request.json();
    const result = await createTodo(db, body);
    if ("error" in result) return json(result, { status: result.status });
    return json(result, { status: 201 });
  }

  const match = pathname.match(/^\/api\/todos\/(\d+)$/);
  if (!match) return json({ error: "Not found" }, { status: 404 });

  const id = match[1];

  if (method === "PUT") {
    const body = await request.json();
    const result = await updateTodo(db, id, body);
    if ("error" in result) return json(result, { status: result.status });
    return json(result);
  }

  if (method === "DELETE") {
    const result = await deleteTodo(db, id);
    if ("error" in result) return json(result, { status: result.status });
    return json(result);
  }

  return json({ error: "Unsupported method" }, { status: 405 });
}

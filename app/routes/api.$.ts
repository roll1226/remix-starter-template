import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";

// GET リクエストのハンドラー
export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
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
    // ここで必要に応じて他のCRUD操作を実装
    return json(
      { method, pathname, message: "Action not implemented yet" },
      { status: 501 }
    );
  } catch (error) {
    console.error("Action failed:", error);
    return json({ error: "Action failed" }, { status: 500 });
  }
}

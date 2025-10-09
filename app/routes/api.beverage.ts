import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;

  try {
    const { results } = await env.prod_d1_tutorial
      .prepare("SELECT * FROM Customers WHERE CompanyName = ?")
      .bind("Bs Beverages")
      .run();

    return json(results);
  } catch (error) {
    console.error("Database query failed:", error);
    return json({ error: "Failed to fetch beverages" }, { status: 500 });
  }
}

import {
  CreateTodoInput,
  Todo,
  TodoCreateResponseSchema,
  TodoDeleteResponseSchema,
  TodoListResponseSchema,
  TodoUpdateResponseSchema,
  UpdateTodoInput,
} from "~/schemas/todo";

// APIクライアントクラス
export class TodoApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Todos一覧取得
  async getTodos(): Promise<Todo[]> {
    const response = await fetch(`${this.baseUrl}/api/todos`);

    if (!response.ok) {
      throw new Error(`Failed to fetch todos: ${response.status}`);
    }

    const rawData = await response.json();
    const validationResult = TodoListResponseSchema.safeParse(rawData);

    if (!validationResult.success) {
      throw new Error("Invalid API response format");
    }

    return validationResult.data;
  }

  // Todo作成
  async createTodo(data: CreateTodoInput): Promise<Todo> {
    const response = await fetch(`${this.baseUrl}/api/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error((errorData as any)?.error || "Failed to create todo");
    }

    const rawData = await response.json();
    const validationResult = TodoCreateResponseSchema.safeParse(rawData);

    if (!validationResult.success) {
      throw new Error("Invalid API response format");
    }

    return validationResult.data;
  }

  // Todo更新
  async updateTodo(id: number, data: UpdateTodoInput): Promise<Todo> {
    const response = await fetch(`${this.baseUrl}/api/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error((errorData as any)?.error || "Failed to update todo");
    }

    const rawData = await response.json();
    const validationResult = TodoUpdateResponseSchema.safeParse(rawData);

    if (!validationResult.success) {
      throw new Error("Invalid API response format");
    }

    return validationResult.data;
  }

  // Todo削除
  async deleteTodo(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/todos/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error((errorData as any)?.error || "Failed to delete todo");
    }

    const rawData = await response.json();
    const validationResult = TodoDeleteResponseSchema.safeParse(rawData);

    if (!validationResult.success) {
      throw new Error("Invalid API response format");
    }
  }
}

// ヘルパー関数: URLからAPIクライアントを作成
export const createTodoApiClient = (request: Request): TodoApiClient => {
  const url = new URL(request.url);
  return new TodoApiClient(url.origin);
};

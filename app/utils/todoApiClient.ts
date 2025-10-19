import type { D1Database } from "@cloudflare/workers-types";
import {
  CreateTodoInput,
  ErrorResponse,
  Todo,
  UpdateTodoInput,
} from "~/schemas/todo";
import {
  createTodo as createTodoServer,
  deleteTodo as deleteTodoServer,
  getAllTodos,
  getTodoDetail,
  updateTodo as updateTodoServer,
} from "~/utils/todo.server";

// 直接データベース操作クライアントクラス
export class TodoApiClient {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  // エラーレスポンスの型ガード
  private isErrorResponse = (data: unknown): data is ErrorResponse => {
    return typeof data === "object" && data !== null && "error" in data;
  };

  // Todos一覧取得
  async getTodos(): Promise<Todo[]> {
    try {
      const result = await getAllTodos(this.db);
      return result;
    } catch (error) {
      console.error("Failed to get todos:", error);
      throw new Error("Failed to fetch todos");
    }
  }

  // Todo詳細取得
  async getTodoById(id: number): Promise<Todo> {
    try {
      const result = await getTodoDetail(this.db, id.toString());

      if ("error" in result) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error("Failed to get todo:", error);
      throw new Error("Failed to fetch todo");
    }
  }

  // Todo作成
  async createTodo(data: CreateTodoInput): Promise<Todo> {
    try {
      const result = await createTodoServer(this.db, data);

      if ("error" in result) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error("Failed to create todo:", error);
      throw new Error("Failed to create todo");
    }
  }

  // Todo更新
  async updateTodo(id: number, data: UpdateTodoInput): Promise<Todo> {
    try {
      const result = await updateTodoServer(this.db, id.toString(), data);

      if ("error" in result) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error("Failed to update todo:", error);
      throw new Error("Failed to update todo");
    }
  }

  // Todo削除
  async deleteTodo(id: number): Promise<void> {
    try {
      const result = await deleteTodoServer(this.db, id.toString());

      if ("error" in result) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to delete todo:", error);
      throw new Error("Failed to delete todo");
    }
  }
}

// ヘルパー関数: D1DatabaseからAPIクライアントを作成
export const createTodoApiClient = (db: D1Database): TodoApiClient => {
  return new TodoApiClient(db);
};

// レガシー: Requestから context経由でAPIクライアントを作成（後方互換性）
export const createTodoApiClientFromContext = (context: any): TodoApiClient => {
  const db = context.cloudflare.env.prod_d1_tutorial;
  return new TodoApiClient(db);
};

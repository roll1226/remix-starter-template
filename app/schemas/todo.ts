import { z } from "zod";

// ===============================
// 共有Zodスキーマ定義
// ===============================

// Todo基本スキーマ
export const TodoSchema = z.object({
  TodoId: z.number().int().positive(),
  Title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(255, "タイトルは255文字以内で入力してください"),
  IsComplete: z.boolean(),
});

// Todo作成用スキーマ
export const CreateTodoSchema = z.object({
  Title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(255, "タイトルは255文字以内で入力してください"),
  IsComplete: z.boolean().optional().default(false),
});

// Todo更新用スキーマ（部分更新対応）
export const UpdateTodoSchema = z
  .object({
    Title: z
      .string()
      .min(1, "タイトルは必須です")
      .max(255, "タイトルは255文字以内で入力してください")
      .optional(),
    IsComplete: z.boolean().optional(),
  })
  .refine(
    (data) => data.Title !== undefined || data.IsComplete !== undefined,
    "少なくとも1つのフィールドを更新する必要があります"
  );

// TodoIDパラメータスキーマ
export const TodoIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "IDは数値である必要があります")
    .transform(Number),
});

// ===============================
// D1データベース結果型
// ===============================

// D1から返される生のTodoデータの型
export interface D1TodoRow {
  TodoId: number;
  Title: string;
  IsComplete: number; // SQLiteはboolean値を0/1で保存
}

// ===============================
// エラーレスポンススキーマ
// ===============================

export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z
    .union([
      z.string(),
      z.record(z.string(), z.unknown()),
      z.array(z.unknown()),
    ])
    .optional(),
});

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// ===============================
// APIレスポンススキーマ
// ===============================

// Todo一覧レスポンス
export const TodoListResponseSchema = z.array(TodoSchema);

// Todo詳細レスポンス
export const TodoDetailResponseSchema = TodoSchema;

// Todo作成レスポンス
export const TodoCreateResponseSchema = TodoSchema;

// Todo更新レスポンス
export const TodoUpdateResponseSchema = TodoSchema;

// Todo削除レスポンス
export const TodoDeleteResponseSchema = z.object({
  message: z.string(),
});

// ===============================
// 型エクスポート
// ===============================

export type Todo = z.infer<typeof TodoSchema>;
export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;
export type TodoIdParam = z.infer<typeof TodoIdParamSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

// APIレスポンス型
export type TodoListResponse = z.infer<typeof TodoListResponseSchema>;
export type TodoDetailResponse = z.infer<typeof TodoDetailResponseSchema>;
export type TodoCreateResponse = z.infer<typeof TodoCreateResponseSchema>;
export type TodoUpdateResponse = z.infer<typeof TodoUpdateResponseSchema>;
export type TodoDeleteResponse = z.infer<typeof TodoDeleteResponseSchema>;

// ===============================
// D1結果変換ヘルパー関数
// ===============================

// D1の生データをTodo型に変換
export const convertD1RowToTodo = (row: D1TodoRow): Todo => ({
  TodoId: row.TodoId,
  Title: row.Title,
  IsComplete: Boolean(row.IsComplete),
});

// 複数のD1行をTodo配列に変換
export const convertD1RowsToTodos = (rows: D1TodoRow[]): Todo[] =>
  rows.map(convertD1RowToTodo);

// ===============================
// バリデーションヘルパー関数
// ===============================

export const validateTodo = (data: unknown) => TodoSchema.safeParse(data);
export const validateCreateTodo = (data: unknown) =>
  CreateTodoSchema.safeParse(data);
export const validateUpdateTodo = (data: unknown) =>
  UpdateTodoSchema.safeParse(data);
export const validateTodoId = (data: unknown) =>
  TodoIdParamSchema.safeParse(data);

// ===============================
// フォームデータ変換ヘルパー
// ===============================

export const formDataToCreateTodo = (formData: FormData): CreateTodoInput => {
  const title = formData.get("title") as string;
  const isComplete = formData.get("isComplete") === "true";

  return {
    Title: title?.trim() || "",
    IsComplete: isComplete,
  };
};

export const formDataToUpdateTodo = (
  formData: FormData
): Partial<UpdateTodoInput> => {
  const title = formData.get("title") as string;
  const isComplete = formData.get("isComplete");

  const updateData: Partial<UpdateTodoInput> = {};

  if (title !== null && title !== undefined) {
    updateData.Title = title.trim();
  }

  if (isComplete !== null && isComplete !== undefined) {
    updateData.IsComplete = isComplete === "true";
  }

  return updateData;
};

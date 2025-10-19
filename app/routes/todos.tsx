import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { ErrorMessage } from "~/components/ErrorMessage";
import { ThemeToggle } from "~/components/ThemeToggle";
import { TodoCreateForm } from "~/components/TodoCreateForm";
import { TodoList } from "~/components/TodoList";
import { TodoStats } from "~/components/TodoStats";
import { useTodoManagement } from "~/hooks/useTodoManagement";
import {
  type CreateTodoInput,
  type UpdateTodoInput,
  validateCreateTodo,
} from "~/schemas/todo";
import {
  createTodo as createTodoServer,
  deleteTodo as deleteTodoServer,
  getAllTodos,
  updateTodo as updateTodoServer,
} from "~/utils/todo.server";

// todos一覧を取得
export async function loader({ context }: LoaderFunctionArgs) {
  try {
    const db = context.cloudflare.env.prod_d1_tutorial;
    const todos = await getAllTodos(db);
    return json({ todos });
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    return json({ todos: [], error: "Failed to fetch todos" });
  }
}

// ActionでCRUD操作を処理（直接データベース関数を呼び出し）
export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const db = context.cloudflare.env.prod_d1_tutorial;

  try {
    switch (intent) {
      case "create": {
        const title = formData.get("title") as string;
        if (!title?.trim()) {
          return json({ error: "タイトルは必須です" }, { status: 400 });
        }

        const createData: CreateTodoInput = {
          Title: title.trim(),
          IsComplete: false,
        };

        const validationResult = validateCreateTodo(createData);
        if (!validationResult.success) {
          return json({ error: "入力データが無効です" }, { status: 400 });
        }

        const createdTodo = await createTodoServer(db, validationResult.data);
        return json({ success: true, todo: createdTodo });
      }

      case "toggle": {
        const todoId = formData.get("todoId") as string;
        const isComplete = formData.get("isComplete") === "true";

        const updateData: UpdateTodoInput = {
          IsComplete: !isComplete,
        };

        await updateTodoServer(db, todoId, updateData);
        return json({ success: true });
      }

      case "delete": {
        const todoId = formData.get("todoId") as string;
        await deleteTodoServer(db, todoId);
        return json({ success: true });
      }

      case "update": {
        const todoId = formData.get("todoId") as string;
        const title = formData.get("title") as string;

        if (!title?.trim()) {
          return json({ error: "タイトルは必須です" }, { status: 400 });
        }

        const updateData: UpdateTodoInput = {
          Title: title.trim(),
        };

        await updateTodoServer(db, todoId, updateData);
        return json({ success: true });
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Action failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "操作に失敗しました";
    return json({ error: errorMessage }, { status: 500 });
  }
}

export default function TodosPage() {
  const { todos } = useLoaderData<typeof loader>();
  const {
    editingId,
    editTitle,
    setEditTitle,
    isSubmitting,
    handleEdit,
    handleCancelEdit,
    errorMessage,
  } = useTodoManagement();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <ThemeToggle />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-200">
          Todo管理
        </h1>

        {errorMessage && <ErrorMessage message={errorMessage} />}

        <TodoCreateForm isSubmitting={isSubmitting} />

        <TodoList
          todos={todos}
          editingId={editingId}
          editTitle={editTitle}
          onEdit={handleEdit}
          onCancelEdit={handleCancelEdit}
          onEditTitleChange={setEditTitle}
        />

        <TodoStats todos={todos} />
      </div>
    </div>
  );
}

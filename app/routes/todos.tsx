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
import { createTodoApiClient } from "~/utils/todoApiClient";

// APIからtodos一覧を取得
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const apiClient = createTodoApiClient(request);
    const todos = await apiClient.getTodos();
    return json({ todos });
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    return json({ todos: [], error: "Failed to fetch todos" });
  }
}

// ActionでAPI経由でCRUD操作を処理
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const apiClient = createTodoApiClient(request);

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

        const createdTodo = await apiClient.createTodo(validationResult.data);
        return json({ success: true, todo: createdTodo });
      }

      case "toggle": {
        const todoId = parseInt(formData.get("todoId") as string);
        const isComplete = formData.get("isComplete") === "true";

        const updateData: UpdateTodoInput = {
          IsComplete: !isComplete,
        };

        await apiClient.updateTodo(todoId, updateData);
        return json({ success: true });
      }

      case "delete": {
        const todoId = parseInt(formData.get("todoId") as string);
        await apiClient.deleteTodo(todoId);
        return json({ success: true });
      }

      case "update": {
        const todoId = parseInt(formData.get("todoId") as string);
        const title = formData.get("title") as string;

        if (!title?.trim()) {
          return json({ error: "タイトルは必須です" }, { status: 400 });
        }

        const updateData: UpdateTodoInput = {
          Title: title.trim(),
        };

        await apiClient.updateTodo(todoId, updateData);
        return json({ success: true });
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Action failed:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "ネットワークエラーが発生しました";
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

import { useFetcher } from "@remix-run/react";
import { type Todo } from "~/schemas/todo";

interface TodoItemProps {
  todo: Todo;
  isEditing: boolean;
  editTitle: string;
  onEdit: (todo: Todo) => void;
  onCancelEdit: () => void;
  onEditTitleChange: (title: string) => void;
}

export function TodoItem({
  todo,
  isEditing,
  editTitle,
  onEdit,
  onCancelEdit,
  onEditTitleChange,
}: TodoItemProps) {
  const fetcher = useFetcher();

  return (
    <div className="p-4 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      {/* 完了チェックボックス */}
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="toggle" />
        <input type="hidden" name="todoId" value={todo.TodoId} />
        <input
          type="hidden"
          name="isComplete"
          value={todo.IsComplete.toString()}
        />
        <button
          type="submit"
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
            todo.IsComplete
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500"
          }`}
        >
          {todo.IsComplete && "✓"}
        </button>
      </fetcher.Form>

      {/* タイトル編集 */}
      <div className="flex-1">
        {isEditing ? (
          <fetcher.Form method="post" className="flex gap-2">
            <input type="hidden" name="intent" value="update" />
            <input type="hidden" name="todoId" value={todo.TodoId} />
            <input
              type="text"
              name="title"
              value={editTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              autoFocus
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              保存
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              キャンセル
            </button>
          </fetcher.Form>
        ) : (
          <span
            className={`${
              todo.IsComplete
                ? "line-through text-gray-500 dark:text-gray-400"
                : "text-gray-800 dark:text-gray-200"
            }`}
          >
            {todo.Title}
          </span>
        )}
      </div>

      {/* アクションボタン */}
      <div className="flex gap-2">
        {!isEditing && (
          <button
            onClick={() => onEdit(todo)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            編集
          </button>
        )}

        <fetcher.Form method="post" style={{ display: "inline" }}>
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="todoId" value={todo.TodoId} />
          <button
            type="submit"
            onClick={(e) => {
              if (!confirm("このTodoを削除しますか？")) {
                e.preventDefault();
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            削除
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
}

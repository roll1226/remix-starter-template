import { type Todo } from "~/schemas/todo";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  editingId: number | null;
  editTitle: string;
  onEdit: (todo: Todo) => void;
  onCancelEdit: () => void;
  onEditTitleChange: (title: string) => void;
}

export function TodoList({
  todos,
  editingId,
  editTitle,
  onEdit,
  onCancelEdit,
  onEditTitleChange,
}: TodoListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg border dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Todoリスト ({todos.length}件)
        </h2>
      </div>

      {todos.length === 0 ? (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          Todoがありません。新しいTodoを追加してください。
        </div>
      ) : (
        <div>
          {todos.map((todo) => (
            <TodoItem
              key={todo.TodoId}
              todo={todo}
              isEditing={editingId === todo.TodoId}
              editTitle={editTitle}
              onEdit={onEdit}
              onCancelEdit={onCancelEdit}
              onEditTitleChange={onEditTitleChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

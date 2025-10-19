import { type Todo } from "~/schemas/todo";

interface TodoStatsProps {
  todos: Todo[];
}

export function TodoStats({ todos }: TodoStatsProps) {
  const completedCount = todos.filter((t) => t.IsComplete).length;
  const incompleteCount = todos.filter((t) => !t.IsComplete).length;

  return (
    <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {todos.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            総タスク数
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {completedCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">完了</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {incompleteCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">未完了</div>
        </div>
      </div>
    </div>
  );
}

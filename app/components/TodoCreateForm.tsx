import { Form } from "@remix-run/react";

interface TodoCreateFormProps {
  isSubmitting: boolean;
}

export function TodoCreateForm({ isSubmitting }: TodoCreateFormProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6 border dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        新しいTodoを追加
      </h2>
      <Form method="post" className="flex gap-4">
        <input type="hidden" name="intent" value="create" />
        <input
          type="text"
          name="title"
          placeholder="Todoのタイトルを入力..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
        >
          {isSubmitting ? "追加中..." : "追加"}
        </button>
      </Form>
    </div>
  );
}

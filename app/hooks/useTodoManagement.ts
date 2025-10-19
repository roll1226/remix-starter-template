import { useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { type ErrorResponse, type Todo } from "~/schemas/todo";

export function useTodoManagement() {
  const actionData = useActionData();
  const navigation = useNavigation();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const isSubmitting = navigation.state === "submitting";

  const handleEdit = (todo: Todo) => {
    setEditingId(todo.TodoId);
    setEditTitle(todo.Title);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  // エラーの型安全なチェック
  const isErrorResponse = (data: unknown): data is ErrorResponse => {
    return typeof data === "object" && data !== null && "error" in data;
  };

  const hasError = actionData && isErrorResponse(actionData);
  const errorMessage = hasError ? actionData.error : null;

  return {
    editingId,
    editTitle,
    setEditTitle,
    isSubmitting,
    handleEdit,
    handleCancelEdit,
    errorMessage,
  };
}

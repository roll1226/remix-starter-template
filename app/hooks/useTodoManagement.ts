import { useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { type Todo } from "~/schemas/todo";

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

  const hasError =
    actionData &&
    typeof actionData === "object" &&
    "error" in actionData &&
    actionData.error;
  const errorMessage = hasError ? (actionData as any).error : null;

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

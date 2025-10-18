import { useParams } from "@remix-run/react";

export default function TargetPage() {
  const { id } = useParams();
  return (
    <div style={{ textAlign: "center", padding: "3rem" }}>
      <h2>遷移先ページ ID: {id}</h2>
      <a href="/">戻る</a>
    </div>
  );
}

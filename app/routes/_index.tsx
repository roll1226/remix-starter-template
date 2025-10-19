import { Link } from "@remix-run/react";
import { ClickableImage } from "~/components/ClickableImage";

export default function Index() {
  return (
    <main style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Remix Starter Template</h1>

      <div
        style={{
          margin: "2rem 0",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <Link
          to="/todos"
          style={{
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            textDecoration: "none",
            fontSize: "1.1rem",
            fontWeight: "500",
            transition: "background-color 0.2s",
          }}
        >
          📝 Todo管理アプリ
        </Link>

        <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
          D1データベースと連携したTodo管理機能
        </p>
      </div>

      <hr style={{ margin: "3rem 0", borderColor: "#e5e7eb" }} />

      <h2>透過PNGクリックデモ</h2>
      <ClickableImage
        src="https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png"
        navigateTo="/target/1"
        alt="Clickable PNG"
      />
    </main>
  );
}

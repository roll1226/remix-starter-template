import { ClickableImage } from "~/components/ClickableImage";

export default function Index() {
  return (
    <main style={{ textAlign: "center", padding: "2rem" }}>
      <h1>透過PNGクリックデモ</h1>
      <ClickableImage
        src="https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png"
        navigateTo="/target/1"
        alt="Clickable PNG"
      />
    </main>
  );
}

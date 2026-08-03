export default function AboutPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050B18",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        padding: "40px",
      }}
    >
      <div style={{ maxWidth: "800px", textAlign: "center" }}>
        <h1
          style={{
            color: "#2EA8FF",
            fontSize: "48px",
            marginBottom: "20px",
          }}
        >
          About PropertySure AI
        </h1>

        <p
          style={{
            color: "#B6C2D2",
            fontSize: "20px",
            lineHeight: "1.8",
          }}
        >
          PropertySure AI is an AI-powered property verification platform
          designed to help buyers, investors, and real estate professionals
          verify property documents before making payments. Our mission is to
          reduce real estate fraud through artificial intelligence, secure
          document analysis, and blockchain-backed verification.
        </p>
      </div>
    </main>
  );
}
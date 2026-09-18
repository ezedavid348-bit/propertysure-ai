export default function AdminLoading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f9fc",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "32px",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            margin: "0 auto 18px",
            border: "4px solid #dbeafe",
            borderTop: "4px solid #1676c5",
            borderRadius: "50%",
          }}
        />

        <h2
          style={{
            margin: "0 0 8px",
            color: "#102a43",
            fontSize: "20px",
            fontWeight: 700,
          }}
        >
          PropertySure AI
        </h2>

        <p
          style={{
            margin: 0,
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          Loading administrator dashboard...
        </p>
      </div>
    </main>
  );
}
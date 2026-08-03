export default function ContactPage() {
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
      <div
        style={{
          maxWidth: "800px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#2EA8FF",
            fontSize: "48px",
            marginBottom: "20px",
          }}
        >
          Contact PropertySure AI
        </h1>

        <p
          style={{
            color: "#B6C2D2",
            fontSize: "20px",
            lineHeight: "1.8",
            marginBottom: "40px",
          }}
        >
          We'd love to hear from you. Contact us for support, partnerships,
          business enquiries, or questions about property verification.
        </p>

        <div
          style={{
            background: "#111827",
            borderRadius: "18px",
            padding: "35px",
            border: "1px solid rgba(255,255,255,0.08)",
            textAlign: "left",
          }}
        >
          <h2
            style={{
              color: "#2EA8FF",
              marginBottom: "25px",
            }}
          >
            Contact Information
          </h2>

          <p style={{ fontSize: "18px", lineHeight: "2" }}>
            <strong>Email:</strong><br />
            support@propertysure.ai
          </p>

          <p style={{ fontSize: "18px", lineHeight: "2" }}>
            <strong>Phone:</strong><br />
            +234 806 562 4091
          </p>

          <p style={{ fontSize: "18px", lineHeight: "2" }}>
            <strong>Business Address:</strong><br />
            Shop 28/29, Block 16<br />
            Dutse P.E. Model Market<br />
            Kubwa, Abuja<br />
            Federal Capital Territory, Nigeria
          </p>

          <p
            style={{
              marginTop: "30px",
              color: "#9FB3C8",
              lineHeight: "1.8",
            }}
          >
            <strong>Business Hours</strong><br />
            Monday – Friday: 9:00 AM – 5:00 PM
          </p>
        </div>
      </div>
    </main>
  );
}
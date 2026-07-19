export default function ResultPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0A1224",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        color: "white",
        padding: "30px",
      }}
    >
      <div
        style={{
          width: "650px",
          background: "#111827",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 0 30px rgba(46,168,255,0.15)",
        }}
      >
        <h1
          style={{
            color: "#22C55E",
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          ✅ Verification Completed
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#CBD5E1",
            marginBottom: "35px",
          }}
        >
          Property document successfully analyzed by PropertySure AI
        </p>

        <div
          style={{
            background: "#1A2338",
            padding: "25px",
            borderRadius: "15px",
            lineHeight: "2",
          }}
        >
          <p><strong>Verification Status:</strong> <span style={{color:"#22C55E"}}>Verified ✅</span></p>

          <p><strong>AI Confidence:</strong> 98.7%</p>

          <p><strong>Property ID:</strong> PS-2026-0001</p>

          <p><strong>Owner:</strong> John Doe</p>

          <p><strong>Document Type:</strong> Certificate of Occupancy (C of O)</p>

          <p><strong>Location:</strong> Lagos, Nigeria</p>

          <p><strong>Verification Date:</strong> 19 July 2026</p>

          <p><strong>Blockchain Hash:</strong></p>

          <div
            style={{
              background: "#0F172A",
              padding: "12px",
              borderRadius: "8px",
              wordBreak: "break-all",
              color: "#2EA8FF",
              fontSize: "13px",
            }}
          >
            0x8A7F4E92B31CD89F47A65DE34AB6712F9C2D145EF983B72A
          </div>
        </div>

        <button
          style={{
            width: "100%",
            marginTop: "30px",
            padding: "16px",
            background: "#2EA8FF",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "17px",
            cursor: "pointer",
          }}
        >
          📄 Download Verification Report
        </button>

        <button
          style={{
            width: "100%",
            marginTop: "15px",
            padding: "16px",
            background: "#22C55E",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "17px",
            cursor: "pointer",
          }}
        >
          🔗 Share Verification
        </button>
      </div>
    </main>
  );
}
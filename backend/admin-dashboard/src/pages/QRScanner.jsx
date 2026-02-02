import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function QRScanner() {
  const qrRef = useRef(null);
  const [status, setStatus] = useState("📷 Point camera at QR code");

  useEffect(() => {
    const qrScanner = new Html5Qrcode("reader");

    qrScanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      async (decodedText) => {
        try {
          const parsed = JSON.parse(decodedText);

          const res = await axios.post(`${API}/bookings/scan`, {
            bookingId: parsed.bookingId,
            mealType: parsed.mealType
          });

          setStatus(`✅ ENTRY ALLOWED — ${res.data.student}`);

        } catch (err) {
          setStatus(err.response?.data?.error || "❌ Invalid QR");
        }
      },
      (error) => {
        // ignore scan errors
      }
    );

    return () => {
      qrScanner.stop().catch(() => {});
    };
  }, []);

  return (
    <div style={styles.page}>
      <h2>📷 Mess Gate QR Scanner</h2>

      <div id="reader" style={styles.scanner}></div>

      <p style={styles.status}>{status}</p>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    padding: "40px",
    textAlign: "center"
  },
  scanner: {
    width: "320px",
    margin: "20px auto",
    borderRadius: "12px",
    overflow: "hidden"
  },
  status: {
    marginTop: "20px",
    fontSize: "18px",
    fontWeight: "bold"
  }
};

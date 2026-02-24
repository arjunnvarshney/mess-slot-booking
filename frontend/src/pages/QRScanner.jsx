import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../services/api";

export default function QRScanner() {
    const [status, setStatus] = useState("📷 Point camera at QR code");

    useEffect(() => {
        const qrScanner = new Html5Qrcode("reader");

        qrScanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            async (decodedText) => {
                try {
                    // Some QRs might be just IDs or JSON
                    let bookingId, mealType;
                    try {
                        const parsed = JSON.parse(decodedText);
                        bookingId = parsed.bookingId;
                        mealType = parsed.mealType;
                    } catch {
                        bookingId = decodedText;
                    }

                    const res = await api.post("/admin/scan", {
                        bookingId,
                        mealType
                    });

                    setStatus(`✅ ENTRY ALLOWED — ${res.data.student}`);

                } catch (err) {
                    setStatus(err.response?.data?.error || "❌ Invalid QR or Already Used");
                }
            },
            (error) => {
                // ignore scan errors
            }
        ).catch(err => {
            console.error("Scanner start error:", err);
            setStatus("❌ Camera Error: Make sure you give permissions");
        });

        return () => {
            if (qrScanner.isScanning) {
                qrScanner.stop().catch(() => { });
            }
        };
    }, []);

    return (
        <div style={styles.page}>
            <h2>📷 Mess Gate QR Scanner</h2>

            <div id="reader" style={styles.scanner}></div>

            <div style={styles.statusCard}>
                <p style={styles.status}>{status}</p>
            </div>

            <button
                onClick={() => window.location.reload()}
                style={styles.refreshBtn}
            >
                Refresh Scanner
            </button>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    scanner: {
        width: "100%",
        maxWidth: "500px",
        margin: "20px auto",
        borderRadius: "12px",
        overflow: "hidden",
        border: "2px solid #1e293b"
    },
    statusCard: {
        marginTop: "20px",
        padding: "15px 30px",
        background: "#1e293b",
        borderRadius: "10px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.3)"
    },
    status: {
        fontSize: "18px",
        fontWeight: "bold",
        margin: 0
    },
    refreshBtn: {
        marginTop: "30px",
        padding: "10px 20px",
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer"
    }
};

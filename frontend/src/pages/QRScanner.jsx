import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { errorMessage } from "../services/utils";
export default function QRScanner() {
  const [scanning, setScanning] = useState(false),
    [busy, setBusy] = useState(false),
    [result, setResult] = useState(null),
    [error, setError] = useState("");
  const lock = useRef(false);
  const lifecycle = useRef(Promise.resolve());
  async function verify(code) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setResult(null);
    setError("");
    try {
      const response = await api.post("/bookings/scan", { qrCode: code });
      setResult(response.data);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setScanning(false);
      setBusy(false);
      lock.current = false;
    }
  }
  const verifyRef = useRef(verify);
  useEffect(() => {
    verifyRef.current = verify;
  });
  useEffect(() => {
    if (!scanning) return;
    let disposed = false,
      scanner,
      submitted = false;
    const start = async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (disposed) return;
      scanner = new Html5Qrcode("reader");
      await scanner.start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 220, height: 220 } },
        (code) => {
          if (disposed || submitted) return;
          submitted = true;
          verifyRef.current(code);
        },
        () => {},
      );
    };
    const starting = lifecycle.current.then(start).catch(() => {
      if (!disposed) {
        setError(
          "Camera unavailable. Allow camera access on HTTPS or localhost, or enter the pass code below.",
        );
        setScanning(false);
      }
    });
    return () => {
      disposed = true;
      lifecycle.current = starting
        .then(async () => {
          if (scanner?.isScanning) await scanner.stop();
          scanner?.clear();
        })
        .catch(() => {});
    };
  }, [scanning]);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Gate operations</p>
          <h1>Verify a meal pass</h1>
          <p className="muted">
            One scan, one entry. The server checks the meal time and previous
            use.
          </p>
        </div>
      </div>
      <div className="scanner-layout">
        <section className="card">
          <div id="reader" className="scanner-reader" />
          <button
            className="primary"
            disabled={busy}
            onClick={() => {
              setResult(null);
              setError("");
              setScanning((value) => !value);
            }}
          >
            {scanning ? "Stop camera" : "Start next scan"}
          </button>
        </section>
        <section className="card" aria-live="polite" aria-atomic="true">
          <h2>Entry status</h2>
          {busy && <p>Verifying pass…</p>}
          {result ? (
            <div className="notice success">
              <h3>Entry allowed</h3>
              <p>{result.student}</p>
              <p className="capitalize">
                {result.mealType} · Floor {result.floor}
              </p>
            </div>
          ) : (
            !error &&
            !busy && <p className="muted">Ready for the next student.</p>
          )}
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          <form
            className="stack section-gap"
            onSubmit={(event) => {
              event.preventDefault();
              if (scanning || busy) return;
              verify(
                String(new FormData(event.currentTarget).get("code")).trim(),
              );
            }}
          >
            <label>
              Pass code (scanner fallback)
              <input name="code" required maxLength={200} autoComplete="off" />
            </label>
            <button disabled={busy || scanning}>Verify code</button>
          </form>
        </section>
      </div>
    </>
  );
}

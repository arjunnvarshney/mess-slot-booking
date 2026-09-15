import { useEffect, useRef } from "react";
import useResource from "../hooks/useResource";
import ResourceState from "./ResourceState";
export default function QRPass({ booking, onClose }) {
  const dialog = useRef(null);
  const resource = useResource("/bookings/" + booking._id + "/qr");
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-labelledby="pass-title"
      onCancel={onClose}
      className="pass-dialog"
    >
      <h2 id="pass-title">Your meal pass</h2>
      <p className="capitalize">
        {booking.mealType} · Floor {booking.floor}
      </p>
      <p>{booking.slotTime}</p>
      <ResourceState {...resource} />
      {resource.data && (
        <img
          className="qr-image"
          src={resource.data.qrCode}
          alt="Your single-use mess entry QR code"
        />
      )}
      <p className="muted">
        Present this pass during your meal slot. It can be used once.
      </p>
      <button className="primary" onClick={onClose}>
        Close pass
      </button>
    </dialog>
  );
}

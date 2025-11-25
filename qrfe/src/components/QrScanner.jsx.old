import React, { useEffect, useRef } from "react";
import QrScanner from "qr-scanner";

export default function QrScannerComponent({ onDetected }) {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    scannerRef.current = new QrScanner(
      video,
      (result) => {
        if (result?.data) onDetected(result.data);
      },
      {
        highlightScanRegion: false,
        highlightCodeOutline: false,
      }
    );

    scannerRef.current
      .start()
      .catch((e) => console.error("Camera error:", e));

    return () => scannerRef.current?.stop();
  }, [onDetected]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover"
      muted
      playsInline
    />
  );
}

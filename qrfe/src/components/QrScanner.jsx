import React, { useEffect, useRef } from "react";
import QrScanner from "qr-scanner";

export default function QrScannerComponent({ onDetected }) {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const videoElem = videoRef.current;

    scannerRef.current = new QrScanner(
      videoElem,
      (result) => {
        if (onDetected) onDetected(result.data);
      },
      {
        highlightScanRegion: false,
        highlightCodeOutline: false,
      }
    );

    scannerRef.current.start();

    return () => {
      scannerRef.current?.stop();
    };
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

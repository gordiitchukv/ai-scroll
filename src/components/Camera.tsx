import { useRef, useEffect, useState } from "react";
import "./Camera.css";

export const Camera = () => {
  const [error, setError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.name);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    setError(null);
    stopStream();
    if (isEnabled) startStream();
  }, [isEnabled]);

  return (
    <div>
      <div className="camera-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
        />
        {error && <div className="error-message">{error}</div>}
      </div>
      <div className="controls">
        <button onClick={() => setIsEnabled(!isEnabled)}>
          {isEnabled ? "Off" : "On"}
        </button>
      </div>
    </div>
  );
};

import { useRef, useEffect, useState } from "react";
import "./Camera.css";

export const Camera = () => {
  const [error, setError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isEnabled || !videoRef.current) return;

    let stream: MediaStream | null = null;

    const startStream = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current!.srcObject = stream;
      } catch (err) {
        if (err instanceof Error) {
          setError(err.name);
        } else {
          setError("An unknown error occurred");
        }
      }
    };

    startStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
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
        <button
          onClick={() => {
            setError(null);
            setIsEnabled(!isEnabled);
          }}
        >
          {isEnabled ? "Off" : "On"}
        </button>
      </div>
    </div>
  );
};

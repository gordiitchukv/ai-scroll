import { useRef, useEffect, useState } from "react";
import "./Camera.css";

export const Camera = () => {
  const [error, setError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    let stream: MediaStream | null = null;

    if (!isEnabled) {
      videoRef.current.srcObject = null;
      return;
    }

    const startStream = async () => {
      try {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (isEnabled && videoRef.current) {
          videoRef.current.srcObject = stream;
        } else {
          stream.getTracks().forEach((track) => track.stop());
        }
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

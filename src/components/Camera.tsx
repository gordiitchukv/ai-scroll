import { useRef, useEffect, useState } from "react";
import "./Camera.css";

export const Camera = () => {
  const [error, setError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isEnabled) {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      return;
    }

    if (!videoRef.current) return;

    let stream: MediaStream | null = null;
    let isTerminated = false;

    const startStream = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (isTerminated) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

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
      isTerminated = true;
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

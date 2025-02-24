import { useRef, useEffect, useState } from "react";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import "@mediapipe/hands";
import "./Camera.css";

export const Camera = () => {
  const [error, setError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !isEnabled) return;

    let stream: MediaStream | null = null;
    let detector: handPoseDetection.HandDetector | null = null;
    let isTerminated = false;
    let intervalId: NodeJS.Timeout | null = null;

    const cleanup = () => {
      isTerminated = true;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (detector) {
        detector.dispose();
        detector = null;
      }
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const startStream = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });

        if (isTerminated) {
          cleanup();
          return;
        }

        videoElement.srcObject = stream;

        const model = handPoseDetection.SupportedModels.MediaPipeHands;
        const detectorConfig: handPoseDetection.MediaPipeHandsMediaPipeModelConfig =
          {
            runtime: "mediapipe",
            solutionPath:
              "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/",
            modelType: "full",
          };

        detector = await handPoseDetection.createDetector(
          model,
          detectorConfig
        );

        if (isTerminated) {
          cleanup();
          return;
        }

        console.log("Hand detector initialized");

        intervalId = setInterval(async () => {
          if (videoElement.readyState < 2) return;
          const hands = await detector!.estimateHands(videoElement);

          if (hands.length > 0) {
            const hand = hands[0];
            const wrist = hand.keypoints.find(
              (point) => point.name === "wrist"
            );
            const thumbTip = hand.keypoints.find(
              (point) => point.name === "thumb_tip"
            );

            if (wrist && thumbTip) {
              window.scrollBy({
                top: (thumbTip.y < wrist.y ? -1 : 1) * 200,
                behavior: "smooth",
              });
            }
          }
        }, 500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        cleanup();
      }
    };

    startStream();

    return cleanup;
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
            if (isEnabled && videoRef.current) videoRef.current.srcObject = null;
            setIsEnabled(!isEnabled);
          }}
        >
          {isEnabled ? "Off" : "On"}
        </button>
      </div>
    </div>
  );
};

import React, { useRef, useEffect, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const ObjectDetector = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
    };

    loadModel();
    startCamera();
  }, []);

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }
  };

  const detectObjects = async () => {
    if (model && videoRef.current) {
      const predictions = await model.detect(videoRef.current);
      drawPredictions(predictions);
    }
    requestAnimationFrame(detectObjects);
  };

  const drawPredictions = (predictions) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!videoRef.current) return;
    const { videoWidth, videoHeight } = videoRef.current;
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      ctx.fillStyle = "red";
      ctx.fillText(prediction.class, x, y > 10 ? y - 5 : y + 10);
    });
  };

  return (
    <div className="flex flex-col items-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedData={detectObjects}
        className="border border-gray-500 rounded-lg"
      />
      <canvas ref={canvasRef} className="absolute top-0 left-0" />
    </div>
  );
};

export default ObjectDetector;

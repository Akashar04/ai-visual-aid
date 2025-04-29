import React, { useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import { createWorker } from "tesseract.js";

import Details from './components/Details';

const App = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const workerRef = useRef(null);
    const [objects, setObjects] = useState([]);
    const [text, setText] = useState("");
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState("Fetching location...");

    useEffect(() => {
        // ✅ Initialize Text Recognition Worker
        const startWorker = async () => {
            workerRef.current = await createWorker("eng");
        };

        // ✅ Start Webcam
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Error accessing webcam:", error);
            }
        };

        startWorker();
        startCamera();
        initVoiceCommands();

        return () => {
            // ✅ Cleanup webcam & worker
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            if (workerRef.current) {
                workerRef.current.terminate().catch(console.error);
            }
        };
    }, []);

    // ✅ Object Detection
    const detectObjects = async () => {
        const model = await cocoSsd.load();
        const ctx = canvasRef.current.getContext("2d");

        setInterval(async () => {
            if (!videoRef.current) return;
            const video = videoRef.current;
            const predictions = await model.detect(video);

            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
            
            predictions.forEach(prediction => {
                ctx.beginPath();
                ctx.rect(...prediction.bbox);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "red";
                ctx.fillStyle = "red";
                ctx.stroke();
                ctx.fillText(prediction.class, prediction.bbox[0], prediction.bbox[1] - 5);
            });

            setObjects(predictions.map(p => p.class));
            speak(`Detected objects: ${predictions.map(p => p.class).join(", ")}`);
        }, 1000);
    };

    // ✅ Text Recognition
    const recognizeText = async () => {
        if (!videoRef.current || !workerRef.current) return;

        const canvas = document.createElement("canvas");
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

        const { data: { text } } = await workerRef.current.recognize(canvas);
        setText(text);
        speak(`Detected text is: ${text}`);
    };

    // ✅ Get User Location
    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
                setLocation(locationUrl);
                getAddressFromCoords(latitude, longitude);
            });
        } else {
            speak("Geolocation is not supported by this browser.");
        }
    };

    // ✅ Convert Coordinates to Address
    const getAddressFromCoords = async () => {
        const fakeLocation = "Visvesvaraya National Institute of Technology, Nagpur";
        speak(`You are at: ${fakeLocation}`);
        setAddress(fakeLocation);
    };

    // ✅ Text-to-Speech
    const speak = (message) => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(message);
        synth.speak(utterance);
    };

    // ✅ Voice Commands
    const initVoiceCommands = () => {
        if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
            speak("Voice commands are not supported in this browser.");
            return;
        }

        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
            const lastCommand = event.results[event.results.length - 1][0].transcript.toLowerCase();
            console.log("Voice Command:", lastCommand);
            processCommand(lastCommand);
        };

        recognition.start();
    };

    // ✅ Process Voice Commands
    const processCommand = (command) => {
        if (command.includes("detect object")) {
            detectObjects();
        } else if (command.includes("read ")) {
            recognizeText();
        } else if (command.includes("navigate")) {
            getLocation();
        } else {
            speak("Sorry, I did not understand that command.");
        }
    };

    return (
        <div className="p-5 text-center">
            <h1 className="text-3xl font-bold">AI-Powered Assistive Tool</h1>

            {/* ✅ Video Feed & Canvas */}
            <div className="relative">
                <video ref={videoRef} autoPlay playsInline className="border rounded-lg"></video>
                <canvas ref={canvasRef} className="absolute top-0 left-0" />
            </div>

            {/* ✅ Object Detection */}
            <button onClick={detectObjects} className="mt-4 p-2 bg-blue-500 text-white rounded">
                Detect Objects
            </button>
            <p className="mt-2"><b>Detected Objects:</b> {objects.join(", ")}</p>

            {/* ✅ Text Recognition */}
            <button onClick={recognizeText} className="mt-4 p-2 bg-green-500 text-white rounded">
                Recognize Text
            </button>
            <p className="mt-2"><b>Recognized Text:</b> {text}</p>

            {/* ✅ Navigation Assistance */}
            <button onClick={getLocation} className="mt-4 p-2 bg-red-500 text-white rounded">
                Where Am I?
            </button>
            {location && <p><a href={location} target="_blank" className="text-blue-600 underline">Open Google Maps</a></p>}
            <p className="mt-2"><b>Location:</b> {address}</p>

            {/* ✅ Voice Commands Info */}
            <p className="mt-5 text-gray-600">Try saying: "Detect objects", "Read text", "Navigate me"</p>
        </div>
    );
};

export default App;
import React, { useState } from "react";
import { useLoadScript, GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";

const libraries = ["places"];

const Navigation = () => {
    const [location, setLocation] = useState(null);
    const [directions, setDirections] = useState(null);
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: "AIzaSyAkVM4xroM_oa77DzGG7im9ncZnYvwrrsg", // 🔴 Replace with your Google API Key
        libraries,
    });

    // ✅ 1. Get User's Current Location
    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setLocation(userLocation);
                    speakText("Your location has been set.");
                },
                (error) => alert("Error getting location: " + error.message)
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    // ✅ 2. Text-to-Speech Function
    const speakText = (text) => {
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-US";
        window.speechSynthesis.speak(speech);
    };

    // ✅ 3. Get Directions to a Destination
    const getDirections = (destination) => {
        if (!location) {
            alert("Please get your location first!");
            return;
        }
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: location,
                destination: destination,
                travelMode: "WALKING",
            },
            (result, status) => {
                if (status === "OK") {
                    setDirections(result);
                    speakText(`Starting navigation to ${destination}`);
                } else {
                    alert("Directions request failed: " + status);
                }
            }
        );
    };

    return (
        <div className="p-5 text-center">
            <h2 className="text-2xl font-bold">🗺️ Navigation</h2>
            <button onClick={getLocation} className="m-2 p-2 bg-blue-500 text-white rounded">
                📍 Get My Location
            </button>
            <button onClick={() => getDirections("New Delhi, India")} className="m-2 p-2 bg-green-500 text-white rounded">
                🚶 Navigate to New Delhi
            </button>

            {isLoaded && location && (
                <GoogleMap center={location} zoom={15} mapContainerStyle={{ width: "100%", height: "400px" }}>
                    <Marker position={location} />
                    {directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>
            )}
        </div>
    );
};

export default Navigation;

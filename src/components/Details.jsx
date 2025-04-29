import { useState, useEffect } from "react";

const Details = ({ objectId }) => {
    const [objectDetails, setObjectDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const API_KEY = "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";
    const GROQ_API_URL = "https://api.groq.com/v1/objects"; // Adjust if needed

    useEffect(() => {
        if (!objectId) return; // Prevent fetching if objectId is not provided

        const fetchObjectDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${GROQ_API_URL}/${objectId}`, {
                    headers: { Authorization: `Bearer ${API_KEY}` },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch object details");
                }

                const data = await response.json();
                setObjectDetails(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchObjectDetails();
    }, [objectId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!objectDetails) return <div>No details found</div>;

    return (
        <div className="p-4 border rounded shadow">
            <h2 className="text-xl font-bold">{objectDetails.name || "Unnamed Object"}</h2>
            <p><b>ID:</b> {objectDetails.id}</p>
            <p><b>Description:</b> {objectDetails.description || "No description available"}</p>
            <p><b>Category:</b> {objectDetails.category || "Unknown"}</p>
            <p><b>Created At:</b> {new Date(objectDetails.created_at).toLocaleString()}</p>
        </div>
    );
};

export default Details;
import React, { useState, useEffect } from 'react';

/**
 * Home component for uploading a video, showing the YOLO detection stream,
 * and displaying notifications/alerts in real-time.
 */
const Home = () => {
  // Store selected file in state
  const [videoFile, setVideoFile] = useState(null);

  // Store the streaming URL (where your backend provides annotated frames)
  const [streamUrl, setStreamUrl] = useState('');

  // Store incoming notifications (violation alerts) in an array
  const [notifications, setNotifications] = useState([]);

  /**
   * Handle file selection
   */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  /**
   * Upload the file to the server and get back a stream URL
   */
  const handleUpload = async () => {
    if (!videoFile) {
      alert('Please select a video file first.');
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      // Example POST request to your server
      // Replace 'http://localhost:5000/upload' with your actual upload endpoint
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Suppose the server returns a JSON containing a streaming URL
      // e.g. { "streamUrl": "http://localhost:5000/stream/video123" }
      const data = await response.json();
      setStreamUrl(data.streamUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload video.');
    }
  };

  /**
   * Set up real-time notifications (using WebSockets or SSE)
   * For demonstration, we’ll use a WebSocket approach.
   * The server should broadcast violation alerts to this socket.
   */
  useEffect(() => {
    // Replace with your actual WebSocket endpoint
    const socket = new WebSocket('ws://localhost:5000/notifications');

    // On receiving a message, we assume the server sends JSON like:
    // { "plate": "XYZ 123", "message": "Violation detected" }
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.message) {
          setNotifications((prev) => [...prev, data.message]);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    // Cleanup on unmount
    return () => {
      socket.close();
    };
  }, []);

  return (
    <div style={containerStyle}>
      <h1>Parking Detection Home</h1>

      {/* File input for video selection */}
      <div style={uploadContainerStyle}>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          style={fileInputStyle}
        />
        <button onClick={handleUpload} style={buttonStyle}>
          Upload & Start Detection
        </button>
      </div>

      {/* Display the detection stream (assuming the server provides a direct video stream URL) */}
      {streamUrl && (
        <div style={videoContainerStyle}>
          <h2>Live Detection Stream</h2>
          {/* 
            If your backend streams MJPEG, you could use <img> with the stream URL.
            If it's a video endpoint, you can use <video> with controls or autoplay.
            Adjust as needed for your backend's streaming method.
          */}
          <video
            src={streamUrl}
            style={videoStyle}
            controls
            autoPlay
            muted
          />
        </div>
      )}

      {/* Notification/Alert section */}
      <div style={alertContainerStyle}>
        <h2>Violation Alerts</h2>
        {notifications.length === 0 ? (
          <p>No violations detected yet.</p>
        ) : (
          <ul>
            {notifications.map((note, index) => (
              <li key={index} style={alertItemStyle}>
                {note}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/* Simple inline styles for demonstration purposes */
const containerStyle = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '20px',
  fontFamily: 'Arial, sans-serif',
};

const uploadContainerStyle = {
  marginBottom: '20px',
};

const fileInputStyle = {
  marginRight: '10px',
};

const buttonStyle = {
  padding: '8px 16px',
  backgroundColor: '#333',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
  borderRadius: '4px',
};

const videoContainerStyle = {
  marginBottom: '20px',
  textAlign: 'center',
};

const videoStyle = {
  width: '100%',
  maxWidth: '600px',
  border: '1px solid #ccc',
  borderRadius: '4px',
};

const alertContainerStyle = {
  backgroundColor: '#f9f9f9',
  padding: '10px',
  borderRadius: '4px',
};

const alertItemStyle = {
  backgroundColor: '#ffe6e6',
  padding: '8px',
  margin: '5px 0',
  borderRadius: '4px',
  color: '#cc0000',
};

export default Home;

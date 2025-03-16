import React, { useState } from 'react';

const Home = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [recognizedPlates, setRecognizedPlates] = useState([]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!videoFile) {
      alert('Please select a video file first.');
      return;
    }

    setResponseMessage('Uploading and processing video...');
    setRecognizedPlates([]);

    const formData = new FormData();
    formData.append('file', videoFile);

    try {
      // POST to FastAPI backend at /view_video
      const response = await fetch('http://localhost:8000/view_video', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      setResponseMessage(data.message || 'Video processed successfully.');
      setRecognizedPlates(data.recognized_plates || []);
    } catch (error) {
      console.error('Error uploading video:', error);
      setResponseMessage('Error uploading video. Check console for details.');
    }
  };

  return (
    <div style={containerStyle}>
      <h1>Parking Detection - Home</h1>
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

      {/* Display response messages */}
      {responseMessage && (
        <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{responseMessage}</p>
      )}

      {/* Display recognized plates (if any) */}
      {recognizedPlates.length > 0 && (
        <div style={platesContainerStyle}>
          <h2>Recognized Plates:</h2>
          <ul>
            {recognizedPlates.map((plate, idx) => (
              <li key={idx} style={plateItemStyle}>
                {plate}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/* Basic inline styling */
const containerStyle = {
  maxWidth: '600px',
  margin: '50px auto',
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

const platesContainerStyle = {
  marginTop: '20px',
  backgroundColor: '#f9f9f9',
  padding: '15px',
  borderRadius: '8px',
};

const plateItemStyle = {
  backgroundColor: '#eee',
  margin: '5px 0',
  padding: '8px',
  borderRadius: '4px',
};

export default Home;
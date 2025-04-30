// server.js
const express = require('express');
const path = require('path');
const osc = require('osc');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Create UDP sender for OSC messages
let udpPort = null;

// Function to create or get UDP port
function getUDPPort(host = '127.0.0.1', port = 9000) {
  // If we already have a UDP port, return it
  if (udpPort) {
    // Update the target if needed
    udpPort.options.remoteAddress = host;
    udpPort.options.remotePort = port;
    return udpPort;
  }
  
  // Create a new UDP port
  udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 0,  // Any available port for outgoing messages
    remoteAddress: host,
    remotePort: port
  });
  
  // Handle errors
  udpPort.on('error', (err) => {
    console.error('OSC UDP error:', err);
  });
  
  // Open the port
  udpPort.open();
  console.log(`Created OSC UDP port sending to ${host}:${port}`);
  
  return udpPort;
}

// Test OSC connection
app.post('/api/test-osc', (req, res) => {
  const { host = '127.0.0.1', port = 9000 } = req.query;
  
  try {
    // Try to create or get the UDP port
    const port = getUDPPort(host, parseInt(port));
    
    // Send a test message
    port.send({
      address: '/mediapipe/test',
      args: [
        { type: 's', value: 'Connection test' },
        { type: 'f', value: 1.0 }
      ]
    });
    
    res.status(200).json({ success: true, message: 'OSC connection test successful' });
  } catch (err) {
    console.error('Error testing OSC connection:', err);
    res.status(500).json({ success: false, message: 'OSC connection test failed', error: err.message });
  }
});

// Send OSC message
app.post('/api/send-osc', (req, res) => {
  const { address, host = '127.0.0.1', port = 9000, landmarks } = req.body;
  
  try {
    // Get or create the UDP port
    const udp = getUDPPort(host, parseInt(port));
    
    // Send individual landmark messages
    landmarks.forEach(landmark => {
      udp.send({
        address: `${address}/${landmark.name}`,
        args: [
          { type: 'f', value: landmark.x },
          { type: 'f', value: landmark.y },
          { type: 'f', value: landmark.z },
          { type: 'f', value: landmark.visibility }
        ]
      });
    });
    
    // Send bundled message with all landmarks
    const allArgs = [];
    landmarks.forEach(landmark => {
      allArgs.push(
        { type: 'f', value: landmark.x },
        { type: 'f', value: landmark.y },
        { type: 'f', value: landmark.z },
        { type: 'f', value: landmark.visibility }
      );
    });
    
    udp.send({
      address: `${address}/all`,
      args: allArgs
    });
    
    // Don't wait for response to avoid blocking the UI
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error sending OSC message:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Stop OSC
app.post('/api/stop-osc', (req, res) => {
  try {
    if (udpPort) {
      udpPort.close();
      udpPort = null;
      console.log('Closed OSC UDP port');
    }
    
    res.status(200).json({ success: true, message: 'OSC stopped' });
  } catch (err) {
    console.error('Error stopping OSC:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the HTTP server
const server = app.listen(PORT, () => {
  console.log(`MediaPipe Pose Tracking server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
  console.log(`OSC data will be sent to port 9000 by default`);
});

// Close connections when the server is terminated
process.on('SIGINT', () => {
  if (udpPort) {
    udpPort.close();
  }
  
  server.close(() => {
    console.log('Server terminated');
    process.exit(0);
  });
});
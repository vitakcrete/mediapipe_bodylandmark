# MediaPipe Pose Tracking Web App

This project demonstrates how to use MediaPipe's Pose solution in a web application with Node.js. The application captures video from your webcam and displays pose tracking landmarks in real-time.

## Project Structure

```
mediapipe-pose-app/
├── package.json
├── server.js
└── public/
    └── index.html
```

## Setup Instructions

### 1. Create the project directory and initialize npm

```bash
mkdir mediapipe-pose-app
cd mediapipe-pose-app
npm init -y
```

### 2. Install the required dependencies

```bash
npm install express
```

### 3. Create the project files

Create a file structure as shown above.

1. Copy the `server.js` code into the server.js file in your root directory
2. Create a `public` directory 
3. Copy the HTML code into `public/index.html`

### 4. Run the application

```bash
node server.js
```

### 5. Open the application

Open your web browser and navigate to http://localhost:3000

## How to Use

1. Click the "Start Camera" button to activate your webcam
2. The application will begin tracking and displaying pose landmarks
3. Click "Stop Camera" to stop the tracking and turn off the camera

## Features

- Real-time pose tracking using MediaPipe
- Displays pose landmarks directly on the video feed
- Simple and intuitive interface
- Optimized performance for web browsers

## Notes

- This application requires camera permissions in your browser
- For best results, ensure you are well-lit and visible to the camera
- The tracking works best when your full body is visible in the frame
- MediaPipe loads its models from CDN, so an internet connection is required

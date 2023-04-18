# Canvas

This is a web application that allows multiple users to collaborate and draw on a shared canvas in real-time. The application is built using Express-WS on the backend, and React and JS WebSocket on the frontend.

## Getting started

### Prerequisites

You will need to have the following software installed:

- Node.js (v12 or higher)
- npm (v6 or higher)

To get started with the project, follow the steps below:

1. Clone the repository and navigate to the project directory

```bash
  git clone https://github.com/AlmazXX/Canvas.git
  cd Canvas
```

2. Install the project dependencies.

```bash
  npm run install-all
```

3. Open your web browser and navigate to http://localhost:5173.

## Features

The application provides the following features:

- Real-time drawing on a shared canvas.
- Multiple users can collaborate on the same canvas.
- The user can clear the canvas.

## Tech Stack

- Node JS
- Express
- Express-ws
- React
- Typescript
- Material-UI

## How it works

The backend is built using Express-WS, which provides a WebSocket server to handle real-time communication between the clients. When a user connects to the server, a WebSocket connection is established, and the user is assigned a unique ID. When the user draws on the canvas, the client sends the drawing data to the server using the WebSocket connection. The server broadcasts the drawing data to all the other connected clients, allowing them to see the drawing in real-time.

The frontend is built using React and JS WebSocket. When the user loads the application, the client establishes a WebSocket connection with the server. When the user draws on the canvas, the client sends the drawing data to the server using the WebSocket connection. The client also receives the drawing data from the server and updates the canvas accordingly.

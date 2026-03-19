import React from "react";

function App() {
  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Welcome to DockStack</h1>
      <p>
        DockStack is a lightweight platform that helps you manage your Docker
        containers efficiently. With DockStack, you can start, stop, and monitor
        your applications with ease.
      </p>
      <h2>Features</h2>
      <ul>
        <li>Easy container orchestration</li>
        <li>Simple setup and configuration</li>
        <li>Monitor running containers in real-time</li>
        <li>Works with any Docker image</li>
      </ul>
      <p>
        Get started by creating a new Docker container and let DockStack handle
        the rest!
      </p>
    </div>
  );
}

export default App;
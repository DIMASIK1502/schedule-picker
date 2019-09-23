import React from "react";

import "bootstrap/scss/bootstrap.scss";
import "./App.css";

import Schedule from "./components/Schedule/Schedule";

function App() {
  return (
    <div className="App">
      <div
        style={{
          paddingTop: 32,
          maxWidth: 900,
          margin: "0 auto"
        }}
      >
        <Schedule />
      </div>
    </div>
  );
}

export default App;

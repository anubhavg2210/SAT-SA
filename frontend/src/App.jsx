import { useState } from "react";

import Header from "./components/Header";
import Home from "./pages/Home";
import Assessment from "./pages/Assessment";
import Dashboard from "./pages/Dashboard";

import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [data, setData] = useState(null);

  function startAssessment() {
    setPage("assessment");
  }

  function handleAnalysisComplete(result) {
    setData(result);
    setPage("dashboard");
  }

  function openDashboard() {
    if (data) {
      setPage("dashboard");
    } else {
      setPage("assessment");
    }
  }

  function goHome() {
    setPage("home");
  }

  return (
    <div className="app">

      <Header onHome={goHome} />

      <main>

        {page === "home" && (
          <Home
            onStartAssessment={startAssessment}
            onViewDashboard={openDashboard}
          />
        )}

        {page === "assessment" && (
          <Assessment
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {page === "dashboard" && (
          <Dashboard
            data={data}
            loading={false}
            error=""
          />
        )}

      </main>

    </div>
  );
}

export default App;
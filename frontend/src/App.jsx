import { useState } from "react";

import Header from "./components/Header";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { getAnalysis } from "./services/api";

import "./App.css";

function App() {

  const [page, setPage] = useState("home");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startAnalysis() {

    setPage("dashboard");
    setLoading(true);
    setError("");

    try {

      const result = await getAnalysis();

      setData(result);

    } catch (err) {

      console.error(err);

      setError(
        err.message || "Unable to connect to SAT-SA backend."
      );

    } finally {

      setLoading(false);

    }
  }

  function openDashboard() {

    if (data) {
      setPage("dashboard");
    } else {
      startAnalysis();
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
            onStartAssessment={startAnalysis}
            onViewDashboard={openDashboard}
          />
        )}

        {page === "dashboard" && (
          <Dashboard
            data={data}
            loading={loading}
            error={error}
          />
        )}

      </main>

    </div>
  );
}

export default App;

import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [selectedCSE, setSelectedCSE] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/analysis")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch analysis");
        }

        return response.json();
      })
      .then((result) => {
        setData(result);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  if (error) {
    return (
      <div className="error-page">
        <h2>Unable to load SAT-SA analysis</h2>
        <p>{error}</p>
        <p>
          Make sure the FastAPI backend is running on port 8000.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="loading">
        Loading SAT-SA analysis...
      </div>
    );
  }

  const summary = data.summary || {};
  const cseAssessments = data.cse_assessments || {};

  return (
    <div className="app">

      <header className="header">
        <div>
          <h1>SAT-SA</h1>
          <p>
            Security Assessment & Supervisory Analytics
          </p>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          Analysis Ready
        </div>
      </header>

      <main>

        <section className="hero">
          <h2>Supervisory Analysis Dashboard</h2>

          <p>
            Data-driven analysis of security operations,
            investigation and cyber-resilience signals.
          </p>
        </section>

        {/* SUMMARY */}

        <section className="cards">

          <div className="card">
            <span>Total Cases</span>
            <strong>
              {summary.total_cases ?? 0}
            </strong>
          </div>

          <div className="card">
            <span>Cases with Anomalies</span>
            <strong>
              {summary.cases_with_anomalies ?? 0}
            </strong>
          </div>

          <div className="card">
            <span>Total Case Signals</span>
            <strong>
              {summary.total_case_signals ?? 0}
            </strong>
          </div>

          <div className="card">
            <span>Total Signals</span>
            <strong>
              {summary.total_signals ?? 0}
            </strong>
          </div>

        </section>


        {/* CSE ASSESSMENT */}

        <section className="panel">

          <div className="panel-header">
            <div>
              <h2>CSE-wise Assessment</h2>
              <p>
                Supervisory signals and cases by CSE unit
              </p>
            </div>

            <span>
              {Object.keys(cseAssessments).length} CSEs
            </span>
          </div>


          <div className="cse-grid">

            {Object.entries(cseAssessments).map(
              ([cse, assessment]) => {

                const cases = assessment.cases || [];

                return (
                  <div
                    className="cse-card"
                    key={cse}
                  >

                    <div className="cse-title">

                      <div>
                        <span className="cse-label">
                          CSE UNIT
                        </span>

                        <h3>{cse}</h3>
                      </div>

                      <div className="signal-badge">
                        {assessment.signal_count ?? 0}
                      </div>

                    </div>


                    <div className="cse-stats">

                      <div>
                        <strong>
                          {assessment.case_count ?? cases.length}
                        </strong>

                        <span>
                          Cases
                        </span>
                      </div>

                      <div>
                        <strong>
                          {assessment.signal_count ?? 0}
                        </strong>

                        <span>
                          Signals
                        </span>
                      </div>

                    </div>


                    <p className="section-label">
                      Detected Signals
                    </p>


                    <div className="signal-list">

                      {Object.entries(
                        assessment.signals_by_code || {}
                      ).map(([code, count]) => (

                        <div
                          className="signal-row"
                          key={code}
                        >

                          <span>{code}</span>

                          <strong>
                            {count}
                          </strong>

                        </div>

                      ))}

                    </div>


                    <button
                      className="view-button"
                      onClick={() => setSelectedCSE(cse)}
                    >
                      View Cases ?
                    </button>

                  </div>
                );
              }
            )}

          </div>

        </section>


        {/* SELECTED CSE CASES */}

        {selectedCSE && (
          <section className="panel case-panel">

            <div className="panel-header">

              <div>
                <h2>
                  Cases — {selectedCSE}
                </h2>

                <p>
                  Case records associated with this CSE
                </p>
              </div>

              <button
                className="close-button"
                onClick={() => setSelectedCSE(null)}
              >
                Close
              </button>

            </div>


            {(() => {

              const assessment =
                cseAssessments[selectedCSE];

              const cases =
                assessment?.cases || [];

              if (cases.length === 0) {

                return (
                  <div className="empty-state">
                    No case-level records were returned
                    for this CSE.
                  </div>
                );

              }

              return (
                <div className="case-table-wrapper">

                  <table className="case-table">

                    <thead>
                      <tr>
                        <th>Case ID</th>
                        <th>Severity</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Asset</th>
                      </tr>
                    </thead>

                    <tbody>

                      {cases.map((caseItem, index) => (

                        <tr key={index}>

                          <td>
                            <strong>
                              {caseItem.case_id || "—"}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={
                                `severity ${String(
                                  caseItem.severity || ""
                                ).toLowerCase()}`
                              }
                            >
                              {caseItem.severity || "—"}
                            </span>
                          </td>

                          <td>
                            {caseItem.priority || "—"}
                          </td>

                          <td>
                            {caseItem.status || "—"}
                          </td>

                          <td>
                            {caseItem.asset_id || "—"}
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>
              );

            })()}

          </section>
        )}


        {/* SIGNAL DISTRIBUTION */}

        <section className="panel">

          <div className="panel-header">
            <div>
              <h2>Signal Distribution</h2>
              <p>
                Distribution of detected supervisory signals
              </p>
            </div>
          </div>


          <div className="distribution">

            {Object.entries(
              summary.case_signal_summary || {}
            ).map(([code, count]) => (

              <div
                className="distribution-row"
                key={code}
              >

                <span>{code}</span>

                <div className="bar-container">

                  <div
                    className="bar"
                    style={{
                      width: `${Math.min(
                        (Number(count) / 2),
                        100
                      )}%`,
                    }}
                  />

                </div>

                <strong>
                  {count}
                </strong>

              </div>

            ))}

          </div>

        </section>

      </main>


      <footer>
        SAT-SA • Supervisory Security Analytics
      </footer>

    </div>
  );
}

export default App;

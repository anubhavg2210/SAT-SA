import { useState } from "react";

function Dashboard({ data, loading, error }) {
  const [selectedCase, setSelectedCase] = useState(null);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="analysis-loading">
          <div className="loading-spinner"></div>
          <h2>Running Security Analysis</h2>
          <p>
            Analysing cases, alerts, investigations, evidence
            and supervisory signals...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="analysis-error">
          <h2>Analysis Failed</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const cases = data?.case_results || [];

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <div className="page-heading">
        <div>
          <span className="eyebrow">ASSESSMENT OVERVIEW</span>

          <h2>Supervisory Dashboard</h2>

          <p>
            Evidence-backed analysis of security operations
            and supervisory signals.
          </p>
        </div>

        <div className="analysis-status">
          <span></span>
          Analysis Ready
        </div>
      </div>

      {/* SUMMARY */}

      <section className="dashboard-stats">

        <div className="dashboard-stat">
          <span>Total Cases</span>
          <strong>{summary.total_cases ?? 0}</strong>
        </div>

        <div className="dashboard-stat">
          <span>Cases with Anomalies</span>
          <strong>{summary.cases_with_anomalies ?? 0}</strong>
        </div>

        <div className="dashboard-stat">
          <span>Case Signals</span>
          <strong>{summary.total_case_signals ?? 0}</strong>
        </div>

        <div className="dashboard-stat">
          <span>Total Signals</span>
          <strong>{summary.total_signals ?? 0}</strong>
        </div>

      </section>

      {/* SIGNAL DISTRIBUTION */}

      <section className="dashboard-panel">

        <div className="panel-heading">

          <div>
            <span className="eyebrow">
              SIGNAL DISTRIBUTION
            </span>

            <h3>
              Detected Supervisory Signals
            </h3>
          </div>

          <span className="panel-note">
            {summary.total_signals ?? 0} signals detected
          </span>

        </div>

        <div className="signal-grid">

          {Object.entries({
            ...(summary.case_signal_summary || {}),
            ...(summary.dataset_signal_summary || {})
          }).map(([code, count]) => (

            <div
              className="signal-card"
              key={code}
            >

              <div className="signal-card-top">
                <span>{code}</span>
              </div>

              <strong>{count}</strong>

            </div>

          ))}

        </div>

      </section>

      {/* CASE FINDINGS */}

      <section className="dashboard-panel case-findings-panel">

        <div className="panel-heading">

          <div>
            <span className="eyebrow">
              CASE FINDINGS
            </span>

            <h3>
              Detected Cases
            </h3>
          </div>

          <span className="panel-note">
            Showing first {Math.min(20, cases.length)} of{" "}
            {cases.length} findings
          </span>

        </div>

        {/* TABLE HEADER */}

        <div className="case-table-header">

          <span>CASE</span>
          <span>SIGNALS</span>
          <span>CONTEXT</span>
          <span>CONFIDENCE</span>

        </div>

        {/* CASE LIST */}

        <div className="case-list">

          {cases
            .slice(0, 20)
            .map((item) => {

              const firstSignal =
                item.signals?.[0] || {};

              return (

                <div
                  className="case-row case-row-clickable"
                  key={item.case_id}
                  onClick={() => setSelectedCase(item)}
                >

                  {/* CASE */}

                  <div className="case-main">

                    <strong>
                      {item.case_id}
                    </strong>

                    <span>
                      {item.signal_count} signal
                      {item.signal_count === 1
                        ? ""
                        : "s"}
                    </span>

                  </div>

                  {/* SIGNALS */}

                  <div className="case-signals">

                    {(item.signals || [])
                      .slice(0, 3)
                      .map((signal, index) => (

                        <span key={index}>
                          {signal.signal_code}
                        </span>

                      ))}

                  </div>

                  {/* CONTEXT */}

                  <div className="case-context">

                    {firstSignal.cse_id && (
                      <span>
                        CSE {firstSignal.cse_id}
                      </span>
                    )}

                    {firstSignal.asset_id && (
                      <span>
                        {firstSignal.asset_id}
                      </span>
                    )}

                    {firstSignal.severity && (
                      <span className="severity-badge">
                        {firstSignal.severity}
                      </span>
                    )}

                    {firstSignal.priority && (
                      <span className="priority-badge">
                        {firstSignal.priority}
                      </span>
                    )}

                  </div>

                  {/* CONFIDENCE */}

                  <div className="case-confidence">

                    <small>
                      Confidence
                    </small>

                    <strong>
                      {item.confidence
                        ?.confidence_score ?? 0}
                    </strong>

                    <span>
                      {item.confidence?.priority ||
                        "LOW"}
                    </span>

                  </div>

                </div>

              );
            })}

        </div>

      </section>

      {/* CASE DETAIL MODAL */}

      {selectedCase && (

        <div
          className="case-modal-overlay"
          onClick={() => setSelectedCase(null)}
        >

          <div
            className="case-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="case-modal-header">

              <div>

                <span className="eyebrow">
                  CASE DETAILS
                </span>

                <h2>
                  {selectedCase.case_id}
                </h2>

              </div>

              <button
                className="case-modal-close"
                onClick={() =>
                  setSelectedCase(null)
                }
              >
                ×
              </button>

            </div>

            {/* SUMMARY */}

            <div className="case-detail-grid">

              <div className="case-detail-card">

                <span>
                  Signal Count
                </span>

                <strong>
                  {selectedCase.signal_count}
                </strong>

              </div>

              <div className="case-detail-card">

                <span>
                  Confidence Score
                </span>

                <strong>
                  {selectedCase.confidence
                    ?.confidence_score ?? 0}
                </strong>

              </div>

              <div className="case-detail-card">

                <span>
                  Priority
                </span>

                <strong>
                  {selectedCase.confidence
                    ?.priority || "LOW"}
                </strong>

              </div>

            </div>

            {/* SIGNAL DETAILS */}

            <div className="case-detail-section">

              <span className="eyebrow">
                DETECTED SIGNALS
              </span>

              <div className="detail-signal-list">

                {(selectedCase.signals || [])
                  .map((signal, index) => (

                    <div
                      className="detail-signal"
                      key={index}
                    >

                      <div className="detail-signal-header">

                        <strong>
                          {signal.signal_code}
                        </strong>

                        {signal.severity && (
                          <span className="severity-badge">
                            {signal.severity}
                          </span>
                        )}

                      </div>

                      <p>
                        {signal.description ||
                          "No description available."}
                      </p>

                      <div className="detail-meta">

                        {signal.cse_id && (
                          <span>
                            CSE: {signal.cse_id}
                          </span>
                        )}

                        {signal.asset_id && (
                          <span>
                            Asset: {signal.asset_id}
                          </span>
                        )}

                        {signal.priority && (
                          <span>
                            Priority: {signal.priority}
                          </span>
                        )}

                        {signal.supervisory_dimension && (
                          <span>
                            Dimension:{" "}
                            {signal.supervisory_dimension}
                          </span>
                        )}

                        {signal.signal_category && (
                          <span>
                            Category:{" "}
                            {signal.signal_category}
                          </span>
                        )}

                      </div>

                      {signal.evidence_sources?.length > 0 && (

                        <div className="evidence-sources">

                          <small>
                            Evidence Sources
                          </small>

                          <div>

                            {signal.evidence_sources.map(
                              (source, sourceIndex) => (

                                <span key={sourceIndex}>
                                  {source}
                                </span>

                              )
                            )}

                          </div>

                        </div>

                      )}

                    </div>

                  ))}

              </div>

            </div>

            {/* FUSION */}

            {selectedCase.fusion && (

              <div className="case-detail-section">

                <span className="eyebrow">
                  SIGNAL FUSION
                </span>

                <div className="fusion-box">

                  <strong>
                    {selectedCase.fusion
                      .fused_signal_count ?? 0}
                  </strong>

                  <span>
                    fused findings detected
                  </span>

                </div>

                {selectedCase.fusion.findings
                  ?.length > 0 && (

                  <div className="fusion-findings">

                    {selectedCase.fusion.findings.map(
                      (finding, index) => (

                        <div key={index}>
                          {typeof finding === "string"
                            ? finding
                            : JSON.stringify(finding)}
                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default Dashboard;
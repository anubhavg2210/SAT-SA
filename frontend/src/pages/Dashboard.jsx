import { useState } from "react";

function Dashboard({ data, loading, error }) {
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseDetails, setCaseDetails] = useState(null);
  const [caseAnalysis, setCaseAnalysis] = useState(null);
  const [caseLoading, setCaseLoading] = useState(false);
  const [caseError, setCaseError] = useState("");
  const [flagged, setFlagged] = useState(false);
  const [notes, setNotes] = useState("");

  const summary = data?.summary || {};

  async function openCase(item) {
    const caseId = item?.case_id;

    if (!caseId) {
      setCaseError("Case ID is missing.");
      return;
    }

    setSelectedCase(caseId);
    setCaseDetails(null);
    setCaseAnalysis(null);
    setCaseError("");
    setCaseLoading(true);
    setFlagged(false);
    setNotes("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/analyze/${encodeURIComponent(caseId)}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Unable to load case."
        );
      }

      if (!result.case) {
        throw new Error(
          "Backend returned no case details."
        );
      }

      setCaseDetails(result.case);
      setCaseAnalysis(result.analysis || null);
    } catch (err) {
      console.error("Case loading failed:", err);

      setCaseError(
        err.message || "Unable to load case details."
      );
    } finally {
      setCaseLoading(false);
    }
  }

  function closeCase() {
    setSelectedCase(null);
    setCaseDetails(null);
    setCaseAnalysis(null);
    setCaseError("");
    setCaseLoading(false);
    setFlagged(false);
    setNotes("");
  }

  function displayValue(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  }

  function fieldLabel(key) {
    return key
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function renderRecord(record) {
    if (!record) return null;

    return (
      <div className="record-card">
        {Object.entries(record).map(([key, value]) => (
          <div className="record-field" key={key}>
            <small>{fieldLabel(key)}</small>
            <span>{displayValue(value)}</span>
          </div>
        ))}
      </div>
    );
  }

  function renderRecords(records, emptyText) {
    if (!records || records.length === 0) {
      return (
        <div className="detail-empty">
          {emptyText}
        </div>
      );
    }

    return (
      <div className="record-list">
        {records.map((record, index) => (
          <div key={index}>
            {renderRecord(record)}
          </div>
        ))}
      </div>
    );
  }

  function renderAvailability(
    available,
    count,
    availableText = "AVAILABLE",
    missingText = "NOT AVAILABLE"
  ) {
    return (
      <div className="availability-card">
        <strong>
          {available ? availableText : missingText}
        </strong>

        <span>
          {count ?? 0} record{count === 1 ? "" : "s"}
        </span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="analysis-loading">
          <div className="loading-spinner"></div>

          <h2>Running Security Analysis</h2>

          <p>
            Analysing cases, alerts, investigations,
            evidence and supervisory signals...
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

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <div className="page-heading">
        <div>
          <span className="eyebrow">
            ASSESSMENT OVERVIEW
          </span>

          <h2>Supervisory Dashboard</h2>

          <p>
            Evidence-backed analysis of security
            operations and supervisory signals.
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
          <strong>
            {summary.total_cases ?? 0}
          </strong>
        </div>

        <div className="dashboard-stat">
          <span>Cases with Anomalies</span>
          <strong>
            {summary.cases_with_anomalies ?? 0}
          </strong>
        </div>

        <div className="dashboard-stat">
          <span>Case Signals</span>
          <strong>
            {summary.total_case_signals ?? 0}
          </strong>
        </div>

        <div className="dashboard-stat">
          <span>Total Signals</span>
          <strong>
            {summary.total_signals ?? 0}
          </strong>
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
            ...(summary.dataset_signal_summary || {}),
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

            <h3>Detected Cases</h3>
          </div>

          <span className="panel-note">
            Showing first{" "}
            {Math.min(
              20,
              data?.case_results?.length || 0
            )}{" "}
            of{" "}
            {summary.cases_with_anomalies ?? 0} findings
          </span>

        </div>

        <div className="case-table-header">
          <span>CASE</span>
          <span>SIGNALS</span>
          <span>CONTEXT</span>
          <span>CONFIDENCE</span>
        </div>

        <div className="case-list">

          {(data?.case_results || [])
            .slice(0, 20)
            .map((item) => {

              const firstSignal =
                item.signals?.[0] || {};

              return (
                <button
                  type="button"
                  className="case-row"
                  key={item.case_id}
                  onClick={() => openCase(item)}
                >

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

                  <div className="case-signals">

                    {(item.signals || [])
                      .slice(0, 3)
                      .map((signal, index) => (

                        <span key={index}>
                          {signal.signal_code}
                        </span>

                      ))}

                  </div>

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

                  </div>

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

                </button>
              );
            })}

        </div>

      </section>

      {/* OFFICER WORKSPACE */}

      {selectedCase && (

        <div
          className="case-modal-backdrop"
          onClick={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeCase();
            }
          }}
        >

          <div
            className="case-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-workspace-title"
          >

            {/* WORKSPACE HEADER */}

            <div className="case-modal-header">

              <div>
                <span className="eyebrow">
                  OFFICER WORKSPACE
                </span>

                <h2 id="case-workspace-title">
                  {selectedCase}
                </h2>

                <p>
                  Review findings, source records,
                  evidence and supporting telemetry.
                </p>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={closeCase}
                aria-label="Close case workspace"
              >
                ×
              </button>

            </div>

            {/* LOADING */}

            {caseLoading && (

              <div className="case-loading">
                <div className="loading-spinner"></div>

                <strong>
                  Loading case evidence...
                </strong>

                <span>
                  Retrieving alerts, investigations,
                  evidence, events and raw logs.
                </span>
              </div>

            )}

            {/* ERROR */}

            {caseError && (

              <div className="case-error">

                <strong>
                  Unable to load case
                </strong>

                <p>
                  {caseError}
                </p>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    const currentCase =
                      data?.case_results?.find(
                        (item) =>
                          item.case_id === selectedCase
                      );

                    if (currentCase) {
                      openCase(currentCase);
                    }
                  }}
                >
                  Retry
                </button>

              </div>

            )}

            {/* CASE CONTENT */}

            {caseDetails && !caseLoading && (

              <div className="case-workspace">

                {/* OFFICER REVIEW */}

                <section className="case-review-bar">

                  <div>
                    <span className="eyebrow">
                      OFFICER REVIEW
                    </span>

                    <p>
                      Flag the case when additional
                      review or follow-up is required.
                    </p>
                  </div>

                  <button
                    type="button"
                    className={
                      flagged
                        ? "primary-button"
                        : "secondary-button"
                    }
                    onClick={() =>
                      setFlagged((current) => !current)
                    }
                  >
                    {flagged
                      ? "⚑ Flagged for Review"
                      : "⚑ Flag for Review"}
                  </button>

                </section>

                {/* CASE SUMMARY */}

                <section className="case-detail-section">

                  <span className="eyebrow">
                    CASE SUMMARY
                  </span>

                  <div className="case-summary-grid">

                    <div>
                      <small>CASE</small>
                      <strong>
                        {displayValue(
                          caseDetails.case?.case_id
                        )}
                      </strong>
                    </div>

                    <div>
                      <small>CSE</small>
                      <strong>
                        {displayValue(
                          caseDetails.case?.cse_id
                        )}
                      </strong>
                    </div>

                    <div>
                      <small>SEVERITY</small>
                      <strong>
                        {displayValue(
                          caseDetails.case?.severity
                        )}
                      </strong>
                    </div>

                    <div>
                      <small>PRIORITY</small>
                      <strong>
                        {displayValue(
                          caseDetails.case?.priority
                        )}
                      </strong>
                    </div>

                    <div>
                      <small>STATUS</small>
                      <strong>
                        {displayValue(
                          caseDetails.case?.status
                        )}
                      </strong>
                    </div>

                    <div>
                      <small>ASSET</small>
                      <strong>
                        {displayValue(
                          caseDetails.case?.asset_id
                        )}
                      </strong>
                    </div>

                  </div>

                </section>

                {/* FINDING */}

                <section className="case-detail-section">

                  <span className="eyebrow">
                    DETECTED FINDING
                  </span>

                  {caseAnalysis?.signals?.length ? (

                    <div className="signal-detail-list">

                      {caseAnalysis.signals.map(
                        (signal, index) => (

                          <div
                            className="signal-detail-card"
                            key={index}
                          >

                            <div className="signal-card-top">
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
                              {signal.description}
                            </p>

                            <div className="signal-meta">

                              <span>
                                <strong>
                                  Dimension:
                                </strong>{" "}
                                {displayValue(
                                  signal.supervisory_dimension
                                )}
                              </span>

                              <span>
                                <strong>
                                  Category:
                                </strong>{" "}
                                {displayValue(
                                  signal.signal_category
                                )}
                              </span>

                            </div>

                            <div className="evidence-source-row">

                              <small>
                                Supporting Sources
                              </small>

                              {(signal.evidence_sources ||
                                []).length > 0 ? (

                                signal.evidence_sources.map(
                                  (
                                    source,
                                    sourceIndex
                                  ) => (
                                    <span
                                      key={sourceIndex}
                                    >
                                      {source}
                                    </span>
                                  )
                                )

                              ) : (

                                <span>
                                  No source references
                                </span>

                              )}

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="detail-empty">
                      No supervisory signals detected
                      for this case.
                    </div>

                  )}

                </section>

                {/* EVIDENCE AVAILABILITY */}

                <section className="case-detail-section">

                  <span className="eyebrow">
                    EVIDENCE AVAILABILITY
                  </span>

                  <div className="availability-grid">

                    {renderAvailability(
                      caseDetails.evidence_summary
                        ?.evidence_available,
                      caseDetails.evidence_summary
                        ?.evidence_count,
                      "AVAILABLE",
                      "NOT AVAILABLE"
                    )}

                    {renderAvailability(
                      caseDetails.evidence_summary
                        ?.raw_logs_available,
                      caseDetails.evidence_summary
                        ?.raw_log_count,
                      "AVAILABLE",
                      "NOT AVAILABLE"
                    )}

                    <div className="availability-card">
                      <strong>
                        {caseDetails.investigations?.length
                          ? "AVAILABLE"
                          : "MISSING"}
                      </strong>

                      <span>
                        {caseDetails.investigations
                          ?.length ?? 0}{" "}
                        investigation record
                        {caseDetails.investigations
                          ?.length === 1
                          ? ""
                          : "s"}
                      </span>
                    </div>

                    <div className="availability-card">
                      <strong>
                        {caseDetails.events?.length
                          ? "AVAILABLE"
                          : "NO EVENTS"}
                      </strong>

                      <span>
                        {caseDetails.events?.length ?? 0}{" "}
                        event record
                        {caseDetails.events?.length === 1
                          ? ""
                          : "s"}
                      </span>
                    </div>

                  </div>

                </section>

                {/* SOURCE RECORDS */}

                <section className="case-detail-section">

                  <span className="eyebrow">
                    SOURCE RECORDS
                  </span>

                  <div className="case-source-status">

                    <div>
                      <span className="source-status-icon">
                        {caseDetails.alerts?.length
                          ? "✓"
                          : "—"}
                      </span>

                      <div>
                        <strong>Alerts</strong>

                        <small>
                          {caseDetails.alerts?.length ?? 0}{" "}
                          record
                          {caseDetails.alerts?.length === 1
                            ? ""
                            : "s"}
                        </small>
                      </div>
                    </div>

                    <div>
                      <span className="source-status-icon">
                        {caseDetails.investigations?.length
                          ? "✓"
                          : "!"}
                      </span>

                      <div>
                        <strong>Investigations</strong>

                        <small>
                          {caseDetails.investigations?.length ?? 0}{" "}
                          record
                          {caseDetails.investigations?.length === 1
                            ? ""
                            : "s"}
                        </small>
                      </div>
                    </div>

                    <div>
                      <span className="source-status-icon">
                        {caseDetails.escalations?.length
                          ? "✓"
                          : "—"}
                      </span>

                      <div>
                        <strong>Escalations</strong>

                        <small>
                          {caseDetails.escalations?.length ?? 0}{" "}
                          record
                          {caseDetails.escalations?.length === 1
                            ? ""
                            : "s"}
                        </small>
                      </div>
                    </div>

                    <div>
                      <span className="source-status-icon">
                        {caseDetails.evidence?.length
                          ? "✓"
                          : "!"}
                      </span>

                      <div>
                        <strong>Evidence</strong>

                        <small>
                          {caseDetails.evidence?.length ?? 0}{" "}
                          record
                          {caseDetails.evidence?.length === 1
                            ? ""
                            : "s"}
                        </small>
                      </div>
                    </div>

                    <div>
                      <span className="source-status-icon">
                        {caseDetails.events?.length
                          ? "✓"
                          : "—"}
                      </span>

                      <div>
                        <strong>Events</strong>

                        <small>
                          {caseDetails.events?.length ?? 0}{" "}
                          record
                          {caseDetails.events?.length === 1
                            ? ""
                            : "s"}
                        </small>
                      </div>
                    </div>

                    <div>
                      <span className="source-status-icon">
                        {caseDetails.raw_logs?.length
                          ? "✓"
                          : "!"}
                      </span>

                      <div>
                        <strong>Raw Logs</strong>

                        <small>
                          {caseDetails.raw_logs?.length ?? 0}{" "}
                          record
                          {caseDetails.raw_logs?.length === 1
                            ? ""
                            : "s"}
                        </small>
                      </div>
                    </div>

                  </div>

                </section>

                {/* ALERTS */}

                <section className="case-detail-section">

                  <span className="eyebrow">
                    ALERT RECORDS
                  </span>

                  {renderRecords(
                    caseDetails.alerts,
                    "No alert records are linked to this case."
                  )}

                </section>

                {/* INVESTIGATIONS */}

                <section className="case-detail-section">

                  <span className="eyebrow">
                    INVESTIGATION RECORDS
                  </span>

                  {renderRecords(
                    caseDetails.investigations,
                    "No investigation record was found for this case. This absence may be relevant to the detected finding."
                  )}

                </section>

                {/* ESCALATIONS */}

                <section className="case-detail-section">

                  <span className="eyebrow">
                    ESCALATION RECORDS
                  </span>

                  {renderRecords(
                    caseDetails.escalations,
                    "No escalation record is linked to this case."
                  )}

                </section>

                {/* EVIDENCE */}

                <section className="case-detail-section">

                  <span className="eyebrow">
                    EVIDENCE RECORDS
                  </span>

                  {renderRecords(
                    caseDetails.evidence,
                    "No evidence records are linked to this case."
                  )}

                </section>

                {/* EVENT TIMELINE */}

                <section className="case-detail-section">

                  <span className="eyebrow">
                    EVENT TIMELINE
                  </span>

                  {caseDetails.events?.length ? (

                    <div className="timeline-list">

                      {caseDetails.events.map(
                        (event, index) => (

                          <div
                            className="timeline-item"
                            key={
                              event.event_id || index
                            }
                          >

                            <div className="timeline-marker">
                              {index + 1}
                            </div>

                            <div className="timeline-content">

                              <div className="timeline-top">

                                <strong>
                                  {displayValue(
                                    event.event_type
                                  )}
                                </strong>

                                <span>
                                  {displayValue(
                                    event.event_timestamp
                                  )}
                                </span>

                              </div>

                              <p>
                                {displayValue(
                                  event.event_summary
                                )}
                              </p>

                              <div className="timeline-meta">

                                <span>
                                  Event ID:{" "}
                                  {displayValue(
                                    event.event_id
                                  )}
                                </span>

                                <span>
                                  Source:{" "}
                                  {displayValue(
                                    event.source_system
                                  )}
                                </span>

                                <span>
                                  Count:{" "}
                                  {displayValue(
                                    event.event_count
                                  )}
                                </span>

                              </div>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="detail-empty">
                      No event records are linked to
                      this case.
                    </div>

                  )}

                </section>

                {/* ASSET */}

                <section className="case-detail-section">

                  <span className="eyebrow">
                    ASSET CONTEXT
                  </span>

                  {caseDetails.asset ? (

                    <div className="asset-context-card">

                      <div>
                        <small>ASSET</small>

                        <strong>
                          {displayValue(
                            caseDetails.asset.asset_id
                          )}
                        </strong>
                      </div>

                      <div>
                        <small>NAME</small>

                        <strong>
                          {displayValue(
                            caseDetails.asset.asset_name
                          )}
                        </strong>
                      </div>

                      <div>
                        <small>TYPE</small>

                        <strong>
                          {displayValue(
                            caseDetails.asset.asset_type
                          )}
                        </strong>
                      </div>

                      <div>
                        <small>ENVIRONMENT</small>

                        <strong>
                          {displayValue(
                            caseDetails.asset.environment
                          )}
                        </strong>
                      </div>

                      <div>
                        <small>CRITICALITY</small>

                        <strong>
                          {displayValue(
                            caseDetails.asset.criticality
                          )}
                        </strong>
                      </div>

                      <div>
                        <small>EXPECTED DAILY EVENTS</small>

                        <strong>
                          {displayValue(
                            caseDetails.asset
                              .expected_daily_events
                          )}
                        </strong>
                      </div>

                    </div>

                  ) : (

                    <div className="detail-empty">
                      No asset record is linked to this
                      case.
                    </div>

                  )}

                </section>

                {/* RAW LOGS */}

                <section className="case-detail-section">

                  <span className="eyebrow">
                    RAW LOGS
                  </span>

                  {renderRecords(
                    caseDetails.raw_logs,
                    "No raw logs are linked to this case. Raw telemetry cannot be reviewed from this case record."
                  )}

                </section>

                {/* CASE RECORD */}

                <section className="case-detail-section">

                  <span className="eyebrow">
                    CASE RECORD
                  </span>

                  {renderRecord(caseDetails.case)}

                </section>

                {/* OFFICER NOTES */}

                <section className="case-detail-section">

                  <span className="eyebrow">
                    OFFICER NOTES
                  </span>

                  <textarea
                    className="officer-notes"
                    value={notes}
                    onChange={(event) =>
                      setNotes(event.target.value)
                    }
                    placeholder="Add review notes, observations or follow-up requirements..."
                    rows={6}
                  />

                </section>

                {/* FOOTER */}

                <div className="case-review-footer">

                  <div>

                    {flagged ? (

                      <strong>
                        ⚑ Case marked for review
                      </strong>

                    ) : (

                      <span>
                        Review the supporting records
                        before closing this case.
                      </span>

                    )}

                  </div>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={closeCase}
                  >
                    Close Case
                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default Dashboard;
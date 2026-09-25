function Home({ onStartAssessment, onViewDashboard }) {
  return (
    <div className="home-page">

      <section className="home-hero">

        <div className="hero-content">

          <span className="eyebrow">
            SUPERVISORY SECURITY ANALYTICS
          </span>

          <h2>
            Security assessment,
            <br />
            <span>backed by evidence.</span>
          </h2>

          <p>
            Analyse security operations, investigations,
            evidence and supervisory signals across
            critical infrastructure datasets.
          </p>

          <div className="hero-actions">

            <button
              className="primary-button"
              onClick={onStartAssessment}
            >
              + New Assessment
            </button>

            <button
              className="secondary-button"
              onClick={onViewDashboard}
            >
              View Latest Analysis ?
            </button>

          </div>

        </div>

        <div className="hero-panel">

          <div className="hero-panel-header">
            <span>ASSESSMENT WORKFLOW</span>
            <span className="live-badge">LIVE</span>
          </div>

          <div className="workflow">

            <div className="workflow-step active">
              <span>01</span>
              <div>
                <strong>Ingest</strong>
                <p>Security datasets</p>
              </div>
            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step">
              <span>02</span>
              <div>
                <strong>Analyse</strong>
                <p>Signals & anomalies</p>
              </div>
            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step">
              <span>03</span>
              <div>
                <strong>Assess</strong>
                <p>CSE & case analysis</p>
              </div>
            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step">
              <span>04</span>
              <div>
                <strong>Review</strong>
                <p>Evidence & actions</p>
              </div>
            </div>

          </div>

        </div>

      </section>

      <section className="home-features">

        <div className="feature-card">
          <div className="feature-icon">01</div>
          <h3>Evidence-backed analysis</h3>
          <p>
            Connect detected signals with cases,
            events, investigations and evidence.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">02</div>
          <h3>CSE-level visibility</h3>
          <p>
            Review supervisory signals and operational
            patterns across individual CSE units.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">03</div>
          <h3>Officer review workflow</h3>
          <p>
            Move from automated findings to evidence
            review and recorded supervisory actions.
          </p>
        </div>

      </section>

    </div>
  );
}

export default Home;

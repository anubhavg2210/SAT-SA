import { useState } from "react";

function Assessment({ onBack, onAnalysisComplete }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);

    setFiles(selectedFiles);
    setStatus("");
  };

  const startAnalysis = async () => {
    if (files.length === 0) {
      setStatus("Please upload at least one dataset.");
      return;
    }

    setLoading(true);
    setStatus("Uploading datasets and starting analysis...");

    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(
        "http://127.0.0.1:8000/api/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Analysis request failed.");
      }

      const result = await response.json();

      setStatus("Analysis completed successfully.");

      onAnalysisComplete(result);

    } catch (error) {
      setStatus(
        "Unable to start analysis. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assessment-page">

      <div className="page-heading">

        <div>
          <span className="eyebrow">
            NEW ASSESSMENT
          </span>

          <h2>Upload Security Datasets</h2>

          <p>
            Upload the datasets required for SAT-SA
            supervisory analysis.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={onBack}
        >
          ← Back
        </button>

      </div>


      <section className="upload-panel">

        <div className="upload-header">

          <div>
            <span className="eyebrow">
              DATA INGESTION
            </span>

            <h3>Assessment Dataset</h3>

            <p>
              Select CSV files containing cases, events,
              investigations, evidence and related records.
            </p>
          </div>

        </div>


        <label className="upload-box">

          <input
            type="file"
            multiple
            accept=".csv,.xlsx,.json"
            onChange={handleFileChange}
          />

          <div className="upload-icon">
            +
          </div>

          <strong>
            Select dataset files
          </strong>

          <span>
            CSV, XLSX or JSON
          </span>

        </label>


        {files.length > 0 && (

          <div className="selected-files">

            <div className="selected-files-header">
              <strong>
                Selected Files
              </strong>

              <span>
                {files.length} file(s)
              </span>
            </div>

            {files.map((file) => (

              <div
                className="file-row"
                key={file.name}
              >

                <div>
                  <strong>
                    {file.name}
                  </strong>

                  <span>
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>

                <span className="file-status">
                  Ready
                </span>

              </div>

            ))}

          </div>

        )}


        {status && (

          <div
            className={
              loading
                ? "analysis-message loading-message"
                : "analysis-message"
            }
          >
            {status}
          </div>

        )}


        <div className="assessment-actions">

          <button
            className="secondary-button"
            onClick={onBack}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="primary-button"
            onClick={startAnalysis}
            disabled={loading || files.length === 0}
          >
            {loading
              ? "Analysing..."
              : "Start Analysis →"}
          </button>

        </div>

      </section>

    </div>
  );
}

export default Assessment;
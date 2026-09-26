import { useRef, useState } from "react";

const REQUIRED_FILES = [
  "cases.csv",
  "alerts.csv",
  "investigations.csv",
  "escalations.csv",
  "evidence.csv",
  "events.csv",
  "assets.csv",
];

function Assessment({ onAnalysisComplete }) {
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleFiles(selectedFiles) {
    const csvFiles = Array.from(selectedFiles).filter((file) =>
      file.name.toLowerCase().endsWith(".csv")
    );

    setFiles(csvFiles);
    setMessage("");
    setError("");
  }

  async function handleUpload() {
    if (!files.length) {
      setError("Please select CSV files first.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      const uploadResponse = await fetch(
        "http://127.0.0.1:8000/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          uploadData.detail || "Upload failed."
        );
      }

      if (uploadData.dataset_status !== "ready") {
        setMessage(
          `Dataset status: ${uploadData.dataset_status}`
        );

        if (uploadData.missing_files?.length) {
          setError(
            `Missing files: ${uploadData.missing_files.join(", ")}`
          );
        }

        return;
      }

      setMessage(
        "Dataset uploaded successfully. Running full analysis..."
      );

      const analysisResponse = await fetch(
        "http://127.0.0.1:8000/api/analysis"
      );

      const analysisData =
        await analysisResponse.json();

      if (!analysisResponse.ok) {
        throw new Error(
          analysisData.detail ||
            "Analysis failed."
        );
      }

      setMessage(
        "Analysis completed successfully."
      );

      if (onAnalysisComplete) {
        onAnalysisComplete(analysisData);
      }
    } catch (err) {
      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setUploading(false);
    }
  }

  const uploadedNames = new Set(
    files.map((file) => file.name)
  );

  return (
    <div className="assessment-page">

      <div className="page-heading">
        <div>
          <span className="eyebrow">
            DATA INGESTION
          </span>

          <h2>
            Upload Assessment Dataset
          </h2>

          <p>
            Upload the security-operation CSV files
            to begin the supervisory assessment.
          </p>
        </div>
      </div>

      <section className="upload-panel">

        <div
          className="upload-dropzone"
          onClick={() => inputRef.current?.click()}
        >
          <div className="upload-icon">
            +
          </div>

          <h3>
            Upload CSV files
          </h3>

          <p>
            Select multiple CSV files at once.
          </p>

          <button
            type="button"
            className="secondary-button"
            onClick={(event) => {
              event.stopPropagation();
              inputRef.current?.click();
            }}
          >
            Choose Files
          </button>

          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            multiple
            hidden
            onChange={(event) =>
              handleFiles(event.target.files)
            }
          />
        </div>

        <div className="required-files">

          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                REQUIRED DATA
              </span>

              <h3>
                Assessment Files
              </h3>
            </div>

            <span className="panel-note">
              {files.length} selected
            </span>
          </div>

          <div className="file-check-list">

            {REQUIRED_FILES.map((filename) => {

              const present =
                uploadedNames.has(filename);

              return (
                <div
                  className={`file-check ${
                    present ? "present" : ""
                  }`}
                  key={filename}
                >
                  <span>
                    {present ? "✓" : "○"}
                  </span>

                  <strong>
                    {filename}
                  </strong>

                  <small>
                    {present
                      ? "Selected"
                      : "Required"}
                  </small>
                </div>
              );
            })}

          </div>

        </div>

        {files.length > 0 && (
          <div className="selected-files">

            <span className="eyebrow">
              SELECTED FILES
            </span>

            {files.map((file) => (
              <div
                className="selected-file"
                key={file.name}
              >
                <span>{file.name}</span>

                <small>
                  {(file.size / 1024).toFixed(1)} KB
                </small>
              </div>
            ))}

          </div>
        )}

        {message && (
          <div className="upload-message">
            {message}
          </div>
        )}

        {error && (
          <div className="upload-error">
            {error}
          </div>
        )}

        <div className="upload-actions">

          <button
            className="primary-button"
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
          >
            {uploading
              ? "Analysing Dataset..."
              : "Upload & Run Analysis"}
          </button>

        </div>

      </section>

    </div>
  );
}

export default Assessment;
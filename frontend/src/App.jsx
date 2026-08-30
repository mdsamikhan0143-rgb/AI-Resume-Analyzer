import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  // =========================================
  // CONVERT ANALYSIS INTO JAVASCRIPT OBJECT
  // =========================================
  const normalizeAnalysis = (value) => {
    if (!value) {
      return null;
    }

    // Already an object
    if (typeof value === "object") {
      return value;
    }

    // If backend/history gives JSON as string
    if (typeof value === "string") {
      const cleaned = value
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      try {
        return JSON.parse(cleaned);
      } catch {
        // Support older analyses
        return {
          raw_text: value,
        };
      }
    }

    return null;
  };

  // =========================================
  // LOAD HISTORY
  // =========================================
  const loadHistory = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/resume/history"
      );

      if (!response.ok) {
        throw new Error("Failed to load history");
      }

      const data = await response.json();

      console.log("History:", data);

      setHistory(data);
    } catch (error) {
      console.error("History error:", error);
    }
  };

  // Load history when page starts
  useEffect(() => {
    loadHistory();
  }, []);

  // =========================================
  // ANALYZE RESUME
  // =========================================
  const analyzeResume = async () => {
    if (!file) {
      alert("Please select a resume first.");
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setSelectedHistoryId(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/resume/upload-resume",
        {
          method: "POST",
          body: formData,
        }
      );

      // Read backend response first
      const data = await response.json();

      // Show backend error message
      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Resume analysis failed."
        );
      }

      console.log("Backend response:", data);

      const result =
        data.analysis ??
        data.result ??
        data;

      const parsedAnalysis =
        normalizeAnalysis(result);

      console.log(
        "Parsed analysis:",
        parsedAnalysis
      );

      setAnalysis(parsedAnalysis);

      // Refresh history
      await loadHistory();

      // Scroll to analysis result
      setTimeout(() => {
        document
          .getElementById("analysis-section")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 200);

    } catch (error) {
      console.error(
        "Analysis error:",
        error
      );

      alert(
        error.message ||
          "Resume analysis failed."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // ATS SCORE
  // =========================================
  const getScore = () => {
    if (!analysis) {
      return null;
    }

    // New structured analysis
    if (
      analysis.ats_score !== undefined &&
      analysis.ats_score !== null
    ) {
      const value = Number(
        analysis.ats_score
      );

      return Math.min(
        100,
        Math.max(0, value)
      );
    }

    // Old saved analysis
    if (analysis.raw_text) {
      const match =
        analysis.raw_text.match(
          /ATS Score[^0-9]*(\d{1,3})/i
        );

      if (match) {
        return Number(match[1]);
      }
    }

    return null;
  };

  const score = getScore();

  // =========================================
  // VIEW SAVED ANALYSIS
  // =========================================
  const viewHistoryAnalysis = (item) => {
    const savedAnalysis =
      normalizeAnalysis(item.analysis);

    setAnalysis(savedAnalysis);

    setSelectedHistoryId(
      item.id
    );

    setTimeout(() => {
      document
        .getElementById("analysis-section")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };

  // =========================================
  // DISPLAY LIST
  // =========================================
  const renderList = (items) => {
    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return (
        <p>No information found.</p>
      );
    }

    return (
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div>
          <h1>
            AI Resume Analyzer
          </h1>

          <p>
            Get intelligent ATS insights and improve your resume.
          </p>
        </div>
      </header>

      <main className="container">

        {/* =========================
            UPLOAD
        ========================= */}

        <section className="upload-card">

          <div className="upload-icon">
            📄
          </div>

          <h2>
            Upload Your Resume
          </h2>

          <p>
            Upload your resume and let AI analyze it.
          </p>

          <label className="file-button">
            Choose Resume

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              hidden
              onChange={(e) => {
                const selectedFile =
                  e.target.files?.[0] ||
                  null;

                setFile(selectedFile);

                setSelectedHistoryId(
                  null
                );
              }}
            />
          </label>

          {file && (
            <div className="selected-file">
              ✓ {file.name}
            </div>
          )}

          <button
            className="analyze-button"
            onClick={analyzeResume}
            disabled={loading}
          >
            {loading
              ? "Analyzing Resume..."
              : "Analyze Resume"}
          </button>

        </section>


        {/* =========================
            ANALYSIS
        ========================= */}

        {analysis && (

          <section
            className="analysis-section"
            id="analysis-section"
          >

            <div className="section-title">

              <h2>
                Resume Analysis
              </h2>

              <p>
                AI-powered insights from your resume
              </p>

              {selectedHistoryId && (
                <p>
                  📋 Viewing saved analysis
                </p>
              )}

            </div>


            {/* =========================
                SCORE CARDS
            ========================= */}

            <div className="score-grid">

              <div className="score-card">

                <h3>
                  ATS Score
                </h3>

                <div className="score">

                  {score !== null
                    ? score
                    : "--"}

                  <span>
                    /100
                  </span>

                </div>

                <div className="progress">

                  <div
                    className="progress-bar"
                    style={{
                      width:
                        `${score ?? 0}%`,
                    }}
                  />

                </div>

              </div>


              <div className="overview-card">

                <h3>
                  Resume Overview
                </h3>

                <div className="overview-number">

                  {score !== null
                    ? `${score}%`
                    : "--"}

                </div>

                <p>
                  Resume compatibility
                </p>

                <div className="progress">

                  <div
                    className="progress-bar"
                    style={{
                      width:
                        `${score ?? 0}%`,
                    }}
                  />

                </div>

              </div>

            </div>


            {/* =========================
                STRUCTURED ANALYSIS
            ========================= */}

            {!analysis.raw_text && (

              <div className="analysis-grid">

                <div className="analysis-card">

                  <h2>
                    🛠 Skills
                  </h2>

                  {renderList(
                    analysis.skills
                  )}

                </div>


                <div className="analysis-card">

                  <h2>
                    ✅ Strengths
                  </h2>

                  {renderList(
                    analysis.strengths
                  )}

                </div>


                <div className="analysis-card">

                  <h2>
                    ⚠️ Weaknesses
                  </h2>

                  {renderList(
                    analysis.weaknesses
                  )}

                </div>


                <div className="analysis-card">

                  <h2>
                    💡 Suggestions
                  </h2>

                  {renderList(
                    analysis.suggestions
                  )}

                </div>

              </div>

            )}


            {/* OLD ANALYSIS SUPPORT */}

            {analysis.raw_text && (

              <div className="result-card">

                <h2>
                  🤖 Previous AI Analysis
                </h2>

                <div className="analysis-text">
                  {analysis.raw_text}
                </div>

              </div>

            )}

          </section>

        )}


        {/* =========================
            HISTORY
        ========================= */}

        <section className="history">

          <div className="history-header">

            <div>

              <h2>
                📋 Analysis History
              </h2>

              <p>
                Your previously analyzed resumes
              </p>

            </div>

            <button
              className="refresh-button"
              onClick={loadHistory}
            >
              🔄 Refresh
            </button>

          </div>


          {history.length === 0 ? (

            <div className="no-history">

              <h3>
                No previous analyses
              </h3>

              <p>
                Upload and analyze your first resume.
              </p>

            </div>

          ) : (

            <div className="history-list">

              {history.map(
                (item, index) => (

                  <div
                    key={
                      item.id ||
                      index
                    }
                    className={
                      `history-item ${
                        selectedHistoryId ===
                        item.id
                          ? "selected-history"
                          : ""
                      }`
                    }
                  >

                    <div className="history-info">

                      <div className="history-icon">
                        📄
                      </div>

                      <div>

                        <strong>
                          {item.filename ||
                            "Resume"}
                        </strong>

                        <p>
                          Analysis #
                          {history.length -
                            index}
                        </p>

                      </div>

                    </div>


                    <button
                      className="view-button"
                      onClick={() =>
                        viewHistoryAnalysis(
                          item
                        )
                      }
                    >
                      View Analysis →
                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default App;
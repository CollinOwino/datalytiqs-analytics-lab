"use client";

import { useEffect, useMemo, useState } from "react";
import "./playgrounds.css";
import "./datasets.css";

type Cell = { id: string; code: string };
type TablePayload = {
  columns: string[];
  rows: (string | number | boolean | null)[][];
  rowCount?: number;
};
type ChartPayload = {
  format: string;
  data?: string;
  url?: string;
  title?: string;
};
type ExecutionOutput = {
  id: string;
  kind: string;
  sequence: number;
  text?: string;
  table?: TablePayload;
  chart?: ChartPayload;
};
type ExecutionResult = {
  status: string;
  outputs?: ExecutionOutput[];
  error?: { message?: string };
};

const firstCell = `# DatalytIQs Playground\n# Case_001_Dataset.xlsx is available as df\n\nprint("Dataset shape:", df.shape)\nprint("Columns:", list(df.columns))\ndf.head()`;
const analysisCell = `# Build a transparent descriptive summary\nnumeric = df.select_dtypes(include="number")\nsummary = numeric.describe().T.round(2)\nsummary`;
const visualCell = `# Create a clearly labelled visual\nimport matplotlib.pyplot as plt\nscore = df.select_dtypes(include="number").columns[0]\nplt.figure(figsize=(8, 4.5))\ndf[score].dropna().hist(bins=12, color="#1565C0", edgecolor="white")\nplt.title(f"Distribution of {score}")\nplt.xlabel(score)\nplt.ylabel("Number of records")\nplt.tight_layout()\nplt.show()`;

const datasetCatalog = {
  case001: {
    caseId: "001",
    title: "School Performance · Case 001",
    file: "Case_001_Dataset.xlsx",
    domain: "Education",
    question:
      "What patterns in the school-performance dataset deserve management attention?",
  },
  macro: {
    caseId: "pg-kenya-macro",
    title: "Kenya Macroeconomic Indicators",
    file: "kenya_macro_illustrative.csv",
    domain: "Economics",
    question:
      "How do growth, inflation, policy rates and public debt move across time?",
  },
  counties: {
    caseId: "pg-county-services",
    title: "County Service-Delivery Indicators",
    file: "county_services_illustrative.csv",
    domain: "Governance",
    question:
      "Which service-delivery gaps and peer differences merit management attention?",
  },
  health: {
    caseId: "pg-community-health",
    title: "Community Health Service Indicators",
    file: "community_health_illustrative.csv",
    domain: "Public health",
    question:
      "What seasonal service and disease patterns require operational follow-up?",
  },
  demographics: {
    caseId: "pg-african-demographics",
    title: "African Demographic & Livelihood Indicators",
    file: "african_demographic_livelihood_illustrative.csv",
    domain: "Demography",
    question:
      "Which demographic and livelihood gaps merit careful, equity-conscious investigation?",
  },
  housing: {
    caseId: "pg-kenya-housing",
    title: "Kenya Housing Price Modelling",
    file: "kenya_housing_illustrative.csv",
    domain: "Housing economics",
    question:
      "Which property attributes explain variation in asking prices, and how reliably can they support valuation?",
  },
} as const;
type DatasetKey = keyof typeof datasetCatalog;

function firstCellFor(key: DatasetKey) {
  const d = datasetCatalog[key];
  return `# DatalytIQs Playground
# ${d.file} is available as df
# IMPORTANT: datasets labelled illustrative contain original teaching values, not official statistics.

print("Dataset shape:", df.shape)
print("Columns:", list(df.columns))
df.head()`;
}
function freshCells(key: DatasetKey = "case001"): Cell[] {
  return [
    { id: crypto.randomUUID(), code: firstCellFor(key) },
    { id: crypto.randomUUID(), code: analysisCell },
  ];
}
function chartSource(chart?: ChartPayload) {
  if (!chart) return "";
  if (chart.url) return chart.url;
  if (chart.data)
    return chart.data.startsWith("data:")
      ? chart.data
      : `data:${chart.format === "svg" ? "image/svg+xml" : "image/png"};base64,${chart.data}`;
  return "";
}

export default function Playgrounds() {
  const [title, setTitle] = useState("Untitled analysis");
  const [question, setQuestion] = useState(
    "What patterns in the school-performance dataset deserve management attention?",
  );
  const [cells, setCells] = useState<Cell[]>([]);
  const [active, setActive] = useState("");
  const [outputs, setOutputs] = useState<ExecutionOutput[]>([]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState("");
  const [view, setView] = useState<"console" | "table" | "chart">("console");
  const [savedAt, setSavedAt] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<"workspace" | "datasets">("workspace");
  const [dataset, setDataset] = useState<DatasetKey>("case001");
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("tab") === "datasets")
      setMode("datasets");
  }, []);
  useEffect(() => {
    try {
      const requested = new URLSearchParams(window.location.search).get(
        "dataset",
      ) as DatasetKey | null;
      const key =
        requested && requested in datasetCatalog ? requested : "case001";
      setDataset(key);
      if (key !== "case001") {
        const starter = freshCells(key);
        setCells(starter);
        setActive(starter[0].id);
        setTitle(datasetCatalog[key].title);
        setQuestion(datasetCatalog[key].question);
        return;
      }
      const raw = localStorage.getItem("datalytiqs-playground-v1");
      if (raw) {
        const x = JSON.parse(raw);
        setTitle(x.title || "Untitled analysis");
        setQuestion(x.question || "");
        setCells(
          Array.isArray(x.cells) && x.cells.length ? x.cells : freshCells(key),
        );
        setActive(x.active || x.cells?.[0]?.id || "");
      } else {
        const starter = freshCells(key);
        setCells(starter);
        setActive(starter[0].id);
      }
    } catch {
      const starter = freshCells();
      setCells(starter);
      setActive(starter[0].id);
    } finally {
      setLoaded(true);
    }
  }, []);
  useEffect(() => {
    if (!loaded || !cells.length) return;
    const timer = setTimeout(() => {
      localStorage.setItem(
        "datalytiqs-playground-v1",
        JSON.stringify({
          title,
          question,
          cells,
          active,
          updatedAt: new Date().toISOString(),
        }),
      );
      setSavedAt(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }, 650);
    return () => clearTimeout(timer);
  }, [loaded, title, question, cells, active]);
  const combined = useMemo(
    () => cells.map((c, i) => `# %% Cell ${i + 1}\n${c.code}`).join("\n\n"),
    [cells],
  );
  function update(id: string, code: string) {
    setCells((x) => x.map((c) => (c.id === id ? { ...c, code } : c)));
  }
  function addCell(code = "# Write Python here\n") {
    const c = { id: crypto.randomUUID(), code };
    setCells((x) => [...x, c]);
    setActive(c.id);
  }
  function removeCell(id: string) {
    if (cells.length === 1) return;
    const next = cells.filter((c) => c.id !== id);
    setCells(next);
    if (active === id) setActive(next[0].id);
  }
  function duplicate() {
    const source = cells.find((c) => c.id === active) ?? cells[0];
    addCell(source.code);
  }
  function reset() {
    if (!confirm("Reset this playground to its starter notebook?")) return;
    const c = freshCells(dataset);
    setCells(c);
    setActive(c[0].id);
    setOutputs([]);
    setError("");
  }
  function download() {
    const text = `# ${title}\n# Research question: ${question}\n# Exported from DatalytIQs Playgrounds\n\n${combined}`;
    const blob = new Blob([text], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "datalytiqs-playground"
    }.py`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function run() {
    setRunning(true);
    setError("");
    setOutputs([]);
    setStatus("Submitting");
    try {
      const submit = await fetch("/api/executions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          requestId: crypto.randomUUID(),
          caseId: datasetCatalog[dataset].caseId,
          language: "python",
          code: combined,
          metadata: { stage: "playground" },
          limits: {
            timeoutMs: 30000,
            memoryMb: 512,
            cpuSeconds: 20,
            maxOutputBytes: 2000000,
            network: "disabled",
          },
        }),
      });
      const accepted = await submit.json();
      if (submit.status === 401)
        throw new Error("Sign in to the Analytics Lab before running Python.");
      if (!submit.ok)
        throw new Error(
          accepted?.error?.message || "Execution could not be submitted.",
        );
      setStatus(accepted.status || "Queued");
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 500));
        const res = await fetch(
          `/api/executions/${encodeURIComponent(accepted.executionId)}`,
          { cache: "no-store" },
        );
        const result = (await res.json()) as ExecutionResult;
        if (!res.ok)
          throw new Error(
            result?.error?.message || "Execution result is unavailable.",
          );
        setStatus(result.status);
        if (result.outputs)
          setOutputs(
            [...result.outputs].sort((a, b) => a.sequence - b.sequence),
          );
        if (
          ["succeeded", "failed", "timed_out", "cancelled"].includes(
            result.status,
          )
        ) {
          if (result.status !== "succeeded")
            setError(result.error?.message || `Execution ${result.status}.`);
          return;
        }
      }
      throw new Error("Execution did not finish within the polling window.");
    } catch (e) {
      setStatus("Failed");
      setError(e instanceof Error ? e.message : "Execution failed.");
    } finally {
      setRunning(false);
    }
  }
  const stdout = outputs
    .filter((o) => ["stdout", "stderr", "error"].includes(o.kind))
    .map((o) => o.text || "")
    .join("\n");
  const table = outputs.find((o) => o.kind === "table")?.table;
  const chart = outputs.find((o) => o.kind === "chart")?.chart;
  const chartSrc = chartSource(chart);
  function openWorkspace(key: DatasetKey = dataset) {
    setDataset(key);
    const starter = freshCells(key);
    setCells(starter);
    setActive(starter[0].id);
    setTitle(datasetCatalog[key].title);
    setQuestion(datasetCatalog[key].question);
    setMode("workspace");
    history.replaceState(null, "", `/playgrounds?dataset=${key}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (mode === "datasets")
    return (
      <main className="pg-shell">
        <header className="pg-top">
          <div>
            <a href="/">DatalytIQs Analytics Lab</a>
            <span>/</span>
            <strong>Dataset Library</strong>
          </div>
          <nav>
            <a href="/evidence-lab">Guided Projects</a>
            <a className="active" href="/playgrounds">
              Playgrounds
            </a>
            <a href="/practice">Interactive Practice</a>
            <a href="/data-explorer">Data Explorer</a>
          </nav>
          <div>
            <span className="pg-dot" />
            Curated · documented · safe
          </div>
        </header>
        <section className="ds-hero">
          <div>
            <span>DATALYTIQS DATASET LIBRARY</span>
            <h1>Choose evidence worth investigating.</h1>
            <p>
              Start with documented, learning-ready datasets. Each entry states
              its provenance, analytical level, format and permitted use before
              it enters the execution environment.
            </p>
          </div>
          <button onClick={() => openWorkspace()}>
            Open current playground →
          </button>
        </section>
        <section className="ds-controls">
          <label>
            <span>SEARCH DATASETS</span>
            <input
              placeholder="Search by subject, skill or format"
              disabled
              title="Search activates when the catalogue expands"
            />
          </label>
          <div>
            <button className="active">All</button>
            <button>Education</button>
            <button>Economics</button>
            <button>Governance</button>
            <button>Public health</button>
          </div>
        </section>
        <section className="ds-grid">
          <article className="available">
            <div className="ds-card-head">
              <span>HOUSING ECONOMICS</span>
              <b>NEW PATHWAY</b>
            </div>
            <h2>Kenya Housing Price Modelling</h2>
            <p>
              Original illustrative property records for progressive
              regression, diagnostic testing and professionally qualified
              valuation. Values are teaching data—not market quotations.
            </p>
            <dl>
              <div><dt>Format</dt><dd>CSV · tabular</dd></div>
              <div><dt>Workspace object</dt><dd><code>df</code></dd></div>
              <div><dt>Level</dt><dd>Intermediate</dd></div>
              <div><dt>Provenance</dt><dd>DatalytIQs original illustrative data</dd></div>
            </dl>
            <div className="ds-skills">
              <span>Regression</span>
              <span>Diagnostics</span>
              <span>Valuation</span>
            </div>
            <button
              onClick={() =>
                (location.href = "/playgrounds/pathway?dataset=housing")
              }
            >
              Start structured pathway
            </button>
            <button onClick={() => openWorkspace("housing")}>
              Open in Python Playground
            </button>
          </article>
          <article className="available">
            <div className="ds-card-head">
              <span>EDUCATION</span>
              <b>AVAILABLE</b>
            </div>
            <h2>Secondary-School Performance Records</h2>
            <p>
              A canonical analytical case for profiling, data-quality review,
              descriptive statistics, group comparisons, visualisation and
              decision interpretation.
            </p>
            <dl>
              <div>
                <dt>Format</dt>
                <dd>XLSX · tabular</dd>
              </div>
              <div>
                <dt>Workspace object</dt>
                <dd>
                  <code>df</code>
                </dd>
              </div>
              <div>
                <dt>Level</dt>
                <dd>Foundation–intermediate</dd>
              </div>
              <div>
                <dt>Provenance</dt>
                <dd>DatalytIQs Case 001</dd>
              </div>
            </dl>
            <div className="ds-skills">
              <span>pandas</span>
              <span>Data quality</span>
              <span>Statistics</span>
              <span>Visualisation</span>
            </div>
            <button
              onClick={() =>
                (location.href = "/playgrounds/pathway?dataset=case001")
              }
            >
              Start structured pathway
            </button>
            <button onClick={() => openWorkspace("case001")}>
              Open in Python Playground
            </button>
          </article>
          <article className="available">
            <div className="ds-card-head">
              <span>ECONOMICS</span>
              <b>AVAILABLE</b>
            </div>
            <h2>Kenya Macroeconomic Indicators</h2>
            <p>
              Original illustrative time-series data for growth, inflation,
              policy rates, trade indices and public-debt analysis. Values are
              teaching data—not official statistics.
            </p>
            <div className="ds-skills">
              <span>Time series</span>
              <span>Economics</span>
              <span>Trend analysis</span>
            </div>
            <button
              onClick={() =>
                (location.href = "/playgrounds/pathway?dataset=macro")
              }
            >
              Start structured pathway
            </button>
            <button onClick={() => openWorkspace("macro")}>
              Open in Python Playground
            </button>
          </article>
          <article className="available">
            <div className="ds-card-head">
              <span>GOVERNANCE</span>
              <b>AVAILABLE</b>
            </div>
            <h2>County Service-Delivery Indicators</h2>
            <p>
              Original illustrative cross-county data for benchmarking access,
              revenue, budget absorption and citizen satisfaction. Values are
              teaching data.
            </p>
            <div className="ds-skills">
              <span>Benchmarking</span>
              <span>Indicators</span>
              <span>Public sector</span>
            </div>
            <button
              onClick={() =>
                (location.href = "/playgrounds/pathway?dataset=counties")
              }
            >
              Start structured pathway
            </button>
            <button onClick={() => openWorkspace("counties")}>
              Open in Python Playground
            </button>
          </article>
          <article className="available">
            <div className="ds-card-head">
              <span>PUBLIC HEALTH</span>
              <b>AVAILABLE</b>
            </div>
            <h2>Community Health Service Indicators</h2>
            <p>
              Original non-identifiable monthly teaching data for service
              volumes, immunisation, maternal care, malaria and
              reporting-quality analysis.
            </p>
            <div className="ds-skills">
              <span>Health indicators</span>
              <span>Seasonality</span>
              <span>Data quality</span>
            </div>
            <button
              onClick={() =>
                (location.href = "/playgrounds/pathway?dataset=health")
              }
            >
              Start structured pathway
            </button>
            <button onClick={() => openWorkspace("health")}>
              Open in Python Playground
            </button>
          </article>
          <article className="available">
            <div className="ds-card-head">
              <span>DEMOGRAPHY</span>
              <b>AVAILABLE</b>
            </div>
            <h2>African Demographic &amp; Livelihood Indicators</h2>
            <p>
              Original aggregated teaching data for education, employment,
              income, digital access and equity analysis. Values are
              illustrative—not official statistics.
            </p>
            <div className="ds-skills">
              <span>Demography</span>
              <span>Equity</span>
              <span>Responsible statistics</span>
            </div>
            <button
              onClick={() =>
                (location.href = "/playgrounds/pathway?dataset=demographics")
              }
            >
              Start structured pathway
            </button>
            <button onClick={() => openWorkspace("demographics")}>
              Open in Python Playground
            </button>
          </article>
        </section>
        <section className="ds-standards">
          <div>
            <span>DATASET ADMISSION STANDARD</span>
            <h2>Nothing enters the library without documentation.</h2>
          </div>
          <ul>
            <li>Provenance and lawful-use record</li>
            <li>Variable dictionary and units</li>
            <li>Missing-value and validity profile</li>
            <li>Privacy and disclosure review</li>
            <li>Version, revision date and checksum</li>
            <li>Suggested questions without predetermined conclusions</li>
          </ul>
        </section>
        <footer className="pg-footer">
          <div>
            <b>DatalytIQs Dataset Library</b>
            <span>Curated evidence for responsible analytical practice</span>
          </div>
          <a href="/playgrounds">Return to Playgrounds</a>
        </footer>
      </main>
    );
  return (
    <main className="pg-shell">
      <a className="pg-skip" href="#notebook">
        Skip to notebook
      </a>
      <header className="pg-top">
        <div>
          <a href="/">DatalytIQs Analytics Lab</a>
          <span>/</span>
          <strong>Playgrounds</strong>
        </div>
        <nav>
          <a href="/evidence-lab">Guided Projects</a>
          <a className="active" href="/playgrounds">
            Playgrounds
          </a>
          <a href="/playgrounds?tab=datasets">Datasets</a>
          <a href="/practice">Interactive Practice</a>
          <a href="/data-explorer">Data Explorer</a>
        </nav>
        <div>
          <span className="pg-dot" />
          Python 3 · {status}
        </div>
      </header>
      <section className="pg-hero">
        <div>
          <span>INDEPENDENT ANALYTICAL PRACTICE</span>
          <h1>
            Explore freely.
            <br />
            Keep the evidence.
          </h1>
          <p>
            Move beyond guided activities into your own reproducible
            investigation. Your notebook is private, autosaved in this browser
            and executed in an isolated Python environment.
          </p>
        </div>
        <aside>
          <small>ACTIVE DATASET</small>
          <strong>{datasetCatalog[dataset].title}</strong>
          <p>
            {datasetCatalog[dataset].file} · server-attached · read-only source
          </p>
          <div>
            <span>{datasetCatalog[dataset].domain}</span>
            <span>Tabular</span>
            <span>Python</span>
          </div>
        </aside>
      </section>
      <section className="pg-project">
        <label>
          <span>PLAYGROUND TITLE</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Playground title"
          />
        </label>
        <label className="wide">
          <span>RESEARCH OR DECISION QUESTION</span>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            aria-label="Research or decision question"
          />
        </label>
        <div className="pg-save">
          <b>{savedAt ? `Saved ${savedAt}` : "Autosave ready"}</b>
          <span>Private to this browser</span>
        </div>
      </section>
      <section className="pg-tools">
        <div>
          <button onClick={() => addCell()}>＋ Add cell</button>
          <button onClick={duplicate}>Duplicate cell</button>
          <button onClick={() => addCell(visualCell)}>Add chart starter</button>
        </div>
        <div>
          <button onClick={download}>Export .py</button>
          <button onClick={reset}>Reset</button>
          <button className="run" onClick={run} disabled={running}>
            {running ? "Running notebook…" : "▶ Run all cells"}
          </button>
        </div>
      </section>
      <section className="pg-workspace" id="notebook">
        <aside className="pg-rail">
          <span>DATASETS</span>
          <article className="selected">
            <b>{datasetCatalog[dataset].title}</b>
            <p>{datasetCatalog[dataset].file}</p>
            <small>
              Attached as <code>df</code>
            </small>
          </article>
          <article className="locked">
            <b>Upload a dataset</b>
            <p>Coming after security validation</p>
            <small>CSV · XLSX</small>
          </article>
          <span>NOTEBOOK</span>
          {cells.map((c, i) => (
            <button
              className={active === c.id ? "active" : ""}
              onClick={() => setActive(c.id)}
              key={c.id}
            >
              Cell {i + 1}
              <small>
                {c.code
                  .split("\n")
                  .find(Boolean)
                  ?.replace(/^#\s*/, "")
                  .slice(0, 26) || "Python code"}
              </small>
            </button>
          ))}
        </aside>
        <section className="pg-main">
          {cells.map((cell, i) => (
            <article
              className={`pg-cell ${active === cell.id ? "active" : ""}`}
              onClick={() => setActive(cell.id)}
              key={cell.id}
            >
              <header>
                <span>In&nbsp;[ ]:</span>
                <b>Code cell {i + 1}</b>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCell(cell.id);
                  }}
                  disabled={cells.length === 1}
                >
                  Remove
                </button>
              </header>
              <textarea
                value={cell.code}
                onChange={(e) => update(cell.id, e.target.value)}
                spellCheck={false}
                aria-label={`Python code cell ${i + 1}`}
              />
            </article>
          ))}
          <button className="pg-add" onClick={() => addCell()}>
            ＋ Add another code cell
          </button>
        </section>
        <aside className="pg-results">
          <nav>
            {(["console", "table", "chart"] as const).map((x) => (
              <button
                className={view === x ? "active" : ""}
                onClick={() => setView(x)}
                key={x}
              >
                {x}
              </button>
            ))}
          </nav>
          <div className="pg-result-body">
            {running && (
              <p className="pg-empty">
                Executing notebook in the isolated runtime…
              </p>
            )}
            {!running && error && <pre className="pg-error">{error}</pre>}
            {!running &&
              !error &&
              view === "console" &&
              (stdout ? (
                <pre>{stdout}</pre>
              ) : (
                <p className="pg-empty">
                  Run the notebook to inspect console output.
                </p>
              ))}
            {!running &&
              !error &&
              view === "table" &&
              (table ? (
                <div className="pg-table">
                  <table>
                    <thead>
                      <tr>
                        {table.columns.map((c, i) => (
                          <th key={i}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.slice(0, 30).map((r, i) => (
                        <tr key={i}>
                          {r.map((v, j) => (
                            <td key={j}>{String(v ?? "")}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="pg-empty">
                  Leave a DataFrame or Series as the final expression.
                </p>
              ))}
            {!running &&
              !error &&
              view === "chart" &&
              (chartSrc ? (
                <img
                  src={chartSrc}
                  alt={chart?.title || "Playground chart output"}
                />
              ) : (
                <p className="pg-empty">
                  Create a Matplotlib figure and call <code>plt.show()</code>.
                </p>
              ))}
          </div>
          <footer>
            <span>Network disabled</span>
            <span>30-second runtime</span>
            <span>Private execution</span>
          </footer>
        </aside>
      </section>
      <footer className="pg-footer">
        <div>
          <b>DatalytIQs Playgrounds</b>
          <span>
            Independent practice · reproducible evidence · responsible
            interpretation
          </span>
        </div>
        <a href="https://datalytiqsacademy.com/dashboard/">
          Academy dashboard ↗
        </a>
      </footer>
    </main>
  );
}

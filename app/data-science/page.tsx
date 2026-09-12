import Link from "next/link";

const levels = [
  {
    number: "01",
    title: "Data Science Foundations",
    description:
      "Build competence in analytical reasoning, data preparation, exploratory analysis and reproducible statistical workflows.",
    modules: [
      "Analytical Thinking and the Data Science Workflow",
      "Data Preparation and Quality",
      "Exploratory Data Analysis",
    ],
    status: "FOUNDATION",
  },
  {
    number: "02",
    title: "Applied Modelling",
    description:
      "Progress from statistical modelling to supervised and unsupervised machine-learning methods using defensible analytical practice.",
    modules: [
      "Statistical Modelling",
      "Supervised Machine Learning",
      "Unsupervised Learning",
      "Model Evaluation and Validation",
    ],
    status: "APPLIED",
  },
  {
    number: "03",
    title: "Professional Data Science",
    description:
      "Convert models into reproducible analytical products, communicate evidence and assemble a professional portfolio.",
    modules: [
      "Reproducible Analytics and MLOps",
      "Evidence Communication and Decision Support",
      "Professional Data Science Portfolio",
    ],
    status: "PROFESSIONAL",
  },
];

export default function DataSciencePage() {
  return (
    <main className="ds-page">
      <section className="ds-hero">
        <div className="ds-kicker">DATALYTIQS ANALYTICS LAB · DATA SCIENCE</div>

        <Link className="ds-back" href="/">
          ← Analytics Environments
        </Link>

        <h1>
          Data Science
          <br />
          Professional Pathway
        </h1>

        <p className="ds-intro">
          Progress from analytical foundations to reproducible modelling,
          machine-learning operations and a defensible professional portfolio.
        </p>

        <div className="ds-stats">
          <div>
            <strong>3</strong>
            <span>Levels</span>
          </div>
          <div>
            <strong>10</strong>
            <span>Modules</span>
          </div>
          <div>
            <strong>30</strong>
            <span>Guided lessons</span>
          </div>
          <div>
            <strong>1</strong>
            <span>Professional portfolio</span>
          </div>
        </div>
      </section>

      <section className="ds-method">
        <span>THE DATALYTIQS METHOD</span>
        <strong>Problem → Data → Analysis → Evidence → Decision</strong>
      </section>

      <section className="ds-content">
        <div className="ds-heading">
          <div>
            <span>PROFESSIONAL DEVELOPMENT PATHWAY</span>
            <h2>Build competence progressively</h2>
          </div>
          <p>
            Each level develops analytical competence through guided learning,
            practical datasets, reproducible analysis and evidence-oriented
            outputs.
          </p>
        </div>

        <div className="ds-levels">
          {levels.map((level) => (
            <article className="ds-level" key={level.number}>
              <div className="ds-number">{level.number}</div>

              <div className="ds-level-body">
                <span className="ds-status">{level.status}</span>
                <h3>{level.title}</h3>
                <p>{level.description}</p>

                <ol>
                  {level.modules.map((module) => (
                    <li key={module}>{module}</li>
                  ))}
                </ol>
              </div>
            </article>
          ))}
        </div>

        <section className="ds-practice">
          <div>
            <span>APPLIED ANALYTICS</span>
            <h2>Practise inside the Analytics Lab</h2>
            <p>
              Use the existing analytical workspaces for dataset exploration,
              Python analysis and reproducible evidence generation as the
              Data Science learning environment is progressively expanded.
            </p>
          </div>

          <div className="ds-actions">
            <Link href="/data-explorer">Open Data Explorer →</Link>
            <Link href="/python-editor">Open Python Workspace →</Link>
          </div>
        </section>
      </section>

      <style>{`
        .ds-page {
          min-height: 100vh;
          background: #f6f8fb;
          color: #0b2c4d;
          font-family: Arial, Helvetica, sans-serif;
        }

        .ds-hero {
          position: relative;
          padding: 72px max(7vw, 32px) 58px;
          background: #0b2c4d;
          color: white;
        }

        .ds-kicker,
        .ds-heading span,
        .ds-practice span {
          color: #f4a261;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.7px;
        }

        .ds-back {
          position: absolute;
          right: max(7vw, 32px);
          top: 74px;
          color: white;
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,.5);
          padding-bottom: 4px;
        }

        .ds-hero h1 {
          max-width: 800px;
          margin: 22px 0 18px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(44px, 6vw, 76px);
          line-height: .98;
          letter-spacing: -2px;
        }

        .ds-intro {
          max-width: 760px;
          color: #d8e3ed;
          font-size: 19px;
          line-height: 1.65;
        }

        .ds-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          max-width: 900px;
          margin-top: 44px;
          border-top: 1px solid rgba(255,255,255,.22);
        }

        .ds-stats div {
          padding: 24px 24px 4px 0;
        }

        .ds-stats strong {
          display: block;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 32px;
        }

        .ds-stats span {
          display: block;
          margin-top: 6px;
          color: #b8c8d7;
          font-size: 13px;
        }

        .ds-method {
          display: flex;
          gap: 28px;
          padding: 18px max(7vw, 32px);
          background: #081f33;
          color: white;
        }

        .ds-method span {
          color: #f4a261;
          font-size: 11px;
          letter-spacing: 1.4px;
        }

        .ds-content {
          max-width: 1120px;
          margin: auto;
          padding: 64px 32px 90px;
        }

        .ds-heading {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          margin-bottom: 36px;
        }

        .ds-heading h2,
        .ds-practice h2 {
          margin: 10px 0 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 34px;
        }

        .ds-heading p,
        .ds-practice p {
          color: #53697e;
          line-height: 1.7;
        }

        .ds-level {
          display: grid;
          grid-template-columns: 90px 1fr;
          padding: 34px 0;
          border-top: 2px solid #f4a261;
        }

        .ds-number {
          color: #9baabc;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 25px;
        }

        .ds-status {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #1565c0;
        }

        .ds-level h3 {
          margin: 8px 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 28px;
        }

        .ds-level p {
          max-width: 760px;
          color: #53697e;
          line-height: 1.65;
        }

        .ds-level ol {
          display: grid;
          grid-template-columns: repeat(2, minmax(0,1fr));
          gap: 8px 32px;
          padding-left: 20px;
          line-height: 1.6;
        }

        .ds-practice {
          display: grid;
          grid-template-columns: 1.4fr .8fr;
          gap: 60px;
          margin-top: 30px;
          padding: 38px;
          background: white;
          border-top: 4px solid #f4a261;
        }

        .ds-actions {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 12px;
        }

        .ds-actions a {
          display: block;
          padding: 15px 18px;
          background: #f4a261;
          color: #081f33;
          font-weight: 800;
          text-decoration: none;
        }

        @media (max-width: 760px) {
          .ds-back {
            position: static;
            display: inline-block;
            margin-top: 20px;
          }

          .ds-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .ds-heading,
          .ds-practice {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .ds-level {
            grid-template-columns: 52px 1fr;
          }

          .ds-level ol {
            grid-template-columns: 1fr;
          }

          .ds-method {
            flex-direction: column;
            gap: 6px;
          }
        }
      `}</style>
    </main>
  );
}

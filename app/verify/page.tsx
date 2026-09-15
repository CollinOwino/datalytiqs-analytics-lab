import { redirect } from "next/navigation";

export const metadata = { title: "Verify a DatalytIQs Credential" };

export default async function CredentialLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ credential?: string }>;
}) {
  const { credential } = await searchParams;
  const lookup = credential?.trim();
  if (lookup) redirect(`/verify/${encodeURIComponent(lookup)}`);
  return (
    <main
      style={{
        maxWidth: 760,
        margin: "60px auto",
        padding: 24,
        fontFamily: "system-ui",
        color: "#0B2C4D",
      }}
    >
      <section
        style={{
          border: "1px solid #D8E0E8",
          borderTop: "5px solid #F4A261",
          borderRadius: 14,
          padding: 30,
          background: "#fff",
        }}
      >
        <a href="/" style={{ color: "#1565C0" }}>
          ← DatalytIQs Analytics Lab
        </a>
        <p
          style={{
            letterSpacing: 1.5,
            fontWeight: 800,
            fontSize: 12,
            marginTop: 28,
          }}
        >
          DATALYTIQS ACADEMY · PUBLIC VERIFICATION
        </p>
        <h1
          style={{
            fontFamily: "Georgia,serif",
            fontSize: 38,
            margin: "8px 0 18px",
          }}
        >
          Verify a credential
        </h1>
        <p>
          Enter the credential ID, certificate number or verification key
          exactly as shown on the certificate.
        </p>
        <form method="get" style={{ display: "grid", gap: 12, marginTop: 24 }}>
          <label htmlFor="credential">Credential reference</label>
          <input
            id="credential"
            name="credential"
            required
            autoComplete="off"
            style={{
              minHeight: 46,
              padding: "10px 12px",
              font: "inherit",
              border: "1px solid #718096",
              borderRadius: 7,
            }}
          />
          <button
            type="submit"
            style={{
              minHeight: 46,
              padding: "10px 16px",
              font: "inherit",
              fontWeight: 800,
              color: "white",
              background: "#1565C0",
              border: 0,
              borderRadius: 7,
            }}
          >
            Verify credential
          </button>
        </form>
      </section>
    </main>
  );
}

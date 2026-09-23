
'use client'

import { useActionState, useRef } from 'react'
import { processMinutes } from '../minutes-actions'

type Props = {
  expanded?: boolean
}

const initial = {
  ok: false,
  message: '',
}

export default function MinutesProcessForm({
  expanded = false,
}: Props) {
  const [state, action, pending] = useActionState(
    processMinutes,
    initial
  )
  const fileRef = useRef<HTMLInputElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  return (
    <form
      action={action}
      className="minutes-intake-form"
      aria-label="Process meeting minutes"
      aria-busy={pending}
      onSubmit={(event) => {
        const text = textRef.current
        if (!fileRef.current?.files?.length && !text?.value.trim()) {
          event.preventDefault()
          text?.setCustomValidity('Upload minutes or paste the meeting text.')
          text?.reportValidity()
        }
      }}
    >
      <div className="minutes-intake-intro">
        <span className="minutes-step">01 / MEETING RECORD</span>
        <h3>Provide your meeting minutes</h3>
        <p>
          Upload a document or paste the minutes. If you provide both,
          the uploaded file is analysed.
          DatalytIQs will prepare an executive brief and proposed
          organizational records.
        </p>
      </div>

      <div className="minutes-form-fields">
        <label htmlFor="minutes-title">
          Meeting or document title
          <input
            id="minutes-title"
            name="title"
            type="text"
            required
            maxLength={200}
            placeholder="Management Committee Meeting — 18 September 2026"
            disabled={pending}
          />
        </label>

        <div className="minutes-upload-field">
          <label htmlFor="minutes-file">
            Upload minutes
          </label>

          <p id="minutes-file-help">
            PDF, DOCX or TXT · Maximum 10 MB
          </p>

          <input
            id="minutes-file"
            ref={fileRef}
            name="file"
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            aria-describedby="minutes-file-help"
            disabled={pending}
          />
        </div>

        <div
          className="minutes-input-divider"
          aria-hidden="true"
        >
          <span>OR PASTE YOUR MINUTES</span>
        </div>

        <label htmlFor="minutes-text">
          Minutes text
          <textarea
            id="minutes-text"
            ref={textRef}
            name="minutes_text"
            rows={expanded ? 9 : 6}
            placeholder="Paste approved or draft meeting minutes here..."
            disabled={pending}
            onInput={(event) => event.currentTarget.setCustomValidity('')}
          />
        </label>

        <p className="minutes-input-hint">
          Provide at least one source. Review the proposed decisions and
          actions against the original minutes before confirming them.
        </p>
      </div>

      {state.message && (
        <div
          className={
            state.ok
              ? 'minutes-feedback minutes-feedback-success'
              : 'minutes-feedback minutes-feedback-error'
          }
          role="status"
          aria-live="polite"
        >
          {state.message}
        </div>
      )}

      <div className="minutes-form-footer">
        <button
          type="submit"
          className="minutes-submit-button"
          disabled={pending}
        >
          {pending
            ? 'Processing minutes…'
            : 'Analyse Minutes'}
        </button>

        <p className="minutes-privacy-note">
          Private organizational storage. Extracted decisions
          and actions require human confirmation.
        </p>
      </div>
    </form>
  )
}

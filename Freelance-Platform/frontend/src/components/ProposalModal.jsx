import { useState } from "react";
import api from "../api";

export default function ProposalModal({ job, onClose, onSubmitted }) {
  const [coverLetter, setCoverLetter] = useState("");
  const [bid, setBid] = useState(job.budget || "");
  const [deliveryDays, setDeliveryDays] = useState(7);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/proposals", {
        jobId: job.id,
        coverLetter,
        bid: Number(bid),
        deliveryDays: Number(deliveryDays),
      });
      onSubmitted?.(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit proposal");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Submit a proposal</h2>
        <p className="modal-sub">
          Applying to: <strong>{job.title}</strong>
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Cover letter</label>
            <textarea
              required
              rows={6}
              placeholder="Introduce yourself and explain why you're a great fit..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>Your bid (USD)</label>
              <input
                type="number"
                required
                min="1"
                value={bid}
                onChange={(e) => setBid(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Delivery (days)</label>
              <input
                type="number"
                required
                min="1"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
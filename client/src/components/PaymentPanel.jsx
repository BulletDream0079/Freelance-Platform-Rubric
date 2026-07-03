import { useEffect, useState } from 'react'
import api from '../api'

const fmt = (cents) => `$${(cents / 100).toFixed(2)}`

export default function PaymentPanel({ job, acceptedProposal, onChange }) {
  const [cfg, setCfg] = useState(null)
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    api.get('/payments/config').then(r => setCfg(r.data)).catch(() => setCfg({ feePercent: 10, mode: 'mock' }))
  }, [])

  const bid = acceptedProposal?.bid ?? job.budget
  const amountCents = Math.round(bid * 100)
  const feePercent = cfg?.feePercent ?? 10
  const feeCents = Math.round((amountCents * feePercent) / 100)
  const payoutCents = amountCents - feeCents

  const status = job.paymentStatus || 'unfunded'

  const fund = async () => {
    setBusy('fund'); setErr(''); setNote('')
    try {
      const { data } = await api.post(`/payments/jobs/${job.id}/fund`)
      if (data.clientSecret && cfg?.publishableKey) {
        await confirmWithStripe(data.clientSecret, cfg.publishableKey)
      }
      setNote(
        data.mode === 'mock'
          ? 'Escrow funded (mock mode — no real charge).'
          : 'Escrow funded via Stripe test mode.'
      )
      onChange && onChange()
    } catch (e) {
      setErr(e.response?.data?.error || 'Funding failed')
    } finally {
      setBusy('')
    }
  }

  const release = async () => {
    setBusy('release'); setErr(''); setNote('')
    try {
      await api.post(`/payments/jobs/${job.id}/release`)
      setNote('Payment released to the freelancer. Job marked complete.')
      onChange && onChange()
    } catch (e) {
      setErr(e.response?.data?.error || 'Release failed')
    } finally {
      setBusy('')
    }
  }

  const refund = async () => {
    if (!confirm('Refund the escrowed amount and reopen the job?')) return
    setBusy('refund'); setErr(''); setNote('')
    try {
      await api.post(`/payments/jobs/${job.id}/refund`)
      setNote('Escrow refunded. The job is open again.')
      onChange && onChange()
    } catch (e) {
      setErr(e.response?.data?.error || 'Refund failed')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="card payment-panel">
      <div className="payment-panel-head">
        <h2 className="card-title">Payment &amp; Escrow</h2>
        <span className={`pay-status pay-${status}`}>{status}</span>
      </div>

      <p className="muted small" style={{ marginTop: -4 }}>
        You accepted <strong>{acceptedProposal?.freelancer?.name}</strong>'s proposal. Funds are held
        in escrow and released to the freelancer when the work is complete.
      </p>

      <div className="fee-breakdown">
        <div className="fee-row">
          <span>Accepted bid</span>
          <strong>{fmt(amountCents)}</strong>
        </div>
        <div className="fee-row fee-row-muted">
          <span>Platform fee ({feePercent}%)</span>
          <span>−{fmt(feeCents)}</span>
        </div>
        <div className="fee-row fee-row-total">
          <span>Freelancer receives</span>
          <strong>{fmt(payoutCents)}</strong>
        </div>
      </div>

      {cfg?.mode === 'mock' && (
        <div className="pay-mode-note">
          Payments are in <strong>mock mode</strong>. Add Stripe test keys to the backend
          <code> .env</code> to run real test-mode charges.
        </div>
      )}

      {err && <div className="alert alert-error" style={{ marginTop: 12 }}>{err}</div>}
      {note && <div className="alert alert-success" style={{ marginTop: 12 }}>{note}</div>}

      <div className="payment-actions">
        {status === 'unfunded' && (
          <button className="btn btn-dark" onClick={fund} disabled={busy === 'fund'}>
            {busy === 'fund' ? 'Processing…' : `Fund escrow (${fmt(amountCents)})`}
          </button>
        )}
        {status === 'funded' && (
          <>
            <button className="btn btn-light" onClick={refund} disabled={busy === 'refund'}>
              {busy === 'refund' ? 'Refunding…' : 'Refund'}
            </button>
            <button className="btn btn-dark" onClick={release} disabled={busy === 'release'}>
              {busy === 'release' ? 'Releasing…' : `Release ${fmt(payoutCents)} to freelancer`}
            </button>
          </>
        )}
        {status === 'released' && (
          <div className="pay-done">✓ Paid out. Platform earned {fmt(feeCents)} on this job.</div>
        )}
        {status === 'refunded' && (
          <div className="muted">This job's escrow was refunded.</div>
        )}
      </div>
    </div>
  )
}

async function confirmWithStripe(clientSecret, publishableKey) {
  const stripe = await loadStripe(publishableKey)
  if (!stripe) return
  const { error } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: { card: { token: 'tok_visa' } },
  })
  if (error) throw new Error(error.message)
}

function loadStripe(pk) {
  return new Promise((resolve) => {
    if (window.Stripe) return resolve(window.Stripe(pk))
    const s = document.createElement('script')
    s.src = 'https://js.stripe.com/v3/'
    s.onload = () => resolve(window.Stripe ? window.Stripe(pk) : null)
    s.onerror = () => resolve(null)
    document.head.appendChild(s)
  })
}

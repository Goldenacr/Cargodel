import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Check, X, Ban, Power, Trash2, Save } from 'lucide-react'
import { driverSupabase } from '../../lib/supabase'
import DocumentViewer from '../../components/admin/DocumentViewer'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import StatusBadge from '../../components/admin/StatusBadge'

export default function AdminDriverDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [driver, setDriver] = useState(null)
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(null)

  useEffect(() => { load() }, [id])

  async function load() {
    const { data, error } = await driverSupabase
      .from('drivers').select('*').eq('id', id).maybeSingle()
    if (error || !data) { setError('Driver not found'); return }
    setDriver(data)
    setNotes(data.admin_notes ?? '')
  }

  async function patchDriver(patch) {
    setBusy(true); setError('')
    const { error } = await driverSupabase.from('drivers').update(patch).eq('id', id)
    setBusy(false)
    if (error) return setError(error.message)
    load()
  }

  async function handleDelete() {
    setConfirm(null); setBusy(true); setError('')
    const { error: delError } = await driverSupabase.from('drivers').delete().eq('id', id)
    if (delError) { setBusy(false); return setError(delError.message) }

    const { data, error } = await driverSupabase.functions.invoke('admin-delete-driver', {
      body: { driverId: id },
    })
    setBusy(false)
    if (error || !data?.ok) return setError(data?.error ?? error?.message ?? 'Could not delete auth user')
    navigate('/admin/drivers')
  }

  if (!driver) {
    return (
      <div className="text-slate-500">
        {error || 'Loading…'}
        <Link to="/admin/drivers" className="block mt-4 text-amber-600 font-medium">← Back to drivers</Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Link to="/admin/drivers" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{driver.full_name}</h1>
          <p className="text-sm text-slate-500">
            {driver.vehicle_type} · {driver.vehicle_plate_number ?? '—'} · {driver.phone_number}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {driver.is_online && !driver.is_suspended && (
            <span className="text-xs font-medium text-green-600">● Online</span>
          )}
          <StatusBadge status={driver.verification_status} suspended={driver.is_suspended} />
        </div>
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 rounded-xl p-3">{error}</p>}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <h2 className="font-semibold text-slate-700">Verification Actions</h2>
        <div className="flex flex-wrap gap-2">
          {driver.verification_status !== 'Verified' && !driver.is_suspended && (
            <button
              disabled={busy}
              onClick={async () => {
                const { data: { user } } = await driverSupabase.auth.getUser()
                patchDriver({
                  verification_status: 'Verified',
                  rejection_reason: null,
                  verified_at: new Date().toISOString(),
                  verified_by: user?.id,
                })
              }}
              className="inline-flex items-center gap-1 rounded-xl bg-green-600 text-white px-3 py-2 text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              <Check size={14} /> Approve
            </button>
          )}
          {driver.verification_status === 'Pending' && (
            <button
              disabled={busy}
              onClick={() => {
                const reason = prompt('Reason for rejection?')
                if (reason === null) return
                patchDriver({
                  verification_status: 'Rejected',
                  rejection_reason: reason || 'Not specified',
                  is_online: false,
                })
              }}
              className="inline-flex items-center gap-1 rounded-xl bg-red-600 text-white px-3 py-2 text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              <X size={14} /> Reject
            </button>
          )}
          {!driver.is_suspended ? (
            <button disabled={busy}
              onClick={() => patchDriver({ is_suspended: true, is_online: false })}
              className="inline-flex items-center gap-1 rounded-xl bg-orange-500 text-white px-3 py-2 text-sm font-semibold hover:bg-orange-600 disabled:opacity-50">
              <Ban size={14} /> Suspend
            </button>
          ) : (
            <button disabled={busy}
              onClick={() => patchDriver({ is_suspended: false })}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-700 text-white px-3 py-2 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50">
              <Check size={14} /> Unsuspend
            </button>
          )}
          {driver.is_online && (
            <button disabled={busy}
              onClick={() => patchDriver({ is_online: false })}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-200 text-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-300 disabled:opacity-50">
              <Power size={14} /> Force Offline
            </button>
          )}
          <button disabled={busy}
            onClick={() => setConfirm({
              action: 'delete',
              title: 'Delete driver?',
              message: 'This removes the driver profile and their auth account. This cannot be undone.',
              destructive: true,
            })}
            className="inline-flex items-center gap-1 rounded-xl bg-red-50 text-red-600 px-3 py-2 text-sm font-semibold hover:bg-red-100 disabled:opacity-50">
            <Trash2 size={14} /> Delete
          </button>
        </div>
        {driver.rejection_reason && (
          <p className="text-xs text-red-700 bg-red-50 rounded-lg p-2">
            Rejection reason: {driver.rejection_reason}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
          <h2 className="font-semibold text-slate-700 mb-2">Profile</h2>
          <Row label="Full Name" value={driver.full_name} />
          <Row label="Phone" value={driver.phone_number} />
          <Row label="Vehicle Type" value={driver.vehicle_type} />
          <Row label="Plate Number" value={driver.vehicle_plate_number} />
          <Row label="License Number" value={driver.license_number} />
          <Row label="Registered" value={new Date(driver.created_at).toLocaleString()} />
          {driver.verified_at && <Row label="Verified At" value={new Date(driver.verified_at).toLocaleString()} />}
        </div>

        <DocumentViewer
          bucket="driver-licenses"
          path={driver.license_image_path}
          legacyUrl={driver.license_image_url}
          label="Driver's License"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <DocumentViewer
          bucket="driver-vehicles"
          path={driver.vehicle_image_path}
          legacyUrl={driver.vehicle_image_url}
          label="Vehicle Photo"
        />

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <h2 className="font-semibold text-slate-700">Admin Notes (internal)</h2>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Observations, follow-ups, verification details…" rows={4}
            className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 focus:border-amber-500 focus:outline-none" />
          <button disabled={busy} onClick={() => patchDriver({ admin_notes: notes })}
            className="inline-flex items-center gap-1 rounded-xl bg-amber-500 text-white px-3 py-2 text-sm font-semibold hover:bg-amber-600 disabled:opacity-50">
            <Save size={14} /> Save Notes
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        destructive={confirm?.destructive}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800 font-medium text-right">{value || '—'}</span>
    </div>
  )
              }

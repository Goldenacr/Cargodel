import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { driverSupabase } from '../lib/supabase'

export default function Register() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    full_name: '', phone_number: '', email: '', password: '',
    vehicle_type: 'Motorcycle', vehicle_plate_number: '',
    license_number: '', licenseFile: null, vehicleFile: null,
  })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setInfo('')
    try {
      const { data: authData, error: authError } = await driverSupabase.auth.signUp({
        email: form.email,
        password: form.password,
      })
      if (authError) throw authError
      if (!authData.user) throw new Error('Signup failed.')

      if (!authData.session) {
        setInfo('Check your email to confirm your account, then log in.')
        return
      }

      const userId = authData.user.id
      const licenseExt = form.licenseFile.name.split('.').pop()
      const licensePath = `${userId}/license.${licenseExt}`
      const { error: licenseUploadError } = await driverSupabase.storage
        .from('driver-licenses')
        .upload(licensePath, form.licenseFile, { upsert: true })
      if (licenseUploadError) throw licenseUploadError

      const vehicleExt = form.vehicleFile.name.split('.').pop()
      const vehiclePath = `${userId}/vehicle.${vehicleExt}`
      const { error: vehicleUploadError } = await driverSupabase.storage
        .from('driver-vehicles')
        .upload(vehiclePath, form.vehicleFile, { upsert: true })
      if (vehicleUploadError) throw vehicleUploadError

      const { error: insertError } = await driverSupabase.from('drivers').insert({
        id: userId,
        full_name: form.full_name,
        phone_number: form.phone_number,
        vehicle_type: form.vehicle_type,
        vehicle_plate_number: form.vehicle_plate_number,
        license_number: form.license_number,
        license_image_path: licensePath,
        vehicle_image_path: vehiclePath,
        verification_status: 'Pending',
        is_online: false,
      })
      if (insertError) throw insertError

      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const canNext1 = form.full_name && form.phone_number && form.email && form.password.length >= 6
  const canNext2 = form.vehicle_type && form.vehicle_plate_number
  const canSubmit = form.license_number && form.licenseFile && form.vehicleFile

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Driver Sign Up</h1>
        <p className="text-sm text-slate-500">Step {step} of 3</p>

        {error && <p className="text-sm bg-red-50 text-red-700 rounded-lg p-2">{error}</p>}
        {info && <p className="text-sm bg-amber-50 text-amber-700 rounded-lg p-2">{info}</p>}

        {step === 1 && (
          <>
            <input placeholder="Full Name" value={form.full_name}
              onChange={(e) => update('full_name', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3" />
            <input placeholder="Phone Number" value={form.phone_number}
              onChange={(e) => update('phone_number', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3" />
            <input type="email" placeholder="Email" value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3" />
            <input type="password" placeholder="Password (min 6 chars)" value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3" />
            <button
              disabled={!canNext1}
              onClick={() => setStep(2)}
              className="w-full rounded-xl bg-amber-500 py-3 font-semibold text-white disabled:opacity-50"
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <select
              value={form.vehicle_type}
              onChange={(e) => update('vehicle_type', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            >
              <option>Motorcycle</option>
              <option>Car</option>
              <option>Tricycle</option>
            </select>
            <input placeholder="Plate Number" value={form.vehicle_plate_number}
              onChange={(e) => update('vehicle_plate_number', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3" />
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="flex-1 rounded-xl bg-slate-100 py-3 font-semibold text-slate-700">
                Back
              </button>
              <button
                disabled={!canNext2}
                onClick={() => setStep(3)}
                className="flex-1 rounded-xl bg-amber-500 py-3 font-semibold text-white disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <input placeholder="Driver's License Number" value={form.license_number}
              onChange={(e) => update('license_number', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3" />
            <div>
              <label className="text-sm font-medium text-slate-700">License Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => update('licenseFile', e.target.files?.[0] ?? null)}
                className="mt-1 w-full text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Vehicle Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => update('vehicleFile', e.target.files?.[0] ?? null)}
                className="mt-1 w-full text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="flex-1 rounded-xl bg-slate-100 py-3 font-semibold text-slate-700">
                Back
              </button>
              <button
                disabled={!canSubmit || loading}
                onClick={handleSubmit}
                className="flex-1 rounded-xl bg-amber-500 py-3 font-semibold text-white disabled:opacity-50"
              >
                {loading ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </>
        )}

        <p className="text-sm text-slate-500 text-center">
          Already registered? <a href="/login" className="text-amber-600 font-medium">Log in</a>
        </p>
      </div>
    </div>
  )
    }

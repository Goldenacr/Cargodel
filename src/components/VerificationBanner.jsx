export default function VerificationBanner({ driver }) {
  if (!driver) return null
  if (driver.verification_status === 'Verified' && !driver.is_suspended) return null

  if (driver.is_suspended) {
    return (
      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
        Your account has been temporarily suspended. Contact support for details.
      </div>
    )
  }
  if (driver.verification_status === 'Pending') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Your account is pending admin approval. You cannot receive orders yet.
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <p className="font-medium mb-1">Your verification was rejected.</p>
      {driver.rejection_reason && <p className="text-xs">Reason: {driver.rejection_reason}</p>}
      <p className="text-xs mt-2">Update your documents and contact support to reapply.</p>
    </div>
  )
}

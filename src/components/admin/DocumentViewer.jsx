import { useEffect, useState } from 'react'
import { FileText, ExternalLink, Loader2 } from 'lucide-react'
import { driverSupabase } from '../../lib/supabase'

export default function DocumentViewer({ bucket, path, legacyUrl, label }) {
  const [url, setUrl] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      if (!path && legacyUrl) { setUrl(legacyUrl); return }
      if (!path) return

      setLoading(true)
      const { data, error } = await driverSupabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600)

      if (error || !data?.signedUrl) {
        if (legacyUrl) setUrl(legacyUrl)
        else setError(error?.message ?? 'Could not load document')
      } else {
        setUrl(data.signedUrl)
      }
      setLoading(false)
    }
    load()
  }, [bucket, path, legacyUrl])

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <p className="text-sm font-semibold text-slate-700 mb-3">{label}</p>
      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      )}
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">{error}</p>}
      {!loading && !error && url && (
        <div className="space-y-3">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
          >
            <img
              src={url}
              alt={label}
              className="w-full h-48 object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </a>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            <ExternalLink size={14} /> Open in new tab
          </a>
        </div>
      )}
      {!loading && !error && !url && (
        <p className="text-sm text-slate-400 flex items-center gap-1">
          <FileText size={14} /> No document uploaded
        </p>
      )}
    </div>
  )
}

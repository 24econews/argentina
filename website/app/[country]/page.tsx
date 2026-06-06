import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCountry, getActiveCountries } from '@/lib/countries'
import { getCountryDigests, formatDate } from '@/lib/digests'

const PAGE_SIZE = 10

export async function generateStaticParams() {
  return getActiveCountries().map((c) => ({ country: c.slug }))
}

export default async function CountryPage({
  params,
  searchParams,
}: {
  params: Promise<{ country: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { country: countrySlug } = await params
  const { page = '1' } = await searchParams

  const countryInfo = getCountry(countrySlug)
  if (!countryInfo || !countryInfo.active) notFound()

  const allDigests = await getCountryDigests(countrySlug)
  const pageNum = Math.max(1, parseInt(page) || 1)
  const totalPages = Math.max(1, Math.ceil(allDigests.length / PAGE_SIZE))
  const digests = allDigests.slice((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-900 font-medium">{countryInfo.flag} {countryInfo.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {countryInfo.flag} {countryInfo.name} — Digests
        </h1>
        <p className="text-slate-500">
          {allDigests.length} digest{allDigests.length !== 1 ? 's' : ''} disponibles
        </p>
      </div>

      {allDigests.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-4">📭</div>
          <p>No digests available yet.</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {digests.map((digest) => (
              <li key={digest.date}>
                <Link
                  href={`/${countrySlug}/${digest.date}`}
                  className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <time
                        dateTime={digest.date}
                        className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors"
                      >
                        {formatDate(digest.date)}
                      </time>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                        {digest.articleCount} artículos
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {digest.sources.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))}
                      <svg
                        className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {digest.firstHeadline && (
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {digest.firstHeadline}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-8">
              {pageNum > 1 && (
                <Link
                  href={`/${countrySlug}?page=${pageNum - 1}`}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  ← Anterior
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/${countrySlug}?page=${p}`}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    p === pageNum
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </Link>
              ))}
              {pageNum < totalPages && (
                <Link
                  href={`/${countrySlug}?page=${pageNum + 1}`}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Siguiente →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  )
}

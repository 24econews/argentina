import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getCountry, getActiveCountries } from '@/lib/countries'
import { getDigest, getCountryDigests } from '@/lib/digests'
import DigestViewer from '@/components/DigestViewer'

export async function generateStaticParams() {
  const params: { country: string; date: string }[] = []
  for (const country of getActiveCountries()) {
    const digests = await getCountryDigests(country.slug)
    for (const digest of digests) {
      params.push({ country: country.slug, date: digest.date })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; date: string }>
}): Promise<Metadata> {
  const { country, date } = await params
  const digest = await getDigest(country, date, 'es')
  if (!digest) return {}
  return {
    title: `${digest.title} | EconoDigest`,
    description: digest.firstHeadline,
  }
}

export default async function DigestPage({
  params,
}: {
  params: Promise<{ country: string; date: string }>
}) {
  const { country: countrySlug, date } = await params

  const countryInfo = getCountry(countrySlug)
  if (!countryInfo || !countryInfo.active) notFound()

  const esDigest = await getDigest(countrySlug, date, 'es')
  if (!esDigest) notFound()

  const enDigest = await getDigest(countrySlug, date, 'en')

  return (
    <DigestViewer
      esDigest={esDigest}
      enDigest={enDigest}
      country={countrySlug}
      countryName={countryInfo.name}
      countryFlag={countryInfo.flag}
    />
  )
}

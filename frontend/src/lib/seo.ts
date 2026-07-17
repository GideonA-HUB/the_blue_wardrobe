type SeoPayload = {
  title: string
  description?: string
  url?: string
  image?: string | null
  type?: string
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  if (typeof document === 'undefined') return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  if (typeof document === 'undefined') return
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/** Update document title + Open Graph / Twitter tags for richer social previews. */
export function applyPageSeo({
  title,
  description,
  url,
  image,
  type = 'website',
}: SeoPayload) {
  if (typeof document === 'undefined') return

  document.title = title
  const pageUrl = url || window.location.href
  const desc =
    (description || '').replace(/\s+/g, ' ').trim().slice(0, 280) ||
    'Luxury fashion from THE BLUE WARDROBE.'

  upsertMeta('name', 'description', desc)
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', desc)
  upsertMeta('property', 'og:url', pageUrl)
  upsertMeta('property', 'og:type', type)
  upsertMeta('property', 'og:site_name', 'THE BLUE WARDROBE')
  upsertMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', desc)
  upsertLink('canonical', pageUrl)

  if (image) {
    upsertMeta('property', 'og:image', image)
    upsertMeta('property', 'og:image:secure_url', image)
    upsertMeta('name', 'twitter:image', image)
  }
}

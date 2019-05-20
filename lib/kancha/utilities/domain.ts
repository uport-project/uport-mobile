import URL from 'url-parse'

function domain(url: string) {
  if (!url) return ''
  const parsed = new URL(url)
  return parsed.hostname
}

export default domain

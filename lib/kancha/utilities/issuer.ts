export function issuer({ issuer: { name, url }, iss }: any) {
  if (name && url) {
    return `${name}\n${url}`
  }
  return name || url || iss.slice(0, 16)
}

export default issuer

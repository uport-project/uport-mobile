export const fetchMarketPlaceData = async (iss: string) => {
  const response = await fetch(`https://fake-marketplace-rp-store.s3.us-east-2.amazonaws.com/${iss}/config.json`)
  if (!response.ok) {
    return false
  }
  const json = response.json()
  return json
}

export const fetchSurveyData = async (iss: string) => {
  const response = await fetch(`https://fake-marketplace-rp-store.s3.us-east-2.amazonaws.com/${iss}/survey/config.json`)
  if (!response.ok) {
    return false
  }
  const json = response.json()
  return json
}

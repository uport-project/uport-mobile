import moment from 'moment'
/**
 * Formats a timestamp into a readable date format regardless of seconds or milliseconds
 *
 */
const dateChecker = (date: number) => {
  const isMilliSeconds = date && date >= 1000000000000
  const formattedDate = isMilliSeconds ? moment(date).format('MMM Do YYYY') : moment.unix(date).format('MMM Do YYYY')
  return formattedDate
}

export default dateChecker

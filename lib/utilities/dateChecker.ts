import moment from 'moment'
/**
 * Formats a timestamp into a readable date format regardless of seconds or milliseconds
 *
 */
const dateChecker = (date: number) => {
  const isMilliSeconds = date && date.toString().length >= 13
  const formattedDate = isMilliSeconds ? moment(date).format('MMM Do YYYY') : moment.unix(date).format('MMM Do YYYY')
  return formattedDate
}

export default dateChecker

import moment from 'moment'
import { JWT_MS_CUTOFF } from '../selectors/attestations';

/**
 * Formats a timestamp into a readable date format regardless of seconds or milliseconds
 *
 */
const dateChecker = (date: number) => {
  const isMilliSeconds = date && date >= JWT_MS_CUTOFF
  const formattedDate = isMilliSeconds ? moment(date).format('MMM Do YYYY') : moment.unix(date).format('MMM Do YYYY')
  return formattedDate
}

export default dateChecker

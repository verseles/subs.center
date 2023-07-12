import { Currency } from '@depay/local-currency'

let language = navigator.language || 'en-US'
let currencyCode = Currency.getCode()

const currencyPrefix = () => {
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
    .format(0)
    .replace('0', '')
    .trim()
}

// The mask using quasar mask directive
const currencyMask = () =>
  new Intl.NumberFormat(language, {
    style: 'currency',
    currency: currencyCode
  })
    .format('9999.98')
    .replace(currencyPrefix(), '')
    .trim()
    .replace(/[0-9]/g, '#')

export { currencyPrefix, currencyMask }

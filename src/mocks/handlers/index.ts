import { authHandlers } from './authHandlers'
import { invoiceHandlers } from './invoiceHandlers'
import { walletHandlers } from './walletHandlers'
import { paymentHandlers } from './paymentHandlers'
import { refundHandlers } from './refundHandlers'
import { adminHandlers } from './adminHandlers'

export const handlers = [
  ...authHandlers,
  ...invoiceHandlers,
  ...walletHandlers,
  ...paymentHandlers,
  ...refundHandlers,
  ...adminHandlers,
]
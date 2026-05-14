import create from 'zustand'
import { persist } from 'zustand/middleware'

export type PayCurrency = 'NGN' | 'USD' | 'GBP'

type State = {
  payCurrency: PayCurrency
  setPayCurrency: (c: PayCurrency) => void
}

export const usePayCurrency = create<State>()(
  persist(
    (set) => ({
      payCurrency: 'NGN',
      setPayCurrency: (payCurrency) => set({ payCurrency }),
    }),
    { name: 'tbw-pay-currency-v1' }
  )
)

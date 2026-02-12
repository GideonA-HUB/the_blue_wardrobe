import create from 'zustand'

export type CartItem = {
  id: number
  title: string
  price: number
  size: string
  qty: number
  image?: string
}

type CartState = {
  items: CartItem[]
  add: (it: CartItem) => void
  remove: (id: number, size?: string) => void
  updateQty: (id: number, size: string, qty: number) => void
  clear: () => void
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  add: (it) => {
    const items = get().items.slice()
    const existing = items.find((i) => i.id === it.id && i.size === it.size)
    if (existing) {
      existing.qty += it.qty
    } else {
      items.push(it)
    }
    set({ items })
  },
  remove: (id, size) => set({ items: get().items.filter((i) => !(i.id === id && (!size || i.size === size))) }),
  updateQty: (id, size, qty) => set({ items: get().items.map((i) => i.id === id && i.size === size ? { ...i, qty } : i) }),
  clear: () => set({ items: [] }),
}))

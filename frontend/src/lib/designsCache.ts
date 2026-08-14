let allDesignsCache: unknown[] | null = null
let atelierCache: unknown[] | null = null

export function getCachedAllDesigns<T>(): T[] | null {
  return allDesignsCache as T[] | null
}

export function setCachedAllDesigns<T>(rows: T[]) {
  allDesignsCache = rows
}

export function getCachedAtelierDesigns<T>(): T[] | null {
  return atelierCache as T[] | null
}

export function setCachedAtelierDesigns<T>(rows: T[]) {
  atelierCache = rows
}

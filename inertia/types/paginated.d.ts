export type Paginated<T> = {
  data: T[]
  metadata: MetaData
}

export type MetaData = {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  fistPage: number
}

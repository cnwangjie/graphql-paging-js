export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor?: string
  endCursor?: string
}

export type Connection<T> = {
  edges: Edge<T>[]
  nodes: T[]
  pageInfo: PageInfo
  totalCount?: number
}

export type Edge<T> = {
  node: T
  cursor: string
}

export interface ItemWithId<T = string> {
  id: T
}

export interface GeneralCursorBasedPaginationInput {
  first?: number
  after?: string
  last?: number
  before?: string
}

export interface GeneralCursorBasedPaginationInfo {
  shouldRetrieveTotalCount?: boolean
  shouldRetrieveContent?: boolean
}

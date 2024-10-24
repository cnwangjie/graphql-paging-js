import type {
  Connection,
  GeneralCursorBasedPaginationInput,
  ItemWithId,
} from './type'

export interface ToConnectionOption<C> {
  /**
   * If cursorItems is provided, it will be used to generate the cursor.
   * It's useful for paginate with relations objects.
   */
  cursorItems?: C[]

  /**
   * If cursorInfos is provided, it will be passed to the cursors.
   * You can provide a function to generate the cursor info based on the cursor item.
   */
  cursorInfos?:
    | ((cursor: C, index: number) => Record<string, unknown>)
    | Record<string, unknown>

  encodeCursor?: (cursor: C) => string
}

export const encodeCursorFallback = (cursor: unknown) => {
  if (typeof cursor === 'string') {
    return cursor
  }
  throw new Error(
    'The encode cursor method must be provided if cursor data is not string.',
  )
}

/**
 * Transform the result of the findMany method of prisma into a connection.
 *
 * @see https://relay.dev/graphql/connections.htm
 *
 * @param items The result of the findMany method of prisma.
 * @param limit The limit field of the result of `toPrismaArgs`.
 * @param isPosSeq Is positive sequence or not.
 * @param input The original input of the pagination.
 * @returns Connection object.
 */
export const toConnection = <T extends ItemWithId, C>(
  items: T[],
  limit: number,
  isPosSeq: boolean,
  input: GeneralCursorBasedPaginationInput,
  opt: ToConnectionOption<C> = {},
) => {
  const { cursorItems, cursorInfos, encodeCursor = encodeCursorFallback } = opt
  const edges = (cursorItems || items).map((cursor, i) => {
    const cursorData =
      typeof cursorInfos === 'function'
        ? cursorInfos(cursor as C, i)
        : { id: (cursor as ItemWithId).id, ...cursorInfos }

    return {
      node: items[i],
      cursor: encodeCursor(cursorData as C),
    }
  })

  const hasPreviousPage = input.last
    ? edges.length > input.last
    : input.after != null
  const hasNextPage = input.first
    ? edges.length > input.first
    : input.before != null

  const actualEdges = isPosSeq ? edges.slice(0, limit) : edges.slice(-limit)

  const connection: Connection<T> = {
    edges: actualEdges,
    nodes: actualEdges.map(edge => edge.node),
    pageInfo: {
      hasPreviousPage,
      hasNextPage,
      startCursor: actualEdges[0]?.cursor,
      endCursor: actualEdges[actualEdges.length - 1]?.cursor,
    },
  }

  return connection
}

export const emptyConnection = () => toConnection([], 0, true, {})
export const isEmptyConnection = (connection: Connection<unknown>) =>
  connection.edges.length === 0 &&
  connection.pageInfo.hasNextPage === false &&
  connection.pageInfo.hasPreviousPage === false

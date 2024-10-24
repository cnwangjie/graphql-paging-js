import type { ParsedGeneralCursorBasedPaginationInput } from '../parse-input'

export interface PrismaPagingArgs<T> {
  skip: number
  take: number
  cursor?: { id: T } | undefined
  orderBy: Record<string, string>
}

/**
 * Parse the cursor based pagination input and transform it into the arguments
 * of the findMany method of prisma.
 *
 * @param input Parsed cursor based pagination input.
 * @returns The arguments of the findMany method of prisma.
 */
export const toPrismaArgs = <
  IdType = string,
  CursorData extends { id?: IdType } = { id?: IdType },
>(
  input: ParsedGeneralCursorBasedPaginationInput<CursorData>,
) => {
  const { cursor, data, isPosSeq, limit } = input

  const cursorId = data?.id

  // if provide cursor, skip current current item
  const skip = cursor ? 1 : 0

  // take 1 more item to check if has more
  // take positive number if is reverse sequence
  const take = (isPosSeq ? 1 : -1) * (limit + 1)

  const pagingArgs = {
    limit,
    isPosSeq,
    param: {
      skip,
      take,
      cursor: cursorId ? { id: cursorId } : undefined,
      orderBy: {
        // order by id by default
        // override `orderBy` later for complex cases
        id: 'asc',
      },
    } as PrismaPagingArgs<IdType>,
  }

  return pagingArgs
}

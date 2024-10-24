import { InvalidPaginationInputError } from './error'
import type { GeneralCursorBasedPaginationInput } from './type'

export interface ParseGeneralCursorBasedPaginationInputOption<T> {
  decodeCursor?: (cursor: string) => T
}

export interface ParsedGeneralCursorBasedPaginationInput<T> {
  cursor?: string
  data?: T
  isPosSeq: boolean
  limit: number
}

/**
 * parse input to intermediate format
 * @param input general cursor based pagination input
 * @returns intermediate result of the cursor based pagination
 */
export const parseGeneralCursorBasedPaginationInput = <T>(
  { first, after, last, before }: GeneralCursorBasedPaginationInput,
  opt: ParseGeneralCursorBasedPaginationInputOption<T> = {},
) => {
  if (!first && !last) {
    throw new InvalidPaginationInputError('Must provide either first or last.')
  }

  if (first && last) {
    throw new InvalidPaginationInputError(
      'Not support both first and last provided.',
    )
  }

  // Use cursor to determine the sequence by default.
  // If provide before, use reverse sequence,
  // else if provide after, use forward sequence,
  // else if provide last, use reverse sequence,
  // else is forward sequence.
  const isPosSeq = before != null ? false : after != null ? true : last == null
  const limit = isPosSeq ? first : last
  if (!limit) {
    throw new InvalidPaginationInputError('Must provide limit.')
  }

  if (limit < 1) {
    throw new InvalidPaginationInputError(
      'Last or before must be greater than 0.',
    )
  }
  const cursor = isPosSeq ? after : before

  const result: ParsedGeneralCursorBasedPaginationInput<T> = {
    cursor,
    isPosSeq,
    limit,
  }

  try {
    if (cursor && opt.decodeCursor) {
      const data = opt.decodeCursor(cursor)
      if (data) {
        result.data = data
      }
    }
  } catch (err) {
    throw new InvalidPaginationInputError('Invalid cursor.')
  }

  return result
}

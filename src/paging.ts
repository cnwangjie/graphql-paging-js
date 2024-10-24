import {
  type ToConnectionOption,
  emptyConnection,
  isEmptyConnection,
  toConnection,
} from './connection-helper'
import { CursorConnectionHandler } from './handler'
import {
  type ParseGeneralCursorBasedPaginationInputOption,
  parseGeneralCursorBasedPaginationInput,
} from './parse-input'
import type {
  Connection,
  GeneralCursorBasedPaginationInput,
  ItemWithId,
} from './type'

export type CursorCodec<T> = {
  encode: (data: T) => string
  decode: (cursor: string) => T
}

export interface GraphQLPagingOption<T> {
  cursorCodec?: CursorCodec<T>
}

export class GraphQLPaging<T = unknown> {
  cursorCodec?: CursorCodec<T>

  constructor(opt: GraphQLPagingOption<T> = {}) {
    this.cursorCodec = opt.cursorCodec
  }

  parseGeneralCursorBasedPaginationInput(
    input: GeneralCursorBasedPaginationInput,
    opt: ParseGeneralCursorBasedPaginationInputOption<T> = {},
  ) {
    return parseGeneralCursorBasedPaginationInput<T>(input, {
      decodeCursor: this.cursorCodec?.decode,
      ...opt,
    })
  }

  toConnection<I extends ItemWithId>(
    items: I[],
    limit: number,
    isPosSeq: boolean,
    input: GeneralCursorBasedPaginationInput,
    opt: ToConnectionOption<T> = {},
  ) {
    return toConnection<I, T>(items, limit, isPosSeq, input, {
      encodeCursor: this.cursorCodec?.encode,
      ...opt,
    })
  }

  emptyConnection() {
    return emptyConnection()
  }

  isEmptyConnection(connection: Connection<unknown>) {
    return isEmptyConnection(connection)
  }

  /**
   * A helper function to create a connection handler.
   * @param input Pagination params.
   * @returns Connection handler instance.
   */
  getCursorConnectionHandler(input: GeneralCursorBasedPaginationInput) {
    return new CursorConnectionHandler(this, input)
  }
}

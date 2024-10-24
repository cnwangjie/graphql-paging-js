import type { ToConnectionOption } from './connection-helper'
import type { GraphQLPaging } from './paging'
import type { ParsedGeneralCursorBasedPaginationInput } from './parse-input'
import type { GeneralCursorBasedPaginationInput, ItemWithId } from './type'

/**
 * A utility class to handle cursor based pagination. For reduce the params bypass
 * between the methods.
 */
export class CursorConnectionHandler<T> {
  constructor(
    protected paging: GraphQLPaging<T>,
    public input: GeneralCursorBasedPaginationInput,
  ) {}

  private parsedInput?: ParsedGeneralCursorBasedPaginationInput<T>
  public parse() {
    if (!this.parsedInput) {
      this.parsedInput = this.paging.parseGeneralCursorBasedPaginationInput(
        this.input,
      )
    }
    return this.parsedInput
  }

  public toConnection<I extends ItemWithId>(
    items: I[],
    opt: ToConnectionOption<T> = {},
  ) {
    const input = this.parse()

    return this.paging.toConnection(
      items,
      input.limit,
      input.isPosSeq,
      this.input,
      opt,
    )
  }
}

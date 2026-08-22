/**
 * Conversations are keyed by an unordered pair of user ids, but the DB
 * unique constraint needs a consistent order to dedupe regardless of who
 * starts the chat. Always sort before reading or writing a conversation row.
 */
export function sortedPair(idA: string, idB: string): [string, string] {
  return idA < idB ? [idA, idB] : [idB, idA];
}

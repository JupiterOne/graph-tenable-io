export const PAGE_ENTITY_COUNT_LIMIT = 10;

export async function paginated(
  callback: (offset: number, limit: number) => Promise<number>,
) {
  let offset = 0;
  const limit = PAGE_ENTITY_COUNT_LIMIT;
  let totalCount = 0;

  do {
    totalCount = await callback(offset, limit);
    offset += limit;
  } while (offset < totalCount);
}

import { PAGE_ENTITY_COUNT_LIMIT, paginated } from './pagination';

test('paginated should call callback multiple times', async () => {
  const cb = jest
    .fn()
    .mockResolvedValueOnce(PAGE_ENTITY_COUNT_LIMIT + 1)
    .mockResolvedValueOnce(1);

  await paginated(cb);

  expect(cb).toHaveBeenCalledTimes(2);
});

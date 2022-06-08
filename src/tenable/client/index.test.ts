import { buildUserAgentHeader } from '.';

test('buildUserAgentHeader', () => {
  expect(
    buildUserAgentHeader({
      vendor: 'vendor',
      product: 'product',
      build: 'build',
    }),
  ).toMatch(
    'Integration/1.0 (vendor; product; Build/build) @jupiterone/graph-tenable-io/',
  );
});

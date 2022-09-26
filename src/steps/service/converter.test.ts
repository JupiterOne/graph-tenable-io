import { Entities } from '../../constants';
import { Service } from '../../tenable/client';
import { createServiceEntity, getServiceKey } from './converters';

const service: Service = {
  name: 'Tenable Scanner',
};

test('convert service entity', () => {
  expect(createServiceEntity(service)).toEqual({
    _key: getServiceKey(service),
    _type: Entities.SERVICE._type,
    _class: Entities.SERVICE._class,
    _rawData: [{ name: 'default', rawData: service }],
    name: 'Tenable Scanner',
    displayName: 'Tenable Scanner',
    category: ['software', 'other'],
  });
});

import {
  IntegrationStepExecutionContext,
  Step,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../config';
import {
  Entities,
  INGESTION_SOURCE_IDS,
  Relationships,
  SERVICE_ENTITY_DATA_KEY,
  StepIds,
} from '../constants';
import { getAccount } from '../account/util';
import {
  createAccountServiceRelationship,
  createServiceEntity,
} from './converters';

export async function fetchServiceDetails(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
): Promise<void> {
  const { jobState } = context;

  const account = getAccount(context);
  const service = {
    name: 'Tenable Scanner',
  };

  const serviceEntity = createServiceEntity(service);
  await Promise.all([
    jobState.addEntity(serviceEntity),
    jobState.setData(SERVICE_ENTITY_DATA_KEY, serviceEntity),
    jobState.addRelationship(
      createAccountServiceRelationship(account, service),
    ),
  ]);
}

export const serviceSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: StepIds.SERVICE,
    name: 'Fetch Service Details',
    entities: [Entities.SERVICE],
    ingestionSourceId: INGESTION_SOURCE_IDS.SERVICE,
    relationships: [Relationships.ACCOUNT_PROVIDES_SERVICE],
    dependsOn: [StepIds.ACCOUNT],
    executionHandler: fetchServiceDetails,
  },
];

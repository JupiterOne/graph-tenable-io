import {
  IntegrationInstanceConfig,
  IntegrationInvocationConfig,
  IntegrationStepExecutionContext,
  Step,
} from '@jupiterone/integration-sdk-core';

export interface StepSpec<TConfig extends IntegrationInstanceConfig>
  extends Omit<
    Step<IntegrationStepExecutionContext<TConfig>>,
    'executionHandler'
  > {
  implemented: boolean;
}

export interface IntegrationSpecConfig<
  TConfig extends IntegrationInstanceConfig = IntegrationInstanceConfig,
> extends Omit<IntegrationInvocationConfig, 'integrationSteps'> {
  integrationSteps: StepSpec<TConfig>[];
}

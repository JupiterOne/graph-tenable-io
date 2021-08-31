import {
  IntegrationInstanceConfig,
  IntegrationInvocationConfig,
  IntegrationStepExecutionContext,
  Step,
} from '@jupiterone/integration-sdk-core';
import { IntegrationSpecConfig } from '../docs/spec/src/types';
import { getMatchers } from 'expect/build/jestMatchersObject';
import { invocationConfig as specConfig } from '../docs/spec/src';
import { invocationConfig as implementedConfig } from '../src';

test('implemented integration should match spec', () => {
  expect(implementedConfig).toImplementSpec(specConfig);
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toImplementSpec(
        spec: IntegrationSpecConfig<IntegrationInstanceConfig>,
      ): R;
    }
  }
}

type StepBase<TConfig extends IntegrationInstanceConfig> = Omit<
  Step<IntegrationStepExecutionContext<TConfig>>,
  'executionHandler'
>;

expect.extend({
  toImplementSpec<
    TConfig extends IntegrationInstanceConfig = IntegrationInstanceConfig,
  >(
    integration: IntegrationInvocationConfig<TConfig>,
    spec: IntegrationSpecConfig<TConfig>,
  ): { message: (...args: any) => string; pass: boolean } {
    const unimplementedSteps: string[] = [];

    const implementedStepsProposed: { [id: string]: StepBase<TConfig> } = {};
    const implementedStepsActual: { [id: string]: StepBase<TConfig> } = {};
    const implementedStepsByIdMap: {
      [id: string]: Step<IntegrationStepExecutionContext<TConfig>>;
    } = integration.integrationSteps.reduce(
      (implStepsById, step) => ({ ...implStepsById, [step.id]: step }),
      {},
    );

    for (const specStep of spec.integrationSteps) {
      if (specStep.implemented === false) {
        unimplementedSteps.push(specStep.id);
      } else {
        const stepId = specStep.id;
        const { implemented, ...specStepBase } = specStep;
        implementedStepsProposed[stepId] = specStepBase;

        const implementedStep = implementedStepsByIdMap[specStep.id];

        if (implementedStep) {
          const { executionHandler, ...implementedStepBase } = implementedStep;
          implementedStepsActual[stepId] = implementedStepBase;
        }
      }
    }
    if (unimplementedSteps.length > 0) {
      console.log(
        {
          unimplementedSteps,
        },
        'Spec steps marked as `implemented: false`',
      );
    }
    return getMatchers().toMatchObject.call(
      this,
      implementedStepsActual,
      implementedStepsProposed,
    );
  },
});

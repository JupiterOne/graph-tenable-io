import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { config } from '../../../test/config';
import { setupTenableRecording, Recording } from '../../../test/recording';
import { Entities, Relationships } from '../../constants';
import {
  buildRepositoryImagesRelationship,
  fetchContainerImages,
  fetchContainerReports,
  fetchContainerRepositories,
} from '.';
import { fetchAccount } from '../account';
import { fetchServiceDetails } from '../service';

jest.mock('@lifeomic/attempt', () => {
  // you MUST comment this block and add a large timeout (1 million ms to be safe) when re-recording tests
  const attempt = jest.requireActual('@lifeomic/attempt');
  return {
    ...attempt,
    sleep: () => Promise.resolve(),
  };
});

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('fetch-container-repositories', () => {
  test('success', async () => {
    recording = setupTenableRecording({
      directory: __dirname,
      name: 'fetch-container-repositories',
    });

    const context = createMockStepExecutionContext({
      instanceConfig: config,
    });

    await fetchAccount(context);
    await fetchContainerRepositories(context);

    const entities = context.jobState.collectedEntities;

    expect(entities.length).toBeGreaterThan(0);
    expect(
      entities.filter((e) => e._type === Entities.CONTAINER_REPOSITORY._type),
    ).toMatchGraphObjectSchema({
      _class: Entities.CONTAINER_REPOSITORY._class,
    });

    const relationships = context.jobState.collectedRelationships;

    expect(relationships.length).toBe(entities.length - 1);
    expect(relationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const: Relationships.ACCOUNT_HAS_CONTAINER_REPOSITORY._type,
          },
        },
      },
    });
  });
});

describe('fetch-container-images', () => {
  test('success', async () => {
    recording = setupTenableRecording({
      directory: __dirname,
      name: 'fetch-container-images',
    });

    const context = createMockStepExecutionContext({
      instanceConfig: config,
    });

    await fetchAccount(context);
    await fetchServiceDetails(context);
    await fetchContainerImages(context);

    const entities = context.jobState.collectedEntities;

    expect(entities.length).toBeGreaterThan(0);
    expect(
      entities.filter((e) => e._type === Entities.CONTAINER_IMAGE._type),
    ).toMatchGraphObjectSchema({
      _class: Entities.CONTAINER_IMAGE._class,
    });

    const relationships = context.jobState.collectedRelationships;
    const accountHasContainerImageRelationships = relationships.filter(
      (r) => r._type === 'tenable_account_has_container_image',
    );
    const serviceScansContainerImage = relationships.filter(
      (r) => r._type === 'tenable_scanner_scans_container_image',
    );

    expect(accountHasContainerImageRelationships.length).toBeGreaterThan(0);
    expect(serviceScansContainerImage.length).toBeGreaterThan(0);

    expect(
      accountHasContainerImageRelationships,
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: Relationships.ACCOUNT_HAS_CONTAINER_IMAGE._type },
        },
      },
    });

    expect(serviceScansContainerImage).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: Relationships.SERVICE_SCANS_CONTAINER_IMAGE._type },
        },
      },
    });
  });
});

describe('build-repository-images-relationships', () => {
  test('success', async () => {
    recording = setupTenableRecording({
      directory: __dirname,
      name: 'build-repository-images-relationships',
    });

    const context = createMockStepExecutionContext({
      instanceConfig: config,
    });

    await fetchAccount(context);
    await fetchServiceDetails(context);
    await fetchContainerImages(context);
    await fetchContainerRepositories(context);
    await buildRepositoryImagesRelationship(context);

    const containerRepositoryHasImage =
      context.jobState.collectedRelationships.filter(
        (r) => r._type === 'tenable_container_repository_has_image',
      );

    expect(containerRepositoryHasImage.length).toBeGreaterThan(0);

    expect(containerRepositoryHasImage).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: Relationships.CONTAINER_REPOSITORY_HAS_IMAGE._type },
        },
      },
    });
  });
});

describe('fetch-container-reports', () => {
  test('success', async () => {
    recording = setupTenableRecording({
      directory: __dirname,
      name: 'fetch-container-reports',
    });

    const context = createMockStepExecutionContext({
      instanceConfig: config,
    });

    await fetchAccount(context);
    await fetchServiceDetails(context);
    await fetchContainerImages(context);
    await fetchContainerReports(context);

    const entities = context.jobState.collectedEntities;
    expect(entities.length).toBeGreaterThan(0);

    const containerReportEntities = entities.filter(
      (e) => e._type === Entities.CONTAINER_REPORT._type,
    );
    const containerFindingEntities = entities.filter(
      (e) => e._type === Entities.CONTAINER_FINDING._type,
    );
    const containerMalwareEntities = entities.filter(
      (e) => e._type === Entities.CONTAINER_MALWARE._type,
    );
    const containerUnwantedProgramEntities = entities.filter(
      (e) => e._type === Entities.CONTAINER_UNWANTED_PROGRAM._type,
    );

    expect(containerReportEntities).toMatchGraphObjectSchema({
      _class: Entities.CONTAINER_REPORT._class,
    });
    expect(containerFindingEntities).toMatchGraphObjectSchema({
      _class: Entities.CONTAINER_FINDING._class,
    });
    expect(containerMalwareEntities).toMatchGraphObjectSchema({
      _class: Entities.CONTAINER_MALWARE._class,
    });
    expect(containerUnwantedProgramEntities).toMatchGraphObjectSchema({
      _class: Entities.CONTAINER_UNWANTED_PROGRAM._class,
    });

    const relationships = context.jobState.collectedRelationships;
    const containerImageHasReport = relationships.filter(
      (r) => r._type === 'tenable_container_image_has_report',
    );
    const containerImageHasFinding = relationships.filter(
      (r) => r._type === 'tenable_container_image_has_finding',
    );
    const containerImageHasMalware = relationships.filter(
      (r) => r._type === 'tenable_container_image_has_malware',
    );
    const containerImageHasUnwantedProgram = relationships.filter(
      (r) => r._type === 'tenable_container_image_has_unwanted_program',
    );
    const reportIdentifiedFinding = relationships.filter(
      (r) => r._type === 'tenable_container_report_identified_finding',
    );
    const reportIdentifiedMalware = relationships.filter(
      (r) => r._type === 'tenable_container_report_identified_malware',
    );
    const reportIdentifiedUnwantedProgram = relationships.filter(
      (r) => r._type === 'tenable_container_report_identified_unwanted_program',
    );

    expect(containerImageHasReport).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: Relationships.CONTAINER_IMAGE_HAS_REPORT._type },
        },
      },
    });

    expect(containerImageHasFinding).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: Relationships.CONTAINER_IMAGE_HAS_FINDING._type },
        },
      },
    });

    expect(containerImageHasMalware).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: Relationships.CONTAINER_IMAGE_HAS_MALWARE._type },
        },
      },
    });

    expect(containerImageHasUnwantedProgram).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const: Relationships.CONTAINER_IMAGE_HAS_UNWANTED_PROGRAM._type,
          },
        },
      },
    });

    expect(reportIdentifiedFinding).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: Relationships.REPORT_IDENTIFIED_FINDING._type },
        },
      },
    });

    expect(reportIdentifiedMalware).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: Relationships.REPORT_IDENTIFIED_MALWARE._type },
        },
      },
    });

    expect(reportIdentifiedUnwantedProgram).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const: Relationships.REPORT_IDENTIFIED_UNWANTED_PROGRAM._type,
          },
        },
      },
    });
  });
});

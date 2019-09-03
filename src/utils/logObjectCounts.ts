import { JupiterOneDataModel } from "../jupiterone/fetchEntitiesAndRelationships";
import { Dictionary, TenableDataModel } from "../tenable/types";
import { TenableIntegrationContext } from "../types";

export default function logObjectCounts(
  context: TenableIntegrationContext,
  oldData: JupiterOneDataModel,
  tenableData: TenableDataModel,
) {
  const graphEntityCounts: {
    [objectName: string]: number;
  } = {};
  for (const [k, v] of Object.entries(oldData.entities)) {
    graphEntityCounts[k] = v.length;
  }

  const graphRelationshipCounts: {
    [objectName: string]: number;
  } = {};
  for (const [k, v] of Object.entries(oldData.relationships)) {
    graphRelationshipCounts[k] = v.length;
  }

  const countDictionary = (dict: Dictionary<any>) =>
    Object.values(dict).reduce((c, h) => c + h.length, 0);

  const tenableDataCounts = {
    containers: tenableData.containers.length,
    containerFindings: countDictionary(tenableData.containerFindings),
    containerMalwares: countDictionary(tenableData.containerMalwares),
    containerUnwantedPrograms: countDictionary(
      tenableData.containerUnwantedPrograms,
    ),
  };

  context.logger.info(
    {
      graphEntityCounts,
      graphRelationshipCounts,
      tenableDataCounts,
    },
    "Loaded container data for synchronization",
  );
}

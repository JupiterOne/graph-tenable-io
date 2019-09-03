// TODO: Move these into integration SDK and push out to other scanner
// integrations
export enum FindingSeverityNormal {
  Informational = 0,
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4,
}

export enum FindingSeverityNormalName {
  Informational = "Informational",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}

export const FindingSeverityNormalNames = {
  [FindingSeverityNormal.Informational]:
    FindingSeverityNormalName.Informational,
  [FindingSeverityNormal.Low]: FindingSeverityNormalName.Low,
  [FindingSeverityNormal.Medium]: FindingSeverityNormalName.Medium,
  [FindingSeverityNormal.High]: FindingSeverityNormalName.High,
  [FindingSeverityNormal.Critical]: FindingSeverityNormalName.Critical,
};

import {
  APPLICATION_ENTITY_TYPE,
  ASSESSMENT_ENTITY_TYPE,
  ASSESSMENT_HAS_APPLICATION_RELATIONSHIP_CLASS,
  ASSESSMENT_HAS_APPLICATION_RELATIONSHIP_TYPE,
  AssessmentApplicationRelationship,
} from "../jupiterone/entities";
import { Asset, Scan, ScanDetail } from "../tenable";
import generateKey from "../utils/generateKey";

const defaultValue: AssessmentApplicationRelationship[] = [];

export function createAssessmentApplicationRelationships(
  scans: Scan[],
  assets: Asset[],
): AssessmentApplicationRelationship[] {
  const relationships: AssessmentApplicationRelationship[] = scans.reduce(
    (acc, scan) => {
      if (!scan.scanDetail) {
        return acc;
      }

      const relationshipsForOneScan = createRelationshipsForOneAssessment(
        scan.id,
        scan.scanDetail,
        assets,
      );

      return acc.concat(relationshipsForOneScan);
    },
    defaultValue,
  );

  return relationships;
}

function createRelationshipsForOneAssessment(
  scanId: number,
  scanDetail: ScanDetail,
  assets: Asset[],
) {
  const relationships = scanDetail.hosts.reduce((acc, host) => {
    const asset = findAsset(assets, host.hostname);

    if (!asset) {
      return acc;
    }

    const parentKey = generateKey(ASSESSMENT_ENTITY_TYPE, scanId);
    const childKey = generateKey(APPLICATION_ENTITY_TYPE, asset.id);
    const relationship: AssessmentApplicationRelationship = {
      _class: ASSESSMENT_HAS_APPLICATION_RELATIONSHIP_CLASS,
      _type: ASSESSMENT_HAS_APPLICATION_RELATIONSHIP_TYPE,
      _fromEntityKey: parentKey,
      _key: `${parentKey}_has_${childKey}`,
      _toEntityKey: childKey,
    };
    return acc.concat(relationship);
  }, defaultValue);

  return relationships;
}

function findAsset(assets: Asset[], assetName: string) {
  return assets.find(asset => !!asset.fqdn.find(item => item === assetName));
}

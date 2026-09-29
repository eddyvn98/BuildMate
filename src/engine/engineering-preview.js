import { readValue } from './project.js';
import { calculateServiceCurrent } from './engineering/electrical.js';
import { estimateEquivalentFoundationArea, estimatePileCountConcept } from './engineering/foundation.js';
import { estimateCoolingCapacity } from './engineering/hvac.js';
import { estimateBuildingGravityLoad } from './engineering/loads.js';
import { estimateDomesticWater } from './engineering/water.js';

export function runEngineeringPreview(project, planningResults) {
  if (!planningResults?.areas?.floorArea?.value) return { status: 'blocked', modules: {} };

  const floorAreaM2 = planningResults.areas.footprint.value;
  const totalFloorAreaM2 = planningResults.areas.floorArea.value;
  const storeys = Number(readValue(project, 'design.storeys', 1));
  const people = Number(readValue(project, 'household.people', 4));

  const gravity = estimateBuildingGravityLoad({
    floorAreaM2,
    storeys,
    deadLoadKnM2: Number(readValue(project, 'engineering.deadLoadKnM2', 3.5)),
    liveLoadKnM2: Number(readValue(project, 'engineering.liveLoadKnM2', 2)),
  });

  const allowableBearingKpa = Number(readValue(project, 'engineering.allowableBearingKpa', 0));
  const foundation = allowableBearingKpa > 0
    ? {
        status: 'ready-indicative',
        result: estimateEquivalentFoundationArea({
          serviceLoadKn: gravity.value,
          allowableBearingKpa,
        }),
      }
    : {
        status: 'blocked',
        message: 'Cần sức chịu tải nền cho phép từ cơ sở địa kỹ thuật trước khi ước tính diện tích móng.',
      };

  const pileCapacityKn = Number(readValue(project, 'engineering.pileWorkingCapacityKn', 0));
  const pile = pileCapacityKn > 0
    ? { status: 'ready-indicative', result: estimatePileCountConcept({ serviceLoadKn: gravity.value, workingCapacityPerPileKn: pileCapacityKn }) }
    : { status: 'missing', message: 'Chưa có sức chịu tải làm việc của cọc.' };

  const connectedPowerW = Number(readValue(project, 'mep.connectedPowerW', 0));
  const electrical = connectedPowerW > 0
    ? {
        status: 'ready-review',
        result: calculateServiceCurrent({
          connectedPowerW,
          demandFactor: Number(readValue(project, 'mep.demandFactor', 0.7)),
          voltageV: Number(readValue(project, 'mep.voltageV', 220)),
          powerFactor: Number(readValue(project, 'mep.powerFactor', 0.9)),
          phase: readValue(project, 'mep.phase', 'single'),
        }),
      }
    : { status: 'blocked', message: 'Cần tổng công suất kết nối hoặc schedule tải điện.' };

  const water = {
    status: 'ready-indicative',
    result: estimateDomesticWater({
      people,
      litersPerPersonDay: Number(readValue(project, 'mep.waterLitersPerPersonDay', 150)),
      storageDays: Number(readValue(project, 'mep.waterStorageDays', 1)),
    }),
  };

  const conditionedRatio = Number(readValue(project, 'mep.conditionedAreaRatio', 0.7));
  const hvac = {
    status: 'ready-indicative',
    result: estimateCoolingCapacity({
      conditionedAreaM2: totalFloorAreaM2 * conditionedRatio,
      wattsPerM2: Number(readValue(project, 'mep.coolingWPerM2', 150)),
    }),
  };

  return {
    status: 'ready',
    modules: {
      structure: { status: 'ready-indicative', gravity },
      foundation,
      pile,
      electrical,
      water,
      hvac,
    },
  };
}

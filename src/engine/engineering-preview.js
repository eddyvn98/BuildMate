import { readValue } from './project.js';
import { calculateServiceCurrent } from './engineering/electrical.js';
import { estimateEquivalentFoundationArea, estimatePileCountConcept } from './engineering/foundation.js';
import { estimateBuildingGravityLoad } from './engineering/loads.js';
import { engineeringProfileStatus } from './engineering-profiles.js';
import { residentialCharacteristicLiveLoad } from './standards/tcvn2737.js';
import { housingDesignFlow } from './standards/tcvn4513.js';

export function runEngineeringPreview(project, planningResults) {
  if (!planningResults?.areas?.floorArea?.value) return {status:'blocked',profiles:engineeringProfileStatus(),modules:{}};

  const floorAreaM2=planningResults.areas.footprint.value;
  const storeys=Number(readValue(project,'design.storeys',1));
  const liveLoadClass=readValue(project,'engineering.liveLoadClass','A1-floor');
  const liveLoad=residentialCharacteristicLiveLoad(liveLoadClass);
  const deadLoadKnM2=Number(readValue(project,'engineering.deadLoadKnM2',0));
  const deadLoadSource=readValue(project,'engineering.deadLoadSource','');

  const structure=deadLoadKnM2>0&&deadLoadSource
    ? {status:'ready-review',result:estimateBuildingGravityLoad({floorAreaM2,storeys,deadLoadKnM2,liveLoadKnM2:liveLoad.value}),provenance:{deadLoadSource,liveLoadReference:liveLoad.reference}}
    : {status:'blocked',message:'Cần tải trọng thường xuyên từ cấu tạo/vật liệu có nguồn. Tải tạm thời được tra theo TCVN 2737:2023.'};

  const gravity=structure.result;
  const allowableBearingKpa=Number(readValue(project,'engineering.allowableBearingKpa',0));
  const bearingSource=readValue(project,'engineering.allowableBearingSource','');
  const foundation=gravity&&allowableBearingKpa>0&&bearingSource
    ? {status:'ready-indicative',result:estimateEquivalentFoundationArea({serviceLoadKn:gravity.value,allowableBearingKpa,loadAllowanceRatio:0}),provenance:{bearingSource}}
    : {status:'blocked',message:'Cần tải trọng có nguồn và sức chịu tải nền có nguồn địa kỹ thuật trước khi tính móng.'};

  const pileCapacityKn=Number(readValue(project,'engineering.pileWorkingCapacityKn',0));
  const pileSource=readValue(project,'engineering.pileCapacitySource','');
  const pile=gravity&&pileCapacityKn>0&&pileSource
    ? {status:'ready-indicative',result:estimatePileCountConcept({serviceLoadKn:gravity.value,workingCapacityPerPileKn:pileCapacityKn,reserveRatio:0}),provenance:{pileSource}}
    : {status:'blocked',message:'Cần sức chịu tải cọc thiết kế có nguồn theo TCVN 10304/hồ sơ địa kỹ thuật.'};

  const connectedPowerW=Number(readValue(project,'mep.connectedPowerW',0));
  const demandFactor=Number(readValue(project,'mep.demandFactor',0));
  const demandSource=readValue(project,'mep.demandFactorSource','');
  const powerFactor=Number(readValue(project,'mep.powerFactor',0));
  const electrical=connectedPowerW>0&&demandFactor>0&&demandSource&&powerFactor>0
    ? {status:'ready-review',result:calculateServiceCurrent({connectedPowerW,demandFactor,voltageV:Number(readValue(project,'mep.voltageV',220)),powerFactor,phase:readValue(project,'mep.phase','single')}),provenance:{demandSource}}
    : {status:'blocked',message:'Cần schedule công suất, hệ số nhu cầu/đồng thời có nguồn TCVN 9206 và hệ số công suất được xác nhận.'};

  const fixtureUnits=Number(readValue(project,'mep.fixtureEquivalentUnits',0));
  const litersPerPersonDay=Number(readValue(project,'mep.waterLitersPerPersonDay',0));
  const water=fixtureUnits>0&&litersPerPersonDay>0
    ? {status:'ready-review',result:housingDesignFlow({fixtureEquivalentUnits:fixtureUnits,litersPerPersonDay})}
    : {status:'blocked',message:'Cần tổng đương lượng thiết bị vệ sinh và mức dùng nước chọn từ TCVN 4513:1988.'};

  const hvac={status:'blocked',message:'Chưa có profile tiêu chuẩn HVAC được chứng minh; BuildMate không dùng W/m² placeholder cho thiết kế kỹ thuật.'};

  return {status:'ready',profiles:engineeringProfileStatus(),modules:{structure,foundation,pile,electrical,water,hvac}};
}

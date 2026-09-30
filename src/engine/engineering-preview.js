import { readValue } from './project.js';
import { calculateServiceCurrent } from './engineering/electrical.js';
import { estimateBuildingGravityLoad } from './engineering/loads.js';
import { engineeringProfileStatus } from './engineering-profiles.js';
import { residentialCharacteristicLiveLoad } from './standards/tcvn2737.js';
import { housingDesignFlow } from './standards/tcvn4513.js';
import { assessEngineeringEvidence } from './engineering-evidence.js';

export function runEngineeringPreview(project, planningResults) {
  if (!planningResults?.areas?.floorArea?.value) return {status:'blocked',profiles:engineeringProfileStatus(),modules:{}};

  const floorAreaM2=planningResults.areas.footprint.value;
  const storeys=Number(readValue(project,'design.storeys',1));
  const liveLoadClass=readValue(project,'engineering.liveLoadClass','A1-floor');
  const liveLoad=residentialCharacteristicLiveLoad(liveLoadClass);
  const deadLoadKnM2=Number(readValue(project,'engineering.deadLoadKnM2',0));
  const deadLoadSource=readValue(project,'engineering.deadLoadSource','');

  const structure=deadLoadKnM2>0&&deadLoadSource
    ? {
        status:'ready-review',
        result:estimateBuildingGravityLoad({
          floorAreaM2,storeys,deadLoadKnM2,liveLoadKnM2:liveLoad.value,
          deadLoadSource,liveLoadSource:liveLoad.reference.standard+' '+liveLoad.reference.clause,
        }),
        provenance:{deadLoadSource,liveLoadReference:liveLoad.reference},
        message:'Tổng tải đứng sử dụng chỉ để định hướng. Tổ hợp/nội lực/thiết kế phải chạy workflow TCVN tương ứng.',
      }
    : {status:'blocked',message:'Cần tải trọng thường xuyên từ cấu tạo/vật liệu có nguồn. Tải tạm thời được tra theo TCVN 2737:2023.'};

  const allowableBearingKpa=Number(readValue(project,'engineering.allowableBearingKpa',0));
  const bearingSource=readValue(project,'engineering.allowableBearingSource','');
  const geotechEvidence=assessEngineeringEvidence(project.engineeringEvidence ?? [],6);
  const foundation=allowableBearingKpa>0&&bearingSource
    ? {
        status:'input-ready',
        message:'Đã có cơ sở áp lực nền. Chạy foundation.shallow-settlement / các workflow TCVN 9362 với lớp đất và ứng suất có nguồn.',
        provenance:{allowableBearingKpa,bearingSource,evidenceDigest:geotechEvidence.digest},
      }
    : {
        status:'blocked',
        message:'Cần cơ sở địa kỹ thuật có nguồn trước khi tính móng. BuildMate không suy ra áp lực nền từ loại đất mô tả.',
        evidence:geotechEvidence,
      };

  const pileCapacityKn=Number(readValue(project,'engineering.pileWorkingCapacityKn',0));
  const pileSource=readValue(project,'engineering.pileCapacitySource','');
  const pile=geotechEvidence.records.length>0||(pileCapacityKn>0&&pileSource)
    ? {
        status:'input-ready',
        message:'Có dữ liệu/cơ sở cọc. Chọn workflow TCVN 10304 (SPT/CPT/thử tải/sức chịu tải/lún) trong calculator; preview không tự chia số cọc.',
        provenance:{pileCapacityKn:pileCapacityKn||null,pileSource:pileSource||null,evidenceDigest:geotechEvidence.digest},
      }
    : {
        status:'blocked',
        message:'Cần khảo sát/thí nghiệm địa kỹ thuật hoặc sức chịu tải cọc có nguồn theo TCVN 10304:2025.',
        evidence:geotechEvidence,
      };

  const connectedPowerW=Number(readValue(project,'mep.connectedPowerW',0));
  const demandFactor=Number(readValue(project,'mep.demandFactor',0));
  const demandSource=readValue(project,'mep.demandFactorSource','');
  const powerFactor=Number(readValue(project,'mep.powerFactor',0));
  const electrical=connectedPowerW>0&&demandFactor>0&&demandSource&&powerFactor>0
    ? {
        status:'ready-review',
        result:calculateServiceCurrent({
          connectedPowerW,demandFactor,
          voltageV:Number(readValue(project,'mep.voltageV',220)),
          powerFactor,phase:readValue(project,'mep.phase','single'),
        }),
        provenance:{demandSource},
        message:'Dòng nhu cầu là đầu vào. Chọn dây/bảo vệ/loop/PE phải chạy calculator QCVN 12 + TCVN 7447.',
      }
    : {status:'blocked',message:'Cần schedule công suất, hệ số nhu cầu/đồng thời có nguồn TCVN 9206 và hệ số công suất được xác nhận.'};

  const fixtureUnits=Number(readValue(project,'mep.fixtureEquivalentUnits',0));
  const litersPerPersonDay=Number(readValue(project,'mep.waterLitersPerPersonDay',0));
  const water=fixtureUnits>0&&litersPerPersonDay>0
    ? {
        status:'ready-review',
        result:housingDesignFlow({fixtureEquivalentUnits:fixtureUnits,litersPerPersonDay}),
        message:'Lưu lượng thiết kế theo TCVN 4513; sizing/loss/pump/drainage tiếp tục qua calculator tiêu chuẩn.',
      }
    : {status:'blocked',message:'Cần tổng đương lượng thiết bị vệ sinh và mức dùng nước chọn từ TCVN 4513:1988.'};

  const hvacEvidence=assessEngineeringEvidence(project.engineeringEvidence ?? [],12);
  const hvacRuns=(project.engineeringCalculations ?? []).filter((item)=>Number(item.issue)===12);
  const latestHvacReady=[...hvacRuns].reverse().find((item)=>item.status==='ready') ?? null;
  const hvac=latestHvacReady
    ? {
        status:'standards-backed',
        result:structuredClone(latestHvacReady.result ?? null),
        calculationId:latestHvacReady.id,
        provenance:{
          standard:latestHvacReady.standard,
          calculationDigest:latestHvacReady.calculationDigest,
          projectEvidenceDigest:latestHvacReady.projectEvidenceDigest ?? hvacEvidence.digest,
        },
        message:'Đã có calculation run TCVN 5687:2024 cho dự án. Xem calculator/history để kiểm tra input, công thức và dẫn chứng.',
      }
    : {
        status:'blocked',
        message:'Chạy workflow TCVN 5687:2024 với điều kiện trong/ngoài nhà, thông gió, tải lạnh thành phần và evidence thiết bị khi workflow yêu cầu. BuildMate không dùng suất W/m² placeholder làm thiết kế HVAC.',
        evidence:hvacEvidence,
      };

  return {
    status:'ready',
    profiles:engineeringProfileStatus(),
    projectEvidence:{foundation:geotechEvidence,hvac:hvacEvidence},
    modules:{structure,foundation,pile,electrical,water,hvac},
  };
}

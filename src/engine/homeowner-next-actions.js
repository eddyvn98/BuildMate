import { projectAtoZStatus } from './a2z-status.js';

const ACTIONS=Object.freeze({
  brief:{title:'Hoàn thiện thông tin đầu vào',body:'Bổ sung vị trí, kích thước đất, số tầng và nhu cầu sử dụng.',view:'project'},
  budget:{title:'Kiểm tra khung ngân sách',body:'Dùng giá thị trường hiện tại hoặc nhập báo giá dự án có nguồn.',view:'pricing'},
  loads:{title:'Chạy tải trọng thường xuyên',body:'Nhập cấu tạo sàn/hoàn thiện để có tải có nguồn.',view:'engineering',guidedAction:'loads.permanent'},
  rc:{title:'Kiểm tra một dầm điển hình',body:'Nhập nội lực và kích thước dầm để kiểm tra BTCT.',view:'engineering',guidedAction:'rc.beam'},
  foundation:{title:'Bổ sung dữ liệu địa chất',body:'Không chốt móng từ giả định. Cần p/E hoặc hồ sơ địa chất trước khi tính lún.',view:'engineering',guidedAction:'foundation.shallow-settlement'},
  electrical:{title:'Chọn tiết diện cáp chính',body:'Nhập dòng thiết kế, cách lắp đặt và hệ số hiệu chỉnh.',view:'engineering',guidedAction:'electrical.xlpe-cable'},
  water:{title:'Tính lưu lượng cấp nước',body:'Nhập tổng đương lượng thiết bị và mức dùng nước.',view:'engineering',guidedAction:'water.design-flow'},
  hvac:{title:'Tính gió tươi phòng ở',body:'Bắt đầu bằng phòng ngủ/phòng khách điển hình.',view:'engineering',guidedAction:'hvac.outdoor-air'},
  report:{title:'Xuất báo cáo A→Z',body:'Lưu phiên bản thiết kế và xuất báo cáo HTML/BOQ để rà soát.',view:'report'},
});

export function homeownerNextActions(project,{limit=3}={}) {
  const status=projectAtoZStatus(project);
  const blocked=status.stages.filter(x=>x.status!=='ready');
  if (!blocked.length) {
    return [{
      id:'review',
      title:'Rà soát và lưu phiên bản',
      body:'Tất cả stage đang ready. Lưu checkpoint, xem cách tính và xuất báo cáo trước khi thay đổi phương án.',
      view:'report',
    }];
  }
  return blocked.slice(0,limit).map((stage)=>({
    id:stage.id,
    ...(ACTIONS[stage.id]??{title:stage.label,body:stage.message,view:'overview'}),
    reason:stage.message,
  }));
}

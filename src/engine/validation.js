import { readValue } from './project.js';

export function validatePlanningInputs(project) {
  const issues = [];
  const width = Number(readValue(project, 'land.widthM'));
  const length = Number(readValue(project, 'land.lengthM'));
  const storeys = Number(readValue(project, 'design.storeys'));

  if (!(width > 0)) issues.push({ path: 'land.widthM', severity: 'blocked', message: 'Cần chiều rộng khu đất.' });
  if (!(length > 0)) issues.push({ path: 'land.lengthM', severity: 'blocked', message: 'Cần chiều dài khu đất.' });
  if (!(storeys >= 1 && storeys <= 5)) issues.push({ path: 'design.storeys', severity: 'blocked', message: 'V1 hỗ trợ nhà phố từ 1 đến 5 tầng.' });
  if (!readValue(project, 'location.province')) issues.push({ path: 'location.province', severity: 'warning', message: 'Chưa có tỉnh/thành để áp dụng đơn giá địa phương.' });
  if (!readValue(project, 'budget.totalVnd')) issues.push({ path: 'budget.totalVnd', severity: 'info', message: 'Chưa có ngân sách mục tiêu.' });

  return issues;
}

export function engineeringGates(project) {
  return {
    planning: { status: 'ready', message: 'Có thể dùng cho lập kế hoạch khi đủ kích thước cơ bản.' },
    structure: {
      status: readValue(project, 'technical.geotechnicalAvailable') ? 'review' : 'blocked',
      message: readValue(project, 'technical.geotechnicalAvailable')
        ? 'Đã có dấu hiệu có dữ liệu địa chất; vẫn cần module tiêu chuẩn được xác minh và kỹ sư kiểm tra.'
        : 'Chưa có dữ liệu địa chất. Không phát hành thiết kế móng thi công.',
    },
    legal: {
      status: readValue(project, 'technical.planningInfoVerified') ? 'review' : 'blocked',
      message: readValue(project, 'technical.planningInfoVerified')
        ? 'Thông tin quy hoạch đã được đánh dấu có dữ liệu, cần đối chiếu hồ sơ nguồn.'
        : 'Chưa xác minh quy hoạch/chỉ tiêu xây dựng địa phương.',
    },
    mep: {
      status: 'blocked',
      message: 'V1 chỉ dự toán định hướng MEP; chưa phát hành sizing thi công.',
    },
  };
}

export function money(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
}

export function number(value, unit = '') {
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(value || 0)} ${unit}`.trim();
}

export function stateLabel(state) {
  return ({
    confirmed: 'Đã xác nhận', suggested: 'Đề xuất', assumed: 'Giả định', missing: 'Chưa biết', blocked: 'Bắt buộc bổ sung',
  })[state] ?? state;
}

export function statusBadge(state) {
  return `<span class="badge badge-${state}">${stateLabel(state)}</span>`;
}

export function functionalPlan(project) {
  const sourcedProgram=project.referenceCase?.floorProgram;
  if (Array.isArray(sourcedProgram)&&sourcedProgram.length) {
    return sourcedProgram.map(item=>({
      name:String(item.floor ?? 'Tầng'),
      rooms:(item.rooms ?? []).map(room=>String(room)),
    }));
  }

  const storeys = Number(project.design.storeys.value || 1);
  const bedrooms = Number(project.household.bedrooms.value || 3);
  const hasCar = Boolean(project.household.hasCar.value);
  const floors = [];
  floors.push({ name: 'Tầng trệt', rooms: [hasCar ? 'Garage' : 'Sân trước', 'Phòng khách', 'Bếp + ăn', 'WC', 'Cầu thang'] });
  let remaining = bedrooms;
  for (let floor = 2; floor <= storeys; floor += 1) {
    const count = Math.min(2, remaining);
    const rooms = Array.from({ length: count }, (_, i) => `Phòng ngủ ${bedrooms - remaining + i + 1}`);
    remaining -= count;
    rooms.push('WC', floor === storeys ? 'Giặt / sân thượng' : 'Sinh hoạt chung');
    floors.push({ name: `Lầu ${floor - 1}`, rooms });
  }
  return floors;
}

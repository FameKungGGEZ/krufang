export function formatPrice(value: number) {
  return `฿${value.toLocaleString('th-TH')}`;
}

export function formatNumber(value: number) {
  return value.toLocaleString('th-TH');
}

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
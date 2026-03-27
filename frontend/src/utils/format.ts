export function formatDateEs(dateISO: string) {
  const d = new Date(dateISO);
  if (Number.isNaN(d.getTime())) return dateISO;
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatMoneyEs(amount: number) {
  const n = Number(amount);
  if (Number.isNaN(n)) return `${amount}€`;
  return `${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} €`;
}

export function formatTime24(timeHHMM?: string) {
  if (!timeHHMM) return '';
  
  const [hours, minutes] = timeHHMM.split(':');
  const h = parseInt(hours, 10);
  const m = minutes || '00';
  
  if (h >= 24 || isNaN(h)) return '';
  
  return `${h.toString().padStart(2, '0')}:${m}`;
}


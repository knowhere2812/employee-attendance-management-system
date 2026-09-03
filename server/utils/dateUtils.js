export const kolkataDate = (date = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date);
export const isLate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const time = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return Number(time.hour) * 60 + Number(time.minute) > 570;
};
export const leaveDays = (start, end) => Math.floor((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000) + 1;

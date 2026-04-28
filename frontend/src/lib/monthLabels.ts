const monthNames: Record<number, string> = {
  0: "Styczeń",
  1: "Luty",
  2: "Marzec",
  3: "Kwiecień",
  4: "Maj",
  5: "Czerwiec",
  6: "Lipiec",
  7: "Sierpień",
  8: "Wrzesień",
  9: "Październik",
  10: "Listopad",
  11: "Grudzień",
};

export interface MonthOption {
  label: string;
  dateFrom: string;
  dateTo: string;
}

const generateMonthLabels = (): MonthOption[] => {
  const months: MonthOption[] = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);

    months.push({
      label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
      dateFrom: date.toISOString(),
      dateTo: new Date(nextMonth.getTime() - 1000).toISOString(),
    });
  }

  return months;
};

export const monthLabels = generateMonthLabels();
export const defaultMonth = monthLabels[1];

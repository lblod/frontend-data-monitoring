import { helper } from '@ember/component/helper';

export default helper(function DateFormat([date, format = 'DD-MM-YYYY']: [
  Date | string,
  string
]): string | null {
  const newDate = new Date(date);

  if (!isNaN(newDate.getTime())) {
    const day = newDate.toLocaleDateString('nl-BE', { day: '2-digit' });
    const month = newDate.toLocaleDateString('nl-BE', { month: '2-digit' });
    const year = newDate.getFullYear();

    if (format === 'YYYY-MM-DD') {
      return `${year}-${month}-${day}`;
    }
    return `${day}-${month}-${year}`;
  }

  return null;
});

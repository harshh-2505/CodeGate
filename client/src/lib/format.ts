// Event dates are plain YYYY-MM-DD strings; parse them as local dates so they don't shift a day by timezone.
export const parseDate = (date: string, time = '00:00') => new Date(`${date}T${time}`);

export const formatDate = (date: string, options: Intl.DateTimeFormatOptions) =>
  parseDate(date).toLocaleDateString('en-US', options);

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

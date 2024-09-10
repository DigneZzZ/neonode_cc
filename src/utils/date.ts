const dateOptions = {
  locale: "ru-RU",
  options: {
    day: "numeric",
    month: "short", // "short" для сокращенных названий месяцев
    year: "numeric",
  }
};

// Форматируем даты по умолчанию с помощью "ru-RU" локали
const dateFormat = (locale: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locale, options);

// Функция для получения отформатированной даты
export function getFormattedDate(
  date: string | number | Date,
  options?: Intl.DateTimeFormatOptions,
  locale?: string,
) {
  const formatLocale = locale ?? dateOptions.locale;
  const formatOptions = options ?? dateOptions.options;

  return dateFormat(formatLocale, formatOptions).format(new Date(date));
}

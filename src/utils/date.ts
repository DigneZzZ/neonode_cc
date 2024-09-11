// Опции по умолчанию для русской локали
const dateOptions = {
  locale: "ru-RU",
  options: {
    day: "numeric",
    month: "short",  // "short" - месяц в коротком формате (например, "сент.")
    year: "numeric",
  } as Intl.DateTimeFormatOptions,
};

// Создание формата даты по умолчанию
const dateFormat = new Intl.DateTimeFormat(
  dateOptions.locale, 
  dateOptions.options
);

// Функция для форматирования даты
export function getFormattedDate(
  date: string | number | Date,
  options?: Intl.DateTimeFormatOptions,
  locale?: string,
): string {
  // Если переданы опции или локаль, используем их, иначе - по умолчанию
  if (options || locale) {
    return new Date(date).toLocaleDateString(locale ?? dateOptions.locale, options ?? dateOptions.options);
  }

  // Если опции не переданы, используем формат по умолчанию
  return dateFormat.format(new Date(date));
}

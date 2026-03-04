export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateUniqueSlug = (title: string, existingSlugs: string[]): string => {
  let slug = slugify(title);
  let counter = 1;
  let uniqueSlug = slug;
  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  return uniqueSlug;
};

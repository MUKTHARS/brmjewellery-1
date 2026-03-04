// UK ring size to inner diameter mapping (mm)
export const UK_RING_SIZES: Record<string, number> = {
  'A': 12.04, 'A½': 12.45, 'B': 12.85, 'B½': 13.26, 'C': 13.67,
  'C½': 14.07, 'D': 14.48, 'D½': 14.88, 'E': 15.29, 'E½': 15.49,
  'F': 15.70, 'F½': 16.10, 'G': 16.51, 'G½': 16.92, 'H': 17.32,
  'H½': 17.53, 'I': 17.73, 'I½': 18.14, 'J': 18.54, 'J½': 18.75,
  'K': 18.95, 'K½': 19.35, 'L': 19.76, 'L½': 20.17, 'M': 20.57,
  'M½': 20.78, 'N': 20.98, 'N½': 21.39, 'O': 21.79, 'O½': 22.20,
  'P': 22.60, 'P½': 22.81, 'Q': 23.01, 'Q½': 23.42, 'R': 23.83,
  'R½': 24.03, 'S': 24.23, 'S½': 24.64, 'T': 25.05, 'T½': 25.25,
  'U': 25.45, 'U½': 25.86, 'V': 26.27, 'V½': 26.47, 'W': 26.67,
  'W½': 27.08, 'X': 27.49, 'X½': 27.69, 'Y': 27.89, 'Y½': 28.30,
  'Z': 28.71, 'Z½': 29.11, 'Z+1': 29.52, 'Z+2': 29.93,
};

export const getInnerDiameter = (ukSize: string): number | null => {
  return UK_RING_SIZES[ukSize] ?? null;
};

export const convertUKToEU = (ukSize: string): string | null => {
  const diameter = UK_RING_SIZES[ukSize];
  if (!diameter) return null;
  const circumference = Math.PI * diameter;
  return String(Math.round(circumference));
};

export const convertUKToUS = (ukSize: string): string | null => {
  const euSizes: Record<string, string> = {
    'F': '2¾', 'G': '3¼', 'H': '3¾', 'I': '4', 'J': '4½',
    'K': '5', 'L': '5½', 'M': '6', 'N': '6½', 'O': '7',
    'P': '7½', 'Q': '8', 'R': '8½', 'S': '9', 'T': '9½',
    'U': '10', 'V': '10½', 'W': '11', 'X': '11½', 'Y': '12',
    'Z': '12½',
  };
  return euSizes[ukSize] ?? null;
};

export const UK_SIZE_LIST = Object.keys(UK_RING_SIZES);

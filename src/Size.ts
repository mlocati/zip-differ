enum Unit {
  Byte = 'byte',
  KiloByte = 'kilobyte',
  MegaByte = 'megabyte',
  GigaByte = 'gigabyte',
  TeraByte = 'terabyte',
  PetaByte = 'petabyte',
}

const FORMATTERS: {[id: string]: Intl.NumberFormat} = {};

Object.values(Unit).forEach((unit: Unit) => {
  FORMATTERS[unit] = new Intl.NumberFormat('en-US', {
    style: 'unit',
    unit: unit,
    unitDisplay: unit === Unit.Byte ? 'long' : 'short',
    minimumFractionDigits: unit === Unit.Byte ? 0 : 2,
    maximumFractionDigits: unit === Unit.Byte ? 0 : 2,
  });
});

function formatUnsigned(size: number): string {
  if (size < 1024) {
    return FORMATTERS[Unit.Byte].format(size);
  }
  const units: Unit[] = Object.values(Unit);
  units.shift();
  let unit: Unit = <Unit>units.shift();
  let divisor = 1024;
  for (const nextUnit of units) {
    if (size < divisor * 1024) {
      return FORMATTERS[unit].format(size / divisor);
    }
    unit = nextUnit;
    divisor *= 1024;
  }
  return FORMATTERS[unit].format(size / divisor);
}

export function formatSize(size: number): string {
  return size < 0 ? '-' + formatUnsigned(Math.abs(size)) : formatUnsigned(size);
}

const FORMATTERS: {[id: string]: Intl.NumberFormat} = {
    byte: new Intl.NumberFormat(
        'en-US',
        {
            style: 'unit',
            unit: 'byte',
            unitDisplay: 'short',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        },
    ),
};

['kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte', ].forEach((unit) => {
    FORMATTERS[unit] = new Intl.NumberFormat(
        'en-US',
        {
            style: 'unit',
            unit: unit,
            unitDisplay: 'short',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        },
    );
});

function formatUnsigned(size: number): string
{
    if (size < 1024) {
        return FORMATTERS.byte.format(size);
    }
    let unit = 'kilobyte';
    let divisor = 1024;
    for (const nextUnit of ['megabyte', 'gigabyte', 'terabyte', 'petabyte']) {
        if (size < divisor * 1024) {
            return FORMATTERS[unit].format(size / divisor);
        }
        unit = nextUnit;
        divisor *= 1024;
    }
    return FORMATTERS[unit].format(size / divisor);

}

export function formatSize(size: number): string
{
    return size < 0 ? '-' + formatUnsigned(Math.abs(size)) : formatUnsigned(size);
}

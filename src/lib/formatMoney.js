export function formatOMR(value) {
    const numberValue = Number(value ?? 0);
    return Number.isFinite(numberValue) ? numberValue.toFixed(3) : "0.000";
}

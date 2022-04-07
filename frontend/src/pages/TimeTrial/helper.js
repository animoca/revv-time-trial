export function formatCurrency(value) {
    if (isNaN(value)) return 0;

    const formatter = new Intl.NumberFormat();
    return formatter.format(value);
}

export function lp(num, isMs = false) {
    let val = num + "";
    if (isMs) {
        if (val.length < 2) {
            val = "00" + val;
        } else if (val.length < 3) {
            val = "0" + val;
        }
    } else {
        if (val.length < 2) {
            val = "0" + val;
        }
    }
    return val;
}

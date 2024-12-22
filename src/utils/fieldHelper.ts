function getFormattedControlName(controlName: string) {
  return controlName.replace(/control de /i, "").replace(/^control /i, "");
}

function getFormattedPrice(price: number | string) {
  return `$${parseFloat(price.toString()).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export { getFormattedControlName, getFormattedPrice };

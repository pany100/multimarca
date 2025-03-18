function getFormattedControlName(controlName: string) {
  return controlName.replace(/control de /i, "").replace(/^control /i, "");
}

function getFormattedPrice(price: number | string) {
  return `$${parseFloat(price.toString()).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getFormattedDate(date: string) {
  const dateParts = date.split("T")[0].split("-");
  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];
  return `${day}/${month}/${year}`;
}

export { getFormattedControlName, getFormattedDate, getFormattedPrice };

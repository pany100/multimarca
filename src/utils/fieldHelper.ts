function getFormattedControlName(controlName: string) {
  return controlName.replace(/control de /i, "").replace(/^control /i, "");
}

export { getFormattedControlName };

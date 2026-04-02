const COLOR_PALETTE = [
  "#0f766e",
  "#1d4ed8",
  "#b45309",
  "#be123c",
  "#4c1d95",
  "#0369a1",
  "#166534",
  "#92400e",
  "#7c2d12",
  "#0f172a",
];

export const getProductColor = (product) => {
  const rawValue = Number(product?.id);
  const safeValue = Number.isFinite(rawValue) ? rawValue : 0;
  return COLOR_PALETTE[Math.abs(safeValue) % COLOR_PALETTE.length];
};

export const getProductVisualLabel = (product) => {
  if (product?.category && String(product.category).trim()) {
    return String(product.category).trim();
  }

  return "Product";
};

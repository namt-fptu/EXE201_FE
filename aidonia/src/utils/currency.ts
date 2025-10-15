// Vietnamese currency formatting utility
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Alternative format without currency symbol
export const formatVNDNumber = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
};

// Shared utilities
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
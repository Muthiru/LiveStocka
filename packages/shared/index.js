// Shared utilities
export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Note: formatDate utility moved to apps/web/utils/formatDate.ts for TypeScript support
export const displayName = value => /^\+?[1-9]\d{1,14}$/.test(value || '') ? `User …${value.slice(-4)}` : value || 'A new friend';

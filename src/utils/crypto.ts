export const maskSensitiveData = (data: string): string => {
  if (!data || data.length <= 2) return '***';
  return data.charAt(0) + '***' + data.charAt(data.length - 1);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
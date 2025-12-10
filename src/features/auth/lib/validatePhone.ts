export const validatePakistaniPhone = (phone: string): boolean => {
  // Pakistani phone format: +92XXXXXXXXXX or 03XXXXXXXXX
  const pakistaniPhoneRegex = /^(\+92|0)?3[0-9]{9}$/;
  return pakistaniPhoneRegex.test(phone.replace(/[\s-]/g, ''));
};

export const formatPakistaniPhone = (phone: string): string => {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.startsWith('+92')) {
    return cleaned;
  }
  if (cleaned.startsWith('0')) {
    return '+92' + cleaned.slice(1);
  }
  if (cleaned.startsWith('3')) {
    return '+92' + cleaned;
  }
  return cleaned;
};

export const isEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

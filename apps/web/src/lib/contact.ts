/**
 * A `tel:` link for a Bangladeshi number as printed on the site (`+88 09666-731731`,
 * `01700-766084`): digits only, always with the +88 country code, so it dials from abroad too.
 */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `tel:+${digits.startsWith('88') ? digits : `88${digits}`}`;
}

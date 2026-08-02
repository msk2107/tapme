export function foundingLabel(signupNumber: number): string | null {
  if (signupNumber === 1) return "TapMe Founder";
  if (signupNumber <= 100) return `Founding Member #${signupNumber}`;
  return null;
}

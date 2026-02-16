export function calculateLevel(referralsCount) {

  if (referralsCount >= 30) return "Platinum";
  if (referralsCount >= 15) return "Gold";
  if (referralsCount >= 5) return "Silver";

  return "Starter";
}

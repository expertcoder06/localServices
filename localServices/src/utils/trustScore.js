export function calculateTrustScore(rating, jobs, responseTime) {
  // Rating (0–5 → 0–10)
  let ratingScore = (rating / 5) * 10;

  // Jobs (log scale)
  let jobScore = (Math.log(jobs + 1) / Math.log(101)) * 10;

  // Boost new users slightly
  if (jobs < 5) {
    jobScore = jobScore * 0.7 + 3;
  }

  // Time (1–24 hours → 10–0)
  let minTime = 1;
  let maxTime = 24;

  let timeScore = 10 * (1 - (responseTime - minTime) / (maxTime - minTime));
  timeScore = Math.max(0, Math.min(10, timeScore));

  // Final weighted score
  let trustScore = (0.5 * ratingScore) + 
                   (0.3 * jobScore) + 
                   (0.2 * timeScore);

  return Number(trustScore.toFixed(1));
}

export function getTrustBadge(score) {
  if (score >= 8.5) return { label: 'Highly Trusted', icon: '⭐', color: '#dd6b20', bg: 'rgba(221,107,32,0.1)' };
  if (score >= 7.0) return { label: 'Trusted', icon: '👍', color: '#38a169', bg: 'rgba(56,161,105,0.1)' };
  if (score >= 5.0) return { label: 'Average', icon: '⚠️', color: '#d69e2e', bg: 'rgba(214,158,46,0.1)' };
  return { label: 'Low Trust', icon: '❌', color: '#e53e3e', bg: 'rgba(229,62,62,0.1)' };
}

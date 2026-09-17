export const REJECTION_REASONS = [
  { key: 'donnees_errones', label: 'Données erronées' },
  { key: 'selfie_non_conforme', label: 'Selfie non conforme' },
  { key: 'document_flou', label: 'Document flou' },
]

export const REJECTION_REASON_LABELS = Object.fromEntries(
  REJECTION_REASONS.map((r) => [r.key, r.label])
)

export function formatRejectionReason(key) {
  return REJECTION_REASON_LABELS[key] ?? key
}
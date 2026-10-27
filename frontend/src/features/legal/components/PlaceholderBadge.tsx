// src/features/legal/components/PlaceholderBadge.tsx
import React from "react";
import { AlertCircle } from "lucide-react";

interface PlaceholderBadgeProps {
  label: string;
  field: string;
}

/**
 * Visual badge for identifying legal and operational details that must
 * be customized with the platform owner's actual business information prior to legal publication.
 */
export const PlaceholderBadge: React.FC<PlaceholderBadgeProps> = ({
  label,
  field,
}) => {
  return (
    <span
      title={`Pre-publication placeholder for: ${field}. Supply your official business details prior to publication.`}
      className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-amber-300 transition-colors hover:bg-amber-500/15"
    >
      <AlertCircle className="h-3 w-3 shrink-0 text-amber-400" />
      <span>{label}</span>
    </span>
  );
};

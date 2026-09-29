import type {
  QueryUnderstanding,
  QueryIntent,
  QueryMode,
} from '../../types';
import React from 'react';
import {
  Package,
  Tag,
  Building2,
  Compass,
  FlaskConical,
  MapPin,
  Binary,
  HelpCircle,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Search,
  Link2,
  AlertOctagon,
} from 'lucide-react';

export interface EntityChip {
  text: string;
  type: string;
  typeLabel: string;
  color: string;
  bg: string;
  border: string;
  confidence: number;
  IconComponent: React.FC<{ size?: number; style?: React.CSSProperties }>;
}

export const ENTITY_TYPE_STYLES: Record<
  string,
  {
    typeLabel: string;
    color: string;
    bg: string;
    border: string;
    IconComponent: React.FC<{ size?: number; style?: React.CSSProperties }>;
  }
> = {
  PRODUCT: {
    typeLabel: 'PRODUCT',
    color: 'var(--collapse-cobalt)',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    IconComponent: Package,
  },
  product_name: {
    typeLabel: 'PRODUCT',
    color: 'var(--collapse-cobalt)',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    IconComponent: Package,
  },
  GRADE_SPECIFICATION: {
    typeLabel: 'GRADE',
    color: 'var(--collapse-cobalt)',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    IconComponent: Tag,
  },
  grade_specification: {
    typeLabel: 'GRADE',
    color: 'var(--collapse-cobalt)',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    IconComponent: Tag,
  },
  APPLICATION_DOMAIN: {
    typeLabel: 'DOMAIN',
    color: 'var(--superposition-violet)',
    bg: '#FAF5FF',
    border: '#E9D5FF',
    IconComponent: Building2,
  },
  domain: {
    typeLabel: 'DOMAIN',
    color: 'var(--superposition-violet)',
    bg: '#FAF5FF',
    border: '#E9D5FF',
    IconComponent: Building2,
  },
  subdomain: {
    typeLabel: 'SUBDOMAIN',
    color: 'var(--superposition-violet)',
    bg: '#FAF5FF',
    border: '#E9D5FF',
    IconComponent: Compass,
  },
  TEST_PARAMETER: {
    typeLabel: 'TEST PARAM',
    color: 'var(--teal-guide)',
    bg: '#F0FDFA',
    border: '#99F6E4',
    IconComponent: FlaskConical,
  },
  LOCATION: {
    typeLabel: 'LOCATION',
    color: 'var(--ink-secondary)',
    bg: '#F3F4F6',
    border: '#E5E7EB',
    IconComponent: MapPin,
  },
  location_context: {
    typeLabel: 'LOCATION',
    color: 'var(--ink-secondary)',
    bg: '#F3F4F6',
    border: '#E5E7EB',
    IconComponent: MapPin,
  },
  CODE: {
    typeLabel: 'CODE',
    color: 'var(--collapse-cobalt)',
    bg: '#DBEAFE',
    border: '#93C5FD',
    IconComponent: Binary,
  },
  product_codes: {
    typeLabel: 'CODE',
    color: 'var(--collapse-cobalt)',
    bg: '#DBEAFE',
    border: '#93C5FD',
    IconComponent: Binary,
  },
  AMBIGUOUS: {
    typeLabel: 'AMBIGUOUS',
    color: '#B45309',
    bg: '#FEF3C7',
    border: '#FDE68A',
    IconComponent: HelpCircle,
  },
};

export const MODE_BADGES: Record<
  QueryMode | 'compare' | 'validate' | 'search',
  { label: string; color: string; bg: string; border: string; IconComponent: React.FC<{ size?: number; style?: React.CSSProperties }> }
> = {
  recommend: {
    label: 'RECOMMENDATION MODE',
    color: 'var(--collapse-cobalt)',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    IconComponent: Compass,
  },
  audit: {
    label: 'CVC AUDIT MODE',
    color: 'var(--superposition-violet)',
    bg: '#FAF5FF',
    border: '#E9D5FF',
    IconComponent: Scale,
  },
  dry_run: {
    label: 'DRY RUN VERIFICATION',
    color: '#B45309',
    bg: '#FFFBEB',
    border: '#FDE68A',
    IconComponent: FlaskConical,
  },
  vendor_check: {
    label: 'VENDOR CONFORMITY CHECK',
    color: 'var(--teal-guide)',
    bg: '#F0FDFA',
    border: '#99F6E4',
    IconComponent: ShieldCheck,
  },
  compare: {
    label: 'STANDARDS COMPARISON',
    color: 'var(--superposition-violet)',
    bg: '#FAF5FF',
    border: '#E9D5FF',
    IconComponent: Scale,
  },
  validate: {
    label: 'VALIDATION MODE',
    color: 'var(--emerald-pass)',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    IconComponent: CheckCircle2,
  },
  search: {
    label: 'EXPLORATORY SEARCH',
    color: 'var(--ink-secondary)',
    bg: '#F3F4F6',
    border: '#E5E7EB',
    IconComponent: Search,
  },
};

export const INTENT_LABELS: Record<QueryIntent, { label: string; IconComponent: React.FC<{ size?: number; style?: React.CSSProperties }> }> = {
  STANDARD_LOOKUP: { label: 'Primary Standard Lookup', IconComponent: Search },
  COMPLIANCE_CHECK: { label: 'Statutory Compliance Check', IconComponent: Scale },
  ALLIED_DISCOVERY: { label: 'Allied Standards Discovery', IconComponent: Link2 },
  OUTDATED_DETECTION: { label: 'Outdated Citation Detection', IconComponent: AlertOctagon },
};

/**
 * Builds normalized entity chips from either `extracted_entities` array
 * or structured field properties.
 */
export function buildEntityChips(queryUnderstanding?: QueryUnderstanding | null): EntityChip[] {
  if (!queryUnderstanding) return [];

  const chips: EntityChip[] = [];
  const seenTexts = new Set<string>();

  // 1. Process extracted_entities array (Schema 2)
  if (queryUnderstanding.extracted_entities && queryUnderstanding.extracted_entities.length > 0) {
    queryUnderstanding.extracted_entities.forEach((entity) => {
      const style = ENTITY_TYPE_STYLES[entity.type] || ENTITY_TYPE_STYLES.PRODUCT;
      chips.push({
        text: entity.entity,
        type: entity.type,
        typeLabel: style.typeLabel,
        color: style.color,
        bg: style.bg,
        border: style.border,
        confidence: entity.confidence,
        IconComponent: style.IconComponent,
      });
      seenTexts.add(entity.entity.toLowerCase());
    });
  }

  // 2. Process structured helper fields if present and not already added
  const fieldMapping: [keyof QueryUnderstanding, string][] = [
    ['product_name', 'product_name'],
    ['grade_specification', 'grade_specification'],
    ['domain', 'domain'],
    ['subdomain', 'subdomain'],
    ['location_context', 'location_context'],
  ];

  fieldMapping.forEach(([field, styleKey]) => {
    const val = queryUnderstanding[field];
    if (typeof val === 'string' && val.trim() && !seenTexts.has(val.toLowerCase())) {
      const style = ENTITY_TYPE_STYLES[styleKey] || ENTITY_TYPE_STYLES.PRODUCT;
      chips.push({
        text: val,
        type: String(field),
        typeLabel: style.typeLabel,
        color: style.color,
        bg: style.bg,
        border: style.border,
        confidence: queryUnderstanding.confidence || 0.95,
        IconComponent: style.IconComponent,
      });
      seenTexts.add(val.toLowerCase());
    }
  });

  // 3. Process product codes
  if (queryUnderstanding.product_codes && queryUnderstanding.product_codes.length > 0) {
    queryUnderstanding.product_codes.forEach((code) => {
      if (!seenTexts.has(code.toLowerCase())) {
        const style = ENTITY_TYPE_STYLES.product_codes;
        chips.push({
          text: code,
          type: 'product_codes',
          typeLabel: style.typeLabel,
          color: style.color,
          bg: style.bg,
          border: style.border,
          confidence: 1.0,
          IconComponent: style.IconComponent,
        });
        seenTexts.add(code.toLowerCase());
      }
    });
  }

  return chips;
}

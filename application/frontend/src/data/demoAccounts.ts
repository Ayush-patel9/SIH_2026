import type { UserAccount } from '../store/userStore';

export interface DemoAccount extends UserAccount {
  badge: string;
  badgeType: 'judge' | 'vendor' | 'auditor';
  personaTitle: string;
  personaSummary: string;
  highlights: string[];
  recommendedForJudge?: boolean;
  avatarInitials: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'demo_nexus_judge',
    name: 'Team Nexus · IIITB (Judge)',
    email: 'teamnexus.judge@iiitb.ac.in',
    password: 'demo123',
    role: 'OFFICER',
    organization: 'Team Nexus · IIIT Bangalore (Authority)',
    ministry: 'Ministry of Road Transport & Highways (MoRTH)',
    department: 'Central Tendering & Standards Directorate',
    designation: 'SIH Evaluation Judge & Chief Technical Officer',
    createdAt: '2026-01-01T00:00:00.000Z',
    badge: 'Recommended for SIH Judges',
    badgeType: 'judge',
    avatarInitials: 'TN',
    personaTitle: 'Tender Authority & Procurement Officer (Judge Mode)',
    personaSummary:
      'Full administrative & evaluation authority. Inspect 3-stage automated tender decomposition, mandatory QCO redlines, human-in-the-loop engineering clarifications, and CVC defense dossier exports.',
    highlights: [
      '3-Stage AI Tender Document Decomposition & Clause Extraction',
      'Mandatory QCO Redlines & Withdrawn Standards (IS 8112 → IS 269)',
      '100% Cryptographic SHA-256 CVC Defense Seal & GFR Rule 144(xi) Audit',
      'Human-in-the-Loop Clarification Engine with Dynamic Confidence Boost',
    ],
    recommendedForJudge: true,
  },
  {
    id: 'demo_nexus_vendor',
    name: 'Team Nexus · IIITB (Vendor)',
    email: 'teamnexus.vendor@iiitb.ac.in',
    password: 'demo123',
    role: 'VENDOR',
    organization: 'Team Nexus · IIIT Bangalore (Industrial Consortium)',
    gstin: '07AAACT2727Q1ZW',
    designation: 'Head of Quality Assurance & Bid Compliance',
    createdAt: '2026-01-01T00:00:00.000Z',
    badge: 'Industrial Bidder / MSME',
    badgeType: 'vendor',
    avatarInitials: 'TN',
    personaTitle: 'Industrial Vendor & EPC Bidder',
    personaSummary:
      'Experience the bidder workspace. Pre-screen tenders for compliance, verify BIS Scheme-I (ISI Mark) and Scheme-II (CRS), and check mandatory NABL lab testing protocols.',
    highlights: [
      'Pre-screen tender specifications before bidding to prevent disqualification',
      'BIS Scheme-I (ISI Mark) & Scheme-II (CRS) License Verification',
      'Mandatory NABL Laboratory Test Protocols & Concrete/Steel Sampling',
      'Bhashini Regional Voice Station for Indian Regional Languages',
    ],
    recommendedForJudge: false,
  },
];

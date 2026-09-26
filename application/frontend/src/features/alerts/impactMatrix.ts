import type { AlertPayload, CitationSeverity } from '../../types';

export interface TenderRecord {
  tender_id: string;
  title: string;
  ministry: string;
  department: string;
  value_inr_cr: number;
  officer_user_id: string;
  date_issued: string;
  bid_closing_date: string;
  cited_standards: string[];
}

export const SAVED_TENDERS: TenderRecord[] = [
  {
    tender_id: 'NIT-PWD-2026-001',
    title: 'Construction of 6-Lane Elevated Corridor & Flyover on NH-44',
    ministry: 'MoHUA',
    department: 'Delhi PWD Special Projects',
    value_inr_cr: 145.5,
    officer_user_id: 'officer_4091',
    date_issued: '2026-08-15',
    bid_closing_date: '2026-11-15',
    cited_standards: ['IS 269:2015', 'IS 8112:1989', 'IS 1786:2008', 'IS 4031 (Part 1):1996'],
  },
  {
    tender_id: 'NIT-NHAI-2026-014',
    title: 'EPC Package for Greenfield Expressway Section km 42 to 98',
    ministry: 'MoRTH',
    department: 'National Highways Authority of India',
    value_inr_cr: 480.0,
    officer_user_id: 'officer_5892',
    date_issued: '2026-07-20',
    bid_closing_date: '2026-11-30',
    cited_standards: ['IS 1786:2008', 'IS 456:2000', 'IS 8112:1989'],
  },
  {
    tender_id: 'NIT-SMART-2026-003',
    title: 'Supply and Integration of AI Integrated IP CCTV Surveillance System',
    ministry: 'MeitY',
    department: 'Smart Cities Mission Project Cell',
    value_inr_cr: 22.8,
    officer_user_id: 'officer_7712',
    date_issued: '2026-09-01',
    bid_closing_date: '2026-10-25',
    cited_standards: ['IS 13252 (Part 1):2010', 'IS 616:2017'],
  },
  {
    tender_id: 'NIT-MoHUA-2026-007',
    title: 'PMAY Urban Affordable Housing Scheme — Phase IV Cluster G',
    ministry: 'MoHUA',
    department: 'Central Housing Board',
    value_inr_cr: 68.2,
    officer_user_id: 'officer_3301',
    date_issued: '2026-09-10',
    bid_closing_date: '2026-12-10',
    cited_standards: ['IS 269:2015', 'IS 456:2000', 'IS 383:2016'],
  },
  {
    tender_id: 'NIT-RAIL-2026-088',
    title: 'Fabrication & Erection of Open Web Steel Girders for Major Railway Bridge',
    ministry: 'Indian Railways',
    department: 'Northern Railway Construction Org',
    value_inr_cr: 185.0,
    officer_user_id: 'officer_2104',
    date_issued: '2026-08-28',
    bid_closing_date: '2026-11-05',
    cited_standards: ['IS 2062:2011', 'IS 800:2007', 'IS 1786:2008'],
  },
  {
    tender_id: 'NIT-CPWD-2026-019',
    title: 'Installation of 1.2 MW Grid-Connected Rooftop Solar PV Power Plant',
    ministry: 'CPWD',
    department: 'Central Public Works Electrical Zone II',
    value_inr_cr: 14.2,
    officer_user_id: 'officer_9012',
    date_issued: '2026-09-15',
    bid_closing_date: '2026-12-20',
    cited_standards: ['IS 17800:2022', 'IS 732:2019'],
  },
];

export type MatrixCellStatus =
  | 'WITHDRAWN'
  | 'AMENDED'
  | 'UNDER_REVISION'
  | 'QCO_MANDATORY'
  | 'NEW_MANDATORY'
  | 'OK';

export interface ImpactMatrixCell {
  standard: string;
  status: MatrixCellStatus;
  severity: CitationSeverity | 'NONE';
  alertId?: string;
  event?: string;
  action?: string;
  replacement?: string | null;
  deadline?: string | null;
  citedVersion?: string;
}

export interface TenderImpactRow {
  tender: TenderRecord;
  cells: { [isNumber: string]: ImpactMatrixCell };
  highestSeverity: CitationSeverity | 'NONE';
  totalRisks: number;
}

export interface ImpactMatrixResult {
  tenders: TenderImpactRow[];
  allStandards: string[];
  summary: {
    totalTenders: number;
    criticalTenders: number;
    highTenders: number;
    mediumTenders: number;
    cleanTenders: number;
  };
}

/**
 * Builds the comprehensive active tender impact matrix by mapping all active alerts
 * onto active public procurement tenders.
 */
export function buildImpactMatrix(
  alerts: AlertPayload[],
  tenders: TenderRecord[] = SAVED_TENDERS
): ImpactMatrixResult {
  // Collect all unique cited standards across tenders
  const standardSet = new Set<string>();
  tenders.forEach((t) => {
    t.cited_standards.forEach((s) => standardSet.add(s));
  });

  // Also include standards mentioned in alerts if not already in the set
  alerts.forEach((a) => {
    if (a.affected_standard?.is_number) {
      standardSet.add(a.affected_standard.is_number);
    }
  });

  const allStandards = Array.from(standardSet).sort();

  // Create an alert index keyed by is_number (normalized)
  const alertMap = new Map<string, AlertPayload>();
  alerts.forEach((a) => {
    const isNum = a.affected_standard?.is_number;
    if (isNum) {
      // Strip amendments or match base code
      const baseCode = isNum.split(':')[0].trim();
      alertMap.set(isNum, a);
      alertMap.set(baseCode, a);
    }
  });

  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let cleanCount = 0;

  const rows: TenderImpactRow[] = tenders.map((tender) => {
    const cells: { [isNumber: string]: ImpactMatrixCell } = {};
    let rowHighestSeverity: CitationSeverity | 'NONE' = 'NONE';
    let riskCount = 0;

    for (const std of tender.cited_standards) {
      const baseCode = std.split(':')[0].trim();
      const matchedAlert = alertMap.get(std) || alertMap.get(baseCode);

      if (matchedAlert) {
        let cellStatus: MatrixCellStatus = 'AMENDED';
        if (matchedAlert.alert_type === 'STANDARD_WITHDRAWN' || matchedAlert.alert_type === 'STANDARD_SUPERSEDED') {
          cellStatus = 'WITHDRAWN';
        } else if (matchedAlert.alert_type === 'STANDARD_AMENDED') {
          cellStatus = 'AMENDED';
        } else if (matchedAlert.alert_type === 'STANDARD_UNDER_REVISION') {
          cellStatus = 'UNDER_REVISION';
        } else if (matchedAlert.alert_type === 'QCO_ENFORCEMENT_DATE') {
          cellStatus = 'QCO_MANDATORY';
        } else if (matchedAlert.alert_type === 'NEW_MANDATORY_STANDARD') {
          cellStatus = 'NEW_MANDATORY';
        }

        cells[std] = {
          standard: std,
          status: cellStatus,
          severity: matchedAlert.severity,
          alertId: matchedAlert.alert_id,
          event: matchedAlert.affected_standard?.event,
          action: matchedAlert.recommended_action,
          replacement: matchedAlert.affected_standard?.replacement || null,
          deadline: matchedAlert.deadline || null,
        };

        riskCount++;

        // Track highest severity
        if (matchedAlert.severity === 'CRITICAL') {
          rowHighestSeverity = 'CRITICAL';
        } else if (matchedAlert.severity === 'HIGH' && rowHighestSeverity !== 'CRITICAL') {
          rowHighestSeverity = 'HIGH';
        } else if (
          matchedAlert.severity === 'MEDIUM' &&
          rowHighestSeverity !== 'CRITICAL' &&
          rowHighestSeverity !== 'HIGH'
        ) {
          rowHighestSeverity = 'MEDIUM';
        }
      } else {
        cells[std] = {
          standard: std,
          status: 'OK',
          severity: 'NONE',
        };
      }
    }

    if (rowHighestSeverity === 'CRITICAL') criticalCount++;
    else if (rowHighestSeverity === 'HIGH') highCount++;
    else if (rowHighestSeverity === 'MEDIUM') mediumCount++;
    else cleanCount++;

    return {
      tender,
      cells,
      highestSeverity: rowHighestSeverity,
      totalRisks: riskCount,
    };
  });

  return {
    tenders: rows,
    allStandards,
    summary: {
      totalTenders: tenders.length,
      criticalTenders: criticalCount,
      highTenders: highCount,
      mediumTenders: mediumCount,
      cleanTenders: cleanCount,
    },
  };
}

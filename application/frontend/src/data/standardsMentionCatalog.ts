/**
 * standardsMentionCatalog.ts
 * Master catalog of Indian Standards (IS) for WhatsApp-style @ mention autocomplete and prefix search.
 */

export interface StandardMentionItem {
  is_number: string;
  code_number: string; // e.g. "73", "7098", "269", "1786"
  title: string;
  category: 'Civil' | 'Steel' | 'Electrical' | 'Water/Pipes' | 'Fire Safety' | 'Chemicals' | 'Electronics' | 'General';
  qco_mandatory: boolean;
  status: 'ACTIVE' | 'WITHDRAWN' | 'UNDER REVISION';
  description?: string;
  keywords?: string[];
}

export const MASTER_STANDARDS_CATALOG: StandardMentionItem[] = [
  // --- IS 7xxx SERIES (PREFIX MATCH PRIORITY FOR "IS 7") ---
  {
    is_number: 'IS 73:2013',
    code_number: '73',
    title: 'Paving Bitumen — Specification (Fourth Revision)',
    category: 'Civil',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Specifies requirements for VG-10, VG-20, VG-30, and VG-40 paving bitumen grades used in highway road construction.',
    keywords: ['bitumen', 'paving', 'road', 'asphalt', 'tar', 'highway', 'vg30', 'vg40'],
  },
  {
    is_number: 'IS 702:1988',
    code_number: '702',
    title: 'Industrial Bitumen — Specification',
    category: 'Chemicals',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Covers industrial grades of bitumen suitable for waterproofing, roofing, and mastic asphalt.',
    keywords: ['industrial bitumen', 'waterproofing', 'roofing'],
  },
  {
    is_number: 'IS 712:1984',
    code_number: '712',
    title: 'Building Lime — Specification',
    category: 'Civil',
    qco_mandatory: false,
    status: 'ACTIVE',
    description: 'Requirements for classes A, B, C, D, E, and F building lime for structural masonry and plastering.',
    keywords: ['lime', 'building lime', 'masonry', 'plaster'],
  },
  {
    is_number: 'IS 729:1979',
    code_number: '729',
    title: 'Drawer Locks, Cupboard Locks and Box Locks',
    category: 'General',
    qco_mandatory: false,
    status: 'ACTIVE',
    description: 'Specification for security and durability requirements of furniture and drawer locks.',
    keywords: ['lock', 'hardware', 'door', 'drawer'],
  },
  {
    is_number: 'IS 783:1985',
    code_number: '783',
    title: 'Code of Practice for Laying of Concrete Pipes',
    category: 'Water/Pipes',
    qco_mandatory: false,
    status: 'ACTIVE',
    description: 'Guidelines for excavation, trenching, bedding, and jointing of concrete sewer and water pipelines.',
    keywords: ['concrete pipes', 'drainage', 'sewer', 'laying pipes'],
  },
  {
    is_number: 'IS 779:2010',
    code_number: '779',
    title: 'Water Meters (Domestic Type) — Specification',
    category: 'Water/Pipes',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Requirements for 15mm to 50mm domestic inferential and positive displacement water meters.',
    keywords: ['water meter', 'flow meter', 'potable water', 'domestic meter'],
  },
  {
    is_number: 'IS 780:2009',
    code_number: '780',
    title: 'Sluice Valves for Water Works Purposes (50 to 300 mm Size)',
    category: 'Water/Pipes',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Specifies cast iron sluice valves with inside screw non-rising spindle for municipal water supply systems.',
    keywords: ['sluice valve', 'water valve', 'pipeline valve', 'cast iron valve'],
  },
  {
    is_number: 'IS 796:2010',
    code_number: '796',
    title: 'Aluminium Alloy Ingots and Castings for General Engineering',
    category: 'Steel',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Chemical composition and mechanical property standards for aluminium alloy castings.',
    keywords: ['aluminium', 'casting', 'alloy ingot'],
  },
  {
    is_number: 'IS 710:2010',
    code_number: '710',
    title: 'Marine Plywood — Specification',
    category: 'Civil',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Requirements for high-grade boiling waterproof (BWP) marine plywood used in marine and wet environments.',
    keywords: ['plywood', 'marine plywood', 'bwp', 'wood'],
  },
  {
    is_number: 'IS 732:2019',
    code_number: '732',
    title: 'Code of Practice for Electrical Wiring Installations',
    category: 'Electrical',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Safety guidelines for design, selection, erection, and testing of electrical wiring in buildings.',
    keywords: ['wiring', 'electrical wiring', 'building safety', 'cabling'],
  },
  {
    is_number: 'IS 7098 (Part 1):2011',
    code_number: '7098',
    title: 'Cross-linked Polyethylene (XLPE) Insulated Cables for Working Voltages up to 1.1 kV',
    category: 'Electrical',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Mandatory standard for low voltage LT XLPE insulated armored and unarmored electric power cables.',
    keywords: ['xlpe', 'cables', 'power cable', 'electric cable', 'lt cable', '1.1 kv'],
  },
  {
    is_number: 'IS 7098 (Part 2):2011',
    code_number: '7098',
    title: 'Cross-linked Polyethylene (XLPE) Insulated Cables for Working Voltages from 3.3 kV up to 33 kV',
    category: 'Electrical',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Mandatory specification for medium and high voltage HT XLPE insulated power cables.',
    keywords: ['ht cable', 'xlpe 33kv', 'high voltage cable', 'power distribution'],
  },
  {
    is_number: 'IS 7300:2017',
    code_number: '7300',
    title: 'Methods of Test for High Voltage Fuses',
    category: 'Electrical',
    qco_mandatory: false,
    status: 'ACTIVE',
    description: 'Standard test protocols for current-limiting and expulsion high voltage electrical fuses.',
    keywords: ['fuse', 'high voltage fuse', 'electrical protection'],
  },
  {
    is_number: 'IS 7307:2017',
    code_number: '7307',
    title: 'Poles for Overhead Power Lines — Concrete and Steel',
    category: 'Electrical',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Structural and strength criteria for pre-stressed concrete and tubular steel transmission poles.',
    keywords: ['pole', 'transmission pole', 'electric pole', 'overhead lines'],
  },
  {
    is_number: 'IS 774:2004',
    code_number: '774',
    title: 'Flushing Cisterns for Water Closets and Urinals',
    category: 'Water/Pipes',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Specification for manual and automatic dual-flush plastic/ceramic water cisterns.',
    keywords: ['cistern', 'toilet', 'sanitary', 'plumbing'],
  },
  {
    is_number: 'IS 775:2004',
    code_number: '775',
    title: 'Cast Iron Steps for Manholes',
    category: 'Civil',
    qco_mandatory: false,
    status: 'ACTIVE',
    description: 'Specification for ductile and cast iron manhole rungs and sewer footrests.',
    keywords: ['manhole step', 'cast iron step', 'sewerage'],
  },

  // --- POPULAR STANDARDS ACROSS ALL ENGINEERING DOMAINS ---
  {
    is_number: 'IS 269:2015',
    code_number: '269',
    title: 'Ordinary Portland Cement (33, 43 and 53 Grade) — Specification',
    category: 'Civil',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Unified Indian Standard for Ordinary Portland Cement. Supersedes and incorporates legacy IS 8112 and IS 12269.',
    keywords: ['cement', 'opc', '43 grade', '53 grade', 'concrete', 'is 8112', 'is 12269'],
  },
  {
    is_number: 'IS 1786:2008',
    code_number: '1786',
    title: 'High Strength Deformed Steel Bars and Wires for Concrete Reinforcement (TMT Rebars)',
    category: 'Steel',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Mandatory standard for Fe 415, Fe 500, Fe 500D, Fe 550, Fe 550D, and Fe 600 thermo-mechanically treated (TMT) steel bars.',
    keywords: ['steel', 'rebar', 'tmt', 'fe 500d', 'reinforcement', 'fe 550d', 'srm'],
  },
  {
    is_number: 'IS 456:2000',
    code_number: '456',
    title: 'Plain and Reinforced Concrete — Code of Practice (Fourth Revision)',
    category: 'Civil',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'The national structural design code for plain and reinforced concrete buildings, foundations, and civil works.',
    keywords: ['rcc', 'concrete code', 'structural design', 'mix design', 'm25', 'm30', 'm40'],
  },
  {
    is_number: 'IS 800:2007',
    code_number: '800',
    title: 'General Construction in Steel — Code of Practice (Third Revision)',
    category: 'Steel',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'National code of practice for design and construction of steel structures using limit state and working stress design.',
    keywords: ['steel structure', 'structural steel', 'steel building', 'truss', 'girder'],
  },
  {
    is_number: 'IS 383:2016',
    code_number: '383',
    title: 'Coarse and Fine Aggregate for Concrete — Specification (Third Revision)',
    category: 'Civil',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Requirements for natural, manufactured (M-sand), and recycled aggregates for structural concrete and road bases.',
    keywords: ['aggregate', 'sand', 'm-sand', 'gravel', 'stone', 'coarse aggregate'],
  },
  {
    is_number: 'IS 2062:2011',
    code_number: '2062',
    title: 'Hot Rolled Medium and High Tensile Structural Steel — Specification',
    category: 'Steel',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Standard for structural steel plates, beams, angles, and channels of grades E250, E300, E350, E410, and E450.',
    keywords: ['structural steel', 'e250', 'steel plates', 'ms angle', 'ms beam', 'channels'],
  },
  {
    is_number: 'IS 4984:2016',
    code_number: '4984',
    title: 'High Density Polyethylene (HDPE) Pipes for Water Supply — Specification',
    category: 'Water/Pipes',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Mandatory standard for PE-63, PE-80, and PE-100 HDPE pipes for potable drinking water supply networks.',
    keywords: ['hdpe', 'hdpe pipe', 'water supply', 'pe 100', 'pn 10', 'pn 16', 'plastic pipe'],
  },
  {
    is_number: 'IS 15683:2018',
    code_number: '15683',
    title: 'Portable Fire Extinguishers — Performance and Construction (First Revision)',
    category: 'Fire Safety',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'National benchmark for ABC dry powder, CO2, water, foam, and clean agent portable fire extinguishers.',
    keywords: ['fire extinguisher', 'fire safety', 'abc powder', 'co2 extinguisher', 'fire protection'],
  },
  {
    is_number: 'IS 15222:2002',
    code_number: '15222',
    title: 'Carbon Dioxide as Fire Extinguishing Medium for Fire Protection — Specification',
    category: 'Fire Safety',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Purity, moisture limits, and testing protocols for liquid and gaseous CO2 used in fire suppression systems.',
    keywords: ['co2 fire', 'carbon dioxide', 'fire suppression', 'flooding system'],
  },
  {
    is_number: 'IS 10500:2012',
    code_number: '10500',
    title: 'Drinking Water — Specification (Second Revision)',
    category: 'Water/Pipes',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'National drinking water quality parameters: acceptable limits for pH, TDS, heavy metals, turbidity, and coliform.',
    keywords: ['drinking water', 'potable water', 'water testing', 'tds', 'water quality'],
  },
  {
    is_number: 'IS 1239 (Part 1):2004',
    code_number: '1239',
    title: 'Steel Tubes, Tubulars and Other Wrought Steel Fittings — Part 1: Steel Tubes',
    category: 'Water/Pipes',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Specification for mild steel GI and MS pipes used for water, gas, steam, and air lines.',
    keywords: ['gi pipe', 'ms pipe', 'steel tube', 'plumbing pipe'],
  },
  {
    is_number: 'IS 16102 (Part 1):2012',
    code_number: '16102',
    title: 'Self-Ballasted LED Lamps for General Lighting Services — Safety Requirements',
    category: 'Electrical',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Safety and energy performance norms for LED bulbs and fixtures under Compulsory Registration Scheme (CRS).',
    keywords: ['led', 'led lamp', 'bulb', 'lighting', 'street light', 'crs'],
  },
  {
    is_number: 'IS 16165:2014',
    code_number: '16165',
    title: 'CCTV Surveillance Systems for Use in Security Applications',
    category: 'Electronics',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Performance and technical standards for IP dome, bullet, and PTZ video surveillance camera networks.',
    keywords: ['cctv', 'surveillance', 'camera', 'ip camera', 'security camera'],
  },
  {
    is_number: 'IS 694:2010',
    code_number: '694',
    title: 'Polyvinyl Chloride (PVC) Insulated Cables for Working Voltages up to and including 1100 V',
    category: 'Electrical',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Standard for copper and aluminium PVC building wiring, flexible cords, and industrial cables.',
    keywords: ['pvc cable', 'copper wire', 'house wiring', 'flexible cable'],
  },
  {
    is_number: 'IS 1554 (Part 1):1988',
    code_number: '1554',
    title: 'PVC Insulated (Heavy Duty) Electric Cables — For Working Voltages up to 1100 V',
    category: 'Electrical',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Heavy duty armoured and unarmoured PVC insulated electric power transmission cables.',
    keywords: ['heavy duty cable', 'armoured cable', 'pvc power cable'],
  },
  {
    is_number: 'IS 3043:2018',
    code_number: '3043',
    title: 'Code of Practice for Earthing (First Revision)',
    category: 'Electrical',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Comprehensive engineering guidelines for copper plate, pipe, chemical, and substation electrical grounding systems.',
    keywords: ['earthing', 'grounding', 'earthing pit', 'copper electrode', 'substation earthing'],
  },
  {
    is_number: 'IS 1893 (Part 1):2016',
    code_number: '1893',
    title: 'Criteria for Earthquake Resistant Design of Structures — Part 1: General Provisions and Buildings',
    category: 'Civil',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'National seismic zone code defining seismic coefficients, zone factors (II, III, IV, V), and response reduction factors.',
    keywords: ['earthquake', 'seismic', 'seismic zone', 'zone iv', 'zone v', 'structural safety'],
  },
  {
    is_number: 'IS 13920:2016',
    code_number: '13920',
    title: 'Ductile Design and Detailing of Reinforced Concrete Structures Subjected to Seismic Forces',
    category: 'Civil',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Mandatory reinforcement detailing criteria for beams, columns, and shear walls in seismic zones III, IV, and V.',
    keywords: ['ductile detailing', 'stirrups', 'seismic reinforcement', 'column detailing'],
  },
  {
    is_number: 'IS 875 (Part 3):2015',
    code_number: '875',
    title: 'Design Loads (Other than Earthquake) for Buildings and Structures — Part 3: Wind Loads',
    category: 'Civil',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Calculation of basic wind speed (Vb), terrain roughness, terrain height factors (k1, k2, k3, k4), and wind pressure.',
    keywords: ['wind load', 'structural load', 'wind pressure', 'design load'],
  },
  {
    is_number: 'IS 516:2021',
    code_number: '516',
    title: 'Hardened Concrete — Methods of Test (Compressive, Flexural and Split Tensile Strength)',
    category: 'Civil',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Standard NABL laboratory test methods for testing cube compressive strength and flexural strength of concrete.',
    keywords: ['concrete test', 'cube test', 'compressive strength', 'split tensile'],
  },
  {
    is_number: 'IS 1199:2018',
    code_number: '1199',
    title: 'Fresh Concrete — Methods of Sampling, Testing and Analysis (Slump Test & Flow Table)',
    category: 'Civil',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Standard methods for testing workability of fresh concrete using slump cone, compaction factor, and flow table.',
    keywords: ['slump test', 'workability', 'fresh concrete', 'flow table'],
  },
  {
    is_number: 'IS 2386 (Part 1-8):2002',
    code_number: '2386',
    title: 'Methods of Test for Aggregates for Concrete',
    category: 'Civil',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Testing aggregate crushing value, impact value, flakiness/elongation index, and alkali-aggregate reactivity.',
    keywords: ['aggregate testing', 'impact value', 'flakiness index', 'crushing value'],
  },
  {
    is_number: 'IS 1608:2022',
    code_number: '1608',
    title: 'Metallic Materials — Tensile Testing at Ambient Temperature',
    category: 'Steel',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Standard testing method for determining 0.2% proof stress, yield strength, tensile strength, and percentage elongation of metals.',
    keywords: ['tensile test', 'yield stress', 'elongation', 'steel test', 'proof stress'],
  },
  {
    is_number: 'IS 1599:2019',
    code_number: '1599',
    title: 'Metallic Materials — Bend Test',
    category: 'Steel',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Test procedure for ductility and crack resistance of steel bars and plates under mandatory mandrels.',
    keywords: ['bend test', 'rebend test', 'steel ductility'],
  },
  {
    is_number: 'IS 2720 (Part 1-41):2020',
    code_number: '2720',
    title: 'Methods of Test for Soils (Standard Proctor, CBR, Atterberg Limits)',
    category: 'Civil',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Geotechnical testing standards for soil classification, California Bearing Ratio (CBR), and optimum moisture content.',
    keywords: ['soil testing', 'cbr test', 'proctor test', 'atterberg limits', 'geotechnical'],
  },
  {
    is_number: 'IS 13311 (Part 1 & 2):1992',
    code_number: '13311',
    title: 'Non-Destructive Testing of Concrete (Ultrasonic Pulse Velocity and Rebound Hammer)',
    category: 'Civil',
    qco_mandatory: false,
    status: 'ACTIVE',
    description: 'Non-destructive testing (NDT) standards for assessing structural integrity of hardened concrete in situ.',
    keywords: ['ndt test', 'rebound hammer', 'ultrasonic pulse', 'upv test'],
  },
  {
    is_number: 'IS 3025:2019',
    code_number: '3025',
    title: 'Methods of Sampling and Test (Physical and Chemical) for Water and Wastewater',
    category: 'Chemicals',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Comprehensive standard test protocols for testing dissolved solids, chlorides, BOD, COD, and heavy metals in water.',
    keywords: ['water analysis', 'wastewater test', 'bod', 'cod', 'effluent testing'],
  },
  {
    is_number: 'IS 13252 (Part 1):2010',
    code_number: '13252',
    title: 'Information Technology Equipment — Safety (General Requirements)',
    category: 'Electronics',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Mandatory standard under MeitY CRO for servers, laptops, biometric scanners, and network switches.',
    keywords: ['it equipment', 'server safety', 'meity cro', 'electronics safety', 'switch'],
  },
  {
    is_number: 'IS 616:2017',
    code_number: '616',
    title: 'Audio, Video and Similar Electronic Apparatus — Safety Requirements',
    category: 'Electronics',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Safety requirements for audio-visual equipment, public address amplifiers, and displays.',
    keywords: ['audio video', 'pa system', 'electronics safety'],
  },
  {
    is_number: 'IS 1293:2019',
    code_number: '1293',
    title: 'Plugs and Socket-Outlets for Domestic and Similar Purposes of Rated Voltage up to 250 V',
    category: 'Electrical',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Mandatory BIS standard for 6A and 16A modular plugs, power sockets, and multi-plugs.',
    keywords: ['plug', 'socket', 'switchboard', 'modular switch', '6a socket', '16a socket'],
  },
  {
    is_number: 'IS 10262:2019',
    code_number: '10262',
    title: 'Concrete Mix Proportioning — Guidelines (Second Revision)',
    category: 'Civil',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Step-by-step mix design manual for standard, high-strength (M60-M100), and self-compacting concrete.',
    keywords: ['mix design', 'concrete proportioning', 'water cement ratio', 'm35', 'm40'],
  },
  {
    is_number: 'IS 3812 (Part 1):2013',
    code_number: '3812',
    title: 'Pulverized Fuel Ash (Fly Ash) for Use as Pozzolana in Cement Concrete',
    category: 'Civil',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Quality requirements for Class F and Class C fly ash pozzolana in structural concrete and PPC cement.',
    keywords: ['fly ash', 'pozzolana', 'ppc', 'green concrete'],
  },
  {
    is_number: 'IS 9103:2020',
    code_number: '9103',
    title: 'Concrete Admixtures — Specification (Superplasticizers and Retarders)',
    category: 'Chemicals',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Requirements for high-range water reducers (PCE superplasticizers), air-entraining agents, and accelerators.',
    keywords: ['admixture', 'superplasticizer', 'pce', 'retarder', 'concrete chemical'],
  },
  {
    is_number: 'IS 4985:2021',
    code_number: '4985',
    title: 'Unplasticized Polyvinyl Chloride (uPVC) Pipes for Potable Water Supplies',
    category: 'Water/Pipes',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Specification for uPVC pressure pipes for agricultural irrigation and drinking water mains.',
    keywords: ['upvc pipe', 'pvc pipe', 'potable pipe', 'irrigation pipe'],
  },
  {
    is_number: 'IS 14333:2020',
    code_number: '14333',
    title: 'High Density Polyethylene (HDPE) Pipes for Sewerage and Drainage',
    category: 'Water/Pipes',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Standard for structured-wall and solid-wall HDPE sewage and industrial effluent discharge conduits.',
    keywords: ['sewer pipe', 'hdpe sewer', 'drainage conduit', 'effluent pipe'],
  },
  {
    is_number: 'IS 8329:2000',
    code_number: '8329',
    title: 'Centrifugally Cast (Ductile) Iron Pipes for Water, Gas and Sewage',
    category: 'Water/Pipes',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Mandatory standard for Class K7, K9, and K12 Ductile Iron (DI) pressure pipes for urban water networks.',
    keywords: ['di pipe', 'ductile iron', 'k9 pipe', 'k7 pipe', 'water trunk line'],
  },
  {
    is_number: 'IS 9537 (Part 1-3):2019',
    code_number: '9537',
    title: 'Conduits for Electrical Installations (Rigid PVC and Steel Conduits)',
    category: 'Electrical',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Specifications for heavy-duty rigid PVC and GI electrical conduits for surface and concealed building wiring.',
    keywords: ['conduit', 'pvc conduit', 'electrical pipe', 'wiring conduit'],
  },
  {
    is_number: 'IS 12640 (Part 1 & 2):2016',
    code_number: '12640',
    title: 'Residual Current Operated Circuit-Breakers (RCCB / ELCB) for Household and Similar Uses',
    category: 'Electrical',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Mandatory life-safety standard for 30mA and 100mA residual current circuit breakers (RCCB) to prevent electric shock.',
    keywords: ['rccb', 'elcb', 'circuit breaker', 'earth leakage', 'electrical safety'],
  },
  {
    is_number: 'IS 13947 / IS 60947:2021',
    code_number: '60947',
    title: 'Low-Voltage Switchgear and Controlgear (MCCB, Contactors, Disconnectors)',
    category: 'Electrical',
    qco_mandatory: true,
    status: 'ACTIVE',
    description: 'Industrial standards for Molded Case Circuit Breakers (MCCB), air circuit breakers (ACB), and motor starters.',
    keywords: ['mccb', 'switchgear', 'acb', 'contactor', 'controlgear'],
  },
];

/**
 * Prefix and fuzzy matching search function for the @ mention autocomplete.
 *
 * Examples:
 *  - searchStandardsForMention("7") -> Returns IS 73, IS 702, IS 712, IS 729, IS 783, IS 7098, IS 7300, IS 7307, IS 779, etc.
 *  - searchStandardsForMention("IS 7") -> Returns IS 73, IS 702, IS 712, IS 7098, IS 7300, etc.
 *  - searchStandardsForMention("cement") -> Returns IS 269, IS 456, IS 383, etc.
 */
export function searchStandardsForMention(
  rawQuery: string,
  categoryFilter: string = 'ALL',
  maxResults = 25
): StandardMentionItem[] {
  let q = rawQuery.trim().toLowerCase();

  // Strip leading '@' or 'is' prefix
  if (q.startsWith('@')) q = q.substring(1).trim();
  if (q.startsWith('is')) {
    q = q.replace(/^is\s*/i, '').trim();
  }

  return MASTER_STANDARDS_CATALOG
    .filter((item) => {
      // Apply category filter if active
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }

      // If query is empty, return all matching the category
      if (!q) return true;

      // 1. Exact or prefix match on numeric code (e.g. "7" matches "73", "7098", "702")
      const codeMatchesPrefix = item.code_number.toLowerCase().startsWith(q);

      // 2. Substring match in full IS string (e.g. "is 7098", "is 269:2015")
      const isStringMatches = item.is_number.toLowerCase().includes(q);

      // 3. Substring match in title
      const titleMatches = item.title.toLowerCase().includes(q);

      // 4. Substring match in keywords or description
      const keywordMatches = item.keywords?.some((k) => k.toLowerCase().includes(q));
      const descMatches = item.description?.toLowerCase().includes(q);

      return codeMatchesPrefix || isStringMatches || titleMatches || keywordMatches || descMatches;
    })
    .sort((a, b) => {
      if (!q) return 0;

      // Prioritize exact code prefix matches (e.g. "7" -> "73", "702", "7098" ahead of "1786")
      const aPrefix = a.code_number.toLowerCase().startsWith(q);
      const bPrefix = b.code_number.toLowerCase().startsWith(q);
      if (aPrefix && !bPrefix) return -1;
      if (!aPrefix && bPrefix) return 1;

      // Prioritize QCO mandatory standards
      if (a.qco_mandatory && !b.qco_mandatory) return -1;
      if (!a.qco_mandatory && b.qco_mandatory) return 1;

      return 0;
    })
    .slice(0, maxResults);
}

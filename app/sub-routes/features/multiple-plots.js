const govukPrototypeKit = require('govuk-prototype-kit');

const router = govukPrototypeKit.requests.setupRouter();

const { paginateSiteAddresses } = require('../../pagination/site-addresses');
const SCENARIOS = [12, 70, 234];

const streets = ['High Street', 'Station Road', 'Church Lane', 'Park Avenue', 'Mill Road', 'Victoria Road', 'Green Lane', 'Queens Road', 'Kings Street', 'The Crescent'];
const places = [
  ['Manchester', 'Greater Manchester', 'M'], ['Bristol', '', 'BS'], ['Leeds', 'West Yorkshire', 'LS'],
  ['Birmingham', 'West Midlands', 'B'], ['Newcastle upon Tyne', 'Tyne and Wear', 'NE'], ['Norwich', 'Norfolk', 'NR'],
  ['Exeter', 'Devon', 'EX'], ['Sheffield', 'South Yorkshire', 'S'], ['Cardiff', '', 'CF'], ['Nottingham', 'Nottinghamshire', 'NG']
];

function buildPlots(count) {
  const plots = [];
  for (let i = 1; i <= count; i++) {
    const [town, county, area] = places[(i - 1) % places.length];
    const lines = [
      `${((i * 7) % 98) + 1} ${streets[(i - 1) % streets.length]}`,
      town
    ];
    if (county) lines.push(county);
    lines.push(`${area}${(i % 20) + 1} ${(i % 9) + 1}${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i * 3) % 26))}`);
    plots.push({ number: i, lines });
  }
  return plots;
}

router.get('/features-and-components/added/multiple-plots/v1/plots', function (req, res) {
  let total = parseInt(req.query.plots, 10);
  if (!SCENARIOS.includes(total)) total = 12;

  const plots = buildPlots(total);
  const result = paginateSiteAddresses(plots, req.query.page, req.query.perPage,
    `/features-and-components/added/multiple-plots/v1/plots?plots=${total}`);

  res.render('features-and-components/added/multiple-plots/v1/plots', {
    scenarios: SCENARIOS,
    ...result,
    plots: result.addresses
  });
});

const dummyCase = {
  reference: 'PINS-2026-0042',
  caseName: 'Land at Example Road compulsory purchase order',
  type: 'Housing and Planning CPOs',
  subtype: 'NONE',
  act: 'Acquisition of Land Act 1981',
  priority: 'Standard',
  'inspector-band': 'Band 2',
  caseStatus: 'Open',
  siteLocation: 'North of Example Road',
  authorityName: 'Example Borough Council',
  applicants: [{
    firstName: 'Alex',
    lastName: 'Example',
    companyName: 'Example Developments Ltd',
    address: { line1: '1 Sample Street', town: 'Leeds', postcode: 'LS1 1AA' },
    email: 'alex.example@example.com'
  }],
  overviewProcedures: [{ type: 'Written representations', status: 'In progress' }],
  caseNotes: [{ text: 'Dummy case note for the prototype.', meta: '10:30am on Monday 26 October 2026 by Case Officer' }]
};

router.get('/features-and-components/added/multiple-plots/v1/case-details', function (req, res) {
  let total = parseInt(req.query.plots, 10);
  if (!SCENARIOS.includes(total)) total = 12;

  const siteAddresses = buildPlots(Math.min(3, total)).map(plot => {
    const [addressLine1, addressTown, ...rest] = plot.lines;
    const addressPostcode = rest.pop();
    return { addressLine1, addressTown, addressCounty: rest[0] || '', addressPostcode };
  });

  res.render('features-and-components/added/multiple-plots/v1/case-details', {
    scenarios: SCENARIOS,
    total,
    currentCase: Object.assign({}, dummyCase, { siteAddresses })
  });
});

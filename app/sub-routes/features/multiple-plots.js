const govukPrototypeKit = require('govuk-prototype-kit');

const router = govukPrototypeKit.requests.setupRouter();

const PAGE_SIZES = [25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;
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

router.get('/features-and-components/multiple-plots/v1/plots', function (req, res) {
  let total = parseInt(req.query.plots, 10);
  if (!SCENARIOS.includes(total)) total = 12;

  let pageSize = parseInt(req.query.perPage, 10);
  if (!PAGE_SIZES.includes(pageSize)) pageSize = DEFAULT_PAGE_SIZE;

  const plots = buildPlots(total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  let page = parseInt(req.query.page, 10);
  if (!(page >= 1)) page = 1;
  if (page > totalPages) page = totalPages;

  const start = (page - 1) * pageSize;
  const pagePlots = plots.slice(start, start + pageSize);
  const base = `/features-and-components/multiple-plots/v1/plots?plots=${total}&perPage=${pageSize}`;
  const href = p => `${base}&page=${p}`;

  let pagination = null;
  if (totalPages > 1) {
    // GOV.UK pagination: first, last, current and neighbours, with ellipses
    const items = [];
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
        items.push({ number: p, href: href(p), current: p === page });
      } else if (items.length && !items[items.length - 1].ellipsis) {
        items.push({ ellipsis: true });
      }
    }
    pagination = { items };
    if (page > 1) pagination.previous = { href: href(page - 1) };
    if (page < totalPages) pagination.next = { href: href(page + 1) };
  }

  res.render('features-and-components/multiple-plots/v1/plots', {
    scenarios: SCENARIOS,
    total,
    page,
    plots: pagePlots,
    from: start + 1,
    to: start + pagePlots.length,
    pagination,
    pageSize,
    pageSizes: PAGE_SIZES
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

router.get('/features-and-components/multiple-plots/v1/case-details', function (req, res) {
  let total = parseInt(req.query.plots, 10);
  if (!SCENARIOS.includes(total)) total = 12;

  const siteAddresses = buildPlots(Math.min(3, total)).map(plot => {
    const [addressLine1, addressTown, ...rest] = plot.lines;
    const addressPostcode = rest.pop();
    return { addressLine1, addressTown, addressCounty: rest[0] || '', addressPostcode };
  });

  res.render('features-and-components/multiple-plots/v1/case-details', {
    scenarios: SCENARIOS,
    total,
    currentCase: Object.assign({}, dummyCase, { siteAddresses })
  });
});

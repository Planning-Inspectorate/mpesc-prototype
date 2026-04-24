const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// Import the shared helpers (using ../ to look in the main app folder)
const { 
  getCase, 
  addAuditLog, 
  validateAndSaveAddress, 
  validateAndSaveDate, 
  validateAndSaveDateTime, 
  validateAndSaveNumber 
} = require('../helpers');

// ==============================================================================
// CASE DETAILS: EDIT LOGIC
// ==============================================================================

// ------------------------------------------------------------------------------
// 1. OVERVIEW CARD FIELDS (Simple Inputs / Radios)
// ------------------------------------------------------------------------------

// --- ACT / LEGISLATION ---
router.get('/cases/edit/act', function(req, res) {
  var c = getCase(req);
  res.render('cases/edit/act', { ref: c.reference, value: c.act || "" });
});

router.post('/cases/edit/act', function(req, res) {
  var ref = req.query.ref;
  var val = req.body.act;
  var c = getCase(req);

  const legislationList = [
    "Acquisition of Land Act 1981, 32", "Acquisition of Land Act 1981, 19 and Schedule 3, para 6",
    "Town and Country Planning Act 1990, 137", "Commons Act 2006, 16", "Commons Act 2006, 38",
    "Commons Act 2006, Part 1 Schedule 6", "Greater London Parks & Open Spaces Order 1967, Article 12",
    "Greater London Parks & Open Spaces Order 1967, Article 17", "Highways Act 1980, 26",
    "Highways Act 1980, 118", "Highways Act 1980, 119", "Highways Act 1980, 118A",
    "Highways Act 1980, 118B", "Highways Act 1980, 119A", "Highways Act 1980, 119B",
    "Highways Act 1980, 119D", "Inclosure Act 1845, 149", "Law of Property Act 1925, 193",
    "National Trust Act 1971, 23", "Town and Country Planning Act 1990, 78",
    "Town and Country Planning Act 1990, 247", "Town and Country Planning Act 1990, 251",
    "Town and Country Planning Act 1990, 257", "Town and Country Planning Act 1990, 61",
    "Wildlife and Countryside Act 1981, 53", "Wildlife and Countryside Act 1981, 54",
    "Wildlife and Countryside Act 1981, Schedule 14 A", "Wildlife and Countryside Act 1981, Schedule 14 D"
  ];

  if (!val || val.trim() === "") {
    return res.render('cases/edit/act', { ref: ref, error: true, errorMessage: { text: "Enter the relevant legislation or act" } });
  }

  if (!legislationList.includes(val)) {
    return res.render('cases/edit/act', { ref: ref, value: val, error: true, errorMessage: { text: "Select an act from the list" } });   
  }

  c.act = val;
  req.session.flashSection = "overview"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Act updated to '" + val + "'");
  res.redirect('/cases/case-details?ref=' + ref + '&updated=legislation');
});

// --- CONSENT SOUGHT ---
router.get('/cases/edit/consent-sought', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  res.render('cases/edit/consent-sought', { ref: ref, currentValue: c['consent-sought'] });
});

router.post('/cases/edit/consent-sought', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  var val = req.body['consent-sought'];

  c['consent-sought'] = val;
  req.session.flashSection = "overview"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Consent sought updated to '" + val + "'");
  res.redirect('/cases/case-details?ref=' + ref);
});

// --- PRIORITY ---
router.get('/cases/edit/priority', function(req, res) {
  var c = getCase(req);
  res.render('cases/edit/priority', { ref: c.reference, value: c.priority || c['priority'] });
});

router.post('/cases/edit/priority', function(req, res) {
  var ref = req.query.ref;
  var action = req.body.action;
  var val = req.body.priority;
  var c = getCase(req);

  if (action === 'remove') {
    delete c.priority;
    delete c['priority'];
    req.session.flashSection = "overview"; 
    if (typeof addAuditLog === "function") addAuditLog(req, ref, "Priority removed");
    return res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
  }

  if (!val) {
    return res.render('cases/edit/priority', { ref: ref, error: true, errorMessage: { text: "Select a priority" } });
  }

  c.priority = val;
  req.session.flashSection = "overview"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Priority updated to '" + val + "'");
  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});

// --- INSPECTOR BAND ---
router.get('/cases/edit/inspector-band', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases');
  res.render('cases/edit/inspector-band', { ref: ref, currentValue: c['inspector-band'] });
});

router.post('/cases/edit/inspector-band', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  if (req.body.action === "remove") {
    c['inspector-band'] = ""; 
    req.session.flashSection = "overview"; 
    if (typeof addAuditLog === "function") addAuditLog(req, ref, "Inspector band removed");
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  var val = req.body['inspector-band'];
  c['inspector-band'] = val;
  req.session.flashSection = "overview"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Inspector band updated to '" + val + "'");
  res.redirect('/cases/case-details?ref=' + ref);
});


// ------------------------------------------------------------------------------
// 2. CASE DETAILS CARD FIELDS (Simple Inputs / Radios / Double Dates)
// ------------------------------------------------------------------------------

// --- EXTERNAL REFERENCE ---
router.get('/cases/edit/external-reference', function(req, res) {
  var c = getCase(req);
  res.render('cases/edit/external-reference', { ref: c.reference, value: c.externalReference || c['external-reference'] });
});

router.post('/cases/edit/external-reference', function(req, res) {
  var ref = req.query.ref;
  var val = req.body.externalReference;
  var c = getCase(req);
  
  c.externalReference = val;
  req.session.flashSection = "case-details"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "External reference updated to '" + val + "'");
  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});


// --- CASE NAME ---
router.get('/cases/edit/case-name', function(req, res) {
  var c = getCase(req);
  res.render('cases/edit/case-name', { ref: c.reference, value: c.caseName || c['case-name'] });
});

router.post('/cases/edit/case-name', function(req, res) {
  var ref = req.query.ref;
  var val = req.body.caseName; 
  
  if (!val || val.trim() === "") {
    return res.render('cases/edit/case-name', { ref: ref, value: val, error: true, errorMessage: { text: "Enter the case name" } });
  }

  var c = getCase(req);
  c.caseName = val;
  req.session.flashSection = "case-details"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Case name updated to '" + val + "'");
  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});

// --- CASE STATUS ---
router.post('/cases/edit/case-status', function(req, res) {
  var ref = req.query.ref;
  var action = req.body.action; 
  var val = req.body.caseStatus;
  var c = getCase(req);

  if (action === 'remove') {
    delete c.caseStatus;
    delete c['case-status'];
    delete c.caseClosedDate; 
    req.session.flashSection = "case-details"; 
    if (typeof addAuditLog === "function") addAuditLog(req, ref, "Case status removed");
    return res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
  }

  if (!val) {
    return res.render('cases/edit/case-status', { ref: ref, error: true, errorMessage: { text: "Select a case status" } });
  }

  c.caseStatus = val;
  delete c['case-status'];

  if (val === 'Closed' || val === 'Closed - opened in error') {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
    c.caseClosedDate = `${dateStr} at ${timeStr}`;
  } else {
    delete c.caseClosedDate;
  }

  req.session.flashSection = "case-details"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Case status updated to '" + val + "'");
  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});


// --- ABEYANCE PERIOD ---
router.get('/cases/edit/abeyance-period', (req, res) => {
  var c = getCase(req); 
  var abeyance = c.abeyancePeriod || {};
  var start = abeyance.startDate || {};
  var end = abeyance.endDate || {};

  res.render('cases/edit/abeyance-period', { 
    ref: c.reference,
    startDay: start.day, startMonth: start.month, startYear: start.year,
    endDay: end.day, endMonth: end.month, endYear: end.year
  });
});

router.post('/cases/edit/abeyance-period', (req, res) => {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/');
  
  if (!c.abeyancePeriod) c.abeyancePeriod = {};

  let sD = req.body['start-day'], sM = req.body['start-month'], sY = req.body['start-year'];
  let eD = req.body['end-day'], eM = req.body['end-month'], eY = req.body['end-year'];

  // 1. Check if they cleared everything to remove the abeyance period
  if (!sD && !sM && !sY && !eD && !eM && !eY) {
    c.abeyancePeriod = null;
    req.session.flashSection = "case-details";
    if (typeof addAuditLog === "function") addAuditLog(req, ref, "Abeyance period was removed");
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  let allErrors = [];
  let startErrorFields = [];
  let endErrorFields = [];

  // 2. Validate Start Date
  let startResult = validateAndSaveDate(req, res, 'start', 'Abeyance start date', c.abeyancePeriod, 'startDate');
  if (startResult.status === "ERROR") {
    allErrors = allErrors.concat(startResult.errorList);
    startErrorFields = startResult.errorFields;
  }

  // 3. Validate End Date (Optional)
  if (!eD && !eM && !eY) {
    c.abeyancePeriod.endDate = null;
  } else {
    let endResult = validateAndSaveDate(req, res, 'end', 'Abeyance end date', c.abeyancePeriod, 'endDate');
    if (endResult.status === "ERROR") {
      allErrors = allErrors.concat(endResult.errorList);
      endErrorFields = endResult.errorFields;
    }
  }

  // 4. Custom Check: Start date must be before end date
  if (allErrors.length === 0 && c.abeyancePeriod.startDate && c.abeyancePeriod.endDate) {
    let startDateObj = new Date(c.abeyancePeriod.startDate.year, c.abeyancePeriod.startDate.month - 1, c.abeyancePeriod.startDate.day);
    let endDateObj = new Date(c.abeyancePeriod.endDate.year, c.abeyancePeriod.endDate.month - 1, c.abeyancePeriod.endDate.day);
    
    if (startDateObj >= endDateObj) {
      allErrors.push({ 
        text: "Abeyance start date must be before the abeyance end date", 
        href: "#start-day" 
      });
      startErrorFields = ['day', 'month', 'year'];
      endErrorFields = ['day', 'month', 'year'];
    }
  }

  // 5. If there are any errors, re-render the page
  if (allErrors.length > 0) {
    return res.render('cases/edit/abeyance-period', { 
      ref: ref,
      startDay: sD, startMonth: sM, startYear: sY,
      endDay: eD, endMonth: eM, endYear: eY,
      errorList: allErrors,
      startErrorFields: startErrorFields,
      endErrorFields: endErrorFields
    });
  }

  // Success!
  req.session.flashSection = "case-details"; 
  let auditText = `Abeyance period updated: ${c.abeyancePeriod.startDate ? `${c.abeyancePeriod.startDate.day}/${c.abeyancePeriod.startDate.month}/${c.abeyancePeriod.startDate.year}` : 'N/A'} to ${c.abeyancePeriod.endDate ? `${c.abeyancePeriod.endDate.day}/${c.abeyancePeriod.endDate.month}/${c.abeyancePeriod.endDate.year}` : 'N/A'}`;
  if (typeof addAuditLog === "function") addAuditLog(req, ref, auditText);

  res.redirect('/cases/case-details?ref=' + ref);
});


// --- MODIFICATION STATUS ---
router.get('/cases/edit/modification-status', function(req, res) {
  var c = getCase(req);
  res.render('cases/edit/modification-status', { ref: c.reference, value: c.modificationStatus || c['modification-status'] });
});

router.post('/cases/edit/modification-status', function(req, res) {
  var ref = req.query.ref;
  var action = req.body.action;
  var val = req.body.modificationStatus;
  var c = getCase(req);

  if (action === 'remove') {
    delete c.modificationStatus;
    delete c['modification-status'];
    req.session.flashSection = "case-details"; 
    if (typeof addAuditLog === "function") addAuditLog(req, ref, "Modification status removed");
    return res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
  }

  if (!val) {
    return res.render('cases/edit/modification-status', { ref: ref, error: true, errorMessage: { text: "Select a modification status" } });
  }

  c.modificationStatus = val;
  delete c['modification-status'];
  req.session.flashSection = "case-details"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Modification status updated to '" + val + "'");
  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});

// --- SITE LOCATION ---
router.get('/cases/edit/site-location', function(req, res) {
  var c = getCase(req);
  res.render('cases/edit/site-location', { ref: c.reference, value: c.siteLocation || c['site-location'] });
});

router.post('/cases/edit/site-location', function(req, res) {
  var ref = req.query.ref;
  var val = req.body.siteLocation;
  var c = getCase(req);
  
  c.siteLocation = val;
  delete c['site-location'];
  req.session.flashSection = "case-details"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Site location updated to '" + val + "'");
  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});


// --- AUTHORITY ---
router.get('/cases/edit/authority', function(req, res) {
  var c = getCase(req);
  res.render('cases/edit/authority', { ref: c.reference, value: c.authorityName || c['authority'] });
});

router.post('/cases/edit/authority', function(req, res) {
  var ref = req.query.ref;
  var val = req.body.authorityName;
  var c = getCase(req);
  
  if (val && val.trim() !== "" && typeof validAuthorities !== "undefined" && !validAuthorities.includes(val)) {
    return res.render('cases/edit/authority', { ref: ref, value: val, errorAuthority: "Select an authority from the list" });
  }

  c.authorityName = val;
  delete c['authority'];
  req.session.flashSection = "case-details"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Authority updated to '" + (val || 'None') + "'");
  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});


// ------------------------------------------------------------------------------
// 3. TEAM & CASE OFFICER
// ------------------------------------------------------------------------------

// --- CASE OFFICER ---
router.get('/cases/edit/case-officer', function(req, res) {
  var c = getCase(req);
  res.render('cases/edit/case-officer', { ref: c.reference, value: c.caseOfficer || c['case-officer'] });
});

router.post('/cases/edit/case-officer', function(req, res) {
  var ref = req.query.ref;
  var val = req.body.caseOfficer;
  var action = req.body.action;
  var c = getCase(req);

  if (action === 'remove') {
    delete c.caseOfficer;
    req.session.flashSection = "team"; 
    if (typeof addAuditLog === "function") addAuditLog(req, ref, "Case officer removed");
    return res.redirect('/cases/case-details?ref=' + ref + '&updated=team');
  }

  if (!val || val.trim() === "") {
    return res.render('cases/edit/case-officer', { ref: ref, error: true, errorMessage: { text: "Select a case officer" } });
  }

  var officers = [
    "Charlotte Morphet", "Kieran De La Cruz", "Edward Mitchell", "Sarah Tudor", "Steve Waterfield",
    "Alex Hudd", "Harry Wood", "Rob Davis", "Deborah Board", "(Service Account) Automated Tester", "Owen Woodwards", 
    "Tony Stark", "Steve Rogers", "Natasha Romanoff", "Bruce Banner", "Thor Odinson", "Wanda Maximoff", 
    "Peter Parker", "Carol Danvers", "Stephen Strange", "T'Challa", "Clint Barton", "Sam Wilson", "Bucky Barnes", "Scott Lang", "Hope van Dyne"
  ];
  
  if (!officers.includes(val)) {
     return res.render('cases/edit/case-officer', { ref: ref, value: val, error: true, errorMessage: { text: "Select a case officer" } });   
  }

  c.caseOfficer = val;
  delete c['case-officer']; 
  req.session.flashSection = "team"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Case officer updated to '" + val + "'");
  res.redirect('/cases/case-details?ref=' + ref + '&updated=team');
});

// ------------------------------------------------------------------------------
// 4. TIMETABLE CARD FIELDS (Date Inputs)
// ------------------------------------------------------------------------------

// --- 6.1 EXPECTED SUBMISSION DATE ---
router.get('/cases/edit/expected-submission-date', function(req, res) {
  var c = getCase(req);
  var val = c.expectedSubmissionDate || {};
  res.render('cases/edit/expected-submission-date', { ref: c.reference, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/edit/expected-submission-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  var day = req.body['date-day']; var month = req.body['date-month']; var year = req.body['date-year'];
  var action = req.body.action;

  if (action === 'remove') {
    delete c.expectedSubmissionDate;
    req.session.flashSection = "timetable"; 
    if (typeof addAuditLog === "function") addAuditLog(req, ref, "Expected submission date removed");
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  var errorList = []; var errorFields = [];
  if (!day && !month && !year) { errorList.push({ text: "Enter the expected submission date", href: "#date-day" }); errorFields = ['day', 'month', 'year']; } 
  else {
    var missing = [];
    if (!day) missing.push('day'); if (!month) missing.push('month'); if (!year) missing.push('year');
    if (missing.length > 0) {
      var missingText = missing.length === 2 ? "Expected submission date must include a " + missing[0] + " and " + missing[1] : "Expected submission date must include a " + missing[0];
      errorList.push({ text: missingText, href: "#date-" + missing[0] }); errorFields = errorFields.concat(missing);
    }
  }

  if (day && (Number(day) < 1 || Number(day) > 31 || isNaN(Number(day)))) { errorList.push({ text: "Expected submission date day must be a real day", href: "#date-day" }); if (!errorFields.includes('day')) errorFields.push('day'); }
  if (month && (Number(month) < 1 || Number(month) > 12 || isNaN(Number(month)))) { errorList.push({ text: "Expected submission date month must be a real month", href: "#date-month" }); if (!errorFields.includes('month')) errorFields.push('month'); }
  if (year && (year.length != 4 || isNaN(Number(year)))) { errorList.push({ text: "Expected submission date year must include four numbers", href: "#date-year" }); if (!errorFields.includes('year')) errorFields.push('year'); }

  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) { errorList.push({ text: "Enter a real date", href: "#date-day" }); errorFields = ['day', 'month', 'year']; }
  }

  if (errorList.length > 0) return res.render('cases/edit/expected-submission-date', { ref: ref, errorList: errorList, errorFields: errorFields, day: day, month: month, year: year });

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var formatted = day + " " + (month ? months[month - 1] : "") + " " + year;

  c.expectedSubmissionDate = { day: day, month: month, year: year, formatted: formatted };
  req.session.flashSection = "timetable"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Expected submission date updated to '" + formatted + "'");
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- 6.2 CASE RECEIVED / SUBMITTED DATE ---
router.get('/cases/edit/case-received-date', function(req, res) {
  var c = getCase(req);
  var day = (c.caseReceivedDate && c.caseReceivedDate.day) || c.receivedDay || c['case-received-date-day'];
  var month = (c.caseReceivedDate && c.caseReceivedDate.month) || c.receivedMonth || c['case-received-date-month'];
  var year = (c.caseReceivedDate && c.caseReceivedDate.year) || c.receivedYear || c['case-received-date-year'];

  res.render('cases/edit/case-received-date', { ref: c.reference, day: day, month: month, year: year });
});

router.post('/cases/edit/case-received-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  var day = req.body['date-day']; var month = req.body['date-month']; var year = req.body['date-year'];
  var action = req.body.action;

  if (action === 'remove') {
    delete c.caseReceivedDate; delete c.receivedDay; delete c.receivedMonth; delete c.receivedYear;
    delete c['case-received-date-day']; delete c['case-received-date-month']; delete c['case-received-date-year'];
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  var errorList = []; var errorFields = [];
  if (!day && !month && !year) { errorList.push({ text: "Enter Case received / submitted date", href: "#date-day" }); errorFields = ['day', 'month', 'year']; } 
  else {
    var missing = [];
    if (!day) missing.push('day'); if (!month) missing.push('month'); if (!year) missing.push('year');
    if (missing.length > 0) {
      var missingText = missing.length === 2 ? "Case received / submitted date must include a " + missing[0] + " and " + missing[1] : "Case received / submitted date must include a " + missing[0];
      errorList.push({ text: missingText, href: "#date-" + missing[0] }); errorFields = errorFields.concat(missing);
    }
  }

  if (day && (Number(day) < 1 || Number(day) > 31 || isNaN(Number(day)))) { errorList.push({ text: "Case received / submitted must include a day", href: "#date-day" }); if (!errorFields.includes('day')) errorFields.push('day'); }
  if (month && (Number(month) < 1 || Number(month) > 12 || isNaN(Number(month)))) { errorList.push({ text: "Case received / submitted month must be between 1 and 12", href: "#date-month" }); if (!errorFields.includes('month')) errorFields.push('month'); }
  if (year && (year.length != 4 || isNaN(Number(year)))) { errorList.push({ text: "Case received / submitted year must include 4 numbers", href: "#date-year" }); if (!errorFields.includes('year')) errorFields.push('year'); }

  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) { errorList.push({ text: "Enter a real date", href: "#date-day" }); errorFields = ['day', 'month', 'year']; }
  }

  if (errorList.length > 0) return res.render('cases/edit/case-received-date', { ref: ref, errorList: errorList, errorFields: errorFields, day: day, month: month, year: year });

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var formatted = day + " " + (month ? months[month - 1] : "") + " " + year;

  c.caseReceivedDate = { day: day, month: month, year: year, formatted: formatted };
  c.receivedDay = day; c.receivedMonth = month; c.receivedYear = year;

  req.session.flashSection = "timetable"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Case received / submitted date updated to '" + formatted + "'"); 
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- 6.3 TARGET DECISION DATE ---
router.get('/cases/edit/target-decision-date', function(req, res) {
  var c = getCase(req);
  var val = c.targetDecisionDate || {};
  res.render('cases/edit/target-decision-date', { ref: c.reference, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/edit/target-decision-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  var day = req.body['date-day']; var month = req.body['date-month']; var year = req.body['date-year'];
  var action = req.body.action;

  if (action === 'remove') {
    delete c.targetDecisionDate;
    req.session.flashSection = "timetable"; 
    if (typeof addAuditLog === "function") addAuditLog(req, ref, "Target decision date removed");
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  var errorList = []; var errorFields = [];
  if (!day && !month && !year) { errorList.push({ text: "Enter the target decision date", href: "#date-day" }); errorFields = ['day', 'month', 'year']; } 
  else {
    var missing = [];
    if (!day) missing.push('day'); if (!month) missing.push('month'); if (!year) missing.push('year');
    if (missing.length > 0) {
      var missingText = missing.length === 2 ? "Target decision date must include a " + missing[0] + " and " + missing[1] : "Target decision date must include a " + missing[0];
      errorList.push({ text: missingText, href: "#date-" + missing[0] }); errorFields = errorFields.concat(missing);
    }
  }

  if (day && (Number(day) < 1 || Number(day) > 31 || isNaN(Number(day)))) { errorList.push({ text: "Target decision date day must be a real day", href: "#date-day" }); if (!errorFields.includes('day')) errorFields.push('day'); }
  if (month && (Number(month) < 1 || Number(month) > 12 || isNaN(Number(month)))) { errorList.push({ text: "Target decision date month must be a real month", href: "#date-month" }); if (!errorFields.includes('month')) errorFields.push('month'); }
  if (year && (year.length != 4 || isNaN(Number(year)))) { errorList.push({ text: "Target decision date year must include four numbers", href: "#date-year" }); if (!errorFields.includes('year')) errorFields.push('year'); }

  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) { errorList.push({ text: "Enter a real date", href: "#date-day" }); errorFields = ['day', 'month', 'year']; }
  }

  if (errorList.length > 0) return res.render('cases/edit/target-decision-date', { ref: ref, errorList: errorList, errorFields: errorFields, day: day, month: month, year: year });

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var formatted = day + " " + (month ? months[month - 1] : "") + " " + year;

  c.targetDecisionDate = { day: day, month: month, year: year, formatted: formatted };
  req.session.flashSection = "timetable"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Target decision date updated to '" + formatted + "'");
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- 6.4 START DATE ---
router.get('/cases/edit/start-date', function(req, res) {
  var c = getCase(req);
  var val = c.startDate || {};
  res.render('cases/edit/start-date', { ref: c.reference, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/edit/start-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  var day = req.body['date-day']; var month = req.body['date-month']; var year = req.body['date-year'];
  var action = req.body.action;

  if (action === 'remove') {
    delete c.startDate;
    req.session.flashSection = "timetable"; 
    if (typeof addAuditLog === "function") addAuditLog(req, ref, "Start date removed");
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  var errorList = []; var errorFields = [];
  if (!day && !month && !year) { errorList.push({ text: "Enter the start date", href: "#date-day" }); errorFields = ['day', 'month', 'year']; } 
  else {
    var missing = [];
    if (!day) missing.push('day'); if (!month) missing.push('month'); if (!year) missing.push('year');
    if (missing.length > 0) {
      var missingText = missing.length === 2 ? "Start date must include a " + missing[0] + " and " + missing[1] : "Start date must include a " + missing[0];
      errorList.push({ text: missingText, href: "#date-" + missing[0] }); errorFields = errorFields.concat(missing);
    }
  }

  if (day && (Number(day) < 1 || Number(day) > 31 || isNaN(Number(day)))) { errorList.push({ text: "Start date day must be a real day", href: "#date-day" }); if (!errorFields.includes('day')) errorFields.push('day'); }
  if (month && (Number(month) < 1 || Number(month) > 12 || isNaN(Number(month)))) { errorList.push({ text: "Start date month must be a real month", href: "#date-month" }); if (!errorFields.includes('month')) errorFields.push('month'); }
  if (year && (year.length != 4 || isNaN(Number(year)))) { errorList.push({ text: "Start date year must include four numbers", href: "#date-year" }); if (!errorFields.includes('year')) errorFields.push('year'); }

  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) { errorList.push({ text: "Enter a real date", href: "#date-day" }); errorFields = ['day', 'month', 'year']; }
  }

  if (errorList.length > 0) return res.render('cases/edit/start-date', { ref: ref, errorList: errorList, errorFields: errorFields, day: day, month: month, year: year });

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var formatted = day + " " + (month ? months[month - 1] : "") + " " + year;

  c.startDate = { day: day, month: month, year: year, formatted: formatted };
  req.session.flashSection = "timetable"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Start date updated to '" + formatted + "'");
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- 6.5 DATE PROPOSED MODIFICATIONS ADVERTISED ---
router.get('/cases/edit/modifications-advertised-date', function(req, res) {
  var c = getCase(req);
  var val = c.modificationsAdvertisedDate || {};
  res.render('cases/edit/modifications-advertised-date', { ref: c.reference, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/edit/modifications-advertised-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  var day = req.body['date-day']; var month = req.body['date-month']; var year = req.body['date-year'];
  var action = req.body.action;

  if (action === 'remove') {
    delete c.modificationsAdvertisedDate;
    req.session.flashSection = "timetable"; 
    if (typeof addAuditLog === "function") addAuditLog(req, ref, "Date proposed modifications advertised removed");
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  var errorList = []; var errorFields = [];
  if (!day && !month && !year) { errorList.push({ text: "Enter the date proposed modifications advertised", href: "#date-day" }); errorFields = ['day', 'month', 'year']; } 
  else {
    var missing = [];
    if (!day) missing.push('day'); if (!month) missing.push('month'); if (!year) missing.push('year');
    if (missing.length > 0) {
      var missingText = missing.length === 2 ? "Date proposed modifications advertised must include a " + missing[0] + " and " + missing[1] : "Date proposed modifications advertised must include a " + missing[0];
      errorList.push({ text: missingText, href: "#date-" + missing[0] }); errorFields = errorFields.concat(missing);
    }
  }

  if (day && (Number(day) < 1 || Number(day) > 31 || isNaN(Number(day)))) { errorList.push({ text: "Date proposed modifications advertised day must be a real day", href: "#date-day" }); if (!errorFields.includes('day')) errorFields.push('day'); }
  if (month && (Number(month) < 1 || Number(month) > 12 || isNaN(Number(month)))) { errorList.push({ text: "Date proposed modifications advertised month must be a real month", href: "#date-month" }); if (!errorFields.includes('month')) errorFields.push('month'); }
  if (year && (year.length != 4 || isNaN(Number(year)))) { errorList.push({ text: "Date proposed modifications advertised year must include four numbers", href: "#date-year" }); if (!errorFields.includes('year')) errorFields.push('year'); }

  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) { errorList.push({ text: "Enter a real date", href: "#date-day" }); errorFields = ['day', 'month', 'year']; }
  }

  if (errorList.length > 0) return res.render('cases/edit/modifications-advertised-date', { ref: ref, errorList: errorList, errorFields: errorFields, day: day, month: month, year: year });

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var formatted = day + " " + (month ? months[month - 1] : "") + " " + year;

  c.modificationsAdvertisedDate = { day: day, month: month, year: year, formatted: formatted };
  req.session.flashSection = "timetable"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Date proposed modifications advertised updated to '" + formatted + "'");
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- 6.6 OBJECTION PERIOD END DATE ---
router.get('/cases/edit/objection-period-end-date', function(req, res) {
  var c = getCase(req);
  var val = c.objectionPeriodEndDate || {};
  res.render('cases/edit/objection-period-end-date', { ref: c.reference, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/edit/objection-period-end-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  var day = req.body['date-day']; var month = req.body['date-month']; var year = req.body['date-year'];
  var action = req.body.action;

  if (action === 'remove') {
    delete c.objectionPeriodEndDate;
    req.session.flashSection = "timetable"; 
    if (typeof addAuditLog === "function") addAuditLog(req, ref, "Objection period end date removed");
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  var errorList = []; var errorFields = [];
  if (!day && !month && !year) { errorList.push({ text: "Enter the objection period end date", href: "#date-day" }); errorFields = ['day', 'month', 'year']; } 
  else {
    var missing = [];
    if (!day) missing.push('day'); if (!month) missing.push('month'); if (!year) missing.push('year');
    if (missing.length > 0) {
      var missingText = missing.length === 2 ? "Objection period end date must include a " + missing[0] + " and " + missing[1] : "Objection period end date must include a " + missing[0];
      errorList.push({ text: missingText, href: "#date-" + missing[0] }); errorFields = errorFields.concat(missing);
    }
  }

  if (day && (Number(day) < 1 || Number(day) > 31 || isNaN(Number(day)))) { errorList.push({ text: "Objection period end date day must be a real day", href: "#date-day" }); if (!errorFields.includes('day')) errorFields.push('day'); }
  if (month && (Number(month) < 1 || Number(month) > 12 || isNaN(Number(month)))) { errorList.push({ text: "Objection period end date month must be a real month", href: "#date-month" }); if (!errorFields.includes('month')) errorFields.push('month'); }
  if (year && (year.length != 4 || isNaN(Number(year)))) { errorList.push({ text: "Objection period end date year must include four numbers", href: "#date-year" }); if (!errorFields.includes('year')) errorFields.push('year'); }

  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) { errorList.push({ text: "Enter a real date", href: "#date-day" }); errorFields = ['day', 'month', 'year']; }
  }

  if (errorList.length > 0) return res.render('cases/edit/objection-period-end-date', { ref: ref, errorList: errorList, errorFields: errorFields, day: day, month: month, year: year });

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var formatted = day + " " + (month ? months[month - 1] : "") + " " + year;

  c.objectionPeriodEndDate = { day: day, month: month, year: year, formatted: formatted };
  req.session.flashSection = "timetable"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Objection period end date updated to '" + formatted + "'");
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- 6.7 DATE TO NOTIFY PARTIES OF DECISION DATE ---
router.get('/cases/edit/decision-notification-date', function(req, res) {
  var c = getCase(req);
  var val = c.decisionNotificationDate || {};
  res.render('cases/edit/decision-notification-date', { ref: c.reference, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/edit/decision-notification-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  var day = req.body['date-day']; var month = req.body['date-month']; var year = req.body['date-year'];
  var action = req.body.action;

  if (action === 'remove') {
    delete c.decisionNotificationDate;
    req.session.flashSection = "timetable"; 
    if (typeof addAuditLog === "function") addAuditLog(req, ref, "Decision notification date removed");
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  var errorList = []; var errorFields = [];
  if (!day && !month && !year) { errorList.push({ text: "Enter the date to notify parties of decision", href: "#date-day" }); errorFields = ['day', 'month', 'year']; } 
  else {
    var missing = [];
    if (!day) missing.push('day'); if (!month) missing.push('month'); if (!year) missing.push('year');
    if (missing.length > 0) {
      var missingText = missing.length === 2 ? "Date to notify parties of decision must include a " + missing[0] + " and " + missing[1] : "Date to notify parties of decision must include a " + missing[0];
      errorList.push({ text: missingText, href: "#date-" + missing[0] }); errorFields = errorFields.concat(missing);
    }
  }

  if (day && (Number(day) < 1 || Number(day) > 31 || isNaN(Number(day)))) { errorList.push({ text: "Date to notify parties of decision day must be a real day", href: "#date-day" }); if (!errorFields.includes('day')) errorFields.push('day'); }
  if (month && (Number(month) < 1 || Number(month) > 12 || isNaN(Number(month)))) { errorList.push({ text: "Date to notify parties of decision month must be a real month", href: "#date-month" }); if (!errorFields.includes('month')) errorFields.push('month'); }
  if (year && (year.length != 4 || isNaN(Number(year)))) { errorList.push({ text: "Date to notify parties of decision year must include four numbers", href: "#date-year" }); if (!errorFields.includes('year')) errorFields.push('year'); }

  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) { errorList.push({ text: "Enter a real date", href: "#date-day" }); errorFields = ['day', 'month', 'year']; }
  }

  if (errorList.length > 0) return res.render('cases/edit/decision-notification-date', { ref: ref, errorList: errorList, errorFields: errorFields, day: day, month: month, year: year });

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var formatted = day + " " + (month ? months[month - 1] : "") + " " + year;

  c.decisionNotificationDate = { day: day, month: month, year: year, formatted: formatted };
  req.session.flashSection = "timetable"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Decision notification date updated to '" + formatted + "'");
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- 6.8 DATE DECISION MUST BE ISSUED BY / EXPIRY DATE ---
router.get('/cases/edit/decision-issued-by-date', function(req, res) {
  var c = getCase(req);
  var val = c.decisionIssuedByDate || {};
  res.render('cases/edit/decision-issued-by-date', { ref: c.reference, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/edit/decision-issued-by-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  var day = req.body['date-day']; var month = req.body['date-month']; var year = req.body['date-year'];
  var action = req.body.action;

  if (action === 'remove') {
    delete c.decisionIssuedByDate;
    req.session.flashSection = "timetable"; 
    if (typeof addAuditLog === "function") addAuditLog(req, ref, "Decision issued by date removed");
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  var errorList = []; var errorFields = [];
  if (!day && !month && !year) { errorList.push({ text: "Enter the date decision must be issued by", href: "#date-day" }); errorFields = ['day', 'month', 'year']; } 
  else {
    var missing = [];
    if (!day) missing.push('day'); if (!month) missing.push('month'); if (!year) missing.push('year');
    if (missing.length > 0) {
      var missingText = missing.length === 2 ? "Date decision must be issued by must include a " + missing[0] + " and " + missing[1] : "Date decision must be issued by must include a " + missing[0];
      errorList.push({ text: missingText, href: "#date-" + missing[0] }); errorFields = errorFields.concat(missing);
    }
  }

  if (day && (Number(day) < 1 || Number(day) > 31 || isNaN(Number(day)))) { errorList.push({ text: "Date decision must be issued by day must be a real day", href: "#date-day" }); if (!errorFields.includes('day')) errorFields.push('day'); }
  if (month && (Number(month) < 1 || Number(month) > 12 || isNaN(Number(month)))) { errorList.push({ text: "Date decision must be issued by month must be a real month", href: "#date-month" }); if (!errorFields.includes('month')) errorFields.push('month'); }
  if (year && (year.length != 4 || isNaN(Number(year)))) { errorList.push({ text: "Date decision must be issued by year must include four numbers", href: "#date-year" }); if (!errorFields.includes('year')) errorFields.push('year'); }

  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) { errorList.push({ text: "Enter a real date", href: "#date-day" }); errorFields = ['day', 'month', 'year']; }
  }

  if (errorList.length > 0) return res.render('cases/edit/decision-issued-by-date', { ref: ref, errorList: errorList, errorFields: errorFields, day: day, month: month, year: year });

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var formatted = day + " " + (month ? months[month - 1] : "") + " " + year;

  c.decisionIssuedByDate = { day: day, month: month, year: year, formatted: formatted };
  req.session.flashSection = "timetable"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Decision issued by date updated to '" + formatted + "'");
  res.redirect('/cases/case-details?ref=' + ref);
});


// ==============================================================================
// 5. ADDITIONAL RESOURCE LOCATIONS (Simple Text Areas)
// ==============================================================================

// --- OFFLINE DOCUMENT LOCATION ---
router.get('/cases/edit/offline-document-location', function(req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases');

  res.render('cases/edit/offline-document-location', { 
    ref: c.reference, 
    value: c.offlineDocLocation || "",
    editMode: true 
  });
});

router.post('/cases/edit/offline-document-location', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  c.offlineDocLocation = req.body.offlineDocLocation;
  req.session.flashSection = "additionalResourceLocations"; 

  if (typeof addAuditLog === "function") {
    addAuditLog(req, ref, "Offline file location updated to: " + (c.offlineDocLocation || "N/A"));
  }
  
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- RELEVANT WEBSITE LINKS ---
router.get('/cases/edit/relevant-website-links', function(req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases');

  res.render('cases/edit/relevant-website-links', { 
    ref: c.reference, 
    value: c.relevantWebsiteLinks || "",
    editMode: true 
  });
});

router.post('/cases/edit/relevant-website-links', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  c.relevantWebsiteLinks = req.body.relevantWebsiteLinks;
  req.session.flashSection = "additionalResourceLocations"; 

  if (typeof addAuditLog === "function") {
    addAuditLog(req, ref, "Relevant website links updated to: " + (c.relevantWebsiteLinks || "N/A"));
  }
  
  res.redirect('/cases/case-details?ref=' + ref);
});


// ==============================================================================
// 6. INVOICING
// ==============================================================================

// --- RECHARGEABLE ---
router.get('/cases/edit/invoicing-rechargeable', function(req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases');
  res.render('cases/edit/invoicing-rechargeable', { ref: c.reference, value: c.invoicing?.rechargeable });
});

router.post('/cases/edit/invoicing-rechargeable', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  var val = req.body.rechargeable;

  if (!val) {
    return res.render('cases/edit/invoicing-rechargeable', { 
      ref: ref, 
      errors: { rechargeable: { text: "Select yes if the case is rechargeable" } } 
    });
  }

  if (!c.invoicing) c.invoicing = {};
  c.invoicing.rechargeable = val;
  
  req.session.flashSection = "invoicing"; 
  
  if (typeof addAuditLog === "function") {
    addAuditLog(req, ref, "Invoicing rechargeable value updated to " + val);
  }
  
  res.redirect('/cases/case-details?ref=' + ref);
});

// --- FINAL COST ---
router.get('/cases/edit/invoicing-final-cost', function(req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases');
  res.render('cases/edit/invoicing-final-cost', { ref: c.reference, value: c.invoicing?.finalCost });
});

router.post('/cases/edit/invoicing-final-cost', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  var cost = req.body.finalCost;

  // Validate: not empty, and must be a valid number up to 2 decimal places
  var currencyRegex = /^\d+(\.\d{1,2})?$/;

  if (!cost) {
    return res.render('cases/edit/invoicing-final-cost', { 
      ref: ref, 
      errors: { finalCost: { text: "Enter the final cost" } } 
    });
  } else if (!currencyRegex.test(cost)) {
    return res.render('cases/edit/invoicing-final-cost', { 
      ref: ref, 
      value: cost, 
      errors: { finalCost: { text: "Final cost must be an amount of money, like 150 or 150.50" } } 
    });
  }

  if (!c.invoicing) c.invoicing = {};
  
  // GOV.UK Formatting: Drop .00 if it's a whole number, keep .xx if there are pence
  let num = parseFloat(cost);
  c.invoicing.finalCost = Number.isInteger(num) ? num.toString() : num.toFixed(2);
  
  req.session.flashSection = "invoicing"; 

  if (typeof addAuditLog === "function") {
    // Note: The \u00A3 is the Unicode character for the £ symbol!
    addAuditLog(req, ref, "Invoicing final cost updated to \u00A3" + c.invoicing.finalCost);
  }
  
  res.redirect('/cases/case-details?ref=' + ref);
});

// --- INVOICE SENT ---
router.get('/cases/edit/invoicing-invoice-sent', function(req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases');
  res.render('cases/edit/invoicing-invoice-sent', { ref: c.reference, value: c.invoicing?.invoiceSent });
});

router.post('/cases/edit/invoicing-invoice-sent', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  var val = req.body.invoiceSent;

  if (!val) {
    return res.render('cases/edit/invoicing-invoice-sent', { 
      ref: ref, 
      errors: { invoiceSent: { text: "Select yes if the invoice has been sent" } } 
    });
  }

  if (!c.invoicing) c.invoicing = {};
  c.invoicing.invoiceSent = val;
  
  req.session.flashSection = "invoicing"; 

  if (typeof addAuditLog === "function") {
    addAuditLog(req, ref, "Invoicing invoice sent value updated to " + val);
  }
  
  res.redirect('/cases/case-details?ref=' + ref);
});

// --- FEE RECEIVED ---
router.get('/cases/edit/invoicing-fee-received', function(req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases');
  res.render('cases/edit/invoicing-fee-received', { ref: c.reference, value: c.invoicing?.feeReceived });
});

router.post('/cases/edit/invoicing-fee-received', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  var val = req.body.feeReceived;

  if (!val) {
    return res.render('cases/edit/invoicing-fee-received', { 
      ref: ref, 
      errors: { feeReceived: { text: "Select yes if the fee has been received" } } 
    });
  }

  if (!c.invoicing) c.invoicing = {};
  c.invoicing.feeReceived = val;
  
  req.session.flashSection = "invoicing"; 

  if (typeof addAuditLog === "function") {
    addAuditLog(req, ref, "Invoicing fee received value updated to " + val);
  }
  
  res.redirect('/cases/case-details?ref=' + ref);
});
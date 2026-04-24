const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// Import all the shared helpers need for procedures from helpers.js
const { 
  getCase, 
  addAuditLog, 
  validateAndSaveAddress, 
  validateAndSaveDate, 
  validateAndSaveDateTime, 
  validateAndSaveNumber 
} = require('../helpers');


// ==============================================================================
// DYNAMIC PROCEDURE ROUTES
// ==============================================================================
// These routes handle adding/editing attributes for an infinite number of procedures.
// They use the URL parameter :index (e.g., /cases/procedures/1/site-visit) 
// to automatically target the correct object inside the array.

// --- Helper: Find the Correct Procedure ---
function getTargetProcedure(req) {
  var ref = req.body.ref || req.query.ref;
  var match = req.params.index.match(/\d+/);
  if (match) req.params.index = match[0]; 

  var arrayIndex = parseInt(req.params.index, 10) - 1; 
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);

  if (!c) return { c: null, proc: null };
  if (!c.overviewProcedures) c.overviewProcedures = [];
  if (!c.overviewProcedures[arrayIndex]) c.overviewProcedures[arrayIndex] = {};

  return { c: c, proc: c.overviewProcedures[arrayIndex] };
}

// --- Helper: Generate Audit Log Name ---
function getProcName(proc, index) {
  if (!proc || !proc.type) return `Procedure ${index + 1}`;
  let status = proc.status || 'Not Selected'; 
  return `${proc.type} (${status})`;
}

// ------------------------------------------------------------------------------
// CMC & PIM ROUTES
// ------------------------------------------------------------------------------

// --- CMC DATE ---
router.get('/cases/procedures/:index/cmc-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.cmcDate || {}; 
  res.render('cases/procedures/details/cmc-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year, hour: val.hour, minute: val.minute, ampm: val.ampm, errorFields: [] });
});

router.post('/cases/procedures/:index/cmc-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDateTime(req, res, 'cmc', 'Case management conference', proc, 'cmcDate');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Case management conference date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Case management conference date for ${procName} updated to ${proc.cmcDate.formattedDate + (proc.cmcDate.formattedTime ? ' at ' + proc.cmcDate.formattedTime : '')}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/cmc-date', { ref: c.reference, index: req.params.index, day: req.body['cmc-day'], month: req.body['cmc-month'], year: req.body['cmc-year'], hour: req.body['cmc-hour'], minute: req.body['cmc-minute'], ampm: req.body['cmc-ampm'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- CMC NOTE SENT ---
router.get('/cases/procedures/:index/cmc-note-sent', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.cmcNoteSent || {}; 
  res.render('cases/procedures/details/cmc-note-sent', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/cmc-note-sent', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'cmc-note', 'Case management conference note sent date', proc, 'cmcNoteSent');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Case management conference note sent date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Case management conference note sent date for ${procName} updated to ${proc.cmcNoteSent.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/cmc-note-sent', { ref: c.reference, index: req.params.index, day: req.body['cmc-note-day'], month: req.body['cmc-note-month'], year: req.body['cmc-note-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- CMC TYPE ---
router.get('/cases/procedures/:index/cmc-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/cmc-type', { ref: c.reference, index: req.params.index, cmcType: proc.cmcType });
});

router.post('/cases/procedures/:index/cmc-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var val = req.body['cmc-type'];
  let procName = getProcName(proc, parseInt(req.params.index) - 1);

  if (req.body.action === 'remove') {
    delete proc.cmcType;
    addAuditLog(req, c.reference, `Case management conference type for ${procName} removed`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (!val) return res.render('cases/procedures/details/cmc-type', { ref: c.reference, index: req.params.index, errorList: [{ text: "Select the case management conference type", href: "#cmc-type" }] });

  proc.cmcType = val;
  addAuditLog(req, c.reference, `Case management conference type for ${procName} updated to ${val}`);
  req.session.flashSection = `procedure-${req.params.index}`;
  res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- CMC VENUE ---
router.get('/cases/procedures/:index/cmc-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.cmcVenue || {}; 
  res.render('cases/procedures/details/cmc-venue', { ref: c.reference, index: req.params.index, line1: val.line1, line2: val.line2, town: val.town, county: val.county, postcode: val.postcode, errorFields: [] });
});

router.post('/cases/procedures/:index/cmc-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveAddress(req, res, 'venue', 'Venue address', proc, 'cmcVenue');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Case management venue address for ${procName} removed`);
    else addAuditLog(req, c.reference, `Case management venue address for ${procName} updated to ${proc.cmcVenue.formatted.replace(/<br>/g, ', ')}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/cmc-venue', { ref: c.reference, index: req.params.index, line1: req.body['venue-line1'], line2: req.body['venue-line2'], town: req.body['venue-town'], county: req.body['venue-county'], postcode: req.body['venue-postcode'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- PRE-INQUIRY MEETING (PIM) OR CMC ---
router.get('/cases/procedures/:index/pre-inquiry-meeting-cmc', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/pre-inquiry-meeting-cmc', { ref: c.reference, index: req.params.index, meetingType: proc.preInquiryMeetingCmc });
});

router.post('/cases/procedures/:index/pre-inquiry-meeting-cmc', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var val = req.body['meeting-type'];
  let procName = getProcName(proc, parseInt(req.params.index) - 1);

  if (req.body.action === 'remove') {
    delete proc.preInquiryMeetingCmc;
    addAuditLog(req, c.reference, `Pre inquiry meeting or case management conference for ${procName} removed`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (!val) return res.render('cases/procedures/details/pre-inquiry-meeting-cmc', { ref: c.reference, index: req.params.index, errorList: [{ text: "Select whether there will be a pre inquiry meeting or case management conference", href: "#meeting-type" }] });

  proc.preInquiryMeetingCmc = val;
  addAuditLog(req, c.reference, `Pre inquiry meeting or case management conference for ${procName} updated to ${val}`);
  req.session.flashSection = `procedure-${req.params.index}`;
  res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- PIM DATE ---
router.get('/cases/procedures/:index/pim-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.pimDate || {}; 
  res.render('cases/procedures/details/pim-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year, hour: val.hour, minute: val.minute, ampm: val.ampm, errorFields: [] });
});

router.post('/cases/procedures/:index/pim-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDateTime(req, res, 'pim', 'Pre inquiry meeting date', proc, 'pimDate');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Pre inquiry meeting date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Pre inquiry meeting date for ${procName} updated to ${proc.pimDate.formattedDate + (proc.pimDate.formattedTime ? ' at ' + proc.pimDate.formattedTime : '')}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/pim-date', { ref: c.reference, index: req.params.index, day: req.body['pim-day'], month: req.body['pim-month'], year: req.body['pim-year'], hour: req.body['pim-hour'], minute: req.body['pim-minute'], ampm: req.body['pim-ampm'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- PIM NOTE SENT ---
router.get('/cases/procedures/:index/pim-note-sent', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.pimNoteSent || {}; 
  res.render('cases/procedures/details/pim-note-sent', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/pim-note-sent', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'pim-note', 'Pre inquiry meeting note sent', proc, 'pimNoteSent');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Pre inquiry meeting note sent date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Pre inquiry meeting note sent date for ${procName} updated to ${proc.pimNoteSent.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/pim-note-sent', { ref: c.reference, index: req.params.index, day: req.body['pim-note-day'], month: req.body['pim-note-month'], year: req.body['pim-note-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- PIM TYPE ---
router.get('/cases/procedures/:index/pim-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/pim-type', { ref: c.reference, index: req.params.index, pimType: proc.pimType });
});

router.post('/cases/procedures/:index/pim-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var val = req.body['pim-type'];
  let procName = getProcName(proc, parseInt(req.params.index) - 1);

  if (req.body.action === 'remove') {
    delete proc.pimType;
    addAuditLog(req, c.reference, `Pre inquiry meeting type for ${procName} removed`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (!val) return res.render('cases/procedures/details/pim-type', { ref: c.reference, index: req.params.index, errorList: [{ text: "Select the format of the pre inquiry meeting", href: "#pim-type" }] });

  proc.pimType = val;
  addAuditLog(req, c.reference, `Pre inquiry meeting type for ${procName} updated to ${val}`);
  req.session.flashSection = `procedure-${req.params.index}`;
  res.redirect('/cases/case-details?ref=' + c.reference);
});


// ------------------------------------------------------------------------------
// HEARING ROUTES
// ------------------------------------------------------------------------------

// --- CONFIRMED HEARING DATE ---
router.get('/cases/procedures/:index/confirmed-hearing-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.confirmedHearing || {}; 
  res.render('cases/procedures/details/confirmed-hearing-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year, hour: val.hour, minute: val.minute, ampm: val.ampm, errorFields: [] });
});

router.post('/cases/procedures/:index/confirmed-hearing-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDateTime(req, res, 'confirmed-hearing', 'Confirmed hearing date', proc, 'confirmedHearing');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Confirmed hearing date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Confirmed hearing date for ${procName} updated to ${proc.confirmedHearing.formattedDate + (proc.confirmedHearing.formattedTime ? ' at ' + proc.confirmedHearing.formattedTime : '')}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/confirmed-hearing-date', { ref: c.reference, index: req.params.index, day: req.body['confirmed-hearing-day'], month: req.body['confirmed-hearing-month'], year: req.body['confirmed-hearing-year'], hour: req.body['confirmed-hearing-hour'], minute: req.body['confirmed-hearing-minute'], ampm: req.body['confirmed-hearing-ampm'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- EARLIEST POTENTIAL HEARING DATE ---
router.get('/cases/procedures/:index/earliest-hearing-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.earliestHearingDate || {}; 
  res.render('cases/procedures/details/earliest-hearing-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/earliest-hearing-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'earliest-date', 'Earliest potential hearing date', proc, 'earliestHearingDate');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Earliest potential hearing date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Earliest potential hearing date for ${procName} updated to ${proc.earliestHearingDate.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/earliest-hearing-date', { ref: c.reference, index: req.params.index, day: req.body['earliest-date-day'], month: req.body['earliest-date-month'], year: req.body['earliest-date-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- HEARING CLOSED DATE ---
router.get('/cases/procedures/:index/hearing-closed-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.hearingClosed || {}; 
  res.render('cases/procedures/details/hearing-closed-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/hearing-closed-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'hearing-closed', 'Date hearing closed', proc, 'hearingClosed');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date hearing closed for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date hearing closed for ${procName} updated to ${proc.hearingClosed.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/hearing-closed-date', { ref: c.reference, index: req.params.index, day: req.body['hearing-closed-day'], month: req.body['hearing-closed-month'], year: req.body['hearing-closed-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- HEARING IN TARGET? ---
router.get('/cases/procedures/:index/hearing-in-target', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/hearing-in-target', { ref: c.reference, index: req.params.index, hearingInTarget: proc.hearingInTarget });
});

router.post('/cases/procedures/:index/hearing-in-target', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var val = req.body['hearing-in-target'];
  let procName = getProcName(proc, parseInt(req.params.index) - 1);

  if (req.body.action === 'remove') {
    delete proc.hearingInTarget;
    addAuditLog(req, c.reference, `Hearing in target for ${procName} removed`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (!val) return res.render('cases/procedures/details/hearing-in-target', { ref: c.reference, index: req.params.index, errorList: [{ text: "Select yes if the hearing was completed in the target timeframe", href: "#hearing-in-target" }] });

  proc.hearingInTarget = val;
  addAuditLog(req, c.reference, `Hearing in target for ${procName} updated to ${val}`);
  req.session.flashSection = `procedure-${req.params.index}`;
  res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- HEARING LENGTH OF EVENT ---
router.get('/cases/procedures/:index/hearing-length-of-event', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/hearing-length-of-event', { ref: c.reference, index: req.params.index, value: proc.hearingLengthOfEvent });
});

router.post('/cases/procedures/:index/hearing-length-of-event', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'length-event', 'Length of event', proc, 'hearingLengthOfEvent');

  if (result.status === "ERROR") return res.render('cases/procedures/details/hearing-length-of-event', { ref: c.reference, index: req.params.index, value: req.body['length-event'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Length of event for ${procName} removed`);
  else addAuditLog(req, c.reference, `Length of event for ${procName} updated to ${proc.hearingLengthOfEvent} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- HEARING NOTIFIED DATE ---
router.get('/cases/procedures/:index/hearing-notified-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.hearingNotified || {}; 
  res.render('cases/procedures/details/hearing-notified-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/hearing-notified-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'hearing-notified', 'Date parties must be notified of hearing', proc, 'hearingNotified');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date parties must be notified of hearing for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date parties must be notified of hearing for ${procName} updated to ${proc.hearingNotified.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/hearing-notified-date', { ref: c.reference, index: req.params.index, day: req.body['hearing-notified-day'], month: req.body['hearing-notified-month'], year: req.body['hearing-notified-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- HEARING PREPARATION TIME ---
router.get('/cases/procedures/:index/hearing-preparation-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/hearing-preparation-time', { ref: c.reference, index: req.params.index, value: proc.hearingPrepTime });
});

router.post('/cases/procedures/:index/hearing-preparation-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'prep-time', 'Preparation time', proc, 'hearingPrepTime');

  if (result.status === "ERROR") return res.render('cases/procedures/details/hearing-preparation-time', { ref: c.reference, index: req.params.index, value: req.body['prep-time'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Preparation time for ${procName} removed`);
  else addAuditLog(req, c.reference, `Preparation time for ${procName} updated to ${proc.hearingPrepTime} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- HEARING REPORTING TIME---
router.get('/cases/procedures/:index/hearing-reporting-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/hearing-reporting-time', { ref: c.reference, index: req.params.index, value: proc.hearingReportingTime });
});

router.post('/cases/procedures/:index/hearing-reporting-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'reporting-time', 'Reporting time', proc, 'hearingReportingTime');

  if (result.status === "ERROR") return res.render('cases/procedures/details/hearing-reporting-time', { ref: c.reference, index: req.params.index, value: req.body['reporting-time'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Reporting time for ${procName} removed`);
  else addAuditLog(req, c.reference, `Reporting time for ${procName} updated to ${proc.hearingReportingTime} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- HEARING SITTING TIME ---
router.get('/cases/procedures/:index/hearing-sitting-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/hearing-sitting-time', { ref: c.reference, index: req.params.index, value: proc.hearingSittingTime });
});

router.post('/cases/procedures/:index/hearing-sitting-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'sitting-time', 'Sitting time', proc, 'hearingSittingTime');

  if (result.status === "ERROR") return res.render('cases/procedures/details/hearing-sitting-time', { ref: c.reference, index: req.params.index, value: req.body['sitting-time'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Sitting time for ${procName} removed`);
  else addAuditLog(req, c.reference, `Sitting time for ${procName} updated to ${proc.hearingSittingTime} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- HEARING TRAVEL TIME ---
router.get('/cases/procedures/:index/hearing-travel-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/hearing-travel-time', { ref: c.reference, index: req.params.index, value: proc.hearingTravelTime });
});

router.post('/cases/procedures/:index/hearing-travel-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'travel-time', 'Travel time', proc, 'hearingTravelTime');

  if (result.status === "ERROR") return res.render('cases/procedures/details/hearing-travel-time', { ref: c.reference, index: req.params.index, value: req.body['travel-time'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Travel time for ${procName} removed`);
  else addAuditLog(req, c.reference, `Travel time for ${procName} updated to ${proc.hearingTravelTime} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- HEARING TYPE ---
router.get('/cases/procedures/:index/hearing-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/hearing-type', { ref: c.reference, index: req.params.index, hearingType: proc.hearingType });
});

router.post('/cases/procedures/:index/hearing-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var val = req.body['hearing-type'];
  let procName = getProcName(proc, parseInt(req.params.index) - 1);

  if (req.body.action === 'remove') {
    delete proc.hearingType;
    addAuditLog(req, c.reference, `Hearing type for ${procName} removed`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (!val) return res.render('cases/procedures/details/hearing-type', { ref: c.reference, index: req.params.index, errorList: [{ text: "Select type of hearing", href: "#hearing-type" }] });

  proc.hearingType = val;
  addAuditLog(req, c.reference, `Hearing type for ${procName} updated to ${val}`);
  req.session.flashSection = `procedure-${req.params.index}`;
  res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- HEARING VENUE ---
router.get('/cases/procedures/:index/hearing-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.hearingVenue || {}; 
  res.render('cases/procedures/details/hearing-venue', { ref: c.reference, index: req.params.index, line1: val.line1, line2: val.line2, town: val.town, county: val.county, postcode: val.postcode, errorFields: [] });
});

router.post('/cases/procedures/:index/hearing-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveAddress(req, res, 'venue', 'Hearing venue', proc, 'hearingVenue');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Hearing venue for ${procName} removed`);
    else addAuditLog(req, c.reference, `Hearing venue for ${procName} updated to ${proc.hearingVenue.formatted.replace(/<br>/g, ', ')}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/hearing-venue', { ref: c.reference, index: req.params.index, line1: req.body['venue-line1'], line2: req.body['venue-line2'], town: req.body['venue-town'], county: req.body['venue-county'], postcode: req.body['venue-postcode'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- NOTIFIED HEARING DATE ---
router.get('/cases/procedures/:index/notified-hearing-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.notifiedHearingDate || {}; 
  res.render('cases/procedures/details/notified-hearing-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/notified-hearing-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'notified-date', 'Date parties notified', proc, 'notifiedHearingDate');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date parties notified of hearing date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date parties notified of hearing date for ${procName} updated to ${proc.notifiedHearingDate.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/notified-hearing-date', { ref: c.reference, index: req.params.index, day: req.body['notified-date-day'], month: req.body['notified-date-month'], year: req.body['notified-date-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- NOTIFIED HEARING VENUE ---
router.get('/cases/procedures/:index/notified-hearing-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.notifiedHearingVenue || {}; 
  res.render('cases/procedures/details/notified-hearing-venue', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/notified-hearing-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'notified-venue', 'Date parties notified of venue', proc, 'notifiedHearingVenue');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date parties notified of hearing venue for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date parties notified of hearing venue for ${procName} updated to ${proc.notifiedHearingVenue.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/notified-hearing-venue', { ref: c.reference, index: req.params.index, day: req.body['notified-venue-day'], month: req.body['notified-venue-month'], year: req.body['notified-venue-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- TARGET HEARING DATE ---
router.get('/cases/procedures/:index/target-hearing-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.targetHearing || {}; 
  res.render('cases/procedures/details/target-hearing-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/target-hearing-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'target-hearing', 'Target hearing date', proc, 'targetHearing');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Target hearing date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Target hearing date for ${procName} updated to ${proc.targetHearing.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/target-hearing-date', { ref: c.reference, index: req.params.index, day: req.body['target-hearing-day'], month: req.body['target-hearing-month'], year: req.body['target-hearing-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});


// ------------------------------------------------------------------------------
// INQUIRY ROUTES
// ------------------------------------------------------------------------------

// --- CONFIRMED INQUIRY DATE ---
router.get('/cases/procedures/:index/confirmed-inquiry-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.confirmedInquiry || {}; 
  res.render('cases/procedures/details/confirmed-inquiry-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year, hour: val.hour, minute: val.minute, ampm: val.ampm, errorFields: [] });
});

router.post('/cases/procedures/:index/confirmed-inquiry-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDateTime(req, res, 'confirmed-inquiry', 'Confirmed inquiry date', proc, 'confirmedInquiry');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Confirmed inquiry date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Confirmed inquiry date for ${procName} updated to ${proc.confirmedInquiry.formattedDate + (proc.confirmedInquiry.formattedTime ? ' at ' + proc.confirmedInquiry.formattedTime : '')}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/confirmed-inquiry-date', { ref: c.reference, index: req.params.index, day: req.body['confirmed-inquiry-day'], month: req.body['confirmed-inquiry-month'], year: req.body['confirmed-inquiry-year'], hour: req.body['confirmed-inquiry-hour'], minute: req.body['confirmed-inquiry-minute'], ampm: req.body['confirmed-inquiry-ampm'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- EARLIEST POTENTIAL INQUIRY DATE ---
router.get('/cases/procedures/:index/earliest-inquiry-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.earliestInquiryDate || {}; 
  res.render('cases/procedures/details/earliest-inquiry-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/earliest-inquiry-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'earliest-inquiry-date', 'Earliest potential inquiry date', proc, 'earliestInquiryDate');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Earliest potential inquiry date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Earliest potential inquiry date for ${procName} updated to ${proc.earliestInquiryDate.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/earliest-inquiry-date', { ref: c.reference, index: req.params.index, day: req.body['earliest-inquiry-date-day'], month: req.body['earliest-inquiry-date-month'], year: req.body['earliest-inquiry-date-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- INQUIRY CLOSED DATE ---
router.get('/cases/procedures/:index/inquiry-closed-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.inquiryClosed || {}; 
  res.render('cases/procedures/details/inquiry-closed-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/inquiry-closed-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'inquiry-closed', 'Date inquiry closed', proc, 'inquiryClosed');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date inquiry closed for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date inquiry closed for ${procName} updated to ${proc.inquiryClosed.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/inquiry-closed-date', { ref: c.reference, index: req.params.index, day: req.body['inquiry-closed-day'], month: req.body['inquiry-closed-month'], year: req.body['inquiry-closed-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- INQUIRY FINISHED DATE ---
router.get('/cases/procedures/:index/inquiry-finished-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.inquiryFinished || {}; 
  res.render('cases/procedures/details/inquiry-finished-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/inquiry-finished-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'inquiry-finished', 'Date inquiry finished', proc, 'inquiryFinished');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date inquiry finished for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date inquiry finished for ${procName} updated to ${proc.inquiryFinished.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/inquiry-finished-date', { ref: c.reference, index: req.params.index, day: req.body['inquiry-finished-day'], month: req.body['inquiry-finished-month'], year: req.body['inquiry-finished-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- INQUIRY LENGTH OF EVENT ---
router.get('/cases/procedures/:index/inquiry-length-of-event', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/inquiry-length-of-event', { ref: c.reference, index: req.params.index, value: proc.inquiryLengthOfEvent });
});

router.post('/cases/procedures/:index/inquiry-length-of-event', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'length-event', 'Length of event', proc, 'inquiryLengthOfEvent');

  if (result.status === "ERROR") return res.render('cases/procedures/details/inquiry-length-of-event', { ref: c.reference, index: req.params.index, value: req.body['length-event'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Length of event for ${procName} removed`);
  else addAuditLog(req, c.reference, `Length of event for ${procName} updated to ${proc.inquiryLengthOfEvent} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- INQUIRY NOTIFIED DATE ---
router.get('/cases/procedures/:index/inquiry-notified-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.inquiryNotified || {}; 
  res.render('cases/procedures/details/inquiry-notified-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/inquiry-notified-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'inquiry-notified', 'Date parties must be notified of inquiry', proc, 'inquiryNotified');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date parties must be notified of inquiry for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date parties must be notified of inquiry for ${procName} updated to ${proc.inquiryNotified.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/inquiry-notified-date', { ref: c.reference, index: req.params.index, day: req.body['inquiry-notified-day'], month: req.body['inquiry-notified-month'], year: req.body['inquiry-notified-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- INQUIRY PREPARATION TIME ---
router.get('/cases/procedures/:index/inquiry-preparation-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/inquiry-preparation-time', { ref: c.reference, index: req.params.index, value: proc.inquiryPrepTime });
});

router.post('/cases/procedures/:index/inquiry-preparation-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'prep-time', 'Preparation time', proc, 'inquiryPrepTime');

  if (result.status === "ERROR") return res.render('cases/procedures/details/inquiry-preparation-time', { ref: c.reference, index: req.params.index, value: req.body['prep-time'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Preparation time for ${procName} removed`);
  else addAuditLog(req, c.reference, `Preparation time for ${procName} updated to ${proc.inquiryPrepTime} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- INQUIRY REPORTING TIME ---
router.get('/cases/procedures/:index/inquiry-reporting-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/inquiry-reporting-time', { ref: c.reference, index: req.params.index, value: proc.inquiryReportingTime });
});

router.post('/cases/procedures/:index/inquiry-reporting-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'reporting-time', 'Reporting time', proc, 'inquiryReportingTime');

  if (result.status === "ERROR") return res.render('cases/procedures/details/inquiry-reporting-time', { ref: c.reference, index: req.params.index, value: req.body['reporting-time'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Reporting time for ${procName} removed`);
  else addAuditLog(req, c.reference, `Reporting time for ${procName} updated to ${proc.inquiryReportingTime} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- INQUIRY SITTING TIME ---
router.get('/cases/procedures/:index/inquiry-sitting-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/inquiry-sitting-time', { ref: c.reference, index: req.params.index, value: proc.inquirySittingTime });
});

router.post('/cases/procedures/:index/inquiry-sitting-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'sitting-time', 'Sitting time', proc, 'inquirySittingTime');

  if (result.status === "ERROR") return res.render('cases/procedures/details/inquiry-sitting-time', { ref: c.reference, index: req.params.index, value: req.body['sitting-time'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Sitting time for ${procName} removed`);
  else addAuditLog(req, c.reference, `Sitting time for ${procName} updated to ${proc.inquirySittingTime} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- INQUIRY TRAVEL TIME ---
router.get('/cases/procedures/:index/inquiry-travel-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/inquiry-travel-time', { ref: c.reference, index: req.params.index, value: proc.inquiryTravelTime });
});

router.post('/cases/procedures/:index/inquiry-travel-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'travel-time', 'Travel time', proc, 'inquiryTravelTime');

  if (result.status === "ERROR") return res.render('cases/procedures/details/inquiry-travel-time', { ref: c.reference, index: req.params.index, value: req.body['travel-time'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Travel time for ${procName} removed`);
  else addAuditLog(req, c.reference, `Travel time for ${procName} updated to ${proc.inquiryTravelTime} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- INQUIRY TYPE ---
router.get('/cases/procedures/:index/inquiry-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/inquiry-type', { ref: c.reference, index: req.params.index, inquiryType: proc.inquiryType });
});

router.post('/cases/procedures/:index/inquiry-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var val = req.body['inquiry-type'];
  let procName = getProcName(proc, parseInt(req.params.index) - 1);

  if (req.body.action === 'remove') {
    delete proc.inquiryType;
    addAuditLog(req, c.reference, `Inquiry type for ${procName} removed`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (!val) return res.render('cases/procedures/details/inquiry-type', { ref: c.reference, index: req.params.index, errorList: [{ text: "Select the inquiry type", href: "#inquiry-type" }] });

  proc.inquiryType = val;
  addAuditLog(req, c.reference, `Inquiry type for ${procName} updated to ${val}`);
  req.session.flashSection = `procedure-${req.params.index}`;
  res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- INQUIRY VENUE ---
router.get('/cases/procedures/:index/inquiry-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.inquiryVenue || {}; 
  res.render('cases/procedures/details/inquiry-venue', { ref: c.reference, index: req.params.index, line1: val.line1, line2: val.line2, town: val.town, county: val.county, postcode: val.postcode, errorFields: [] });
});

router.post('/cases/procedures/:index/inquiry-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveAddress(req, res, 'venue', 'Inquiry venue', proc, 'inquiryVenue');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Inquiry venue for ${procName} removed`);
    else addAuditLog(req, c.reference, `Inquiry venue for ${procName} updated to ${proc.inquiryVenue.formatted.replace(/<br>/g, ', ')}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/inquiry-venue', { ref: c.reference, index: req.params.index, line1: req.body['venue-line1'], line2: req.body['venue-line2'], town: req.body['venue-town'], county: req.body['venue-county'], postcode: req.body['venue-postcode'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- NOTIFIED INQUIRY DATE ---
router.get('/cases/procedures/:index/notified-inquiry-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.notifiedInquiryDate || {}; 
  res.render('cases/procedures/details/notified-inquiry-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/notified-inquiry-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'notified-inquiry-date', 'Date parties notified of inquiry date', proc, 'notifiedInquiryDate');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date parties notified of inquiry date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date parties notified of inquiry date for ${procName} updated to ${proc.notifiedInquiryDate.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/notified-inquiry-date', { ref: c.reference, index: req.params.index, day: req.body['notified-inquiry-date-day'], month: req.body['notified-inquiry-date-month'], year: req.body['notified-inquiry-date-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- NOTIFIED INQUIRY VENUE ---
router.get('/cases/procedures/:index/notified-inquiry-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.notifiedInquiryVenue || {}; 
  res.render('cases/procedures/details/notified-inquiry-venue', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/notified-inquiry-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'notified-inquiry-venue', 'Date parties notified of inquiry venue', proc, 'notifiedInquiryVenue');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date parties notified of inquiry venue for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date parties notified of inquiry venue for ${procName} updated to ${proc.notifiedInquiryVenue.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/notified-inquiry-venue', { ref: c.reference, index: req.params.index, day: req.body['notified-inquiry-venue-day'], month: req.body['notified-inquiry-venue-month'], year: req.body['notified-inquiry-venue-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- TARGET INQUIRY DATE ---
router.get('/cases/procedures/:index/target-inquiry-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.targetInquiry || {}; 
  res.render('cases/procedures/details/target-inquiry-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/target-inquiry-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'target-inquiry', 'Target inquiry date', proc, 'targetInquiry');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Target inquiry date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Target inquiry date for ${procName} updated to ${proc.targetInquiry.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/target-inquiry-date', { ref: c.reference, index: req.params.index, day: req.body['target-inquiry-day'], month: req.body['target-inquiry-month'], year: req.body['target-inquiry-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});


// ------------------------------------------------------------------------------
// SHARED FIELDS (Appears in multiple procedure types)
// ------------------------------------------------------------------------------

// --- EVENT IN TARGET? ---
router.get('/cases/procedures/:index/event-in-target', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/event-in-target', { ref: c.reference, index: req.params.index, eventInTarget: proc.eventInTarget });
});

router.post('/cases/procedures/:index/event-in-target', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var val = req.body['event-in-target'];
  let procName = getProcName(proc, parseInt(req.params.index) - 1);

  if (req.body.action === 'remove') {
    delete proc.eventInTarget;
    addAuditLog(req, c.reference, `Event in target for ${procName} removed`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (!val) return res.render('cases/procedures/details/event-in-target', { ref: c.reference, index: req.params.index, errorList: [{ text: "Select if the event is in target", href: "#event-in-target" }] });

  proc.eventInTarget = val;
  addAuditLog(req, c.reference, `Event in target for ${procName} updated to ${val}`);
  req.session.flashSection = `procedure-${req.params.index}`;
  res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- IN HOUSE DATE ---
router.get('/cases/procedures/:index/in-house-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.inHouse || {}; 
  res.render('cases/procedures/details/in-house-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/in-house-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'in-house', 'In house date', proc, 'inHouse');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `In house date for ${procName} removed`);
    else addAuditLog(req, c.reference, `In house date for ${procName} updated to ${proc.inHouse.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/in-house-date', { ref: c.reference, index: req.params.index, day: req.body['in-house-day'], month: req.body['in-house-month'], year: req.body['in-house-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- PROOFS RECEIVED ---
router.get('/cases/procedures/:index/proofs-received', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.proofsReceived || {}; 
  res.render('cases/procedures/details/proofs-received', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/proofs-received', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'proofs-received', 'Proofs of evidence received date', proc, 'proofsReceived');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Proofs of evidence received date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Proofs of evidence received date for ${procName} updated to ${proc.proofsReceived.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/proofs-received', { ref: c.reference, index: req.params.index, day: req.body['proofs-received-day'], month: req.body['proofs-received-month'], year: req.body['proofs-received-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- SITE VISIT DATE ---
router.get('/cases/procedures/:index/site-visit', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.siteVisit || {}; 
  res.render('cases/procedures/details/site-visit', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/site-visit', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'site-visit', 'Site visit date', proc, 'siteVisit');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Site visit date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Site visit date for ${procName} updated to ${proc.siteVisit.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/site-visit', { ref: c.reference, index: req.params.index, day: req.body['site-visit-day'], month: req.body['site-visit-month'], year: req.body['site-visit-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- SITE VISIT TYPE ---
router.get('/cases/procedures/:index/site-visit-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/site-visit-type', { ref: c.reference, index: req.params.index, siteVisitType: proc.siteVisitType });
});

router.post('/cases/procedures/:index/site-visit-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var action = req.body.action;
  var val = req.body['site-visit-type'];
  let procName = getProcName(proc, parseInt(req.params.index) - 1);

  if (action === 'remove') {
    delete proc.siteVisitType;
    addAuditLog(req, c.reference, `Site visit type for ${procName} removed`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (!val) return res.render('cases/procedures/details/site-visit-type', { ref: c.reference, index: req.params.index, errorList: [{ text: "Select the type of site visit", href: "#site-visit-type" }] });

  proc.siteVisitType = val;
  addAuditLog(req, c.reference, `Site visit type for ${procName} updated to ${val}`);
  req.session.flashSection = `procedure-${req.params.index}`;
  res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- STATEMENTS OF CASE RECEIVED ---
router.get('/cases/procedures/:index/statements-received', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.statementsReceived || {}; 
  res.render('cases/procedures/details/statements-received', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/statements-received', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'statements-received', 'Statements of case received date', proc, 'statementsReceived');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Statements of case received date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Statements of case received date for ${procName} updated to ${proc.statementsReceived.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/statements-received', { ref: c.reference, index: req.params.index, day: req.body['statements-received-day'], month: req.body['statements-received-month'], year: req.body['statements-received-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- VERIFICATION DATE ---
router.get('/cases/procedures/:index/verification-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.verification || {}; 
  res.render('cases/procedures/details/verification-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/verification-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'verification-date', 'Verification date', proc, 'verification');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Verification date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Verification date for ${procName} updated to ${proc.verification.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/verification-date', { ref: c.reference, index: req.params.index, day: req.body['verification-date-day'], month: req.body['verification-date-month'], year: req.body['verification-date-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});


// ------------------------------------------------------------------------------
// WRITTEN REPRESENTATIONS
// ------------------------------------------------------------------------------

// --- WRITTEN REPS DATE ---
router.get('/cases/procedures/:index/written-reps-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.writtenRepsDate || {}; 
  res.render('cases/procedures/details/written-reps-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/written-reps-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'written-reps-date', 'Date offer for written representations', proc, 'writtenRepsDate');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date offer for written representations for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date offer for written representations for ${procName} updated to ${proc.writtenRepsDate.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/written-reps-date', { ref: c.reference, index: req.params.index, day: req.body['written-reps-date-day'], month: req.body['written-reps-date-month'], year: req.body['written-reps-date-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});
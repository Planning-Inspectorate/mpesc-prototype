const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// Use ../../ to go up two folders (from /sub-routes/add-to-list/ to /app/)
const { getCase, validateAndSaveDate, addAuditLog } = require('../../helpers');

// ==============================================================================
// 8. OUTCOMES FLOW (Working Draft Array Pattern)
// ==============================================================================

// --- 00. CATCH OLD LINKS / AUTO-ROUTER ---
router.get('/cases/outcomes/check', (req, res) => {
  res.redirect('/cases/outcomes/hub?ref=' + req.query.ref);
});

// --- 0. START PAGE: Empty State ---
router.get('/cases/outcomes/start', (req, res) => {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  req.session.data['tempOutcomesList'] = [];
  res.render('cases/add-to-list/outcomes/check-outcomes-first', { ref: ref });
});

// --- 1. HUB PAGE: Check Outcomes ---
router.get('/cases/outcomes/hub', (req, res) => {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  if (!c.outcomes) { c.outcomes = []; }

  // Clone real data to start working if no draft exists
  if (!req.session.data['tempOutcomesList']) {
    req.session.data['tempOutcomesList'] = JSON.parse(JSON.stringify(c.outcomes));
  }

  delete req.session.data['tempOutcome']; // clear temp item

  // Pass the list to the template
  res.render('cases/add-to-list/outcomes/check-outcomes', { 
    ref: ref,
    outcomeList: req.session.data['tempOutcomesList']
  });
});

// ==============================================
// ADD / EDIT FLOW
// ==============================================

// --- STEP 1: Type of decision ---
router.get('/cases/outcomes/step-1', (req, res) => {
  var id = req.query.id;
  var draftList = req.session.data['tempOutcomesList'] || [];

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    var existingOutcome = draftList.find(o => o.id === id);
    if (existingOutcome) req.session.data['tempOutcome'] = JSON.parse(JSON.stringify(existingOutcome));
  } else if (!id && !req.session.data['tempOutcome']) {
    req.session.data['tempOutcome'] = {}; 
  }

  var val = req.session.data['tempOutcome']?.type || "";
  
  // Dynamic back link logic
  var backUrl = (draftList.length > 0) ? `/cases/outcomes/hub?ref=${req.query.ref}` : `/cases/outcomes/start?ref=${req.query.ref}`;

  res.render('cases/add-to-list/outcomes/step-1-type', { 
    ref: req.query.ref, id: id, value: val, backUrl: backUrl 
  });
});

router.post('/cases/outcomes/step-1', (req, res) => {
  var type = req.body.outcomeType;
  var draftList = req.session.data['tempOutcomesList'] || [];
  var backUrl = (draftList.length > 0) ? `/cases/outcomes/hub?ref=${req.query.ref}` : `/cases/outcomes/start?ref=${req.query.ref}`;

  if (!type) {
    return res.render('cases/add-to-list/outcomes/step-1-type', { 
      ref: req.query.ref, id: req.query.id, error: true, backUrl: backUrl 
    });
  }
  
  if (!req.session.data['tempOutcome']) req.session.data['tempOutcome'] = {};
  req.session.data['tempOutcome'].type = type;
  res.redirect(`/cases/outcomes/step-2?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// --- STEP 2: Originator (Decision Maker) ---
router.get('/cases/outcomes/step-2', (req, res) => {
  var id = req.query.id;
  var draftList = req.session.data['tempOutcomesList'] || [];

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    var existingOutcome = draftList.find(o => o.id === id);
    if (existingOutcome) req.session.data['tempOutcome'] = JSON.parse(JSON.stringify(existingOutcome));
  }

  var val = req.session.data['tempOutcome']?.originator || "";
  res.render('cases/add-to-list/outcomes/step-2-originator', { ref: req.query.ref, id: id, value: val });
});

router.post('/cases/outcomes/step-2', (req, res) => {
  var originator = req.body.originator;
  if (!originator) return res.render('cases/add-to-list/outcomes/step-2-originator', { ref: req.query.ref, id: req.query.id, error: true });
  
  req.session.data['tempOutcome'].originator = originator;

  // Branching Logic
  if (originator === "Inspector") {
    res.redirect(`/cases/outcomes/step-2a?ref=${req.query.ref}&id=${req.query.id || ''}`);
  } else if (originator === "Officer") {
    res.redirect(`/cases/outcomes/step-2b?ref=${req.query.ref}&id=${req.query.id || ''}`);
  } else {
    req.session.data['tempOutcome'].inspectorName = null; 
    req.session.data['tempOutcome'].officerName = null;
    res.redirect(`/cases/outcomes/step-3?ref=${req.query.ref}&id=${req.query.id || ''}`);
  }
});

// --- STEP 2a: Inspector Name ---
router.get('/cases/outcomes/step-2a', (req, res) => {
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce
  
  var id = req.query.id;
  var draftList = req.session.data['tempOutcomesList'] || [];

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    var existingOutcome = draftList.find(o => o.id === id);
    if (existingOutcome) req.session.data['tempOutcome'] = JSON.parse(JSON.stringify(existingOutcome));
  }

  res.render('cases/add-to-list/outcomes/step-2a-inspector', { 
    ref: req.query.ref, id: id, inspectors: c.inspectors || [] 
  });
});

router.post('/cases/outcomes/step-2a', (req, res) => {
  var inspector = req.body.inspectorName;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce
  
  if (!inspector) {
    return res.render('cases/add-to-list/outcomes/step-2a-inspector', { 
      ref: req.query.ref, id: req.query.id, inspectors: c.inspectors || [], 
      errors: { inspectorName: { text: "Select the inspector" } }
    });
  }

  if (!req.session.data['tempOutcome']) req.session.data['tempOutcome'] = {};
  req.session.data['tempOutcome'].inspectorName = inspector;
  req.session.data['tempOutcome'].officerName = null; 
  
  // Safety wipe: if they changed their mind from Secretary of State
  req.session.data['tempOutcome'].decisionOutcome = null;
  req.session.data['tempOutcome'].decisionGrantedConditions = null;
  req.session.data['tempOutcome'].decisionOtherDetails = null;

  // SKIP STEP 3, REDIRECT STRAIGHT TO STEP 4
  res.redirect(`/cases/outcomes/step-4?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// --- STEP 2b: Officer Name ---
router.get('/cases/outcomes/step-2b', (req, res) => {
  var id = req.query.id;
  var draftList = req.session.data['tempOutcomesList'] || [];

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    var existingOutcome = draftList.find(o => o.id === id);
    if (existingOutcome) req.session.data['tempOutcome'] = JSON.parse(JSON.stringify(existingOutcome));
  }

  res.render('cases/add-to-list/outcomes/step-2b-officer', { ref: req.query.ref, id: id }); 
});

router.post('/cases/outcomes/step-2b', (req, res) => {
  var officer = req.body.officerName; 
  if (!officer) {
    return res.render('cases/add-to-list/outcomes/step-2b-officer', { 
      ref: req.query.ref, id: req.query.id, errors: { officerName: { text: "Select the officer" } } 
    });
  }

  if (!req.session.data['tempOutcome']) req.session.data['tempOutcome'] = {};
  req.session.data['tempOutcome'].officerName = officer;
  req.session.data['tempOutcome'].inspectorName = null; 

  // Safety wipe
  req.session.data['tempOutcome'].decisionOutcome = null;
  req.session.data['tempOutcome'].decisionGrantedConditions = null;
  req.session.data['tempOutcome'].decisionOtherDetails = null;

  // SKIP STEP 3, REDIRECT STRAIGHT TO STEP 4
  res.redirect(`/cases/outcomes/step-4?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// --- STEP 3: Outcome ---
router.get('/cases/outcomes/step-3', (req, res) => {
  var id = req.query.id;
  var draftList = req.session.data['tempOutcomesList'] || [];

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    var existingOutcome = draftList.find(o => o.id === id);
    if (existingOutcome) req.session.data['tempOutcome'] = JSON.parse(JSON.stringify(existingOutcome));
  }

  var val = req.session.data['tempOutcome']?.decisionOutcome || "";
  var grantedDetails = req.session.data['tempOutcome']?.decisionGrantedConditions || "";
  var otherDetails = req.session.data['tempOutcome']?.decisionOtherDetails || "";

  res.render('cases/add-to-list/outcomes/step-3-outcome', { 
    ref: req.query.ref, id: id, value: val, grantedDetails: grantedDetails, otherDetails: otherDetails
  });
});

router.post('/cases/outcomes/step-3', (req, res) => {
  var decisionOutcome = req.body.decisionOutcome;
  if (!decisionOutcome) {
    return res.render('cases/add-to-list/outcomes/step-3-outcome', { 
      ref: req.query.ref, id: req.query.id, errors: { decisionOutcome: { text: "Select the outcome" } }
    });
  }

  if (!req.session.data['tempOutcome']) req.session.data['tempOutcome'] = {};
  req.session.data['tempOutcome'].decisionOutcome = decisionOutcome;
  req.session.data['tempOutcome'].decisionGrantedConditions = req.body.decisionGrantedConditions;
  req.session.data['tempOutcome'].decisionOtherDetails = req.body.decisionOtherDetails;
  res.redirect(`/cases/outcomes/step-4?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// --- STEP 4: Outcome Date (REQUIRED) ---
router.get('/cases/outcomes/step-4', (req, res) => {
  var id = req.query.id;
  var draftList = req.session.data['tempOutcomesList'] || [];

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    var existingOutcome = draftList.find(o => o.id === id);
    if (existingOutcome) req.session.data['tempOutcome'] = JSON.parse(JSON.stringify(existingOutcome));
  }

  var tempOutcome = req.session.data['tempOutcome'] || {};
  var outcomeDate = tempOutcome.outcomeDate || {};

  res.render('cases/add-to-list/outcomes/step-4-date', { 
    ref: req.query.ref, id: id, day: outcomeDate.day, month: outcomeDate.month, year: outcomeDate.year
  });
});

router.post('/cases/outcomes/step-4', (req, res) => {
  if (!req.session.data['tempOutcome']) req.session.data['tempOutcome'] = {};

  var result = validateAndSaveDate(req, res, 'outcome', 'Outcome date', req.session.data['tempOutcome'], 'outcomeDate');

  if (result.status === "SUCCESS" || result.status === "REMOVED") {
    return res.redirect(`/cases/outcomes/step-5?ref=${req.query.ref}&id=${req.query.id || ''}`);
  }

  if (result.status === "ERROR") {
    return res.render('cases/add-to-list/outcomes/step-4-date', { 
      ref: req.query.ref, id: req.query.id, 
      day: req.body['outcome-day'], month: req.body['outcome-month'], year: req.body['outcome-year'],
      errorList: result.errorList, errorFields: result.errorFields
    });
  }
});

// --- STEP 5: Received Date (OPTIONAL) & SAVE TO DRAFT ---
router.get('/cases/outcomes/step-5', (req, res) => {
  var id = req.query.id;
  var draftList = req.session.data['tempOutcomesList'] || [];

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    var existingOutcome = draftList.find(o => o.id === id);
    if (existingOutcome) req.session.data['tempOutcome'] = JSON.parse(JSON.stringify(existingOutcome));
  }

  var tempOutcome = req.session.data['tempOutcome'] || {};
  var receivedDate = tempOutcome.receivedDate || {}; 

  res.render('cases/add-to-list/outcomes/step-5-received', { 
    ref: req.query.ref, id: id, day: receivedDate.day, month: receivedDate.month, year: receivedDate.year
  });
});

router.post('/cases/outcomes/step-5', (req, res) => {
  if (!req.session.data['tempOutcome']) req.session.data['tempOutcome'] = {};
  var id = req.query.id;

  var day = req.body['received-day'], month = req.body['received-month'], year = req.body['received-year'];

  if (!day && !month && !year) {
    req.session.data['tempOutcome'].receivedDate = null; 
  } else {
    var result = validateAndSaveDate(req, res, 'received', 'Received date', req.session.data['tempOutcome'], 'receivedDate');
    if (result.status === "ERROR") {
      return res.render('cases/add-to-list/outcomes/step-5-received', { 
        ref: req.query.ref, id: id, day: day, month: month, year: year, errorList: result.errorList, errorFields: result.errorFields
      });
    }
  }

  // --- SAVE TO DRAFT ARRAY ---
  var draftList = req.session.data['tempOutcomesList'] || [];
  var temp = req.session.data['tempOutcome'];

  if (id) {
    var index = draftList.findIndex(i => i.id === id);
    if (index > -1) draftList[index] = { ...temp };
  } else {
    temp.id = id || 'out-' + Date.now();
    draftList.push(temp);
  }

  req.session.data['tempOutcomesList'] = draftList;
  req.session.data['tempOutcome'] = null; 
  res.redirect(`/cases/outcomes/hub?ref=${req.query.ref}`);
});

// ==============================================
// REMOVE OUTCOME (From Draft)
// ==============================================
router.get('/cases/outcomes/remove-confirm', (req, res) => {
  res.render('cases/add-to-list/outcomes/remove-confirm', { 
    ref: req.query.ref, id: req.query.id, 
    backUrl: `/cases/outcomes/hub?ref=${req.query.ref}`, actionUrl: `/cases/outcomes/remove?id=${req.query.id}&ref=${req.query.ref}` 
  });
});

router.post('/cases/outcomes/remove', (req, res) => {
  var ref = req.query.ref, id = req.query.id;
  if (!req.body.confirmRemove) return res.render('cases/add-to-list/outcomes/remove-confirm', { ref: ref, id: id, error: true, backUrl: `/cases/outcomes/hub?ref=${ref}`, actionUrl: `/cases/outcomes/remove?id=${id}&ref=${ref}` });

  if (req.body.confirmRemove === 'yes' && req.session.data['tempOutcomesList']) {
    req.session.data['tempOutcomesList'] = req.session.data['tempOutcomesList'].filter(i => i.id !== id);
  }
  res.redirect(`/cases/outcomes/hub?ref=${ref}`);
});

// ==============================================
// FINAL COMMIT / CANCEL ACTIONS
// ==============================================

// --- COMMIT DRAFT ---
router.post('/cases/outcomes/commit', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  var oldOutcomes = c.outcomes || [];
  var newOutcomes = req.session.data['tempOutcomesList'] || [];

  // SMART AUDIT LOG: Check for REMOVALS & ADDITIONS
  if (typeof addAuditLog === "function") {
    oldOutcomes.forEach(oldItem => {
      let stillExists = newOutcomes.find(newItem => newItem.id === oldItem.id);
      if (!stillExists) {
        let outType = oldItem.type || "Outcome";
        addAuditLog(req, ref, `${outType} removed from overview`);
      }
    });

    newOutcomes.forEach(newItem => {
      let alreadyExisted = oldOutcomes.find(oldItem => oldItem.id === newItem.id);
      if (!alreadyExisted) {
        let outType = newItem.type || "Outcome";
        addAuditLog(req, ref, `${outType} added to overview`);
      }
    });
  }

  // Safely overwrite the database with the draft
  c.outcomes = newOutcomes;
  
  req.session.data['tempOutcomesList'] = null;
  req.session.flashSection = "outcomeOverview"; 
  res.redirect('/cases/case-details?ref=' + ref);
});

// --- CANCEL DRAFT ---
router.get('/cases/outcomes/cancel', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  var originalOutcomes = c.outcomes || [];
  var draftOutcomes = req.session.data['tempOutcomesList'] || [];

  if (JSON.stringify(originalOutcomes) === JSON.stringify(draftOutcomes)) {
    req.session.data['tempOutcomesList'] = null;
    return res.redirect('/cases/case-details?ref=' + ref);
  }
  res.render('cases/add-to-list/outcomes/cancel-outcomes', { ref: ref });
});

router.post('/cases/outcomes/cancel', function(req, res) {
  var ref = req.query.ref;
  if (!req.body.cancelOutcomes) return res.render('cases/add-to-list/outcomes/cancel-outcomes', { ref: ref, error: true });

  if (req.body.cancelOutcomes === 'yes') {
    req.session.data['tempOutcomesList'] = null;
    res.redirect('/cases/case-details?ref=' + ref);
  } else {
    res.redirect('/cases/outcomes/hub?ref=' + ref);
  }
});
const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// Use ../../ to go up two folders (from /sub-routes/add-to-list/ to /app/)
const { getCase, addAuditLog } = require('../../helpers');

// ==============================================================================
// OVERVIEW PROCEDURES FLOW (Working Draft Array Pattern)
// ==============================================================================

// --- 00. CATCH OLD LINKS / AUTO-ROUTER ---
router.get('/cases/overview-procedures/check', (req, res) => {
  res.redirect('/cases/overview-procedures/hub?ref=' + req.query.ref);
});

// --- 0. START PAGE: Empty State ---
router.get('/cases/overview-procedures/start', (req, res) => {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  req.session.data['tempOverviewProcsList'] = [];
  res.render('cases/add-to-list/overview-procedures/check-procedures-first', { ref: ref });
});

// --- 1. HUB PAGE: Check Procedures ---
router.get('/cases/overview-procedures/hub', (req, res) => {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  if (!c.overviewProcedures) { c.overviewProcedures = []; }

  // Clone real data to start working if no draft exists
  if (!req.session.data['tempOverviewProcsList']) {
    req.session.data['tempOverviewProcsList'] = JSON.parse(JSON.stringify(c.overviewProcedures));
  }

  delete req.session.data['tempProc']; // Clear temp item

  res.render('cases/add-to-list/overview-procedures/check-procedures', { 
    ref: ref,
    procList: req.session.data['tempOverviewProcsList']
  });
});

// --- 2. STEP 1: Select Type ---
router.get('/cases/overview-procedures/step-1', (req, res) => {
  var ref = req.query.ref;
  var id = req.query.id;
  var draftList = req.session.data['tempOverviewProcsList'] || [];
  
  if (id && (!req.session.data['tempProc'] || req.session.data['tempProc'].id !== id)) {
    var item = draftList.find(i => i.id === id);
    if (item) {
      req.session.data['tempProc'] = JSON.parse(JSON.stringify(item));
    }
  } else if (!id && !req.session.data['tempProc']) {
    req.session.data['tempProc'] = {}; 
  }
  
  // Dynamic back link logic
  var backUrl = (draftList.length > 0) ? `/cases/overview-procedures/hub?ref=${ref}` : `/cases/overview-procedures/start?ref=${ref}`;

  res.render('cases/add-to-list/overview-procedures/step-1-type', { 
    ref: ref, id: id || "", value: req.session.data['tempProc'].type || "", backUrl: backUrl
  });
});

router.post('/cases/overview-procedures/step-1', (req, res) => {
  var type = req.body.procType;
  var ref = req.query.ref;
  var id = req.query.id;
  
  var draftList = req.session.data['tempOverviewProcsList'] || [];
  var backUrl = (draftList.length > 0) ? `/cases/overview-procedures/hub?ref=${ref}` : `/cases/overview-procedures/start?ref=${ref}`;
  
  if (!type) {
    return res.render('cases/add-to-list/overview-procedures/step-1-type', { ref: ref, id: id, error: true, backUrl: backUrl });
  }

  if (!req.session.data['tempProc']) req.session.data['tempProc'] = {};
  
  // Data wipe on type change
  var oldType = req.session.data['tempProc'].type;
  if (oldType && oldType !== type) {
    req.session.data['tempProc'] = { id: req.session.data['tempProc'].id };
  }

  req.session.data['tempProc'].type = type;

  // Branching Logic
  if (type === "Admin" || type === "Admin (In house)") {
    res.redirect(`/cases/overview-procedures/step-2a?ref=${ref}&id=${id || ''}`);
  } else if (type === "Site visit") {
    res.redirect(`/cases/overview-procedures/step-2b?ref=${ref}&id=${id || ''}`);
  } else {
    res.redirect(`/cases/overview-procedures/step-2c?ref=${ref}&id=${id || ''}`);
  }
});

// --- 3a. STEP 2: Admin Type ---
router.get('/cases/overview-procedures/step-2a', (req, res) => {
  var val = req.session.data['tempProc']?.adminType || "";
  res.render('cases/add-to-list/overview-procedures/step-2a-admin', { ref: req.query.ref, id: req.query.id, value: val });
});

router.post('/cases/overview-procedures/step-2a', (req, res) => {
  if (!req.body.adminType) return res.render('cases/add-to-list/overview-procedures/step-2a-admin', { ref: req.query.ref, id: req.query.id, error: true });
  req.session.data['tempProc'].adminType = req.body.adminType;
  res.redirect(`/cases/overview-procedures/step-2c?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// --- 3b. STEP 2: Site Visit Type ---
router.get('/cases/overview-procedures/step-2b', (req, res) => {
  var val = req.session.data['tempProc']?.siteVisitType || "";
  res.render('cases/add-to-list/overview-procedures/step-2b-site-visit', { ref: req.query.ref, id: req.query.id, value: val });
});

router.post('/cases/overview-procedures/step-2b', (req, res) => {
  if (!req.body.siteVisitType) return res.render('cases/add-to-list/overview-procedures/step-2b-site-visit', { ref: req.query.ref, id: req.query.id, error: true });
  req.session.data['tempProc'].siteVisitType = req.body.siteVisitType;
  res.redirect(`/cases/overview-procedures/step-2c?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// --- 3c. STEP 2: Inspector Allocation ---
router.get('/cases/overview-procedures/step-2c', (req, res) => {
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  var val = req.session.data['tempProc']?.inspector || "";
  res.render('cases/add-to-list/overview-procedures/step-2c-inspector', { ref: req.query.ref, id: req.query.id, value: val, inspectors: c.inspectors || [] });
});

router.post('/cases/overview-procedures/step-2c', (req, res) => {
  req.session.data['tempProc'].inspector = req.body.inspectorName || "";
  res.redirect(`/cases/overview-procedures/step-3?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// --- 4. STEP 3: Status & Save to Draft ---
router.get('/cases/overview-procedures/step-3', (req, res) => {
  var val = req.session.data['tempProc']?.status || "";
  res.render('cases/add-to-list/overview-procedures/step-3-status', { ref: req.query.ref, id: req.query.id, value: val });
});

router.post('/cases/overview-procedures/step-3', (req, res) => {
  var ref = req.query.ref;
  var id = req.query.id;
  var status = req.body.procStatus;

  if (!status) return res.render('cases/add-to-list/overview-procedures/step-3-status', { ref: ref, id: id, error: true });

  var draftList = req.session.data['tempOverviewProcsList'] || [];
  var temp = req.session.data['tempProc'];
  temp.status = status;

  if (id) {
    var index = draftList.findIndex(i => i.id === id);
    if (index > -1) draftList[index] = { ...temp };
  } else {
    temp.id = id || 'proc-' + Date.now();
    draftList.push(temp);
  }

  req.session.data['tempOverviewProcsList'] = draftList;
  req.session.data['tempProc'] = null; // Clean up
  res.redirect(`/cases/overview-procedures/hub?ref=${ref}`);
});

// ==============================================
// LEAVE TO INSPECTORS (Escape Hatch from Step 2c)
// ==============================================
router.get('/cases/overview-procedures/leave-to-inspectors', function(req, res) {
  res.render('cases/add-to-list/overview-procedures/leave-to-inspectors', { 
    ref: req.query.ref, 
    id: req.query.id 
  });
});

router.post('/cases/overview-procedures/leave-to-inspectors', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var confirm = req.body.leaveToInspectors;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  if (!confirm) {
    return res.render('cases/add-to-list/overview-procedures/leave-to-inspectors', { 
      ref: ref, id: id, error: true 
    });
  }

  if (confirm === 'yes') {
    // 1. Trash the unsaved procedure drafts!
    req.session.data['tempOverviewProcsList'] = null;
    req.session.data['tempProc'] = null;

    // 2. Check if inspectors exist in the case data
    var hasInspectors = c.inspectors && c.inspectors.length > 0;
    
    // 3. Dynamically route to the right inspectors hub/start page
    var targetUrl = hasInspectors 
      ? `/cases/inspectors/check-inspectors?ref=${ref}` 
      : `/cases/inspectors/check-inspectors-first?ref=${ref}`;

    res.redirect(targetUrl);
  } else {
    // If they clicked No, bounce them right back to where they were in Step 2c
    res.redirect(`/cases/overview-procedures/step-2c?ref=${ref}&id=${id}`);
  }
});

// ==============================================
// REMOVE (From Draft)
// ==============================================
router.get('/cases/overview-procedures/remove-confirm', (req, res) => {
  res.render('cases/add-to-list/overview-procedures/remove-confirm', { 
    ref: req.query.ref, id: req.query.id,
    backUrl: `/cases/overview-procedures/hub?ref=${req.query.ref}`,
    actionUrl: `/cases/overview-procedures/remove?id=${req.query.id}&ref=${req.query.ref}`
  });
});

router.post('/cases/overview-procedures/remove', (req, res) => {
  var ref = req.query.ref;
  var id = req.query.id;
  if (!req.body.confirmRemove) return res.render('cases/add-to-list/overview-procedures/remove-confirm', { ref: ref, id: id, error: true, backUrl: `/cases/overview-procedures/hub?ref=${ref}`, actionUrl: `/cases/overview-procedures/remove?id=${id}&ref=${ref}` });

  if (req.body.confirmRemove === 'yes' && req.session.data['tempOverviewProcsList']) {
    req.session.data['tempOverviewProcsList'] = req.session.data['tempOverviewProcsList'].filter(i => i.id !== id);
  }
  res.redirect(`/cases/overview-procedures/hub?ref=${ref}`);
});

// ==============================================
// FINAL COMMIT / CANCEL ACTIONS
// ==============================================

router.post('/cases/overview-procedures/commit', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  var oldProcs = c.overviewProcedures || [];
  var newProcs = req.session.data['tempOverviewProcsList'] || [];

  // 1. SMART AUDIT LOG: Check for REMOVALS
  if (typeof addAuditLog === "function") {
    oldProcs.forEach(oldItem => {
      let stillExists = newProcs.find(newItem => newItem.id === oldItem.id);
      if (!stillExists) {
        let procType = oldItem.type || "Procedure";
        addAuditLog(req, ref, `${procType} removed from overview`);
      }
    });

    // 2. SMART AUDIT LOG: Check for ADDITIONS
    newProcs.forEach(newItem => {
      let alreadyExisted = oldProcs.find(oldItem => oldItem.id === newItem.id);
      if (!alreadyExisted) {
        let procType = newItem.type || "Procedure";
        addAuditLog(req, ref, `${procType} added to overview`);
      }
    });
  }

  // Safely overwrite the database with the draft
  c.overviewProcedures = newProcs;
  
  req.session.data['tempOverviewProcsList'] = null;
  req.session.flashSection = "overview"; 
  res.redirect('/cases/case-details?ref=' + ref);
});

// CANCEL DRAFT
router.get('/cases/overview-procedures/cancel', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  var originalProcs = c.overviewProcedures || [];
  var draftProcs = req.session.data['tempOverviewProcsList'] || [];

  if (JSON.stringify(originalProcs) === JSON.stringify(draftProcs)) {
    req.session.data['tempOverviewProcsList'] = null;
    return res.redirect('/cases/case-details?ref=' + ref);
  }
  res.render('cases/add-to-list/overview-procedures/cancel-procedures', { ref: ref });
});

router.post('/cases/overview-procedures/cancel', function(req, res) {
  var ref = req.query.ref;
  if (!req.body.cancelProcedures) return res.render('cases/add-to-list/overview-procedures/cancel-procedures', { ref: ref, error: true });

  if (req.body.cancelProcedures === 'yes') {
    req.session.data['tempOverviewProcsList'] = null;
    res.redirect('/cases/case-details?ref=' + ref);
  } else {
    res.redirect('/cases/overview-procedures/hub?ref=' + ref);
  }
});
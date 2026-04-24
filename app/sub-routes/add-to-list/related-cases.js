const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// Import the shared helper
const { getCase } = require('../../helpers');

// ==============================================================================
// RELATED CASES LOGIC (Working Draft Pattern)
// ==============================================================================

// 0. Empty State Page: Check First
router.get('/cases/related-cases/start', function(req, res) {
  var ref = req.query.ref;
  var myCase = getCase(req);
  if (!myCase) return res.redirect('/cases/all-cases');

  // Initialize a blank draft
  req.session.data['tempRelatedCasesList'] = [];

  res.render('cases/add-to-list/related-cases/check-related-cases-first', { ref: ref });
});

// 1. SHOW THE LIST PAGE (Hub)
router.get('/cases/related-cases/hub', function (req, res) {
  var ref = req.query.ref;
  var myCase = getCase(req);
  if (!myCase.relatedCases) { myCase.relatedCases = []; }

  // Clone real data to start working if no draft exists
  if (!req.session.data['tempRelatedCasesList']) {
    req.session.data['tempRelatedCasesList'] = JSON.parse(JSON.stringify(myCase.relatedCases));
  }

  res.render('cases/add-to-list/related-cases/check-related-cases', { 
    ref: ref,
    relatedCases: req.session.data['tempRelatedCasesList'] // Pass the DRAFT
  });
});

// 2. STEP 1: SHOW INPUT (Reference)
router.get('/cases/related-cases/step-1', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var draftList = req.session.data['tempRelatedCasesList'] || [];
  var value = "";

  if (id) {
    var item = draftList.find(i => i.id === id);
    if (item) value = item.reference;
  }

  var backUrl = (draftList.length > 0) 
    ? `/cases/related-cases/hub?ref=${ref}` 
    : `/cases/related-cases/start?ref=${ref}`;

  res.render('cases/add-to-list/related-cases/related-case-input', { 
    ref: ref, id: id, value: value, error: false, backUrl: backUrl
  });
});

// 3. STEP 1: VALIDATE & SAVE DIRECTLY TO DRAFT
router.post('/cases/related-cases/step-1', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var val = req.body.relatedCaseRef;
  
  var draftList = req.session.data['tempRelatedCasesList'] || [];

  if (!val || val.trim() === "") {
    var backUrl = (draftList.length > 0) ? `/cases/related-cases/hub?ref=${ref}` : `/cases/related-cases/start?ref=${ref}`;
    return res.render('cases/add-to-list/related-cases/related-case-input', {
      ref: ref, id: id, value: val, error: true, errorMessage: { text: "Enter related case reference" }, backUrl: backUrl
    });
  }

  // Because there is only 1 step, we save straight to the draft array!
  var newItem = {
    id: id || 'rc-' + Math.floor(Math.random() * 10000),
    reference: val 
  };

  var idx = draftList.findIndex(i => i.id === id);
  if (idx >= 0) draftList[idx] = newItem;
  else draftList.push(newItem);

  req.session.data['tempRelatedCasesList'] = draftList;
  
  // Instantly return to hub
  res.redirect(`/cases/related-cases/hub?ref=${ref}`);
});

// ==============================================
// REMOVE RELATED CASE (From Draft)
// ==============================================
router.get('/cases/related-cases/remove', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  res.render('cases/add-to-list/related-cases/remove-related-cases', { 
    ref: ref, id: id, backUrl: `/cases/related-cases/hub?ref=${ref}`, actionUrl: `/cases/related-cases/remove?id=${id}&ref=${ref}`
  });
});

router.post('/cases/related-cases/remove', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var confirm = req.body.relatedCaseRemove;

  if (!confirm) {
    return res.render('cases/add-to-list/related-cases/remove-related-cases', { 
      ref: ref, id: id, error: true, backUrl: `/cases/related-cases/hub?ref=${ref}`, actionUrl: `/cases/related-cases/remove?id=${id}&ref=${ref}`
    });
  }

  if (confirm === 'yes') {
    if (req.session.data['tempRelatedCasesList']) {
      req.session.data['tempRelatedCasesList'] = req.session.data['tempRelatedCasesList'].filter(i => i.id !== id);
    }
  }
  res.redirect(`/cases/related-cases/hub?ref=${ref}`);
});

// ==============================================
// FINAL COMMIT / CANCEL ACTIONS
// ==============================================

// COMMIT DRAFT: Final Save to Case Details
router.post('/cases/related-cases/commit', function(req, res) {
  var ref = req.query.ref;
  var myCase = getCase(req);

  if (myCase) {
    myCase.relatedCases = req.session.data['tempRelatedCasesList'] || [];
  }
  
  req.session.data['tempRelatedCasesList'] = null;
  req.session.flashSection = "overview"; 
  res.redirect('/cases/case-details?ref=' + ref);
});

// CANCEL DRAFT: Smart Check
router.get('/cases/related-cases/cancel', function(req, res) {
  var ref = req.query.ref;
  var myCase = getCase(req);

  var originalRelated = myCase.relatedCases || [];
  var draftRelated = req.session.data['tempRelatedCasesList'] || [];

  if (JSON.stringify(originalRelated) === JSON.stringify(draftRelated)) {
    req.session.data['tempRelatedCasesList'] = null;
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  res.render('cases/add-to-list/related-cases/cancel-related-cases', { ref: ref });
});

// CANCEL DRAFT: Process Warning Page
router.post('/cases/related-cases/cancel', function(req, res) {
  var ref = req.query.ref;
  var confirm = req.body.cancelRelatedCases;

  if (!confirm) {
    return res.render('cases/add-to-list/related-cases/cancel-related-cases', { ref: ref, error: true });
  }

  if (confirm === 'yes') {
    req.session.data['tempRelatedCasesList'] = null;
    res.redirect('/cases/case-details?ref=' + ref);
  } else {
    res.redirect('/cases/related-cases/hub?ref=' + ref);
  }
});
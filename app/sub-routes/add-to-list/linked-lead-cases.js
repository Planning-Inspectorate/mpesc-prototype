const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// Import the shared helpers
const { getCase, addAuditLog } = require('../../helpers');

// ==============================================================================
// 1. LEAD CASE SELECTION (Overview Card Flow)
// ==============================================================================

router.get('/cases/linked-cases/lead-case-question', function (req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Figure out what should be pre-selected
  var leadCaseType = "";
  var leadCaseSelection = "";

  if (c.isLinked === false) {
    leadCaseType = "not-linked";
  } else if (c.leadCase === ref) {
    leadCaseType = "current-case";
  } else if (c.leadCase) {
    leadCaseType = "linked-case";
    leadCaseSelection = c.leadCase;
  }

  res.render('cases/add-to-list/linked-cases/lead-case-question', {
    ref: ref,
    linkedCases: c.linkedCases || [],
    leadCaseType: leadCaseType,
    leadCaseSelection: leadCaseSelection
  });
});

router.post('/cases/linked-cases/lead-case-question', function (req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  var leadCaseType = req.body.leadCaseType;
  var leadCaseSelection = req.body.leadCaseSelection;

  // --- VALIDATION ---
  if (!leadCaseType) {
    return res.render('cases/add-to-list/linked-cases/lead-case-question', {
      ref: ref, linkedCases: c.linkedCases || [],
      errorLeadCase: "Select which is the lead case"
    });
  }

  if (leadCaseType === 'linked-case' && !leadCaseSelection) {
    return res.render('cases/add-to-list/linked-cases/lead-case-question', {
      ref: ref, linkedCases: c.linkedCases || [], leadCaseType: leadCaseType,
      errorLeadCaseSelection: "Select the lead case reference from the list"
    });
  }

  // --- SAVE THE DATA ---
  if (leadCaseType === 'not-linked') {
    c.isLinked = false;
    c.leadCase = null;
  }
  else if (leadCaseType === 'current-case') {
    c.isLinked = true;
    c.leadCase = ref;
  }
  else if (leadCaseType === 'linked-case') {
    c.isLinked = true;
    c.leadCase = leadCaseSelection;
  }

  // Trigger the green success banner on case details
  req.session.flashSection = "overview";
  if (typeof addAuditLog === "function") {
    addAuditLog(req, ref, "Lead case updated");
  }

  res.redirect('/cases/case-details?ref=' + ref);
});


// ==============================================================================
// 2. LINKED CASES LIST (Working Draft Pattern)
// ==============================================================================

// --- 0. Empty State Page: Check First ---
router.get('/cases/linked-cases/start', function (req, res) {
  var ref = req.query.ref;
  var myCase = getCase(req);
  if (!myCase) return res.redirect('/cases/all-cases');

  // Initialize empty draft
  req.session.data['tempLinkedCasesList'] = [];

  res.render('cases/add-to-list/linked-cases/check-linked-cases-first', { ref: ref });
});

// --- 1. SHOW THE LIST PAGE (Hub) ---
router.get('/cases/linked-cases/hub', function (req, res) {
  var ref = req.query.ref;
  var myCase = getCase(req);
  if (!myCase) return res.redirect('/cases/all-cases');
  if (!myCase.linkedCases) { myCase.linkedCases = []; }

  // Clone real data to start working if no draft exists
  if (!req.session.data['tempLinkedCasesList']) {
    req.session.data['tempLinkedCasesList'] = (myCase.linkedCases || []).map(item => ({
      id: item.id || 'lc-' + Math.floor(Math.random() * 10000),
      reference: item.reference,
      isLeadCase: item.reference === myCase.leadCase
    }));
  }

  res.render('cases/add-to-list/linked-cases/check-linked-cases', {
    ref: ref,
    linkedCases: req.session.data['tempLinkedCasesList']
  });
});

// --- 2. ADD / EDIT LINKED CASE (Multi-Step) ---
router.get('/cases/linked-cases/step-1', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var draftList = req.session.data['tempLinkedCasesList'] || [];

  if (!req.session.data['tempLinkedCase'] || req.session.data['tempLinkedCase'].id !== id) {
    if (id) {
      var existingItem = draftList.find(i => i.id === id);
      req.session.data['tempLinkedCase'] = existingItem ? JSON.parse(JSON.stringify(existingItem)) : { id: id };
    } else {
      req.session.data['tempLinkedCase'] = { id: null, reference: '', isLeadCase: null };
    }
  }

  var backUrl = (draftList.length > 0)
    ? `/cases/linked-cases/hub?ref=${ref}`
    : `/cases/linked-cases/start?ref=${ref}`;

  var validReferences = (req.session.data['cases'] || [])
    .map(c => c.reference)
    .filter(Boolean)
    .sort();

  res.render('cases/add-to-list/linked-cases/linked-case-input', {
    ref: ref,
    id: id,
    value: req.session.data['tempLinkedCase'].reference || '',
    error: false,
    backUrl: backUrl,
    caseReferences: JSON.stringify(validReferences)
  });
});

router.post('/cases/linked-cases/step-1', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var val = req.body.linkedCaseRef;
  var draftList = req.session.data['tempLinkedCasesList'] || [];
  var backUrl = (draftList.length > 0)
    ? `/cases/linked-cases/hub?ref=${ref}`
    : `/cases/linked-cases/start?ref=${ref}`;

  if (!req.session.data['tempLinkedCase']) {
    req.session.data['tempLinkedCase'] = { id: id || null, reference: '', isLeadCase: false };
  }

  if (!val || val.trim() === "") {
    return res.render('cases/add-to-list/linked-cases/linked-case-input', {
      ref: ref,
      id: id,
      value: val,
      error: true,
      errorMessage: { text: "Enter linked case reference" },
      backUrl: backUrl,
      caseReferences: JSON.stringify((req.session.data['cases'] || []).map(c => c.reference).filter(Boolean).sort())
    });
  }

  req.session.data['tempLinkedCase'].reference = val.trim();
  req.session.data['tempLinkedCase'].id = id || req.session.data['tempLinkedCase'].id;

  res.redirect(`/cases/linked-cases/step-2?ref=${ref}&id=${id || ''}`);
});

router.get('/cases/linked-cases/step-2', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var draftList = req.session.data['tempLinkedCasesList'] || [];
  var temp = req.session.data['tempLinkedCase'] || { id: id || null, reference: '', isLeadCase: false };

  var backUrl = (draftList.length > 0)
    ? `/cases/linked-cases/hub?ref=${ref}`
    : `/cases/linked-cases/start?ref=${ref}`;

  var selectedLeadValue = (typeof temp.isLeadCase === 'boolean')
    ? (temp.isLeadCase ? 'yes' : 'no')
    : null;

  res.render('cases/add-to-list/linked-cases/linked-case-lead-question', {
    ref: ref,
    id: id,
    backUrl: backUrl,
    selectedLeadValue: selectedLeadValue
  });
});

router.post('/cases/linked-cases/step-2', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var leadSelection = req.body.isLeadCase;
  var draftList = req.session.data['tempLinkedCasesList'] || [];
  var temp = req.session.data['tempLinkedCase'] || { id: id || null, reference: '', isLeadCase: false };

  if (!leadSelection) {
    var selectedLeadValue = (typeof temp.isLeadCase === 'boolean')
      ? (temp.isLeadCase ? 'yes' : 'no')
      : null;

    return res.render('cases/add-to-list/linked-cases/linked-case-lead-question', {
      ref: ref,
      id: id,
      backUrl: (draftList.length > 0) ? `/cases/linked-cases/hub?ref=${ref}` : `/cases/linked-cases/start?ref=${ref}`,
      errorIsLeadCase: "Select whether this case is the lead case",
      selectedLeadValue: selectedLeadValue
    });
  }

  temp.isLeadCase = leadSelection === 'yes';
  temp.id = temp.id || ('lc-' + Math.floor(Math.random() * 10000));

  if (id) {
    var idx = draftList.findIndex(i => i.id === id);
    if (idx >= 0) {
      draftList[idx] = { id: temp.id, reference: temp.reference, isLeadCase: temp.isLeadCase };
    } else {
      draftList.push({ id: temp.id, reference: temp.reference, isLeadCase: temp.isLeadCase });
    }
  } else {
    draftList.push({ id: temp.id, reference: temp.reference, isLeadCase: temp.isLeadCase });
  }

  req.session.data['tempLinkedCasesList'] = draftList;
  req.session.data['tempLinkedCase'] = null;

  res.redirect(`/cases/linked-cases/hub?ref=${ref}`);
});


// --- 3. REMOVE LINKED CASE (From Draft) ---
router.get('/cases/linked-cases/remove', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  res.render('cases/add-to-list/linked-cases/remove-linked-cases', {
    ref: ref, id: id, backUrl: `/cases/linked-cases/hub?ref=${ref}`, actionUrl: `/cases/linked-cases/remove?id=${id}&ref=${ref}`
  });
});

router.post('/cases/linked-cases/remove', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var confirm = req.body.linkedCaseRemove;

  if (!confirm) {
    return res.render('cases/add-to-list/linked-cases/remove-linked-cases', {
      ref: ref, id: id, error: true, backUrl: `/cases/linked-cases/hub?ref=${ref}`, actionUrl: `/cases/linked-cases/remove?id=${id}&ref=${ref}`
    });
  }

  if (confirm === 'yes' && req.session.data['tempLinkedCasesList']) {
    req.session.data['tempLinkedCasesList'] = req.session.data['tempLinkedCasesList'].filter(i => i.id !== id);
  }
  res.redirect(`/cases/linked-cases/hub?ref=${ref}`);
});


// ==============================================================================
// 3. FINAL COMMIT / CANCEL ACTIONS
// ==============================================================================

// COMMIT DRAFT: Final Save & Reciprocal Updates
router.post('/cases/linked-cases/commit', function (req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var myCase = cases.find(c => c.reference === ref);

  if (myCase) {
    let draftLinked = req.session.data['tempLinkedCasesList'] || [];
    let leadCount = draftLinked.filter(lc => lc.isLeadCase).length;

    if (leadCount > 1) {
      return res.render('cases/add-to-list/linked-cases/check-linked-cases', {
        ref: ref,
        linkedCases: draftLinked,
        error: true,
        errorMessage: { text: "You cannot save with more than 1 lead case" }
      });
    }

    let currentLead = myCase.leadCase || null;
    if (leadCount === 1) {
      currentLead = draftLinked.find(lc => lc.isLeadCase).reference;
    }

    // 1. Identify all case references in this new "group" (Current case + Draft cases)
    let groupReferences = [ref, ...draftLinked.map(lc => lc.reference)];

    // 2. Identify cases that were just REMOVED from the link group (Orphans)
    let originalLinkedRefs = (myCase.linkedCases || []).map(lc => lc.reference);
    let removedRefs = originalLinkedRefs.filter(oldRef => !draftLinked.find(newRef => newRef.reference === oldRef));

    // 3. Loop through the master case database and apply the reciprocal updates!
    cases.forEach(c => {

      // A. Update the active group members
      if (groupReferences.includes(c.reference)) {
        // Share the lead case across the whole group
        c.leadCase = currentLead;

        // Populate their linked cases array with everyone in the group EXCEPT themselves
        c.linkedCases = groupReferences
          .filter(groupRef => groupRef !== c.reference)
          .map(groupRef => ({
            id: 'lc-' + Math.floor(Math.random() * 10000),
            reference: groupRef
          }));
      }

      // B. Wipe the data for any cases that were just removed from the group
      if (removedRefs.includes(c.reference)) {
        c.leadCase = null;
        c.linkedCases = [];
      }

    });
  }

  // Clear the draft environment
  req.session.data['tempLinkedCasesList'] = null;

  // Trigger success banner and redirect
  req.session.flashSection = "overview";
  if (typeof addAuditLog === "function") {
    addAuditLog(req, ref, "Linked cases updated");
  }
  res.redirect('/cases/case-details?ref=' + ref);
});

// CANCEL DRAFT: Smart Check
router.get('/cases/linked-cases/cancel', function (req, res) {
  var ref = req.query.ref;
  var myCase = getCase(req);

  var originalLinked = myCase.linkedCases || [];
  var draftLinked = req.session.data['tempLinkedCasesList'] || [];

  // Check if they changed the array
  if (JSON.stringify(originalLinked) === JSON.stringify(draftLinked)) {
    req.session.data['tempLinkedCasesList'] = null;
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  res.render('cases/add-to-list/linked-cases/cancel-linked-cases', { ref: ref });
});

// CANCEL DRAFT: Process Warning Page
router.post('/cases/linked-cases/cancel', function (req, res) {
  var ref = req.query.ref;
  if (!req.body.cancelLinkedCases) return res.render('cases/add-to-list/linked-cases/cancel-linked-cases', { ref: ref, error: true });

  if (req.body.cancelLinkedCases === 'yes') {
    req.session.data['tempLinkedCasesList'] = null;
    res.redirect('/cases/case-details?ref=' + ref);
  } else {
    res.redirect('/cases/linked-cases/hub?ref=' + ref);
  }
});
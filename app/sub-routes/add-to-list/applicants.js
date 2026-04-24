const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// Import the shared helpers using ../../
const { getCase, validateAndSaveAddress, addAuditLog } = require('../../helpers');

// ==============================================================================
// APPLICANTS (Working Draft Array Pattern)
// ==============================================================================

// --- 0. Empty State Page: Check Applicants First ---
router.get('/cases/applicants/start', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  req.session.data['tempApplicantsList'] = [];
  res.render('cases/add-to-list/applicants/check-applicants-first', { ref: ref });
});

// --- 1. HUB PAGE: Check Applicants ---
router.get('/cases/applicants/hub', function (req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  if (!c.applicants) { c.applicants = []; }
  
  if (!req.session.data['tempApplicantsList']) {
    req.session.data['tempApplicantsList'] = JSON.parse(JSON.stringify(c.applicants));
  }
  
  delete req.session.data['tempApplicant']; // Clear temp item
  
  res.render('cases/add-to-list/applicants/check-applicants', { ref: ref, applicants: req.session.data['tempApplicantsList'] });
});

// --- 2. STEP 1: APPLICANT NAME ---
router.get('/cases/applicants/applicant-name', (req, res) => {
  let ref = req.query.ref;
  let id = req.query.id;
  let draftList = req.session.data['tempApplicantsList'] || [];

  // Hydrate temp data if editing an existing draft item
  if (id && (!req.session.data['tempApplicant'] || req.session.data['tempApplicant'].id !== id)) {
    let existingApp = draftList.find(a => a.id === id);
    if (existingApp) req.session.data['tempApplicant'] = JSON.parse(JSON.stringify(existingApp));
  } else if (!id && !req.session.data['tempApplicant']) {
    req.session.data['tempApplicant'] = {};
  }

  let backUrl = (draftList.length > 0) ? `/cases/applicants/hub?ref=${ref}` : `/cases/applicants/start?ref=${ref}`;
  res.render('cases/add-to-list/applicants/applicant-name', { ref: ref, id: id, val: req.session.data['tempApplicant'] || {}, editMode: true, backUrl: backUrl });
});

router.post('/cases/applicants/applicant-name', (req, res) => {
  let ref = req.query.ref;
  let id = req.query.id;
  let first = req.body.firstName || "";
  let last = req.body.lastName || "";
  let company = req.body.companyName || "";
  let errors = {};
  let errorList = [];

  if (!first && !last && !company) {
    let err = { text: "Enter at least one of first name, last name or company name", href: "#firstName" };
    errors.general = err; errorList.push(err);
  }
  if (first.length > 250) {
    let err = { text: "First name must be less than 250 characters", href: "#firstName" };
    errors.firstName = err; errorList.push(err);
  }
  if (last.length > 250) {
    let err = { text: "Last name must be less than 250 characters", href: "#lastName" };
    errors.lastName = err; errorList.push(err);
  }
  if (company.length > 250) {
    let err = { text: "Company name must be less than 250 characters", href: "#companyName" };
    errors.companyName = err; errorList.push(err);
  }

  if (errorList.length > 0) {
    let draftList = req.session.data['tempApplicantsList'] || [];
    let backUrl = (draftList.length > 0) ? `/cases/applicants/hub?ref=${ref}` : `/cases/applicants/start?ref=${ref}`;
    return res.render('cases/add-to-list/applicants/applicant-name', { ref: ref, id: id, val: { firstName: first, lastName: last, companyName: company }, errors: errors, errorList: errorList, editMode: true, backUrl: backUrl });
  }

  if (!req.session.data['tempApplicant']) req.session.data['tempApplicant'] = {};
  req.session.data['tempApplicant'].firstName = first;
  req.session.data['tempApplicant'].lastName = last;
  req.session.data['tempApplicant'].companyName = company;

  res.redirect(`/cases/applicants/applicant-address?ref=${ref}&id=${id || ''}`);
});

// --- 3. STEP 2: APPLICANT ADDRESS ---
router.get('/cases/applicants/applicant-address', (req, res) => {
  let ref = req.query.ref;
  let id = req.query.id || '';
  let temp = req.session.data['tempApplicant'] || {};
  res.render('cases/add-to-list/applicants/applicant-address', { ref: ref, id: id, val: temp, address: temp.address || {}, editMode: true, backUrl: `/cases/applicants/applicant-name?ref=${ref}&id=${id}` });
});

router.post('/cases/applicants/applicant-address', (req, res) => {
  let ref = req.query.ref;
  let id = req.query.id;
  var result = validateAndSaveAddress(req, res, 'applicant', 'Applicant address', req.session.data['tempApplicant'], 'address');

  if (result.status === "ERROR") {
    return res.render('cases/add-to-list/applicants/applicant-address', { ref: ref, id: id, val: req.session.data['tempApplicant'], address: { line1: req.body['applicant-line1'], line2: req.body['applicant-line2'], town: req.body['applicant-town'], county: req.body['applicant-county'], postcode: req.body['applicant-postcode'] }, errorList: result.errorList, errorFields: result.errorFields, editMode: true, backUrl: `/cases/applicants/applicant-name?ref=${ref}&id=${id || ''}` });
  }
  res.redirect(`/cases/applicants/applicant-contact?ref=${ref}&id=${id || ''}`);
});

// --- 4. STEP 3: APPLICANT CONTACT ---
router.get('/cases/applicants/applicant-contact', (req, res) => {
  let ref = req.query.ref;
  let id = req.query.id || '';
  res.render('cases/add-to-list/applicants/applicant-contact', { ref: ref, id: id, val: req.session.data['tempApplicant'] || {}, editMode: true, backUrl: `/cases/applicants/applicant-address?ref=${ref}&id=${id}` });
});

router.post('/cases/applicants/applicant-contact', (req, res) => {
  let ref = req.query.ref;
  let id = req.query.id;
  let email = req.body.email || "";
  let phone = req.body.phone || "";
  let errors = {};
  let errorList = [];

  if (email.length > 250) { let err = { text: "Email must be less than 250 characters", href: "#email" }; errors.email = err; errorList.push(err); }
  if (phone.length > 15) { let err = { text: "Phone number must be less than 15 characters", href: "#phone" }; errors.phone = err; errorList.push(err); }

  if (errorList.length > 0) {
    return res.render('cases/add-to-list/applicants/applicant-contact', { ref: ref, id: id, val: { email: email, phone: phone }, errors: errors, errorList: errorList, editMode: true, backUrl: `/cases/applicants/applicant-address?ref=${ref}&id=${id || ''}` });
  }
  
  if (!req.session.data['tempApplicant']) req.session.data['tempApplicant'] = {};
  req.session.data['tempApplicant'].email = email;
  req.session.data['tempApplicant'].phone = phone;

  let draftList = req.session.data['tempApplicantsList'] || [];
  let completedApplicant = req.session.data['tempApplicant'];

  // Update existing or push new
  if (id) {
    let index = draftList.findIndex(a => a.id === id);
    if (index > -1) draftList[index] = { ...completedApplicant };
  } else {
    completedApplicant.id = id || 'app-' + Date.now();
    draftList.push(completedApplicant);
  }

  req.session.data['tempApplicantsList'] = draftList;
  req.session.data['tempApplicant'] = null; 
  res.redirect(`/cases/applicants/hub?ref=${ref}`);
});

// --- 5. REMOVE APPLICANT (From Draft) ---
router.get('/cases/applicants/remove', (req, res) => {
  let id = req.query.id;
  let ref = req.query.ref;
  res.render('cases/add-to-list/applicants/applicant-remove', { id: id, ref: ref, backUrl: `/cases/applicants/hub?ref=${ref}`, actionUrl: `/cases/applicants/remove?id=${id}&ref=${ref}` });
});

router.post('/cases/applicants/remove', (req, res) => {
  let id = req.query.id;
  let ref = req.query.ref;
  let confirm = req.body.applicantRemove;

  if (!confirm) {
    return res.render('cases/add-to-list/applicants/applicant-remove', { id: id, ref: ref, error: true, backUrl: `/cases/applicants/hub?ref=${ref}`, actionUrl: `/cases/applicants/remove?id=${id}&ref=${ref}` });
  }

  if (confirm === 'yes' && req.session.data['tempApplicantsList']) {
    req.session.data['tempApplicantsList'] = req.session.data['tempApplicantsList'].filter(a => a.id !== id);
  }
  res.redirect(`/cases/applicants/hub?ref=${ref}`);
});

// --- 6. FINAL COMMIT ---
router.post('/cases/applicants/commit', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce
  
  c.applicants = req.session.data['tempApplicantsList'] || [];
  req.session.data['tempApplicantsList'] = null;
  req.session.flashSection = "case-details"; 
  
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Applicants updated");
  
  res.redirect('/cases/case-details?ref=' + ref);
});

// --- 7. CANCEL DRAFT ---
router.get('/cases/applicants/cancel', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce
  
  var originalApps = c.applicants || [];
  var draftApps = req.session.data['tempApplicantsList'] || [];

  if (JSON.stringify(originalApps) === JSON.stringify(draftApps)) {
    req.session.data['tempApplicantsList'] = null;
    return res.redirect('/cases/case-details?ref=' + ref);
  }
  res.render('cases/add-to-list/applicants/cancel-applicants', { ref: ref });
});

router.post('/cases/applicants/cancel', function(req, res) {
  var ref = req.query.ref;
  var confirm = req.body.cancelApplicants;
  
  if (!confirm) return res.render('cases/add-to-list/applicants/cancel-applicants', { ref: ref, error: true });
  
  if (confirm === 'yes') {
    req.session.data['tempApplicantsList'] = null;
    res.redirect('/cases/case-details?ref=' + ref);
  } else {
    res.redirect('/cases/applicants/hub?ref=' + ref);
  }
});
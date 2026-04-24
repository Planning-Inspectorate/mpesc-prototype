const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// Use ../../ to go up two folders (from /sub-routes/add-to-list/ to /app/)
const { getCase, addAuditLog } = require('../../helpers');

// ==============================================================================
// 6. KEY CONTACTS: OBJECTORS (Working Draft Array Pattern)
// ==============================================================================

// --- 0. START PAGE: Empty State ---
router.get('/cases/objectors/start', function(req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  // Initialize a blank draft if starting from empty
  req.session.data['tempObjectorsList'] = [];

  res.render('cases/add-to-list/objectors/objector-first', { ref: c.reference });
});

// --- 1. HUB PAGE: Check Objectors ---
router.get('/cases/objectors/hub', function(req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  if (!c.objectors) { c.objectors = []; }

  // Clone real data to start working if no draft exists
  if (!req.session.data['tempObjectorsList']) {
    req.session.data['tempObjectorsList'] = JSON.parse(JSON.stringify(c.objectors));
  }

  // Clear single-objector multi-step temp variables
  var keysToClear = ['temp_obj_fname', 'temp_obj_lname', 'temp_obj_org', 'temp_obj_address1', 'temp_obj_address2', 'temp_obj_town', 'temp_obj_county', 'temp_obj_postcode', 'temp_obj_email', 'temp_obj_phone', 'temp_obj_status'];
  keysToClear.forEach(key => delete req.session.data[key]);

  res.render('cases/add-to-list/objectors/check', {
    ref: c.reference,
    objectors: req.session.data['tempObjectorsList'] // Pass the DRAFT
  });
});

// ==============================================
// ADD / EDIT FLOW
// ==============================================

// --- STEP 1: Who is the objector? ---
router.get('/cases/objectors/step-1', function(req, res) {
  var id = req.query.id;
  var draftList = req.session.data['tempObjectorsList'] || [];
  var objector = id ? (draftList.find(x => x.id == id) || {}) : {};

  res.render('cases/add-to-list/objectors/step-1', {
    ref: req.query.ref,
    id: id,
    fname: req.session.data['temp_obj_fname'] || objector.fname,
    lname: req.session.data['temp_obj_lname'] || objector.lname,
    org:   req.session.data['temp_obj_org']   || objector.org
  });
});

router.post('/cases/objectors/step-1', function(req, res) {
  var first = req.body['obj-fname'] || "";
  var last = req.body['obj-lname'] || "";
  var org = req.body['obj-org'] || "";
  
  let errors = {};
  let errorList = [];

  if (!first && !last && !org) {
    let err = { text: "Enter at least one of first name, last name or organisation", href: "#obj-fname" };
    errors.general = err; errorList.push(err);
  }
  if (first.length > 250) {
    let err = { text: "First name must be less than 250 characters", href: "#obj-fname" };
    errors.fname = err; errorList.push(err);
  }
  if (last.length > 250) {
    let err = { text: "Last name must be less than 250 characters", href: "#obj-lname" };
    errors.lname = err; errorList.push(err);
  }
  if (org.length > 250) {
    let err = { text: "Organisation name must be less than 250 characters", href: "#obj-org" };
    errors.org = err; errorList.push(err);
  }

  if (errorList.length > 0) {
    return res.render('cases/add-to-list/objectors/step-1', {
      ref: req.query.ref, id: req.query.id, fname: first, lname: last, org: org, errors: errors, errorList: errorList
    });
  }

  req.session.data['temp_obj_fname'] = first;
  req.session.data['temp_obj_lname'] = last;
  req.session.data['temp_obj_org']   = org;
  
  res.redirect(`/cases/objectors/step-2?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// --- STEP 2: Address ---
router.get('/cases/objectors/step-2', function(req, res) {
  var id = req.query.id;
  var draftList = req.session.data['tempObjectorsList'] || [];
  var objector = id ? (draftList.find(x => x.id == id) || {}) : {};

  res.render('cases/add-to-list/objectors/step-2', {
    ref: req.query.ref,
    id: id,
    address1: req.session.data['temp_obj_address1'] || objector.address1,
    address2: req.session.data['temp_obj_address2'] || objector.address2,
    town:     req.session.data['temp_obj_town']     || objector.town,
    county:   req.session.data['temp_obj_county']   || objector.county,
    postcode: req.session.data['temp_obj_postcode'] || objector.postcode
  });
});

router.post('/cases/objectors/step-2', function(req, res) {
  var line1 = req.body['obj-address1'];
  var line2 = req.body['obj-address2'];
  var town = req.body['obj-town'];
  var county = req.body['obj-county'];
  var postcode = req.body['obj-postcode'];

  let errors = {};
  let errorList = [];

  if (postcode && postcode.trim() !== "") {
    var cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    var postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/;

    if (cleanPostcode.length < 5 || cleanPostcode.length > 7) {
      let err = { text: "Postcode must be between 5 and 7 characters", href: "#obj-postcode" };
      errors.postcode = err; errorList.push(err);
    } 
    else if (!postcodeRegex.test(cleanPostcode)) {
      let err = { text: "Enter a real postcode", href: "#obj-postcode" };
      errors.postcode = err; errorList.push(err);
    }
  }

  if (errorList.length > 0) {
    return res.render('cases/add-to-list/objectors/step-2', {
      ref: req.query.ref, id: req.query.id, address1: line1, address2: line2, town: town, county: county, postcode: postcode, errors: errors, errorList: errorList
    });
  }

  req.session.data['temp_obj_address1'] = line1;
  req.session.data['temp_obj_address2'] = line2;
  req.session.data['temp_obj_town']     = town;
  req.session.data['temp_obj_county']   = county;
  req.session.data['temp_obj_postcode'] = postcode;

  res.redirect(`/cases/objectors/step-3?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// --- STEP 3: Contact Details ---
router.get('/cases/objectors/step-3', function(req, res) {
  var id = req.query.id;
  var draftList = req.session.data['tempObjectorsList'] || [];
  var objector = id ? (draftList.find(x => x.id == id) || {}) : {};

  res.render('cases/add-to-list/objectors/step-3', {
    ref: req.query.ref,
    id: id,
    email: req.session.data['temp_obj_email'] || objector.email,
    phone: req.session.data['temp_obj_phone'] || objector.phone
  });
});

router.post('/cases/objectors/step-3', function(req, res) {
  let email = req.body['obj-email'] || "";
  let phone = req.body['obj-phone'] || "";

  let errors = {};
  let errorList = [];

  if (email.length > 250) {
    let err = { text: "Email must be less than 250 characters", href: "#obj-email" };
    errors.email = err; errorList.push(err);
  }
  if (phone.length > 15) {
    let err = { text: "Phone number must be less than 15 characters", href: "#obj-phone" };
    errors.phone = err; errorList.push(err);
  }

  if (errorList.length > 0) {
    return res.render('cases/add-to-list/objectors/step-3', {
      ref: req.query.ref, id: req.query.id, email: email, phone: phone, errors: errors, errorList: errorList
    });
  }

  req.session.data['temp_obj_email'] = email;
  req.session.data['temp_obj_phone'] = phone;

  res.redirect(`/cases/objectors/step-4?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// --- STEP 4: Status + SAVE TO DRAFT ---
router.get('/cases/objectors/step-4', function(req, res) {
  var id = req.query.id;
  var draftList = req.session.data['tempObjectorsList'] || [];
  var objector = id ? (draftList.find(x => x.id == id) || {}) : {};

  res.render('cases/add-to-list/objectors/step-4', {
    ref: req.query.ref,
    id: id,
    status: req.session.data['temp_obj_status'] || objector.status
  });
});

router.post('/cases/objectors/step-4', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var status = req.body['obj-status'];

  if (!status) {
    return res.render('cases/add-to-list/objectors/step-4', {
      ref: ref, id: id, errorList: [{ text: "Select the status of the objector", href: "#obj-status" }]
    });
  }

  // Find existing data in DRAFT
  var draftList = req.session.data['tempObjectorsList'] || [];
  var existing = id ? (draftList.find(x => x.id == id) || {}) : {};

  function getVal(sess, db) { return (req.session.data[sess] !== undefined) ? req.session.data[sess] : db; }

  // Build Object
  var newObjector = {
    id: id || 'obj-' + Date.now().toString(),
    fname: getVal('temp_obj_fname', existing.fname),
    lname: getVal('temp_obj_lname', existing.lname),
    org:   getVal('temp_obj_org',   existing.org),
    address1: getVal('temp_obj_address1', existing.address1),
    address2: getVal('temp_obj_address2', existing.address2),
    town:     getVal('temp_obj_town',     existing.town),
    county:   getVal('temp_obj_county',   existing.county),
    postcode: getVal('temp_obj_postcode', existing.postcode),
    email: getVal('temp_obj_email', existing.email),
    phone: getVal('temp_obj_phone', existing.phone),
    status: status
  };

  // Save to DRAFT List
  var idx = draftList.findIndex(x => x.id == id);
  if (idx >= 0) draftList[idx] = newObjector;
  else draftList.push(newObjector);

  req.session.data['tempObjectorsList'] = draftList;

  // Cleanup session
  var keysToClear = ['temp_obj_fname', 'temp_obj_lname', 'temp_obj_org', 'temp_obj_address1', 'temp_obj_address2', 'temp_obj_town', 'temp_obj_county', 'temp_obj_postcode', 'temp_obj_email', 'temp_obj_phone', 'temp_obj_status'];
  keysToClear.forEach(key => delete req.session.data[key]);

  res.redirect('/cases/objectors/hub?ref=' + ref);
});

// ==============================================
// REMOVE OBJECTOR (From Draft)
// ==============================================

router.get('/cases/objectors/remove', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  res.render('cases/add-to-list/objectors/objector-remove', { 
    ref: ref, id: id, backUrl: `/cases/objectors/hub?ref=${ref}`, actionUrl: `/cases/objectors/remove?id=${id}&ref=${ref}`
  });
});

router.post('/cases/objectors/remove', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var confirm = req.body.objectorRemove;

  if (!confirm) {
    return res.render('cases/add-to-list/objectors/objector-remove', { 
      ref: ref, id: id, error: true, backUrl: `/cases/objectors/hub?ref=${ref}`, actionUrl: `/cases/objectors/remove?id=${id}&ref=${ref}`
    });
  }

  if (confirm === 'yes') {
    if (req.session.data['tempObjectorsList']) {
      req.session.data['tempObjectorsList'] = req.session.data['tempObjectorsList'].filter(x => x.id !== id);
    }
  }
  
  res.redirect(`/cases/objectors/hub?ref=${ref}`);
});

// ==============================================
// FINAL COMMIT / CANCEL ACTIONS
// ==============================================

// COMMIT DRAFT
router.post('/cases/objectors/commit', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  // Overwrite database with working draft
  c.objectors = req.session.data['tempObjectorsList'] || [];
  req.session.data['tempObjectorsList'] = null;

  req.session.flashSection = "key-contacts"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Objectors updated");
  
  res.redirect('/cases/case-details?ref=' + ref);
});

// CANCEL DRAFT: Smart Check
router.get('/cases/objectors/cancel', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  var originalObjectors = c.objectors || [];
  var draftObjectors = req.session.data['tempObjectorsList'] || [];

  var isUnchanged = JSON.stringify(originalObjectors) === JSON.stringify(draftObjectors);

  if (isUnchanged) {
    // NO CHANGES: Silently clear draft and exit
    req.session.data['tempObjectorsList'] = null;
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  // CHANGES DETECTED: Render warning page
  res.render('cases/add-to-list/objectors/cancel-objectors', { ref: ref });
});

// CANCEL DRAFT: Process Warning Page
router.post('/cases/objectors/cancel', function(req, res) {
  var ref = req.query.ref;
  var confirm = req.body.cancelObjectors;

  if (!confirm) {
    return res.render('cases/add-to-list/objectors/cancel-objectors', { ref: ref, error: true });
  }

  if (confirm === 'yes') {
    // Toss draft in trash
    req.session.data['tempObjectorsList'] = null;
    res.redirect('/cases/case-details?ref=' + ref);
  } else {
    // Return to working list
    res.redirect('/cases/objectors/hub?ref=' + ref);
  }
});
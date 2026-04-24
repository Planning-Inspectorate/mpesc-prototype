const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// Use ../../ to go up two folders (from /sub-routes/add-to-list/ to /app/)
const { getCase, addAuditLog } = require('../../helpers');

// ==============================================================================
// 7. KEY CONTACTS: CONTACTS (Working Draft Array Pattern)
// ==============================================================================

// --- 0. START PAGE: Empty State ---
router.get('/cases/contacts/start', function(req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  // Initialize a blank draft if starting from empty
  req.session.data['tempContactsList'] = [];

  res.render('cases/add-to-list/contacts/contact-first', {
    ref: c.reference
  });
});

// --- 1. HUB PAGE: Check Contacts ---
router.get('/cases/contacts/hub', function(req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce
  
  if (!c.contacts) { c.contacts = []; }

  // If there is no draft list yet, clone the real data to start working
  if (!req.session.data['tempContactsList']) {
    req.session.data['tempContactsList'] = JSON.parse(JSON.stringify(c.contacts));
  }

  // Clear single-contact multi-step temp variables so "Add details" starts fresh
  var keysToClear = ['temp_con_type', 'temp_con_fname', 'temp_con_lname', 'temp_con_org', 'temp_con_address1', 'temp_con_address2', 'temp_con_town', 'temp_con_county', 'temp_con_postcode', 'temp_con_email', 'temp_con_phone'];
  keysToClear.forEach(key => delete req.session.data[key]);

  res.render('cases/add-to-list/contacts/check', {
    ref: c.reference,
    contacts: req.session.data['tempContactsList'] // Pass the DRAFT
  });
});

// ==============================================
// ADD / EDIT FLOW
// ==============================================

// --- STEP 1: Contact Type ---
router.get('/cases/contacts/step-1', function(req, res) {
  var id = req.query.id;
  var draftList = req.session.data['tempContactsList'] || [];
  var contact = id ? (draftList.find(x => x.id == id) || {}) : {};

  res.render('cases/add-to-list/contacts/step-1', {
    ref: req.query.ref,
    id: id,
    type: req.session.data['temp_con_type'] || contact.type
  });
});

router.post('/cases/contacts/step-1', function(req, res) {
  var type = req.body['con-type'];
  
  if (!type) {
    return res.render('cases/add-to-list/contacts/step-1', {
      ref: req.query.ref,
      id: req.query.id,
      errorList: [{ text: "Select contact type", href: "#con-type" }]
    });
  }

  req.session.data['temp_con_type'] = type;
  res.redirect(`/cases/contacts/step-2?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// --- STEP 2: Who is the contact? ---
router.get('/cases/contacts/step-2', function(req, res) {
  var id = req.query.id;
  var draftList = req.session.data['tempContactsList'] || [];
  var contact = id ? (draftList.find(x => x.id == id) || {}) : {};

  res.render('cases/add-to-list/contacts/step-2', {
    ref: req.query.ref,
    id: id,
    fname: req.session.data['temp_con_fname'] || contact.fname,
    lname: req.session.data['temp_con_lname'] || contact.lname,
    org:   req.session.data['temp_con_org']   || contact.org,
  });
});

router.post('/cases/contacts/step-2', function(req, res) {
  var first = req.body['con-fname'] || "";
  var last = req.body['con-lname'] || "";
  var org = req.body['con-org'] || "";
  
  let errors = {};
  let errorList = [];

  if (!first && !last && !org) {
    let err = { text: "Enter at least one of first name, last name or organisation", href: "#con-fname" };
    errors.general = err; errorList.push(err);
  }
  if (first.length > 250) {
    let err = { text: "First name must be less than 250 characters", href: "#con-fname" };
    errors.fname = err; errorList.push(err);
  }
  if (last.length > 250) {
    let err = { text: "Last name must be less than 250 characters", href: "#con-lname" };
    errors.lname = err; errorList.push(err);
  }
  if (org.length > 250) {
    let err = { text: "Organisation name must be less than 250 characters", href: "#con-org" };
    errors.org = err; errorList.push(err);
  }

  if (errorList.length > 0) {
    return res.render('cases/add-to-list/contacts/step-2', {
      ref: req.query.ref, id: req.query.id, fname: first, lname: last, org: org, errors: errors, errorList: errorList
    });
  }

  req.session.data['temp_con_fname'] = first;
  req.session.data['temp_con_lname'] = last;
  req.session.data['temp_con_org']   = org;

  res.redirect(`/cases/contacts/step-3?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// --- STEP 3: Address ---
router.get('/cases/contacts/step-3', function(req, res) {
  var id = req.query.id;
  var draftList = req.session.data['tempContactsList'] || [];
  var contact = id ? (draftList.find(x => x.id == id) || {}) : {};

  res.render('cases/add-to-list/contacts/step-3', {
    ref: req.query.ref,
    id: id,
    address1: req.session.data['temp_con_address1'] || contact.address1,
    address2: req.session.data['temp_con_address2'] || contact.address2,
    town:     req.session.data['temp_con_town']     || contact.town,
    county:   req.session.data['temp_con_county']   || contact.county,
    postcode: req.session.data['temp_con_postcode'] || contact.postcode
  });
});

router.post('/cases/contacts/step-3', function(req, res) {
  var line1 = req.body['con-address1'];
  var line2 = req.body['con-address2'];
  var town = req.body['con-town'];
  var county = req.body['con-county'];
  var postcode = req.body['con-postcode'];

  let errors = {};
  let errorList = [];

  if (postcode && postcode.trim() !== "") {
    var cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    var postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/;

    if (cleanPostcode.length < 5 || cleanPostcode.length > 7) {
      let err = { text: "Postcode must be between 5 and 7 characters", href: "#con-postcode" };
      errors.postcode = err; errorList.push(err);
    } 
    else if (!postcodeRegex.test(cleanPostcode)) {
      let err = { text: "Enter a real postcode", href: "#con-postcode" };
      errors.postcode = err; errorList.push(err);
    }
  }

  if (errorList.length > 0) {
    return res.render('cases/add-to-list/contacts/step-3', {
      ref: req.query.ref, id: req.query.id, address1: line1, address2: line2, town: town, county: county, postcode: postcode, errors: errors, errorList: errorList
    });
  }

  req.session.data['temp_con_address1'] = line1;
  req.session.data['temp_con_address2'] = line2;
  req.session.data['temp_con_town']     = town;
  req.session.data['temp_con_county']   = county;
  req.session.data['temp_con_postcode'] = postcode;

  res.redirect(`/cases/contacts/step-4?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// --- STEP 4: Contact Details + SAVE TO DRAFT ---
router.get('/cases/contacts/step-4', function(req, res) {
  var id = req.query.id;
  var draftList = req.session.data['tempContactsList'] || [];
  var contact = id ? (draftList.find(x => x.id == id) || {}) : {};

  res.render('cases/add-to-list/contacts/step-4', {
    ref: req.query.ref,
    id: id,
    email: req.session.data['temp_con_email'] || contact.email,
    phone: req.session.data['temp_con_phone'] || contact.phone
  });
});

router.post('/cases/contacts/step-4', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;

  var email = req.body['con-email'] || "";
  var phone = req.body['con-phone'] || "";

  let errors = {};
  let errorList = [];

  if (email.length > 250) {
    let err = { text: "Email must be less than 250 characters", href: "#con-email" };
    errors.email = err; errorList.push(err);
  }
  if (phone.length > 15) {
    let err = { text: "Phone number must be less than 15 characters", href: "#con-phone" };
    errors.phone = err; errorList.push(err);
  }

  if (errorList.length > 0) {
    return res.render('cases/add-to-list/contacts/step-4', {
      ref: ref, id: id, email: email, phone: phone, errors: errors, errorList: errorList
    });
  }

  // Find existing data in DRAFT
  var draftList = req.session.data['tempContactsList'] || [];
  var existing = id ? (draftList.find(x => x.id == id) || {}) : {};

  // Helper to get New Session Data OR Old DB Data
  function getVal(sess, db) { return (req.session.data[sess] !== undefined) ? req.session.data[sess] : db; }

  // Build Object
  var newContact = {
    id: id || 'con-' + Date.now().toString(),
    type: getVal('temp_con_type', existing.type),
    fname: getVal('temp_con_fname', existing.fname),
    lname: getVal('temp_con_lname', existing.lname),
    org:   getVal('temp_con_org',   existing.org),
    address1: getVal('temp_con_address1', existing.address1),
    address2: getVal('temp_con_address2', existing.address2),
    town:     getVal('temp_con_town',     existing.town),
    county:   getVal('temp_con_county',   existing.county),
    postcode: getVal('temp_con_postcode', existing.postcode),
    email: email,
    phone: phone
  };

  // Save to DRAFT List
  var idx = draftList.findIndex(x => x.id == id);
  if (idx >= 0) draftList[idx] = newContact;
  else draftList.push(newContact);
  
  req.session.data['tempContactsList'] = draftList;

  // Cleanup
  var keysToClear = ['temp_con_type', 'temp_con_fname', 'temp_con_lname', 'temp_con_org', 'temp_con_address1', 'temp_con_address2', 'temp_con_town', 'temp_con_county', 'temp_con_postcode', 'temp_con_email', 'temp_con_phone'];
  keysToClear.forEach(key => delete req.session.data[key]);

  res.redirect('/cases/contacts/hub?ref=' + ref);
});

// ==============================================
// REMOVE KEY CONTACT (From Draft)
// ==============================================

router.get('/cases/contacts/remove', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  res.render('cases/add-to-list/contacts/contact-remove', { 
    ref: ref, id: id, backUrl: `/cases/contacts/hub?ref=${ref}`, actionUrl: `/cases/contacts/remove?id=${id}&ref=${ref}`
  });
});

router.post('/cases/contacts/remove', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var confirm = req.body.contactRemove;

  if (!confirm) {
    return res.render('cases/add-to-list/contacts/contact-remove', { 
      ref: ref, id: id, error: true, backUrl: `/cases/contacts/hub?ref=${ref}`, actionUrl: `/cases/contacts/remove?id=${id}&ref=${ref}`
    });
  }

  if (confirm === 'yes') {
    if (req.session.data['tempContactsList']) {
      req.session.data['tempContactsList'] = req.session.data['tempContactsList'].filter(x => x.id !== id);
    }
  }
  res.redirect(`/cases/contacts/hub?ref=${ref}`);
});

// ==============================================
// FINAL COMMIT / CANCEL ACTIONS
// ==============================================

// COMMIT DRAFT
router.post('/cases/contacts/commit', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  // Overwrite the real database with our working draft
  c.contacts = req.session.data['tempContactsList'] || [];
  
  // Clear the draft completely
  req.session.data['tempContactsList'] = null;

  // Flash banner and redirect
  req.session.flashSection = "key-contacts"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Contacts updated");
  
  res.redirect('/cases/case-details?ref=' + ref);
});

// CANCEL DRAFT: View Warning Page (Smart Check)
router.get('/cases/contacts/cancel', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  // 1. Grab both arrays (fallback to empty arrays if they don't exist yet)
  var originalContacts = c.contacts || [];
  var draftContacts = req.session.data['tempContactsList'] || [];

  // 2. Compare them!
  var isUnchanged = JSON.stringify(originalContacts) === JSON.stringify(draftContacts);

  if (isUnchanged) {
    // NO CHANGES: Silently clear the draft and go straight to case details
    req.session.data['tempContactsList'] = null;
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  // CHANGES DETECTED: Render the warning page
  res.render('cases/add-to-list/contacts/cancel-contacts', { ref: ref });
});

// CANCEL DRAFT: Process Warning Page
router.post('/cases/contacts/cancel', function(req, res) {
  var ref = req.query.ref;
  var confirm = req.body.cancelContacts;

  if (!confirm) {
    return res.render('cases/add-to-list/contacts/cancel-contacts', { ref: ref, error: true });
  }

  if (confirm === 'yes') {
    // Toss the draft in the trash
    req.session.data['tempContactsList'] = null;
    res.redirect('/cases/case-details?ref=' + ref);
  } else {
    // Take them back to the working list
    res.redirect('/cases/contacts/hub?ref=' + ref);
  }
});
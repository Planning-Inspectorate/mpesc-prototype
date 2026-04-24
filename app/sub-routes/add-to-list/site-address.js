const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// Import the shared helpers using ../../
const { getCase, addAuditLog } = require('../../helpers');

// ==============================================================================
// SITE ADDRESS (Working Draft Array Pattern)
// ==============================================================================

// Helper: Converts legacy singular addresses into the array format
function getSiteAddresses(c) {
  if (c.siteAddresses) return c.siteAddresses;
  
  if (c.addressLine1 || c.siteAddress || c['site-address']) {
    return [{
      id: 'sa-1',
      addressLine1: c.addressLine1 || c.siteAddress || c['site-address'], 
      addressLine2: c.addressLine2 || "",
      addressTown: c.addressTown || "",
      addressCounty: c.addressCounty || "",
      addressPostcode: c.addressPostcode || ""
    }];
  }
  return [];
}

// --- 0. START PAGE: Empty State ---
router.get('/cases/site-address/start', function(req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce
  
  req.session.data['tempSiteAddresses'] = [];
  res.render('cases/add-to-list/site-address/site-address-first', { ref: c.reference });
});

// --- 1. HUB PAGE: Check Site Addresses ---
router.get('/cases/site-address/hub', function(req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  var original = getSiteAddresses(c);
  
  // Clone real data to start working if no draft exists
  if (!req.session.data['tempSiteAddresses']) {
    req.session.data['tempSiteAddresses'] = JSON.parse(JSON.stringify(original));
  }
  
  // Clear any temporary inputs from the step-1 form
  var keysToClear = ['temp_sa_line1', 'temp_sa_line2', 'temp_sa_town', 'temp_sa_county', 'temp_sa_postcode'];
  keysToClear.forEach(key => delete req.session.data[key]);
  
  res.render('cases/add-to-list/site-address/check', { ref: c.reference, addresses: req.session.data['tempSiteAddresses'] });
});

// --- 2. STEP 1: INPUT ADDRESS ---
router.get('/cases/site-address/step-1', function(req, res) {
  var id = req.query.id;
  var draftList = req.session.data['tempSiteAddresses'] || [];
  var address = id ? (draftList.find(x => x.id == id) || {}) : {};

  res.render('cases/add-to-list/site-address/site-address-question', {
    ref: req.query.ref, 
    id: id,
    addressLine1: req.session.data['temp_sa_line1'] || address.addressLine1,
    addressLine2: req.session.data['temp_sa_line2'] || address.addressLine2,
    addressTown: req.session.data['temp_sa_town'] || address.addressTown,
    addressCounty: req.session.data['temp_sa_county'] || address.addressCounty,
    addressPostcode: req.session.data['temp_sa_postcode'] || address.addressPostcode
  });
});

router.post('/cases/site-address/step-1', function(req, res) {
  var line1 = req.body['addressLine1'];
  var line2 = req.body['addressLine2'];
  var town = req.body['addressTown'];
  var county = req.body['addressCounty'];
  var postcode = req.body['addressPostcode'];

  var error = false;
  var errorMsg = "";

  // Bespoke postcode validation
  if (postcode && postcode.trim() !== "") {
    var cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    var postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/;

    if (cleanPostcode.length < 5 || cleanPostcode.length > 7) {
      error = true;
      errorMsg = "Postcode must be between 5 and 7 characters (excluding spaces)";
    } else if (!postcodeRegex.test(cleanPostcode)) {
      error = true;
      errorMsg = "Enter a real postcode";
    }
  }

  // Stop and show errors
  if (error) {
    return res.render('cases/add-to-list/site-address/site-address-question', {
      ref: req.query.ref, id: req.query.id,
      addressLine1: line1, addressLine2: line2, addressTown: town, addressCounty: county, addressPostcode: postcode,
      error: true, errorMessage: { text: errorMsg }
    });
  }

  // Save to draft array
  var draftList = req.session.data['tempSiteAddresses'] || [];
  var id = req.query.id || 'sa-' + Date.now().toString();
  var newAddress = { id: id, addressLine1: line1, addressLine2: line2, addressTown: town, addressCounty: county, addressPostcode: postcode };

  var idx = draftList.findIndex(x => x.id == id);
  if (idx >= 0) draftList[idx] = newAddress;
  else draftList.push(newAddress);

  req.session.data['tempSiteAddresses'] = draftList;
  
  // Clear temporary memory
  var keysToClear = ['temp_sa_line1', 'temp_sa_line2', 'temp_sa_town', 'temp_sa_county', 'temp_sa_postcode'];
  keysToClear.forEach(key => delete req.session.data[key]);

  res.redirect(`/cases/site-address/hub?ref=${req.query.ref}`);
});

// --- 3. REMOVE ADDRESS (From Draft) ---
router.get('/cases/site-address/remove', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  res.render('cases/add-to-list/site-address/site-address-remove', { 
    ref: ref, id: id, 
    backUrl: `/cases/site-address/hub?ref=${ref}`, 
    actionUrl: `/cases/site-address/remove?id=${id}&ref=${ref}` 
  });
});

router.post('/cases/site-address/remove', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var confirm = req.body.siteAddressRemove;

  if (!confirm) {
    return res.render('cases/add-to-list/site-address/site-address-remove', { 
      ref: ref, id: id, error: true, 
      backUrl: `/cases/site-address/hub?ref=${ref}`, 
      actionUrl: `/cases/site-address/remove?id=${id}&ref=${ref}` 
    });
  }

  if (confirm === 'yes' && req.session.data['tempSiteAddresses']) {
    req.session.data['tempSiteAddresses'] = req.session.data['tempSiteAddresses'].filter(x => x.id !== id);
  }
  res.redirect(`/cases/site-address/hub?ref=${ref}`);
});

// --- 4. FINAL COMMIT ---
router.post('/cases/site-address/commit', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  var draft = req.session.data['tempSiteAddresses'] || [];
  
  // Save array and purge legacy flat attributes
  c.siteAddresses = draft;
  delete c['siteAddress']; delete c['site-address']; delete c['addressLine1']; delete c['addressLine2']; delete c['addressTown']; delete c['addressCounty']; delete c['addressPostcode'];
  
  req.session.data['tempSiteAddresses'] = null; 
  
  // Build beautiful audit log string combining all plots
  var auditStrings = draft.map(function(addr, index) {
    var parts = [addr.addressLine1, addr.addressLine2, addr.addressTown, addr.addressCounty, addr.addressPostcode].filter(Boolean);
    var prefix = draft.length > 1 ? ("Plot " + (index + 1) + ": ") : "";
    return prefix + parts.join(', ');
  });
  var finalAuditText = auditStrings.length > 0 ? auditStrings.join(' | ') : "All site addresses removed";

  req.session.flashSection = "case-details"; 
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Site address updated to '" + finalAuditText + "'");
  
  res.redirect('/cases/case-details?ref=' + ref);
});

// --- 5. CANCEL DRAFT ---
router.get('/cases/site-address/cancel', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  var original = getSiteAddresses(c);
  var draft = req.session.data['tempSiteAddresses'] || [];

  if (JSON.stringify(original) === JSON.stringify(draft)) {
    req.session.data['tempSiteAddresses'] = null;
    return res.redirect('/cases/case-details?ref=' + ref);
  }
  res.render('cases/add-to-list/site-address/cancel-site-address', { ref: ref });
});

router.post('/cases/site-address/cancel', function(req, res) {
  var ref = req.query.ref;
  var confirm = req.body.cancelSiteAddress;

  if (!confirm) return res.render('cases/add-to-list/site-address/cancel-site-address', { ref: ref, error: true });
  
  if (confirm === 'yes') {
    req.session.data['tempSiteAddresses'] = null;
    res.redirect('/cases/case-details?ref=' + ref);
  } else {
    res.redirect('/cases/site-address/hub?ref=' + ref);
  }
});
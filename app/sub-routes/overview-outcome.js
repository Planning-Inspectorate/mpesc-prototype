const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// Use ../ to go up one folder (from /sub-routes/ to /app/)
const { getCase, validateAndSaveDate, addAuditLog } = require('../helpers');

// ==============================================================================
// OVERVIEW OUTCOME (Optional Dates)
// ==============================================================================

// --- 1. PARTIES NOTIFIED OF OUTCOME ---
router.get('/cases/overview-outcome/parties-notified', (req, res) => {
  var c = getCase(req); 
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  var overview = c.outcomeOverview || {};
  var dateObj = overview.partiesNotifiedDate || {};

  res.render('cases/overview-outcome/parties-notified', { 
    ref: req.query.ref,
    day: dateObj.day,
    month: dateObj.month,
    year: dateObj.year
  });
});

router.post('/cases/overview-outcome/parties-notified', (req, res) => {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  if (!c.outcomeOverview) c.outcomeOverview = {};

  var day = req.body['parties-notified-day']; 
  var month = req.body['parties-notified-month']; 
  var year = req.body['parties-notified-year'];

  // Handle completely blank submission (Removal)
  if (!day && !month && !year) {
    c.outcomeOverview.partiesNotifiedDate = null; 
    req.session.flashSection = "outcomeOverview"; 
    
    if (typeof addAuditLog === "function") {
      addAuditLog(req, ref, "Parties notified date removed");
    }
    return res.redirect('/cases/case-details?ref=' + ref); 
  }

  // Validate the date
  var result = validateAndSaveDate(req, res, 'parties-notified', 'Parties notified of outcome date', c.outcomeOverview, 'partiesNotifiedDate');

  if (result.status === "ERROR") {
    return res.render('cases/overview-outcome/parties-notified', { 
      ref: ref, day: day, month: month, year: year, errorList: result.errorList, errorFields: result.errorFields
    });
  }

  // Success! Format the date for the audit log
  req.session.flashSection = "outcomeOverview"; 
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const prettyMonth = monthNames[parseInt(month, 10) - 1]; 
  const formattedDate = `${day} ${prettyMonth} ${year}`;
  
  if (typeof addAuditLog === "function") addAuditLog(req, ref, `Parties notified date updated to '${formattedDate}'`);
  
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- 2. ORDER DECISION DISPATCH ---
router.get('/cases/overview-outcome/order-dispatch', (req, res) => {
  var c = getCase(req); 
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  var dateObj = (c.outcomeOverview && c.outcomeOverview.orderDispatchDate) || {};
  
  res.render('cases/overview-outcome/order-dispatch', { 
    ref: req.query.ref, day: dateObj.day, month: dateObj.month, year: dateObj.year 
  });
});

router.post('/cases/overview-outcome/order-dispatch', (req, res) => {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  if (!c.outcomeOverview) c.outcomeOverview = {};

  var day = req.body['order-dispatch-day'], month = req.body['order-dispatch-month'], year = req.body['order-dispatch-year'];

  // Handle completely blank submission (Removal)
  if (!day && !month && !year) {
    c.outcomeOverview.orderDispatchDate = null; 
    req.session.flashSection = "outcomeOverview"; 

    if (typeof addAuditLog === "function") addAuditLog(req, ref, "Order dispatch date removed");
    return res.redirect('/cases/case-details?ref=' + ref); 
  }

  // Validate the date
  var result = validateAndSaveDate(req, res, 'order-dispatch', 'Order decision dispatch date', c.outcomeOverview, 'orderDispatchDate');

  if (result.status === "ERROR") {
    return res.render('cases/overview-outcome/order-dispatch', { 
      ref: ref, day: day, month: month, year: year, errorList: result.errorList, errorFields: result.errorFields 
    });
  }
  
  // Success! Format the date for the audit log
  req.session.flashSection = "outcomeOverview"; 
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const prettyMonth = monthNames[parseInt(month, 10) - 1]; 
  const formattedDate = `${day} ${prettyMonth} ${year}`;
  
  if (typeof addAuditLog === "function") addAuditLog(req, ref, `Order dispatch date updated to '${formattedDate}'`);
  
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- 3. SEALED ORDER RETURNED ---
router.get('/cases/overview-outcome/sealed-order', (req, res) => {
  var c = getCase(req); 
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  var dateObj = (c.outcomeOverview && c.outcomeOverview.sealedOrderReturnedDate) || {};
  
  res.render('cases/overview-outcome/sealed-order', { 
    ref: req.query.ref, day: dateObj.day, month: dateObj.month, year: dateObj.year 
  });
});

router.post('/cases/overview-outcome/sealed-order', (req, res) => {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  if (!c.outcomeOverview) c.outcomeOverview = {};

  var day = req.body['sealed-order-day'], month = req.body['sealed-order-month'], year = req.body['sealed-order-year'];

  // Handle completely blank submission (Removal)
  if (!day && !month && !year) {
    c.outcomeOverview.sealedOrderReturnedDate = null; 
    req.session.flashSection = "outcomeOverview"; 

    if (typeof addAuditLog === "function") addAuditLog(req, ref, "Sealed order returned date removed");
    return res.redirect('/cases/case-details?ref=' + ref); 
  }

  // Validate the date
  var result = validateAndSaveDate(req, res, 'sealed-order', 'Sealed order returned date', c.outcomeOverview, 'sealedOrderReturnedDate');

  if (result.status === "ERROR") {
    return res.render('cases/overview-outcome/sealed-order', { 
      ref: ref, day: day, month: month, year: year, errorList: result.errorList, errorFields: result.errorFields 
    });
  }
  
  // Success! Format the date for the audit log
  req.session.flashSection = "outcomeOverview"; 
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const prettyMonth = monthNames[parseInt(month, 10) - 1]; 
  const formattedDate = `${day} ${prettyMonth} ${year}`;
  
  if (typeof addAuditLog === "function") addAuditLog(req, ref, `Sealed order date updated to '${formattedDate}'`);
  
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- 4. DECISION PUBLISHED ---
router.get('/cases/overview-outcome/decision-published', (req, res) => {
  var c = getCase(req); 
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  var dateObj = (c.outcomeOverview && c.outcomeOverview.decisionPublishedDate) || {};
  
  res.render('cases/overview-outcome/decision-published', { 
    ref: req.query.ref, day: dateObj.day, month: dateObj.month, year: dateObj.year 
  });
});

router.post('/cases/overview-outcome/decision-published', (req, res) => {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  if (!c.outcomeOverview) c.outcomeOverview = {};

  var day = req.body['decision-published-day'], month = req.body['decision-published-month'], year = req.body['decision-published-year'];

  // Handle completely blank submission (Removal)
  if (!day && !month && !year) {
    c.outcomeOverview.decisionPublishedDate = null; 
    req.session.flashSection = "outcomeOverview"; 

    if (typeof addAuditLog === "function") addAuditLog(req, ref, "Decision published date removed");
    return res.redirect('/cases/case-details?ref=' + ref); 
  }

  // Validate the date
  var result = validateAndSaveDate(req, res, 'decision-published', 'Decision published date', c.outcomeOverview, 'decisionPublishedDate');

  if (result.status === "ERROR") {
    return res.render('cases/overview-outcome/decision-published', { 
      ref: ref, day: day, month: month, year: year, errorList: result.errorList, errorFields: result.errorFields 
    });
  }
  
  // Success! Format the date for the audit log
  req.session.flashSection = "outcomeOverview"; 
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const prettyMonth = monthNames[parseInt(month, 10) - 1]; 
  const formattedDate = `${day} ${prettyMonth} ${year}`;
  
  if (typeof addAuditLog === "function") addAuditLog(req, ref, `Decision published date updated to '${formattedDate}'`);
  
  res.redirect('/cases/case-details?ref=' + ref);
});
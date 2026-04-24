const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// Import the shared helpers using ../../
const { getCase, validateAndSaveDate, addAuditLog } = require('../../helpers');

// ==============================================================================
// INSPECTORS (Working Draft Array Pattern)
// ==============================================================================

// --- 0. START PAGE: Check Inspectors First ---
router.get('/cases/inspectors/check-inspectors-first', function(req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce
  
  req.session.data['tempInspectorsList'] = [];
  res.render('cases/add-to-list/inspectors/check-inspectors-first', { ref: req.query.ref });
});

// --- 1. HUB PAGE: Check Inspectors List ---
router.get('/cases/inspectors/check-inspectors', function (req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce
  if (!c.inspectors) { c.inspectors = []; }
  
  // Clone real data to start working if no draft exists
  if (!req.session.data['tempInspectorsList']) { 
    req.session.data['tempInspectorsList'] = JSON.parse(JSON.stringify(c.inspectors)); 
  }
  
  req.session.data['inspectorTemp'] = null; // Clear temp item
  res.render('cases/add-to-list/inspectors/check-inspectors', { ref: c.reference, inspectors: req.session.data['tempInspectorsList'] });
});

// --- 2. CHANGE ROUTE: Hydrate Temp Data ---
router.get('/cases/inspectors/inspector-change', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var draftList = req.session.data['tempInspectorsList'] || [];
  var item = draftList.find(i => i.id === id);

  if (item) {
    req.session.data['inspectorTemp'] = { id: item.id, name: item.name, day: item.rawDay, month: item.rawMonth, year: item.rawYear };
  }
  res.redirect('/cases/inspectors/inspector-name?ref=' + ref);
});

// --- 3. STEP 1: INSPECTOR NAME ---
router.get('/cases/inspectors/inspector-name', function (req, res) {
  var temp = req.session.data['inspectorTemp'] || {};
  res.render('cases/add-to-list/inspectors/inspector-name', { ref: req.query.ref, value: temp.name });
});

router.post('/cases/inspectors/inspector-name', function (req, res) {
  var ref = req.query.ref;
  var val = req.body.inspectorName;
  
  if (!val || val.trim() === "") {
    return res.render('cases/add-to-list/inspectors/inspector-name', { ref: ref, error: true, errorMessage: { text: "Select an inspector" } });
  }

  var officers = [
    "Charlotte Morphet", "Kieran De La Cruz", "Edward Mitchell", "Sarah Tudor", "Steve Waterfield",
    "Alex Hudd", "Harry Wood", "Rob Davis", "Deborah Board", "(Service Account) Automated Tester", "Owen Woodwards"
  ];
  
  if (!officers.includes(val)) {
     return res.render('cases/add-to-list/inspectors/inspector-name', { ref: ref, value: val, error: true, errorMessage: { text: "Select an inspector" } });   
  }

  if (!req.session.data['inspectorTemp']) { req.session.data['inspectorTemp'] = {}; }
  req.session.data['inspectorTemp'].name = val;
  res.redirect('/cases/inspectors/inspector-date?ref=' + ref);
});

// --- 4. STEP 2: INSPECTOR ALLOCATED DATE ---
router.get('/cases/inspectors/inspector-date', function (req, res) {
  var temp = req.session.data['inspectorTemp'] || {};
  res.render('cases/add-to-list/inspectors/inspector-date', { ref: req.query.ref, day: temp.day, month: temp.month, year: temp.year });
});

router.post('/cases/inspectors/inspector-date', function (req, res) {
  var ref = req.query.ref;
  var day = req.body['date-day'];
  var month = req.body['date-month'];
  var year = req.body['date-year'];

  var errorList = [];
  var errorFields = []; 

  // Validation Logic
  if (!day && !month && !year) {
    errorList.push({ text: "Enter the Inspector allocated date", href: "#date-day" });
    errorFields = ['day', 'month', 'year'];
  } else {
    var missing = [];
    if (!day) missing.push('day');
    if (!month) missing.push('month');
    if (!year) missing.push('year');
    if (missing.length > 0) {
      var missingText = missing.length === 2 ? "Inspector allocated date must include a " + missing[0] + " and " + missing[1] : "Inspector allocated date must include a " + missing[0];
      errorList.push({ text: missingText, href: "#date-" + missing[0] });
      errorFields = errorFields.concat(missing);
    }
  }

  if (day && (Number(day) < 1 || Number(day) > 31 || isNaN(Number(day)))) { errorList.push({ text: "Inspector allocated date day must be a real day", href: "#date-day" }); if (!errorFields.includes('day')) errorFields.push('day'); }
  if (month && (Number(month) < 1 || Number(month) > 12 || isNaN(Number(month)))) { errorList.push({ text: "Inspector allocated date month must be between 1 and 12", href: "#date-month" }); if (!errorFields.includes('month')) errorFields.push('month'); }
  if (year && (year.length != 4 || isNaN(Number(year)))) { errorList.push({ text: "Inspector allocated date year must include four numbers", href: "#date-year" }); if (!errorFields.includes('year')) errorFields.push('year'); }

  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) {
        errorList.push({ text: "Enter a real date", href: "#date-day" });
        errorFields = ['day', 'month', 'year'];
     }
  }

  if (errorList.length > 0) {
    return res.render('cases/add-to-list/inspectors/inspector-date', { ref: ref, errorList: errorList, errorFields: errorFields, day: day, month: month, year: year });
  }

  // Save to draft array
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var formattedDate = day + " " + months[month - 1] + " " + year;
  
  var temp = req.session.data['inspectorTemp'] || {};
  var draftList = req.session.data['tempInspectorsList'] || [];
  var editingId = temp.id;

  if (editingId) {
    var item = draftList.find(i => i.id === editingId);
    if (item) { item.name = temp.name; item.date = formattedDate; item.rawDay = day; item.rawMonth = month; item.rawYear = year; }
  } else {
    draftList.push({ id: 'insp-' + Math.floor(Math.random() * 10000), name: temp.name, date: formattedDate, rawDay: day, rawMonth: month, rawYear: year });
  }

  req.session.data['tempInspectorsList'] = draftList;
  req.session.data['inspectorTemp'] = null;
  res.redirect('/cases/inspectors/check-inspectors?ref=' + ref);
});

// --- 5. REMOVE INSPECTOR ---
router.get('/cases/inspectors/inspector-remove', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  res.render('cases/add-to-list/inspectors/remove-inspectors', { ref: ref, id: id, backUrl: `/cases/inspectors/check-inspectors?ref=${ref}`, actionUrl: `/cases/inspectors/inspector-remove?id=${id}&ref=${ref}` });
});

router.post('/cases/inspectors/inspector-remove', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var confirm = req.body.inspectorRemove; 
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

  if (!confirm) {
    return res.render('cases/add-to-list/inspectors/remove-inspectors', { ref: ref, id: id, error: true, backUrl: `/cases/inspectors/check-inspectors?ref=${ref}`, actionUrl: `/cases/inspectors/inspector-remove?id=${id}&ref=${ref}` });
  }

  if (confirm === 'yes') {
    var draftList = req.session.data['tempInspectorsList'] || [];
    var targetInspector = draftList.find(i => i.id === id);
    var inspName = targetInspector ? targetInspector.name : "";

    // Validation: Check if assigned elsewhere before deleting
    var attachedProcs = (c.overviewProcedures || []).filter(p => p.inspector === inspName);
    var attachedOutcomes = (c.outcomes || []).filter(o => o.inspectorName === inspName);

    if (attachedProcs.length > 0 || attachedOutcomes.length > 0) {
      var errorList = [];
      var hasProc = attachedProcs.length > 0;
      var hasOut = attachedOutcomes.length > 0;

      if (hasProc) {
        attachedProcs.forEach(proc => {
          let rawType = proc.type ? proc.type.toLowerCase() : "procedure";
          let pType = rawType.charAt(0).toUpperCase() + rawType.slice(1);
          let pStat = proc.status ? proc.status.toLowerCase() : "unknown status";
          errorList.push({ text: `Inspector is assigned to ${pType} (${pStat}) so cannot be removed.`, href: "#" });
        });
      }

      if (hasOut) {
        attachedOutcomes.forEach(out => {
          let rawType = out.type ? out.type.toLowerCase() : "outcome";
          let oType = rawType.charAt(0).toUpperCase() + rawType.slice(1);
          errorList.push({ text: `Inspector is assigned to ${oType} so cannot be removed.`, href: "#" });
        });
      }

      var procText = attachedProcs.length > 1 ? "procedures" : "procedure";
      var outText = attachedOutcomes.length > 1 ? "outcomes" : "outcome";

      if (hasProc && !hasOut) { errorList.push({ text: `You must assign a different inspector to the ${procText} before you can remove them from the case.`, href: "#" }); } 
      else if (!hasProc && hasOut) { errorList.push({ text: `You must assign a different inspector to the ${outText} before you can remove them from the case.`, href: "#" }); } 
      else if (hasProc && hasOut) { errorList.push({ text: `You must assign a different inspector to the ${procText} and ${outText} before you can remove them from the case.`, href: "#" }); }

      return res.render('cases/add-to-list/inspectors/check-inspectors', { ref: ref, inspectors: draftList, errorList: errorList });
    }

    if (req.session.data['tempInspectorsList']) {
      req.session.data['tempInspectorsList'] = req.session.data['tempInspectorsList'].filter(i => i.id !== id);
    }
  }
  res.redirect(`/cases/inspectors/check-inspectors?ref=${ref}`);
});

// --- 6. FINAL COMMIT ---
router.post('/cases/inspectors/check-inspectors/save', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce
  
  c.inspectors = req.session.data['tempInspectorsList'] || [];
  req.session.data['tempInspectorsList'] = null;
  req.session.flashSection = "team"; 
  
  if (typeof addAuditLog === "function") addAuditLog(req, ref, "Inspector details updated");
  res.redirect('/cases/case-details?ref=' + ref);
});

// --- 7. CANCEL DRAFT ---
router.get('/cases/inspectors/check-inspectors/cancel', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce
  
  var originalInspectors = c.inspectors || [];
  var draftInspectors = req.session.data['tempInspectorsList'] || [];

  if (JSON.stringify(originalInspectors) === JSON.stringify(draftInspectors)) {
    req.session.data['tempInspectorsList'] = null;
    return res.redirect('/cases/case-details?ref=' + ref);
  }
  res.render('cases/add-to-list/inspectors/cancel-inspectors', { ref: ref });
});

router.post('/cases/inspectors/check-inspectors/cancel', function(req, res) {
  var ref = req.query.ref;
  var confirm = req.body.cancelInspectors;
  
  if (!confirm) return res.render('cases/add-to-list/inspectors/cancel-inspectors', { ref: ref, error: true });
  
  if (confirm === 'yes') {
    req.session.data['tempInspectorsList'] = null;
    res.redirect('/cases/case-details?ref=' + ref);
  } else {
    res.redirect('/cases/inspectors/check-inspectors?ref=' + ref);
  }
});
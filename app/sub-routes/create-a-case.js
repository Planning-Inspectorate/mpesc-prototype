const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// Import the helpers we just created!
const { addAuditLog, validAuthorities, validateAndSaveAddress } = require('../helpers');

// ==============================================================================
// 1. SETUP & INITIALIZATION
// ==============================================================================

router.get('/create-case-start', function (req, res) {
  const savedCases = req.session.data['cases'] || [];
  req.session.data = {};
  req.session.data['cases'] = savedCases;
  res.redirect('/cases/create-a-case/questions/casework-area');
});

// ==============================================================================
// 2. AREA, TYPE & SUBTYPE BRANCHING (With Validation)
// ==============================================================================

router.post('/casework-area-answer', function (req, res) {
  var caseworkarea = req.session.data['casework-area'];
  if (!caseworkarea) return res.render('cases/create-a-case/questions/casework-area', { errorCaseworkArea: "Select the casework area" });

  if (caseworkarea === "Planning, Environmental and Applications") res.redirect('/cases/create-a-case/questions/peas-type-of-case');
  else if (caseworkarea === "Rights of Way and Common Land") res.redirect('/cases/create-a-case/questions/row-type-of-case');
});

router.post('/peas-type-of-case-answer', function (req, res) {
  var peastype = req.session.data['peas-type-of-case'];
  if (!peastype) return res.render('cases/create-a-case/questions/peas-type-of-case', { errorPeasType: "Select the case type" });

  if (peastype === "Drought") res.redirect('/cases/create-a-case/questions/drought-subtype');
  else if (peastype === "Housing and Planning CPOs") res.redirect('/cases/create-a-case/questions/housing-planning-cpos-subtype');
  else if (peastype === "Other Secretary of State casework") res.redirect('/cases/create-a-case/questions/other-sos-casework-subtype');
  else if (peastype === "Purchase Notices") res.redirect('/cases/create-a-case/questions/case-name'); 
  else if (peastype === "Wayleaves") res.redirect('/cases/create-a-case/questions/wayleaves-subtype');
});

router.post('/row-type-of-case-answer', function (req, res) {
  var rowtype = req.session.data['row-type-of-case'];
  if (!rowtype) return res.render('cases/create-a-case/questions/row-type-of-case', { errorRowType: "Select the case type" });

  if (rowtype === "Coastal Access") res.redirect('/cases/create-a-case/questions/coastal-subtype');
  else if (rowtype === "Common Land") res.redirect('/cases/create-a-case/questions/common-land-subtype');
  else if (rowtype === "Rights of Way") res.redirect('/cases/create-a-case/questions/row-subtype');
});

router.post('/drought-subtype-answer', function (req, res) {
  if (!req.session.data['drought-subtype']) return res.render('cases/create-a-case/questions/drought-subtype', { errorSubtype: "Select the case subtype" });
  res.redirect('/cases/create-a-case/questions/case-name');
});

router.post('/coastal-subtype-answer', function (req, res) {
  if (!req.session.data['coastal-subtype']) return res.render('cases/create-a-case/questions/coastal-subtype', { errorSubtype: "Select the case subtype" });
  res.redirect('/cases/create-a-case/questions/case-name');
});

router.post('/common-land-subtype-answer', function (req, res) {
  if (!req.session.data['common-land-subtype']) return res.render('cases/create-a-case/questions/common-land-subtype', { errorSubtype: "Select the case subtype" });
  res.redirect('/cases/create-a-case/questions/case-name');
});

router.post('/housing-planning-cpos-subtype-answer', function (req, res) {
  if (!req.session.data['housing-planning-cpos-subtype']) return res.render('cases/create-a-case/questions/housing-planning-cpos-subtype', { errorSubtype: "Select the case subtype" });
  res.redirect('/cases/create-a-case/questions/case-name');
});

router.post('/row-subtype-answer', function (req, res) {
  if (!req.session.data['row-subtype']) return res.render('cases/create-a-case/questions/row-subtype', { errorSubtype: "Select the case subtype" });
  res.redirect('/cases/create-a-case/questions/case-name');
});

router.post('/wayleaves-subtype-answer', function (req, res) {
  if (!req.session.data['wayleaves-subtype']) return res.render('cases/create-a-case/questions/wayleaves-subtype', { errorSubtype: "Select the case subtype" });
  res.redirect('/cases/create-a-case/questions/case-name');
});

router.post('/other-sos-casework-subtype-answer', function (req, res) {
  var subtype = req.session.data['other-sos-casework-subtype'];
  var otherText = req.session.data['sos-other-textbox'];

  if (!subtype) return res.render('cases/create-a-case/questions/other-sos-casework-subtype', { errorSubtype: "Select the case subtype" });
  if (subtype === "Other" && (!otherText || otherText.trim() === "")) return res.render('cases/create-a-case/questions/other-sos-casework-subtype', { errorOtherText: "Enter the details for 'Other'" });

  res.redirect('/cases/create-a-case/questions/case-name');
});

// ==============================================================================
// 3. CORE CASE DETAILS
// ==============================================================================

router.post('/case-name-answer', function (req, res) {
  var caseName = req.session.data['caseName'];
  if (!caseName || caseName.trim() === "") {
    res.render('cases/create-a-case/questions/case-name', { errorCaseName: "Enter the case name" });
  } else {
    res.redirect('/cases/create-a-case/questions/external-reference');
  }
});

router.post('/case-received-date-answer', function (req, res) {
  var day = req.session.data['case-received-date-day'];
  var month = req.session.data['case-received-date-month'];
  var year = req.session.data['case-received-date-year'];

  var errorList = []; var errorFields = [];

  if (!day && !month && !year) {
    errorList.push({ text: "Enter received date of submission", href: "#case-received-date-day" });
    errorFields = ['day', 'month', 'year'];
  } else {
    var missing = [];
    if (!day) missing.push('day'); if (!month) missing.push('month'); if (!year) missing.push('year');

    if (missing.length > 0) {
      var missingText = missing.length === 2 ? "Received date of submission must include a " + missing[0] + " and " + missing[1] : "Received date of submission must include a " + missing[0];
      errorList.push({ text: missingText, href: "#case-received-date-" + missing[0] });
      errorFields = errorFields.concat(missing);
    }
  }

  if (day) { var dayNum = Number(day); if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) { errorList.push({ text: "Received date of submission day must be a real day", href: "#case-received-date-day" }); if (!errorFields.includes('day')) errorFields.push('day'); } }
  if (month) { var monthNum = Number(month); if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) { errorList.push({ text: "Received date of submission month must be between 1 and 12", href: "#case-received-date-month" }); if (!errorFields.includes('month')) errorFields.push('month'); } }
  if (year) { var yearNum = Number(year); if (year.length != 4 || isNaN(yearNum)) { errorList.push({ text: "Received date of submission year must include four numbers", href: "#case-received-date-year" }); if (!errorFields.includes('year')) errorFields.push('year'); } }

  if (errorList.length > 0) {
    var fieldErrorMessage = errorList.map(e => e.text).join('<br>');
    res.render('cases/create-a-case/questions/case-received-date', { errorList: errorList, errorFields: errorFields, fieldErrorMessage: fieldErrorMessage, day: day, month: month, year: year });
  } else {
    res.redirect('/cases/create-a-case/questions/applicant-check-first');
  }
});

router.post('/site-address-answer', function(req, res) {
  var line1 = req.body['addressLine1']; var line2 = req.body['addressLine2']; var town = req.body['addressTown']; var county = req.body['addressCounty']; var postcode = req.body['addressPostcode'];
  var error = false; var errorMsg = "";

  if (postcode && postcode.trim() !== "") {
    var cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    var postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/;

    if (cleanPostcode.length < 5 || cleanPostcode.length > 7) { error = true; errorMsg = "Postcode must be between 5 and 7 characters"; } 
    else if (!postcodeRegex.test(cleanPostcode)) { error = true; errorMsg = "Enter a real postcode"; }
  }

  if (error) {
    return res.render('cases/create-a-case/questions/site-address', { addressLine1: line1, addressLine2: line2, addressTown: town, addressCounty: county, addressPostcode: postcode, error: true, errorMessage: { text: errorMsg } });
  }

  req.session.data['addressLine1'] = line1; req.session.data['addressLine2'] = line2; req.session.data['addressTown'] = town; req.session.data['addressCounty'] = county; req.session.data['addressPostcode'] = postcode;
  res.redirect('/cases/create-a-case/questions/location');
});

router.post('/authority-answer', function(req, res) {
  let val = req.body.authorityName;

  if (val && val.trim() !== "" && !validAuthorities.includes(val)) {
    return res.render('cases/create-a-case/questions/authority', { authorityName: val, errorAuthority: "Select an authority from the list" });
  }

  req.session.data['authorityName'] = val;
  res.redirect('/cases/create-a-case/questions/case-officer');
});

router.post('/case-officer-answer', function (req, res) {
  var selectedOfficer = req.session.data['caseOfficer'];
  var allowedOfficers = [
      "Charlotte Morphet", "Kieran De La Cruz", "Edward Mitchell", "Sarah Tudor", "Steve Waterfield", "Alex Hudd", "Harry Wood", "Rob Davis", "Deborah Board", "(Service Account) Automated Tester", "Owen Woodwards", "Tony Stark", "Steve Rogers", "Natasha Romanoff", "Bruce Banner", "Thor Odinson", "Wanda Maximoff", "Peter Parker", "Carol Danvers", "Stephen Strange", "T'Challa", "Clint Barton", "Sam Wilson", "Bucky Barnes", "Scott Lang", "Hope van Dyne"
  ];

  if (!selectedOfficer || !allowedOfficers.includes(selectedOfficer)) {
    res.render('cases/create-a-case/questions/case-officer', { errorCaseOfficer: "Select a case officer" });
  } else {
    res.redirect('/cases/create-a-case/questions/linked-case');
  }
});

// ==============================================================================
// 4. APPLICANT OR APPELLANT (Draft Array Pattern)
// ==============================================================================

// --- STEP 1: APPLICANT NAME ---
router.get('/cases/create-a-case/questions/applicant-name', (req, res) => {
  let id = req.query.id;
  let applicants = req.session.data['applicants'] || [];

  // HYDRATION: Load existing applicant if ID exists, otherwise clear temp storage
  if (id && (!req.session.data['tempApplicant'] || req.session.data['tempApplicant'].id !== id)) {
    let existingApp = applicants.find(a => a.id === id);
    if (existingApp) req.session.data['tempApplicant'] = { ...existingApp };
  } else if (!id && req.session.data['tempApplicant']?.id) {
    req.session.data['tempApplicant'] = {};
  }

  let temp = req.session.data['tempApplicant'] || {};
  res.render('cases/create-a-case/questions/applicant-name', { val: temp, id: id });
});

router.post('/cases/create-a-case/questions/applicant-name', (req, res) => {
  let first = req.body.firstName || "";
  let last = req.body.lastName || "";
  let company = req.body.companyName || "";
  
  let errors = {};
  let errorList = [];

  if (!first && !last && !company) {
    let err = { text: "Enter at least one of first name, last name or company name", href: "#firstName" };
    errors.general = err;
    errorList.push(err);
  }
  if (first.length > 250) {
    let err = { text: "First name must be less than 250 characters", href: "#firstName" };
    errors.firstName = err;
    errorList.push(err);
  }
  if (last.length > 250) {
    let err = { text: "Last name must be less than 250 characters", href: "#lastName" };
    errors.lastName = err;
    errorList.push(err);
  }
  if (company.length > 250) {
    let err = { text: "Company name must be less than 250 characters", href: "#companyName" };
    errors.companyName = err;
    errorList.push(err);
  }

  if (errorList.length > 0) {
    return res.render('cases/create-a-case/questions/applicant-name', { 
      val: { firstName: first, lastName: last, companyName: company }, 
      errors, 
      errorList,
      id: req.query.id 
    });
  }

  if (!req.session.data['tempApplicant']) req.session.data['tempApplicant'] = {};
  req.session.data['tempApplicant'].firstName = first;
  req.session.data['tempApplicant'].lastName = last;
  req.session.data['tempApplicant'].companyName = company;

  res.redirect(`/cases/create-a-case/questions/applicant-address${req.query.id ? '?id=' + req.query.id : ''}`);
});


// --- STEP 2: APPLICANT ADDRESS ---
// (Requires validateAndSaveAddress helper)
router.get('/cases/create-a-case/questions/applicant-address', (req, res) => {
  let temp = req.session.data['tempApplicant'] || {};
  let address = temp.address || {}; 
  
  res.render('cases/create-a-case/questions/applicant-address', { 
    val: temp,
    address: address, 
    id: req.query.id
  });
});

router.post('/cases/create-a-case/questions/applicant-address', (req, res) => {
  if (!req.session.data['tempApplicant']) req.session.data['tempApplicant'] = {};

  var result = validateAndSaveAddress(req, res, 'applicant', 'Applicant address', req.session.data['tempApplicant'], 'address');

  if (result.status === "ERROR") {
    return res.render('cases/create-a-case/questions/applicant-address', { 
      val: req.session.data['tempApplicant'],
      address: {
        line1: req.body['applicant-line1'],
        line2: req.body['applicant-line2'],
        town: req.body['applicant-town'],
        county: req.body['applicant-county'],
        postcode: req.body['applicant-postcode']
      },
      errorList: result.errorList,
      errorFields: result.errorFields,
      id: req.query.id
    });
  }

  res.redirect(`/cases/create-a-case/questions/applicant-contact${req.query.id ? '?id=' + req.query.id : ''}`);
});


// --- STEP 3: APPLICANT CONTACT ---
router.get('/cases/create-a-case/questions/applicant-contact', (req, res) => {
  let temp = req.session.data['tempApplicant'] || {};
  res.render('cases/create-a-case/questions/applicant-contact', { val: temp, id: req.query.id });
});

router.post('/cases/create-a-case/questions/applicant-contact', (req, res) => {
  let email = req.body.email || "";
  let phone = req.body.phone || "";
  let errors = {}; let errorList = [];

  if (email.length > 250) { let err = { text: "Email must be less than 250 characters", href: "#email" }; errors.email = err; errorList.push(err); }
  if (phone.length > 15) { let err = { text: "Phone number must be less than 15 characters", href: "#phone" }; errors.phone = err; errorList.push(err); }

  if (errorList.length > 0) {
    return res.render('cases/create-a-case/questions/applicant-contact', { val: { email, phone }, errors, errorList });
  }

  if (!req.session.data['tempApplicant']) req.session.data['tempApplicant'] = {};
  req.session.data['tempApplicant'].email = email;
  req.session.data['tempApplicant'].phone = phone;

  if (!req.session.data['applicants']) req.session.data['applicants'] = [];
  
  let completedApplicant = req.session.data['tempApplicant'];
  
  if (req.query.id) {
    let index = req.session.data['applicants'].findIndex(a => a.id === req.query.id);
    if (index > -1) {
      req.session.data['applicants'][index] = { ...completedApplicant };
    }
  } else {
    completedApplicant.id = 'app-' + Date.now();
    req.session.data['applicants'].push(completedApplicant);
  }

  req.session.data['tempApplicant'] = {};
  res.redirect('/cases/create-a-case/questions/applicant-check');
});


// --- STEP 4: CHECK APPLICANTS / TABLE HUB ---
router.post('/cases/create-a-case/questions/applicant-check', (req, res) => {
  if (!req.session.data['applicants']) req.session.data['applicants'] = [];

  let completedApplicant = req.session.data['tempApplicant'];
  if (completedApplicant && Object.keys(completedApplicant).length !== 0) {
    completedApplicant.id = 'app-' + Date.now();
    req.session.data['applicants'].push(completedApplicant);
  }

  req.session.data['tempApplicant'] = {};
  res.redirect('/cases/create-a-case/questions/site-address');
});


// --- STEP 5: REMOVE APPLICANT (From Create Array) ---
router.get('/cases/create-a-case/questions/applicant-remove', (req, res) => {
  let id = req.query.id;
  res.render('cases/create-a-case/questions/applicant-remove', { 
    id: id,
    backUrl: `/cases/create-a-case/questions/applicant-check`,
    actionUrl: `/cases/create-a-case/questions/applicant-remove?id=${id}`
  });
});

router.post('/cases/create-a-case/questions/applicant-remove', (req, res) => {
  let id = req.query.id;
  let confirm = req.body.applicantRemove; 

  if (!confirm) {
    return res.render('cases/create-a-case/questions/applicant-remove', { 
      id: id, error: true,
      backUrl: `/cases/create-a-case/questions/applicant-check`,
      actionUrl: `/cases/create-a-case/questions/applicant-remove?id=${id}`
    });
  }

  if (confirm === 'yes') {
    if (req.session.data['applicants']) {
      req.session.data['applicants'] = req.session.data['applicants'].filter(a => a.id !== id);
    }
  }
  
  res.redirect('/cases/create-a-case/questions/applicant-check');
});

// ==============================================================================
// 5. LINKED & LEAD CASE LOGIC
// ==============================================================================

router.post('/linked-case-answer', function(req, res) {
  var isLinked = req.body['isLinkedCase'];
  if (!isLinked) return res.render('cases/create-a-case/questions/linked-case', { errorLinkedCase: "Select yes if this is a linked case" });

  req.session.data['isLinkedCase'] = isLinked;
  if (isLinked === 'yes') res.redirect('/cases/create-a-case/questions/is-lead-case');
  else res.redirect('/cases/create-a-case/check-your-answers');
});

router.post('/is-lead-case-answer', function(req, res) {
  var isLead = req.body['isLeadCase'];
  if (!isLead) return res.render('cases/create-a-case/questions/is-lead-case', { errorIsLeadCase: "Select yes if this case is the lead case" });

  req.session.data['isLeadCase'] = isLead;
  if (isLead === 'yes') res.redirect('/cases/create-a-case/check-your-answers');
  else res.redirect('/cases/create-a-case/questions/lead-case-reference');
});

router.post('/lead-case-reference-answer', function(req, res) {
  var refInput = req.body['leadCaseReference'];
  if (!refInput || refInput.trim() === "") return res.render('cases/create-a-case/questions/lead-case-reference', { errorLeadCaseReference: "Enter the lead case reference" });

  req.session.data['leadCaseReference'] = refInput.trim();
  res.redirect('/cases/create-a-case/check-your-answers');
});

// ==============================================================================
// 6. FINAL SUBMISSION & REFERENCE GENERATION
// ==============================================================================

router.post('/create-case-submit', function (req, res) {
  var area = (req.session.data['casework-area'] || "").toLowerCase();
  var caseType = "";

  if (area.includes('rights') || area.includes('common')) caseType = req.session.data['row-type-of-case']; 
  else caseType = req.session.data['peas-type-of-case'];
  
  if (!caseType) caseType = req.session.data['row-type-of-case'] || req.session.data['peas-type-of-case'] || "UNKNOWN";

  var subtype = "";
  switch(caseType) {
    case 'Drought': subtype = req.session.data['drought-subtype']; break;
    case 'Housing and Planning CPOs': case 'Housing': subtype = req.session.data['housing-planning-cpos-subtype']; break;
    case 'Other Secretary of State casework': case 'Other': subtype = req.session.data['other-sos-casework-subtype']; break;
    case 'Purchase Notices': subtype = ""; break;
    case 'Wayleaves': subtype = req.session.data['wayleaves-subtype']; break;
    case 'Coastal Access': subtype = req.session.data['coastal-subtype']; break;
    case 'Common Land': subtype = req.session.data['common-land-subtype']; break;
    case 'Rights of Way': subtype = req.session.data['row-subtype']; break;
    default: subtype = "UNKNOWN";
  }

  const refData = {
    "Drought": { "Drought Orders": ["DRO", "ORD"], "Drought orders": ["DRO", "ORD"], "Drought Permits": ["DRO", "PER"], "Drought permits": ["DRO", "PER"] },
    "Housing and Planning CPOs": { "Housing": ["CPO", "HOU"], "Planning": ["CPO", "PLA"], "Ad hoc": ["CPO", "ADH"] },
    "Other Secretary of State casework": { "DEFRA CPO": ["SOS", "ENV"], "DESNZ CPO": ["SOS", "ENG"], "DfT CPO": ["SOS", "TRN"], "Ad hoc CPO": ["SOS", "CPO"], "Advert": ["SOS", "ADV"], "Completion notice": ["SOS", "COM"], "Discontinuance notice": ["SOS", "DIS"], "Modification to planning permission": ["SOS", "MOD"], "Review of mineral permission": ["SOS", "MIN"], "Revocation": ["SOS", "REV"], "Other": ["SOS", "OTH"] },
    "Purchase Notices": {},
    "Wayleaves": { "New lines": ["WAY", "LIN"], "Tree lopping": ["WAY", "TRE"], "Wayleaves": ["WAY", "WAY"] },
    "Coastal Access": { "Coastal access appeal": ["MCA", "CAA"], "Notice appeal": ["MCA", "NOT"], "Objection": ["MCA", "OBJ"], "Restriction appeal (access land)": ["MCA", "RES"] },
    "Common Land": { "Commons for Ecclesiastical Purposes": ["COM", "ECC"], "Commons in Greater London": ["COM", "LDN"], "Compulsory Purchase of Common Land": ["COM", "PCL"], "Referred applications from Commons Registration Authorities": ["COM", "REF"], "Deregistration & Exchange": ["COM", "DRE"], "Inclosure": ["COM", "INC"], "Inclosure : obsolescent functions": ["COM", "OBS"], "Land Exchange": ["COM", "LEX"], "Local Acts and Provisional Order Confirmation Acts": ["COM", "LCA"], "Public Access to Commons - limitations and restrictions": ["COM", "PAC"], "Scheme of Management": ["COM", "SOM"], "Stint Rates": ["COM", "STI"], "Works on Common Land": ["COM", "WCL"], "Works on Common Land (National Trust)": ["COM", "WNT"] },
    "Rights of Way": { "Dispensation for Serving Notice HA80": ["ROW", "SNH"], "Dispensation for Serving Notice TCPA90": ["ROW", "SNT"], "Dispensation for Serving Notice WCA81": ["ROW", "SNW"], "Opposed Definitive Map Modification Order (DMMO)": ["ROW", "DMM"], "Opposed Public Path Order (PPO) HA80": ["ROW", "PPH"], "Opposed Public Path Order (PPO) TCPA90": ["ROW", "PPT"], "Schedule 14 Appeal": ["ROW", "S14A"], "Schedule 14 Direction": ["ROW", "S14D"], "Schedule 13A Appeal": ["ROW", "S13A"] }
  };

  var finalRef = "ERROR/REF/100"; 
  var seq = "100" + Math.floor(1 + Math.random() * 99); 

  if (caseType === "Purchase Notices") finalRef = `PUR/${seq}`;
  else if (refData[caseType] && refData[caseType][subtype]) finalRef = `${refData[caseType][subtype][0]}/${refData[caseType][subtype][1]}/${seq}`;
  else finalRef = `GEN/ERIC/${seq}`; 

  var isLinkedFlag = req.session.data['isLinkedCase'] === 'yes';
  var isLeadFlag = req.session.data['isLeadCase'] === 'yes';
  var inputLeadRef = req.session.data['leadCaseReference'];

  var resolvedLeadCase = null;
  var initialLinkedCases = [];

  if (isLinkedFlag) {
    if (isLeadFlag) resolvedLeadCase = finalRef;
    else {
      resolvedLeadCase = inputLeadRef;
      initialLinkedCases.push({ id: 'lc-' + Math.floor(Math.random() * 10000), reference: inputLeadRef });
    }
  }
  
  var fullAddress = [req.session.data['addressLine1'], req.session.data['addressLine2'], req.session.data['addressTown'], req.session.data['addressCounty'], req.session.data['addressPostcode']].filter(Boolean).join(',\n');

  var newCase = {
    "reference": finalRef,
    "caseStatus": "",
    "isLinked": isLinkedFlag,
    "leadCase": resolvedLeadCase,
    "linkedCases": initialLinkedCases,
    "type": caseType,
    "subtype": subtype,
    "areaValue": (req.session.data['casework-area'] || "").toLowerCase().replace(/,?\s+/g, '-'),
    "typeValue": (caseType || "").toLowerCase().replace(/,?\s+/g, '-'),
    "subtypeValue": (subtype || "").toLowerCase().replace(/,?\s+/g, '-'),
    "receivedDay": req.session.data['case-received-date-day'],
    "receivedMonth": req.session.data['case-received-date-month'],
    "receivedYear": req.session.data['case-received-date-year'],
    "caseOfficer": req.session.data['caseOfficer'],
    "caseName": req.session.data['caseName'] || req.session.data['case-name'],
    "siteAddress": fullAddress, 
    "addressLine1": req.session.data['addressLine1'],
    "addressLine2": req.session.data['addressLine2'],
    "addressTown": req.session.data['addressTown'],
    "addressCounty": req.session.data['addressCounty'],
    "addressPostcode": req.session.data['addressPostcode'],
    "applicants": req.session.data['applicants'] || [],
    "authorityName": req.session.data['authorityName'] || req.session.data['authority-name'],
    "externalReference": req.session.data['externalReference'] || req.session.data['external-reference'],
    "siteLocation": req.session.data['siteLocation'] || req.session.data['site-location']
  };

  if (!req.session.data['cases']) { req.session.data['cases'] = []; }
  req.session.data['cases'].push(newCase);

  const savedCases = req.session.data['cases'] || [];
  req.session.data = { 'cases': savedCases };

  addAuditLog(req, finalRef, "Case created");

  res.redirect('/cases/create-a-case/success?caseRef=' + encodeURIComponent(finalRef));
});
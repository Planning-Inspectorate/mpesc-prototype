//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()


// Page routes

router.post('/casework-area-answer', function (req, res) {


  var caseworkarea = req.session.data['casework-area']
  if (caseworkarea == "Planning, Environmental and Applications") {
    res.redirect('/cases/create-a-case/questions/peas-type-of-case')
  } else if (caseworkarea == "Rights of Way and Common Land") {

    res.redirect('/cases/create-a-case/questions/row-type-of-case') 
  }

})

router.post('/peas-type-of-case-answer', function (req, res) {


  var peastype = req.session.data['peas-type-of-case']
  if (peastype == "Drought") {
    res.redirect('/cases/create-a-case/questions/drought-subtype')

  } else if (peastype == "Housing and Planning CPOs") {
    res.redirect('/cases/create-a-case/questions/housing-planning-cpos-subtype') 

  } else if (peastype == "Other Secretary of State casework") {
    res.redirect('/cases/create-a-case/questions/other-sos-casework-subtype') 

  } else if (peastype == "Purchase Notices") {
    res.redirect('/cases/create-a-case/questions/case-name') 

  } else if (peastype == "Wayleaves") {
    res.redirect('/cases/create-a-case/questions/wayleaves-subtype') 
  } 

})

router.post('/drought-subtype-answer', function (req, res) {


  var droughtsub = req.session.data['drought-subtype']
  if (droughtsub == "Drought Permits") {
    res.redirect('/cases/create-a-case/questions/case-name')
  } else if (droughtsub == "Drought Orders") {

    res.redirect('/cases/create-a-case/questions/case-name') 
  }

})

router.post('/row-type-of-case-answer', function (req, res) {


  var rowtype = req.session.data['row-type-of-case']
  if (rowtype == "Coastal Access") {
    res.redirect('/cases/create-a-case/questions/coastal-subtype')

  } else if (rowtype == "Common Land") {
    res.redirect('/cases/create-a-case/questions/common-land-subtype') 

  } else if (rowtype == "Rights of Way") {
    res.redirect('/cases/create-a-case/questions/row-subtype') 
}

})


// Error Messages

router.post('/case-name-answer', function (req, res) {
  var caseName = req.session.data['caseName']
  if (caseName == "") {
    res.render('/cases/create-a-case/questions/case-name', {
      errorCaseName: "Enter the case name"
    })
  } else {
    res.redirect('/cases/create-a-case/questions/external-reference')
  }

})

router.post('/case-received-date-answer', function (req, res) {

  var day = req.session.data['case-received-date-day']
  var month = req.session.data['case-received-date-month']
  var year = req.session.data['case-received-date-year']

  var errorList = []   
  var errorFields = [] 

  if (!day && !month && !year) {
    errorList.push({ text: "Enter received date of submission", href: "#case-received-date-day" })
    errorFields = ['day', 'month', 'year']
  } 
  else {
    
    var missing = []
    if (!day) missing.push('day')
    if (!month) missing.push('month')
    if (!year) missing.push('year')

  
    if (missing.length > 0) {
      var missingText = ""
      if (missing.length === 2) {
        missingText = "Received date of submission must include a " + missing[0] + " and " + missing[1]
      } else {
        missingText = "Received date of submission must include a " + missing[0]
      }
      
      errorList.push({ text: missingText, href: "#case-received-date-" + missing[0] })
      errorFields = errorFields.concat(missing) // Add missing fields to highlight list
    }
  }

  if (day) {
    var dayNum = Number(day)
    if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) {
      errorList.push({ text: "Received date of submission day must be a real day", href: "#case-received-date-day" })
      if (!errorFields.includes('day')) errorFields.push('day')
    }
  }

  if (month) {
    var monthNum = Number(month)
    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      errorList.push({ text: "Received date of submission month must be between 1 and 12", href: "#case-received-date-month" })
      if (!errorFields.includes('month')) errorFields.push('month')
    }
  }

  if (year) {
    var yearNum = Number(year)
    if (year.length != 4 || isNaN(yearNum)) {
      errorList.push({ text: "Received date of submission year must include four numbers", href: "#case-received-date-year" })
      if (!errorFields.includes('year')) errorFields.push('year')
    }
  }


  if (errorList.length > 0) {

    var fieldErrorMessage = errorList.map(e => e.text).join('<br>')

    res.render('/cases/create-a-case/questions/case-received-date', {
      errorList: errorList,
      errorFields: errorFields,
      fieldErrorMessage: fieldErrorMessage, 
      day: day,
      month: month,
      year: year
    })
  } else {
    res.redirect('/cases/create-a-case/questions/applicant')
  }

})

router.post('/applicant-name-answer', function (req, res) {
  var applicantName = req.session.data['applicantName']
  if (applicantName == "") {
    res.render('/cases/create-a-case/questions/applicant', {
      errorApplicantName: "Enter the applicant name"
    })
  } else {
    res.redirect('/cases/create-a-case/questions/site-address')
  }

})

router.post('/case-officer-answer', function (req, res) {

  var selectedOfficer = req.session.data['caseOfficer']

  var allowedOfficers = [
    "Kieran De La Cruz",
    "Edward Mitchell",
    "Sarah Tudor",
    "Steve Waterfield",
    "Alex Hudd",
    "Harry Wood",
    "Rob Davis",
    "Deborah Board",
    "(Service Account) Automated Tester",
    "Owen Woodwards"
  ]


  if (selectedOfficer == "") {
    res.render('/cases/create-a-case/questions/case-officer', {
      errorCaseOfficer: "Select a case officer"
    })
  } 
  else if (!allowedOfficers.includes(selectedOfficer)) {
    res.render('/cases/create-a-case/questions/case-officer', {
      errorCaseOfficer: "Select a case officer"
    })
  } 
  else {
    res.redirect('/cases/create-a-case/check-your-answers')
  }

})

router.post('/site-address-answer', function(req, res) {
  
  // Get values from form
  var line1 = req.body['addressLine1'];
  var line2 = req.body['addressLine2'];
  var town = req.body['addressTown'];
  var county = req.body['addressCounty'];
  var postcode = req.body['addressPostcode'];

  // --- VALIDATION LOGIC ---
  var error = false;
  var errorMsg = "";

  // Only validate if postcode is NOT empty (since it's optional)
  if (postcode && postcode.trim() !== "") {
    
    // Clean up input (remove spaces, uppercase)
    var cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    
    // Strict UK Postcode Regex
    var postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/;

    if (cleanPostcode.length < 5 || cleanPostcode.length > 7) {
      error = true;
      errorMsg = "Postcode must be between 5 and 7 characters";
    } 
    else if (!postcodeRegex.test(cleanPostcode)) {
      error = true;
      errorMsg = "Enter a real postcode";
    }
  }

  // IF ERROR: Re-render the page with errors
  if (error) {
    return res.render('/cases/create-a-case/questions/site-address', { // Note: 'site-address' is likely in the root views folder for create flow
      // Pass back values so user doesn't have to re-type
      addressLine1: line1,
      addressLine2: line2,
      addressTown: town,
      addressCounty: county,
      addressPostcode: postcode,
      error: true,
      errorMessage: { text: errorMsg }
    });
  }

  // --- SUCCESS ---
  // Save to session (Create flow uses session data)
  req.session.data['addressLine1'] = line1;
  req.session.data['addressLine2'] = line2;
  req.session.data['addressTown'] = town;
  req.session.data['addressCounty'] = county;
  req.session.data['addressPostcode'] = postcode;

  // Continue to next step
  res.redirect('/cases/create-a-case/questions/location'); // or whatever your next step is
});




//Reference Number Validation

router.post('/create-case-submit', function (req, res) {

  // --- 1. DEBUG LOGS (Keep this forever!) ---
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.log("!!! ROUTE TRIGGERED: /create-case-submit !!!");
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

  // --- 2. DETERMINE CASE TYPE (ROBUST MODE) ---
  // We use .toLowerCase() to match loosely (avoids capitalization errors)
  var area = (req.session.data['casework-area'] || "").toLowerCase();
  var caseType = "";

  // Logic: Check keywords rather than exact strings
  if (area.includes('rights') || area.includes('common')) {
     caseType = req.session.data['row-type-of-case']; 
  } 
  else {
     // Default to PEAS if it's not ROW/Common Land
     caseType = req.session.data['peas-type-of-case'];
  }
  
  // Fallback if still empty
  if (!caseType) {
    caseType = req.session.data['row-type-of-case'] || req.session.data['peas-type-of-case'] || "UNKNOWN";
  }

  console.log("DEBUG: Area identified as:", area);
  console.log("DEBUG: Case Type identified as:", caseType);


  // --- 3. GET SUBTYPE (STRICT SWITCH) ---
  var subtype = "";

  switch(caseType) {
    case 'Drought':
      subtype = req.session.data['drought-subtype']; 
      break;
    case 'Housing and Planning CPOs':
    case 'Housing':
      subtype = req.session.data['housing-planning-cpos-subtype'];
      break;
    case 'Other Secretary of State casework':
    case 'Other':
      subtype = req.session.data['other-sos-casework-subtype'];
      break;
    case 'Purchase Notices':
      subtype = ""; // No subtype
      break;
    case 'Wayleaves':
      subtype = req.session.data['wayleaves-subtype'];
      break;
    case 'Coastal Access':
      subtype = req.session.data['coastal-subtype'];
      break;
    case 'Common Land':
      subtype = req.session.data['common-land-subtype'];
      break;
    case 'Rights of Way':
      subtype = req.session.data['row-subtype'];
      break;
    default:
      subtype = "UNKNOWN";
  }


  // --- 4. THE FULL DATA MAP ---
  const refData = {
    "Drought": { 
      "Drought Orders": ["DRO", "ORD"], "Drought orders": ["DRO", "ORD"], 
      "Drought Permits": ["DRO", "PER"], "Drought permits": ["DRO", "PER"]
    },
    "Housing and Planning CPOs": { 
      "Housing": ["CPO", "HOU"], "Planning": ["CPO", "PLA"], "Ad hoc": ["CPO", "ADH"] 
    },
    "Other Secretary of State casework": {
      "DEFRA CPO": ["SOS", "ENV"], "DESNZ CPO": ["SOS", "ENG"], "DfT CPO": ["SOS", "TRN"],
      "Ad hoc CPO": ["SOS", "CPO"], "Advert": ["SOS", "ADV"], "Completion notice": ["SOS", "COM"],
      "Discontinuance notice": ["SOS", "DIS"], "Modification to planning permission": ["SOS", "MOD"],
      "Review of mineral permission": ["SOS", "MIN"], "Revocation": ["SOS", "REV"], "Other": ["SOS", "OTH"]
    },
    "Purchase Notices": {},
    "Wayleaves": { 
      "New lines": ["WAY", "LIN"], "Tree lopping": ["WAY", "TRE"], "Wayleaves": ["WAY", "WAY"] 
    },
    "Coastal Access": {
      "Coastal access appeal": ["MCA", "CAA"], "Notice appeal": ["MCA", "NOT"], 
      "Objection": ["MCA", "OBJ"], "Restriction appeal (access land)": ["MCA", "RES"]
    },
    "Common Land": {
      "Commons for Ecclesiastical Purposes": ["COM", "ECC"], "Commons in Greater London": ["COM", "LDN"], 
      "Compulsory Purchase of Common Land": ["COM", "PCL"], "Correction of the Common Land or Village Green Registers": ["COM", "COR"], 
      "Deregistration & Exchange": ["COM", "DRE"], "Inclosure": ["COM", "INC"], 
      "Inclosure : obsolescent functions": ["COM", "OBS"], "Land Exchange": ["COM", "LEX"], 
      "Local Acts and Provisional Order Confirmation Acts": ["COM", "LCA"], "Public Access to Commons - limitations and restrictions": ["COM", "PAC"], 
      "Scheme of Management": ["COM", "SOM"], "Stint Rates": ["COM", "STI"], 
      "Works on Common Land": ["COM", "WCL"], "Works on Common Land (National Trust)": ["COM", "WNT"]
    },
    "Rights of Way": {
      "Dispensation for Serving Notice HA80": ["ROW", "SNH"], "Dispensation for Serving Notice TCPA90": ["ROW", "SNT"],
      "Dispensation for Serving Notice WCA81": ["ROW", "SNW"], "Opposed Definitive Map Modification Order (DMMO)": ["ROW", "DMM"],
      "Opposed Public Path Order (PPO) HA80": ["ROW", "PPH"], "Opposed Public Path Order (PPO) TCPA90": ["ROW", "PPT"],
      "Schedule 14 Appeal": ["ROW", "S14A"], "Schedule 14 Direction": ["ROW", "S14D"], "Schedule 13A Appeal": ["ROW", "S13A"]
    }
  };


  // --- 5. GENERATE REFERENCE ---
  var finalRef = "ERROR/REF/000"; 
  var seq = "000" + Math.floor(1 + Math.random() * 99); 

  if (caseType == "Purchase Notices") {
    finalRef = `PUR/${seq}`;
  } 
  else if (refData[caseType]) {
    var typeGroup = refData[caseType];
    var codes = typeGroup[subtype];
    
    if (codes) {
      finalRef = `${codes[0]}/${codes[1]}/${seq}`;
    } else {
      console.log("WARNING: Code not found for subtype '" + subtype + "'. Using fallback.");
      finalRef = `UNK/NOWN/${seq}`;
    }
  } 
  else {
    finalRef = `GEN/ERIC/${seq}`; 
  }


// --- 6. SAVE THE CASE ---

  // 1. Construct the address string first
  var fullAddress = [
    req.session.data['addressLine1'],
    req.session.data['addressLine2'],
    req.session.data['addressTown'],
    req.session.data['addressCounty'],
    req.session.data['addressPostcode']
  ].filter(Boolean).join(',\n');

  var newCase = {
    "reference": finalRef,
    "status": "",
    "type": caseType,
    "subtype": subtype,
    "receivedDay": req.session.data['case-received-date-day'],
    "receivedMonth": req.session.data['case-received-date-month'],
    "receivedYear": req.session.data['case-received-date-year'],
    "caseOfficer": req.session.data['caseOfficer'],
    
    // Mapped Fields:
    "caseName": req.session.data['caseName'] || req.session.data['case-name'],
    
    // Use the variable we created above
    "siteAddress": fullAddress, 
    
    // Save the individual address parts too (so you can edit them later)
    "addressLine1": req.session.data['addressLine1'],
    "addressLine2": req.session.data['addressLine2'],
    "addressTown": req.session.data['addressTown'],
    "addressCounty": req.session.data['addressCounty'],
    "addressPostcode": req.session.data['addressPostcode'],

    // Fix the typo (applicantName) and map the data
    "applicantName": req.session.data['applicantName'] || req.session.data['applicant-name'],
    
    // Map the authority/LPA
    "authorityName": req.session.data['authorityName'] || req.session.data['authority'] || req.session.data['lpa'],

    // Map the external reference
    "externalReference": req.session.data['externalReference'] || req.session.data['external-reference'],

    // Map the site location (grid ref)
    "siteLocation": req.session.data['siteLocation'] || req.session.data['site-location']
  };

  if (!req.session.data['cases']) { req.session.data['cases'] = []; }
  req.session.data['cases'].push(newCase);


  // --- 7. REDIRECT WITH URL PARAM (Crucial for Success Page) ---
  console.log("SUCCESS: Case Saved with Ref:", finalRef);
  
  // Pass the ref in the URL so the Success Page sees it immediately
  res.redirect('/cases/create-a-case/success?caseRef=' + encodeURIComponent(finalRef));

});




// --- CASE DETAILS EDIT LOGIC ---

// Helper to find a case
function getCase(req) {
  var ref = req.query.ref || req.body.ref || req.params.ref;
  var cases = req.session.data['cases'] || [];
  return cases.find(c => c.reference === ref);
}

// --- SPECIFIC FIELD ROUTES (Must be above the generic :field route) ---

// 1. CASE NAME (Migration Logic: Reads old 'case-name', saves new 'caseName')
router.get('/cases/edit/case-name', function(req, res) {
  var c = getCase(req);
  
  // LOGIC: Check for the new camelCase variable first. 
  // If it doesn't exist, check the old kebab-case variable.
  var currentValue = c.caseName || c['case-name'];

  res.render('cases/edit/case-name', { 
    ref: c.reference, 
    value: currentValue 
  });
});

router.post('/cases/edit/case-name', function(req, res) {
  var ref = req.query.ref;
  // Ensure we read from the form correctly (Make sure input name="caseName")
  var val = req.body.caseName; 
  
  // VALIDATION
  if (!val || val.trim() === "") {
    return res.render('cases/edit/case-name', { 
      ref: ref, 
      value: val, 
      error: true, 
      errorMessage: { text: "Enter the case name" } 
    });
  }

  var c = getCase(req);
  
  // SAVE to new variable
  c.caseName = val;
  
  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});

router.post('/cases/edit/applicant-name', function(req, res) {
  var ref = req.query.ref;
  var val = req.body['applicantName'];

  if (!val) {
    return res.render('cases/edit/applicant-name', { ref: ref, error: true, errorMessage: { text: "Enter the applicant name" } });
  }

  var c = getCase(req);
  c['applicantName'] = val;
  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});

// --- 2. EXTERNAL REFERENCE (No validation, migrate to externalReference) ---
router.get('/cases/edit/external-reference', function(req, res) {
  var c = getCase(req);
  var val = c.externalReference || c['external-reference'];
  res.render('cases/edit/external-reference', { ref: c.reference, value: val });
});

router.post('/cases/edit/external-reference', function(req, res) {
  var ref = req.query.ref;
  var val = req.body.externalReference;
  var c = getCase(req);
  
  c.externalReference = val;
  
  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});

// --- 3. APPLICANT / SERVER (Validation required, migrate to applicantName) ---
router.get('/cases/edit/applicant-name', function(req, res) {
  var c = getCase(req);
  var val = c.applicantName || c['applicant-name'];
  res.render('cases/edit/applicant-name', { ref: c.reference, value: val });
});

router.post('/cases/edit/applicant-name', function(req, res) {
  var ref = req.query.ref;
  var val = req.body.applicantName;

  if (!val || val.trim() === "") {
    return res.render('cases/edit/applicant-name', { 
      ref: ref, 
      value: val, 
      error: true, 
      errorMessage: { text: "Enter the applicant name" } 
    });
  }

  var c = getCase(req);
  c.applicantName = val;
  delete c['applicant-name']; 
  
  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});

// --- 4. EDIT SITE ADDRESS (With Strict Postcode Validation) ---
router.post('/cases/edit/site-address', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Get values
  var line1 = req.body['addressLine1'];
  var line2 = req.body['addressLine2'];
  var town = req.body['addressTown'];
  var county = req.body['addressCounty'];
  var postcode = req.body['addressPostcode'];

  // --- VALIDATION LOGIC ---
  var error = false;
  var errorMsg = "";

  if (postcode && postcode.trim() !== "") {
    // 1. Clean up the input (remove spaces to check pattern easier)
    var cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();

    // 2. Strict UK Postcode Regex
    // Breakdown:
    // ^[A-Z]{1,2}    -> Starts with 1 or 2 letters
    // [0-9][A-Z0-9]? -> Followed by a number (and optionally another number or letter)
    // [0-9][A-Z]{2}$ -> Ends with a number and 2 letters
    var postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/;

    if (cleanPostcode.length < 5 || cleanPostcode.length > 7) {
      error = true;
      errorMsg = "Postcode must be between 5 and 7 characters (excluding spaces)";
    } 
    else if (!postcodeRegex.test(cleanPostcode)) {
      error = true;
      errorMsg = "Enter a real postcode";
    }
  }

  // IF ERROR: Re-render
  if (error) {
    return res.render('cases/edit/site-address', {
      ref: ref,
      addressLine1: line1,
      addressLine2: line2,
      addressTown: town,
      addressCounty: county,
      addressPostcode: postcode,
      error: true,
      errorMessage: { text: errorMsg }
    });
  }

  // --- SUCCESS ---
  c.addressLine1 = line1;
  c.addressLine2 = line2;
  c.addressTown = town;
  c.addressCounty = county;
  c.addressPostcode = postcode;

  // Join by newline, filter empty lines
  var fullAddress = [line1, line2, town, county, postcode]
    .filter(Boolean)
    .join('\n');
  
  c.siteAddress = fullAddress; 
  delete c['site-address']; 

  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});

// --- 5. SITE LOCATION (No validation, migrate to siteLocation) ---
router.get('/cases/edit/site-location', function(req, res) {
  var c = getCase(req);
  var val = c.siteLocation || c['site-location'];
  res.render('cases/edit/site-location', { ref: c.reference, value: val });
});

router.post('/cases/edit/site-location', function(req, res) {
  var ref = req.query.ref;
  var val = req.body.siteLocation;
  var c = getCase(req);
  
  c.siteLocation = val;
  delete c['site-location'];

  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});

// --- 6. AUTHORITY (No validation, migrate to authorityName) ---
router.get('/cases/edit/authority', function(req, res) {
  var c = getCase(req);
  var val = c.authorityName || c['authority'];
  res.render('cases/edit/authority', { ref: c.reference, value: val });
});

router.post('/cases/edit/authority', function(req, res) {
  var ref = req.query.ref;
  var val = req.body.authorityName;
  var c = getCase(req);
  
  c.authorityName = val;
  delete c['authority'];

  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});

// --- 7. HISTORICAL REFERENCE (Text input, no validation) ---
router.get('/cases/edit/historical-reference', function(req, res) {
  var c = getCase(req);
  // specific variable OR generic fallback
  var val = c.historicalReference || c['historical-reference'];
  res.render('cases/edit/historical-reference', { ref: c.reference, value: val });
});

router.post('/cases/edit/historical-reference', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  
  c.historicalReference = req.body.historicalReference;
  delete c['historical-reference']; // Cleanup old var

  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});

// --- 8. CASE STATUS (12 Radios + Remove logic) ---
router.get('/cases/edit/case-status', function(req, res) {
  var c = getCase(req);
  var val = c.caseStatus || c['case-status'];
  res.render('cases/edit/case-status', { ref: c.reference, value: val });
});

router.post('/cases/edit/case-status', function(req, res) {
  var ref = req.query.ref;
  var action = req.body.action; // Check if "Remove" was clicked
  var val = req.body.caseStatus;
  var c = getCase(req);

  // 1. Handle Remove
  if (action === 'remove') {
    delete c.caseStatus;
    delete c['case-status'];
    return res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
  }

  // 2. Validation (Required)
  if (!val) {
    return res.render('cases/edit/case-status', { 
      ref: ref, 
      error: true, 
      errorMessage: { text: "Select a case status" } 
    });
  }

  // 3. Save
  c.caseStatus = val;
  delete c['case-status'];
  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});

// --- 9. MODIFICATION STATUS (5 Radios + Remove logic) ---
router.get('/cases/edit/modification-status', function(req, res) {
  var c = getCase(req);
  var val = c.modificationStatus || c['modification-status'];
  res.render('cases/edit/modification-status', { ref: c.reference, value: val });
});

router.post('/cases/edit/modification-status', function(req, res) {
  var ref = req.query.ref;
  var action = req.body.action;
  var val = req.body.modificationStatus;
  var c = getCase(req);

  if (action === 'remove') {
    delete c.modificationStatus;
    delete c['modification-status'];
    return res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
  }

  if (!val) {
    return res.render('cases/edit/modification-status', { 
      ref: ref, 
      error: true, 
      errorMessage: { text: "Select a modification status" } 
    });
  }

  c.modificationStatus = val;
  delete c['modification-status'];
  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});

// --- 10. PRIORITY (3 Radios + Remove logic) ---
router.get('/cases/edit/priority', function(req, res) {
  var c = getCase(req);
  var val = c.priority || c['priority'];
  res.render('cases/edit/priority', { ref: c.reference, value: val });
});

router.post('/cases/edit/priority', function(req, res) {
  var ref = req.query.ref;
  var action = req.body.action;
  var val = req.body.priority;
  var c = getCase(req);

  if (action === 'remove') {
    delete c.priority;
    delete c['priority'];
    return res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
  }

  if (!val) {
    return res.render('cases/edit/priority', { 
      ref: ref, 
      error: true, 
      errorMessage: { text: "Select a priority" } 
    });
  }

  c.priority = val;
  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});


// --- TEAM / CASE OFFICER LOGIC ---

router.get('/cases/edit/case-officer', function(req, res) {
  var c = getCase(req);
  // Read caseOfficer (camelCase) or fallback to case-officer (kebab)
  var val = c.caseOfficer || c['case-officer'];
  
  res.render('cases/edit/case-officer', { 
    ref: c.reference, 
    value: val 
  });
});

router.post('/cases/edit/case-officer', function(req, res) {
  var ref = req.query.ref;
  var val = req.body.caseOfficer;
  var action = req.body.action;
  var c = getCase(req);

  // 1. Handle Remove
  if (action === 'remove') {
    delete c.caseOfficer;
    return res.redirect('/cases/case-details?ref=' + ref + '&updated=team');
  }

  // 2. Validation
  // We can check if it's empty
  if (!val || val.trim() === "") {
    return res.render('cases/edit/case-officer', {
      ref: ref,
      error: true,
      errorMessage: { text: "Select a case officer" }
    });
  }

  // OPTIONAL: Check if the name is actually in the allowed list
  var officers = [
    "Kieran De La Cruz", "Edward Mitchell", "Sarah Tudor", "Steve Waterfield",
    "Alex Hudd", "Harry Wood", "Rob Davis", "Deborah Board",
    "(Service Account) Automated Tester", "Owen Woodwards"
  ];
  
  if (!officers.includes(val)) {
     return res.render('cases/edit/case-officer', {
      ref: ref,
      value: val, // keep what they typed
      error: true,
      errorMessage: { text: "Select a case officer" }
    });   
  }

  // 3. Save
  c.caseOfficer = val;
  delete c['case-officer']; // Cleanup old variable
  
  // Note: updated=team refers to the ID of the new summary card below
  res.redirect('/cases/case-details?ref=' + ref + '&updated=team');
});




// --- INSPECTOR LOGIC (Add, Edit, Delete & Validation) ---

// 1. HUB PAGE: Check Inspectors
router.get('/cases/edit/check-inspectors', function (req, res) {
  var c = getCase(req);
  if (!c.inspectors) { c.inspectors = []; }

  // CLEAR TEMP DATA (So "Add details" starts fresh)
  req.session.data['inspectorTemp'] = null; 

  res.render('cases/edit/check-inspectors', { 
    ref: c.reference,
    inspectors: c.inspectors
  });
});

// 2. CHANGE ROUTE: Load existing data into session
router.get('/cases/edit/inspector-change', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var c = getCase(req);

  var item = c.inspectors.find(i => i.id === id);

  if (item) {
    // Save existing data to a temp object in session
    req.session.data['inspectorTemp'] = {
      id: item.id,             // We track the ID to know we are editing
      name: item.name,
      day: item.rawDay,
      month: item.rawMonth,
      year: item.rawYear
    };
  }

  // Redirect to the first step (Name)
  res.redirect('/cases/edit/inspector-name?ref=' + ref);
});

// 3. STEP 1: Inspector Name (GET)
router.get('/cases/edit/inspector-name', function (req, res) {
  // Use temp data if it exists (for editing), otherwise empty
  var temp = req.session.data['inspectorTemp'] || {};
  
  res.render('cases/edit/inspector-name', { 
    ref: req.query.ref,
    value: temp.name
  });
});

// 4. STEP 1: Inspector Name (POST)
router.post('/cases/edit/inspector-name', function (req, res) {
  var ref = req.query.ref;
  var val = req.body.inspectorName;
  
  // Validation
  if (!val || val.trim() === "") {
    return res.render('cases/edit/inspector-name', {
      ref: ref,
      error: true,
      errorMessage: { text: "Select an inspector" }
    });
  }

  // Check valid list (Optional)
  var officers = [
    "Kieran De La Cruz", "Edward Mitchell", "Sarah Tudor", "Steve Waterfield",
    "Alex Hudd", "Harry Wood", "Rob Davis", "Deborah Board",
    "(Service Account) Automated Tester", "Owen Woodwards"
  ];
  if (!officers.includes(val)) {
     return res.render('cases/edit/inspector-name', {
      ref: ref,
      value: val,
      error: true,
      errorMessage: { text: "Select an inspector" }
    });   
  }

  // Save to temp object
  if (!req.session.data['inspectorTemp']) { req.session.data['inspectorTemp'] = {}; }
  req.session.data['inspectorTemp'].name = val;

  res.redirect('/cases/edit/inspector-date?ref=' + ref);
});

// 5. STEP 2: Inspector Date (GET)
router.get('/cases/edit/inspector-date', function (req, res) {
  var temp = req.session.data['inspectorTemp'] || {};
  
  res.render('cases/edit/inspector-date', { 
    ref: req.query.ref,
    day: temp.day,
    month: temp.month,
    year: temp.year
  });
});

// 6. STEP 2: Inspector Date (POST - Save/Update)
router.post('/cases/edit/inspector-date', function (req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  var day = req.body['date-day'];
  var month = req.body['date-month'];
  var year = req.body['date-year'];

  var errorList = [];
  var errorFields = []; 

  // --- ROBUST DATE VALIDATION ---
  if (!day && !month && !year) {
    errorList.push({ text: "Enter the Inspector allocated date", href: "#date-day" });
    errorFields = ['day', 'month', 'year'];
  } else {
    var missing = [];
    if (!day) missing.push('day');
    if (!month) missing.push('month');
    if (!year) missing.push('year');
  
    if (missing.length > 0) {
      var missingText = "";
      if (missing.length === 2) {
        missingText = "Inspector allocated date must include a " + missing[0] + " and " + missing[1];
      } else {
        missingText = "Inspector allocated date must include a " + missing[0];
      }
      errorList.push({ text: missingText, href: "#date-" + missing[0] });
      errorFields = errorFields.concat(missing);
    }
  }

  if (day) {
    var dayNum = Number(day);
    if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) {
      errorList.push({ text: "Inspector allocated date day must be a real day", href: "#date-day" });
      if (!errorFields.includes('day')) errorFields.push('day');
    }
  }

  if (month) {
    var monthNum = Number(month);
    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      errorList.push({ text: "Inspector allocated date month must be between 1 and 12", href: "#date-month" });
      if (!errorFields.includes('month')) errorFields.push('month');
    }
  }

  if (year) {
    var yearNum = Number(year);
    if (year.length != 4 || isNaN(yearNum)) {
      errorList.push({ text: "Inspector allocated date year must include four numbers", href: "#date-year" });
      if (!errorFields.includes('year')) errorFields.push('year');
    }
  }

  // Check for real date (e.g. 31 Feb)
  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) {
        errorList.push({ text: "Enter a real date", href: "#date-day" });
        errorFields = ['day', 'month', 'year'];
     }
  }

  // --- ERROR HANDLING ---
  if (errorList.length > 0) {
    return res.render('cases/edit/inspector-date', {
      ref: ref,
      errorList: errorList,
      errorFields: errorFields,
      day: day, month: month, year: year
    });
  }

  // --- SUCCESS: SAVE ---
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var formattedDate = day + " " + months[month - 1] + " " + year;
  
  // Get the name from temp storage
  var temp = req.session.data['inspectorTemp'] || {};
  var name = temp.name;
  var editingId = temp.id; // Check if we are editing an existing ID

  if (editingId) {
    // UPDATE EXISTING
    var item = c.inspectors.find(i => i.id === editingId);
    if (item) {
      item.name = name;
      item.date = formattedDate;
      item.rawDay = day;
      item.rawMonth = month;
      item.rawYear = year;
    }
  } else {
    // CREATE NEW
    if (!c.inspectors) { c.inspectors = []; }
    c.inspectors.push({
      id: 'insp-' + Math.floor(Math.random() * 10000),
      name: name,
      date: formattedDate,
      rawDay: day,
      rawMonth: month,
      rawYear: year
    });
  }

  // Clear temp data
  req.session.data['inspectorTemp'] = null;

  res.redirect('/cases/edit/check-inspectors?ref=' + ref);
});

// 7. REMOVE ROUTE
router.get('/cases/edit/inspector-remove', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var c = getCase(req);

  if (c.inspectors) {
    c.inspectors = c.inspectors.filter(i => i.id !== id);
  }

  res.redirect('/cases/edit/check-inspectors?ref=' + ref);
});


// ------------------------------------- TIMETABLE SUMMARY CARD --------------------------------------------

// --- 1. CASE RECEIVED DATE (Clean & Validated) ---

router.get('/cases/edit/case-received-date', function(req, res) {
  var c = getCase(req);

  // Look for the date in all possible locations:
  // 1. The new formatted object (if edited)
  // 2. The variables from the Create flow (receivedDay)
  // 3. The raw variables from older prototypes (case-received-date-day)
  
  var day = (c.caseReceivedDate && c.caseReceivedDate.day) 
            || c.receivedDay 
            || c['case-received-date-day'];

  var month = (c.caseReceivedDate && c.caseReceivedDate.month) 
              || c.receivedMonth 
              || c['case-received-date-month'];

  var year = (c.caseReceivedDate && c.caseReceivedDate.year) 
             || c.receivedYear 
             || c['case-received-date-year'];

  res.render('cases/edit/case-received-date', {
    ref: c.reference,
    day: day,
    month: month,
    year: year
  });
});

router.post('/cases/edit/case-received-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Get inputs (matches HTML namePrefix 'date')
  var day = req.body['date-day'];
  var month = req.body['date-month'];
  var year = req.body['date-year'];
  var action = req.body.action;

  // 1. Handle Remove
  if (action === 'remove') {
    delete c.caseReceivedDate;
    delete c.receivedDay; 
    delete c.receivedMonth; 
    delete c.receivedYear;
    delete c['case-received-date-day'];
    delete c['case-received-date-month'];
    delete c['case-received-date-year'];
    return res.redirect('/cases/case-details?ref=' + ref + '#timetable');
  }

  // 2. Validation Logic
  var errorList = [];
  var errorFields = [];

  // Check if everything is empty
  if (!day && !month && !year) {
    errorList.push({ text: "Enter Case received / submitted date", href: "#date-day" });
    errorFields = ['day', 'month', 'year'];
  } 
  else {
    // Check for missing parts
    var missing = [];
    if (!day) missing.push('day');
    if (!month) missing.push('month');
    if (!year) missing.push('year');
  
    if (missing.length > 0) {
      var missingText = "";
      if (missing.length === 2) {
        missingText = "Case received / submitted date must include a " + missing[0] + " and " + missing[1];
      } else {
        missingText = "Case received / submitted date must include a " + missing[0];
      }
      errorList.push({ text: missingText, href: "#date-" + missing[0] });
      errorFields = errorFields.concat(missing);
    }
  }

  // Validate Day (1-31)
  if (day) {
    var dayNum = Number(day);
    if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) {
      errorList.push({ text: "Case received / submitted must include a day", href: "#date-day" });
      if (!errorFields.includes('day')) errorFields.push('day');
    }
  }

  // Validate Month (1-12)
  if (month) {
    var monthNum = Number(month);
    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      errorList.push({ text: "Case received / submitted month must be between 1 and 12", href: "#date-month" });
      if (!errorFields.includes('month')) errorFields.push('month');
    }
  }

  // Validate Year (4 digits)
  if (year) {
    var yearNum = Number(year);
    if (year.length != 4 || isNaN(yearNum)) {
      errorList.push({ text: "Case received / submitted year must include 4 numbers", href: "#date-year" });
      if (!errorFields.includes('year')) errorFields.push('year');
    }
  }

  // Check for real date (e.g. 31 Feb)
  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) {
        errorList.push({ text: "Enter a real date", href: "#date-day" });
        errorFields = ['day', 'month', 'year'];
     }
  }

  // If there are errors, reload the page
  if (errorList.length > 0) {
    return res.render('cases/edit/case-received-date', {
      ref: ref,
      errorList: errorList,
      errorFields: errorFields,
      // Pass back values so user doesn't re-type
      day: day,
      month: month,
      year: year
    });
  }

  // 3. Success: Save Data
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var monthName = month ? months[month - 1] : "";
  var formatted = day + " " + monthName + " " + year;

  // Save as the new standard object
  c.caseReceivedDate = {
    day: day,
    month: month,
    year: year,
    formatted: formatted
  };
  
  // Update legacy variables to keep everything in sync
  c.receivedDay = day;
  c.receivedMonth = month;
  c.receivedYear = year;

  res.redirect('/cases/case-details?ref=' + ref + '#timetable');
});


// --- 2. START DATE (With Robust Validation) ---

router.get('/cases/edit/start-date', function(req, res) {
  var c = getCase(req);
  // We look for our specific object "startDate"
  var val = c.startDate || {};
  
  res.render('cases/edit/start-date', {
    ref: c.reference,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/edit/start-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Get inputs
  var day = req.body['date-day'];
  var month = req.body['date-month'];
  var year = req.body['date-year'];
  var action = req.body.action;

  // 1. Handle Remove
  if (action === 'remove') {
    delete c.startDate;
    return res.redirect('/cases/case-details?ref=' + ref + '#timetable');
  }

  // 2. Validation Logic
  var errorList = [];
  var errorFields = [];

  // Check if everything is empty
  if (!day && !month && !year) {
    errorList.push({ text: "Enter the start date", href: "#date-day" });
    errorFields = ['day', 'month', 'year'];
  } 
  else {
    // Check for missing parts
    var missing = [];
    if (!day) missing.push('day');
    if (!month) missing.push('month');
    if (!year) missing.push('year');
  
    if (missing.length > 0) {
      var missingText = "";
      if (missing.length === 2) {
        missingText = "Start date must include a " + missing[0] + " and " + missing[1];
      } else {
        missingText = "Start date must include a " + missing[0];
      }
      errorList.push({ text: missingText, href: "#date-" + missing[0] });
      errorFields = errorFields.concat(missing);
    }
  }

  // Validate Day (1-31)
  if (day) {
    var dayNum = Number(day);
    if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) {
      errorList.push({ text: "Start date day must be a real day", href: "#date-day" });
      if (!errorFields.includes('day')) errorFields.push('day');
    }
  }

  // Validate Month (1-12)
  if (month) {
    var monthNum = Number(month);
    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      errorList.push({ text: "Start date month must be a real month", href: "#date-month" });
      if (!errorFields.includes('month')) errorFields.push('month');
    }
  }

  // Validate Year (4 digits)
  if (year) {
    var yearNum = Number(year);
    if (year.length != 4 || isNaN(yearNum)) {
      errorList.push({ text: "Start date year must include four numbers", href: "#date-year" });
      if (!errorFields.includes('year')) errorFields.push('year');
    }
  }

  // Check for real date (e.g. 31 Feb)
  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) {
        errorList.push({ text: "Enter a real date", href: "#date-day" });
        errorFields = ['day', 'month', 'year'];
     }
  }

  // If there are errors, reload page
  if (errorList.length > 0) {
    return res.render('cases/edit/start-date', {
      ref: ref,
      errorList: errorList,
      errorFields: errorFields,
      day: day, month: month, year: year
    });
  }

  // 3. Save
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var monthName = month ? months[month - 1] : "";
  var formatted = day + " " + monthName + " " + year;

  c.startDate = {
    day: day,
    month: month,
    year: year,
    formatted: formatted
  };

  res.redirect('/cases/case-details?ref=' + ref + '#timetable');
});


// --- 3. EXPECTED SUBMISSION DATE ---

router.get('/cases/edit/expected-submission-date', function(req, res) {
  var c = getCase(req);
  var val = c.expectedSubmissionDate || {};
  
  res.render('cases/edit/expected-submission-date', {
    ref: c.reference,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/edit/expected-submission-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Get inputs
  var day = req.body['date-day'];
  var month = req.body['date-month'];
  var year = req.body['date-year'];
  var action = req.body.action;

  // 1. Handle Remove
  if (action === 'remove') {
    delete c.expectedSubmissionDate;
    return res.redirect('/cases/case-details?ref=' + ref + '#timetable');
  }

  // 2. Validation Logic
  var errorList = [];
  var errorFields = [];

  // Check if everything is empty
  if (!day && !month && !year) {
    errorList.push({ text: "Enter the expected submission date", href: "#date-day" });
    errorFields = ['day', 'month', 'year'];
  } 
  else {
    // Check for missing parts
    var missing = [];
    if (!day) missing.push('day');
    if (!month) missing.push('month');
    if (!year) missing.push('year');
  
    if (missing.length > 0) {
      var missingText = "";
      if (missing.length === 2) {
        missingText = "Expected submission date must include a " + missing[0] + " and " + missing[1];
      } else {
        missingText = "Expected submission date must include a " + missing[0];
      }
      errorList.push({ text: missingText, href: "#date-" + missing[0] });
      errorFields = errorFields.concat(missing);
    }
  }

  // Validate Day (1-31)
  if (day) {
    var dayNum = Number(day);
    if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) {
      errorList.push({ text: "Expected submission date day must be a real day", href: "#date-day" });
      if (!errorFields.includes('day')) errorFields.push('day');
    }
  }

  // Validate Month (1-12)
  if (month) {
    var monthNum = Number(month);
    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      errorList.push({ text: "Expected submission date month must be a real month", href: "#date-month" });
      if (!errorFields.includes('month')) errorFields.push('month');
    }
  }

  // Validate Year (4 digits)
  if (year) {
    var yearNum = Number(year);
    if (year.length != 4 || isNaN(yearNum)) {
      errorList.push({ text: "Expected submission date year must include four numbers", href: "#date-year" });
      if (!errorFields.includes('year')) errorFields.push('year');
    }
  }

  // Check for real date (e.g. 31 Feb)
  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) {
        errorList.push({ text: "Enter a real date", href: "#date-day" });
        errorFields = ['day', 'month', 'year'];
     }
  }

  // If there are errors, reload page
  if (errorList.length > 0) {
    return res.render('cases/edit/expected-submission-date', {
      ref: ref,
      errorList: errorList,
      errorFields: errorFields,
      day: day, month: month, year: year
    });
  }

  // 3. Save
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var monthName = month ? months[month - 1] : "";
  var formatted = day + " " + monthName + " " + year;

  c.expectedSubmissionDate = {
    day: day,
    month: month,
    year: year,
    formatted: formatted
  };

  res.redirect('/cases/case-details?ref=' + ref + '#timetable');
});

// --- 4. TARGET DECISION DATE ---

router.get('/cases/edit/target-decision-date', function(req, res) {
  var c = getCase(req);
  var val = c.targetDecisionDate || {};
  
  res.render('cases/edit/target-decision-date', {
    ref: c.reference,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/edit/target-decision-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Get inputs
  var day = req.body['date-day'];
  var month = req.body['date-month'];
  var year = req.body['date-year'];
  var action = req.body.action;

  // 1. Handle Remove
  if (action === 'remove') {
    delete c.targetDecisionDate;
    return res.redirect('/cases/case-details?ref=' + ref + '#timetable');
  }

  // 2. Validation Logic
  var errorList = [];
  var errorFields = [];

  // Check if everything is empty
  if (!day && !month && !year) {
    errorList.push({ text: "Enter the target decision date", href: "#date-day" });
    errorFields = ['day', 'month', 'year'];
  } 
  else {
    // Check for missing parts
    var missing = [];
    if (!day) missing.push('day');
    if (!month) missing.push('month');
    if (!year) missing.push('year');
  
    if (missing.length > 0) {
      var missingText = "";
      if (missing.length === 2) {
        missingText = "Target decision date must include a " + missing[0] + " and " + missing[1];
      } else {
        missingText = "Target decision date must include a " + missing[0];
      }
      errorList.push({ text: missingText, href: "#date-" + missing[0] });
      errorFields = errorFields.concat(missing);
    }
  }

  // Validate Day (1-31)
  if (day) {
    var dayNum = Number(day);
    if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) {
      errorList.push({ text: "Target decision date day must be a real day", href: "#date-day" });
      if (!errorFields.includes('day')) errorFields.push('day');
    }
  }

  // Validate Month (1-12)
  if (month) {
    var monthNum = Number(month);
    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      errorList.push({ text: "Target decision date month must be a real month", href: "#date-month" });
      if (!errorFields.includes('month')) errorFields.push('month');
    }
  }

  // Validate Year (4 digits)
  if (year) {
    var yearNum = Number(year);
    if (year.length != 4 || isNaN(yearNum)) {
      errorList.push({ text: "Target decision date year must include four numbers", href: "#date-year" });
      if (!errorFields.includes('year')) errorFields.push('year');
    }
  }

  // Check for real date (e.g. 31 Feb)
  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) {
        errorList.push({ text: "Enter a real date", href: "#date-day" });
        errorFields = ['day', 'month', 'year'];
     }
  }

  // If there are errors, reload page
  if (errorList.length > 0) {
    return res.render('cases/edit/target-decision-date', {
      ref: ref,
      errorList: errorList,
      errorFields: errorFields,
      day: day, month: month, year: year
    });
  }

  // 3. Save
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var monthName = month ? months[month - 1] : "";
  var formatted = day + " " + monthName + " " + year;

  c.targetDecisionDate = {
    day: day,
    month: month,
    year: year,
    formatted: formatted
  };

  res.redirect('/cases/case-details?ref=' + ref + '#timetable');
});


// --- 5. CASE OFFICER VERIFICATION DATE ---

router.get('/cases/edit/co-verification-date', function(req, res) {
  var c = getCase(req);
  var val = c.coVerificationDate || {};
  
  res.render('cases/edit/co-verification-date', {
    ref: c.reference,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/edit/co-verification-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Get inputs
  var day = req.body['date-day'];
  var month = req.body['date-month'];
  var year = req.body['date-year'];
  var action = req.body.action;

  // 1. Handle Remove
  if (action === 'remove') {
    delete c.coVerificationDate;
    return res.redirect('/cases/case-details?ref=' + ref + '#timetable');
  }

  // 2. Validation Logic
  var errorList = [];
  var errorFields = [];

  // Check if everything is empty
  if (!day && !month && !year) {
    errorList.push({ text: "Enter the case officer verification date", href: "#date-day" });
    errorFields = ['day', 'month', 'year'];
  } 
  else {
    // Check for missing parts
    var missing = [];
    if (!day) missing.push('day');
    if (!month) missing.push('month');
    if (!year) missing.push('year');
  
    if (missing.length > 0) {
      var missingText = "";
      if (missing.length === 2) {
        missingText = "Case officer verification date must include a " + missing[0] + " and " + missing[1];
      } else {
        missingText = "Case officer verification date must include a " + missing[0];
      }
      errorList.push({ text: missingText, href: "#date-" + missing[0] });
      errorFields = errorFields.concat(missing);
    }
  }

  // Validate Day (1-31)
  if (day) {
    var dayNum = Number(day);
    if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) {
      errorList.push({ text: "Case officer verification date day must be a real day", href: "#date-day" });
      if (!errorFields.includes('day')) errorFields.push('day');
    }
  }

  // Validate Month (1-12)
  if (month) {
    var monthNum = Number(month);
    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      errorList.push({ text: "Case officer verification date month must be a real month", href: "#date-month" });
      if (!errorFields.includes('month')) errorFields.push('month');
    }
  }

  // Validate Year (4 digits)
  if (year) {
    var yearNum = Number(year);
    if (year.length != 4 || isNaN(yearNum)) {
      errorList.push({ text: "Case officer verification date year must include four numbers", href: "#date-year" });
      if (!errorFields.includes('year')) errorFields.push('year');
    }
  }

  // Check for real date (e.g. 31 Feb)
  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) {
        errorList.push({ text: "Enter a real date", href: "#date-day" });
        errorFields = ['day', 'month', 'year'];
     }
  }

  // If there are errors, reload page
  if (errorList.length > 0) {
    return res.render('cases/edit/co-verification-date', {
      ref: ref,
      errorList: errorList,
      errorFields: errorFields,
      day: day, month: month, year: year
    });
  }

  // 3. Save
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var monthName = month ? months[month - 1] : "";
  var formatted = day + " " + monthName + " " + year;

  c.coVerificationDate = {
    day: day,
    month: month,
    year: year,
    formatted: formatted
  };

  res.redirect('/cases/case-details?ref=' + ref + '#timetable');
});


// --- 6. DATE PROPOSED MODIFICATIONS ADVERTISED ---

router.get('/cases/edit/modifications-advertised-date', function(req, res) {
  var c = getCase(req);
  var val = c.modificationsAdvertisedDate || {};
  
  res.render('cases/edit/modifications-advertised-date', {
    ref: c.reference,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/edit/modifications-advertised-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Get inputs
  var day = req.body['date-day'];
  var month = req.body['date-month'];
  var year = req.body['date-year'];
  var action = req.body.action;

  // 1. Handle Remove
  if (action === 'remove') {
    delete c.modificationsAdvertisedDate;
    return res.redirect('/cases/case-details?ref=' + ref + '#timetable');
  }

  // 2. Validation Logic
  var errorList = [];
  var errorFields = [];

  // Check if everything is empty
  if (!day && !month && !year) {
    errorList.push({ text: "Enter the date proposed modifications advertised", href: "#date-day" });
    errorFields = ['day', 'month', 'year'];
  } 
  else {
    // Check for missing parts
    var missing = [];
    if (!day) missing.push('day');
    if (!month) missing.push('month');
    if (!year) missing.push('year');
  
    if (missing.length > 0) {
      var missingText = "";
      if (missing.length === 2) {
        missingText = "Date proposed modifications advertised must include a " + missing[0] + " and " + missing[1];
      } else {
        missingText = "Date proposed modifications advertised must include a " + missing[0];
      }
      errorList.push({ text: missingText, href: "#date-" + missing[0] });
      errorFields = errorFields.concat(missing);
    }
  }

  // Validate Day (1-31)
  if (day) {
    var dayNum = Number(day);
    if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) {
      errorList.push({ text: "Date proposed modifications advertised day must be a real day", href: "#date-day" });
      if (!errorFields.includes('day')) errorFields.push('day');
    }
  }

  // Validate Month (1-12)
  if (month) {
    var monthNum = Number(month);
    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      errorList.push({ text: "Date proposed modifications advertised month must be a real month", href: "#date-month" });
      if (!errorFields.includes('month')) errorFields.push('month');
    }
  }

  // Validate Year (4 digits)
  if (year) {
    var yearNum = Number(year);
    if (year.length != 4 || isNaN(yearNum)) {
      errorList.push({ text: "Date proposed modifications advertised year must include four numbers", href: "#date-year" });
      if (!errorFields.includes('year')) errorFields.push('year');
    }
  }

  // Check for real date (e.g. 31 Feb)
  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) {
        errorList.push({ text: "Enter a real date", href: "#date-day" });
        errorFields = ['day', 'month', 'year'];
     }
  }

  // If there are errors, reload page
  if (errorList.length > 0) {
    return res.render('cases/edit/modifications-advertised-date', {
      ref: ref,
      errorList: errorList,
      errorFields: errorFields,
      day: day, month: month, year: year
    });
  }

  // 3. Save
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var monthName = month ? months[month - 1] : "";
  var formatted = day + " " + monthName + " " + year;

  c.modificationsAdvertisedDate = {
    day: day,
    month: month,
    year: year,
    formatted: formatted
  };

  res.redirect('/cases/case-details?ref=' + ref + '#timetable');
});

// --- 7. OBJECTION PERIOD END DATE ---

router.get('/cases/edit/objection-period-end-date', function(req, res) {
  var c = getCase(req);
  var val = c.objectionPeriodEndDate || {};
  
  res.render('cases/edit/objection-period-end-date', {
    ref: c.reference,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/edit/objection-period-end-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Get inputs
  var day = req.body['date-day'];
  var month = req.body['date-month'];
  var year = req.body['date-year'];
  var action = req.body.action;

  // 1. Handle Remove
  if (action === 'remove') {
    delete c.objectionPeriodEndDate;
    return res.redirect('/cases/case-details?ref=' + ref + '#timetable');
  }

  // 2. Validation Logic
  var errorList = [];
  var errorFields = [];

  // Check if everything is empty
  if (!day && !month && !year) {
    errorList.push({ text: "Enter the objection period end date", href: "#date-day" });
    errorFields = ['day', 'month', 'year'];
  } 
  else {
    // Check for missing parts
    var missing = [];
    if (!day) missing.push('day');
    if (!month) missing.push('month');
    if (!year) missing.push('year');
  
    if (missing.length > 0) {
      var missingText = "";
      if (missing.length === 2) {
        missingText = "Objection period end date must include a " + missing[0] + " and " + missing[1];
      } else {
        missingText = "Objection period end date must include a " + missing[0];
      }
      errorList.push({ text: missingText, href: "#date-" + missing[0] });
      errorFields = errorFields.concat(missing);
    }
  }

  // Validate Day (1-31)
  if (day) {
    var dayNum = Number(day);
    if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) {
      errorList.push({ text: "Objection period end date day must be a real day", href: "#date-day" });
      if (!errorFields.includes('day')) errorFields.push('day');
    }
  }

  // Validate Month (1-12)
  if (month) {
    var monthNum = Number(month);
    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      errorList.push({ text: "Objection period end date month must be a real month", href: "#date-month" });
      if (!errorFields.includes('month')) errorFields.push('month');
    }
  }

  // Validate Year (4 digits)
  if (year) {
    var yearNum = Number(year);
    if (year.length != 4 || isNaN(yearNum)) {
      errorList.push({ text: "Objection period end date year must include four numbers", href: "#date-year" });
      if (!errorFields.includes('year')) errorFields.push('year');
    }
  }

  // Check for real date (e.g. 31 Feb)
  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) {
        errorList.push({ text: "Enter a real date", href: "#date-day" });
        errorFields = ['day', 'month', 'year'];
     }
  }

  // If there are errors, reload page
  if (errorList.length > 0) {
    return res.render('cases/edit/objection-period-end-date', {
      ref: ref,
      errorList: errorList,
      errorFields: errorFields,
      day: day, month: month, year: year
    });
  }

  // 3. Save
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var monthName = month ? months[month - 1] : "";
  var formatted = day + " " + monthName + " " + year;

  c.objectionPeriodEndDate = {
    day: day,
    month: month,
    year: year,
    formatted: formatted
  };

  res.redirect('/cases/case-details?ref=' + ref + '#timetable');
});

// --- 8. DEADLINE FOR CONSENT ---

router.get('/cases/edit/consent-deadline-date', function(req, res) {
  var c = getCase(req);
  var val = c.consentDeadlineDate || {};
  
  res.render('cases/edit/consent-deadline-date', {
    ref: c.reference,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/edit/consent-deadline-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Get inputs
  var day = req.body['date-day'];
  var month = req.body['date-month'];
  var year = req.body['date-year'];
  var action = req.body.action;

  // 1. Handle Remove
  if (action === 'remove') {
    delete c.consentDeadlineDate;
    return res.redirect('/cases/case-details?ref=' + ref + '#timetable');
  }

  // 2. Validation Logic
  var errorList = [];
  var errorFields = [];

  // Check if everything is empty
  if (!day && !month && !year) {
    errorList.push({ text: "Enter the deadline for consent", href: "#date-day" });
    errorFields = ['day', 'month', 'year'];
  } 
  else {
    // Check for missing parts
    var missing = [];
    if (!day) missing.push('day');
    if (!month) missing.push('month');
    if (!year) missing.push('year');
  
    if (missing.length > 0) {
      var missingText = "";
      if (missing.length === 2) {
        missingText = "Deadline for consent must include a " + missing[0] + " and " + missing[1];
      } else {
        missingText = "Deadline for consent must include a " + missing[0];
      }
      errorList.push({ text: missingText, href: "#date-" + missing[0] });
      errorFields = errorFields.concat(missing);
    }
  }

  // Validate Day (1-31)
  if (day) {
    var dayNum = Number(day);
    if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) {
      errorList.push({ text: "Deadline for consent day must be a real day", href: "#date-day" });
      if (!errorFields.includes('day')) errorFields.push('day');
    }
  }

  // Validate Month (1-12)
  if (month) {
    var monthNum = Number(month);
    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      errorList.push({ text: "Deadline for consent month must be a real month", href: "#date-month" });
      if (!errorFields.includes('month')) errorFields.push('month');
    }
  }

  // Validate Year (4 digits)
  if (year) {
    var yearNum = Number(year);
    if (year.length != 4 || isNaN(yearNum)) {
      errorList.push({ text: "Deadline for consent year must include four numbers", href: "#date-year" });
      if (!errorFields.includes('year')) errorFields.push('year');
    }
  }

  // Check for real date (e.g. 31 Feb)
  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) {
        errorList.push({ text: "Enter a real date", href: "#date-day" });
        errorFields = ['day', 'month', 'year'];
     }
  }

  // If there are errors, reload page
  if (errorList.length > 0) {
    return res.render('cases/edit/consent-deadline-date', {
      ref: ref,
      errorList: errorList,
      errorFields: errorFields,
      day: day, month: month, year: year
    });
  }

  // 3. Save
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var monthName = month ? months[month - 1] : "";
  var formatted = day + " " + monthName + " " + year;

  c.consentDeadlineDate = {
    day: day,
    month: month,
    year: year,
    formatted: formatted
  };

  res.redirect('/cases/case-details?ref=' + ref + '#timetable');
});


// --- 9. OGD DUE DATE ---

router.get('/cases/edit/ogd-due-date', function(req, res) {
  var c = getCase(req);
  var val = c.ogdDueDate || {};
  
  res.render('cases/edit/ogd-due-date', {
    ref: c.reference,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/edit/ogd-due-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Get inputs
  var day = req.body['date-day'];
  var month = req.body['date-month'];
  var year = req.body['date-year'];
  var action = req.body.action;

  // 1. Handle Remove
  if (action === 'remove') {
    delete c.ogdDueDate;
    return res.redirect('/cases/case-details?ref=' + ref + '#timetable');
  }

  // 2. Validation Logic
  var errorList = [];
  var errorFields = [];

  // Check if everything is empty
  if (!day && !month && !year) {
    errorList.push({ text: "Enter Date due to Other Government Department (OGD)", href: "#date-day" });
    errorFields = ['day', 'month', 'year'];
  } 
  else {
    // Check for missing parts
    var missing = [];
    if (!day) missing.push('day');
    if (!month) missing.push('month');
    if (!year) missing.push('year');
  
    if (missing.length > 0) {
      var missingText = "";
      if (missing.length === 2) {
        missingText = "Date due to Other Government Department (OGD) date must include a " + missing[0] + " and " + missing[1];
      } else {
        missingText = "Date due to Other Government Department (OGD) date must include a " + missing[0];
      }
      errorList.push({ text: missingText, href: "#date-" + missing[0] });
      errorFields = errorFields.concat(missing);
    }
  }

  // Validate Day (1-31)
  if (day) {
    var dayNum = Number(day);
    if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) {
      errorList.push({ text: "Date due to Other Government Department (OGD) date day must be a real day", href: "#date-day" });
      if (!errorFields.includes('day')) errorFields.push('day');
    }
  }

  // Validate Month (1-12)
  if (month) {
    var monthNum = Number(month);
    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      errorList.push({ text: "Date due to Other Government Department (OGD) month must be a real month", href: "#date-month" });
      if (!errorFields.includes('month')) errorFields.push('month');
    }
  }

  // Validate Year (4 digits)
  if (year) {
    var yearNum = Number(year);
    if (year.length != 4 || isNaN(yearNum)) {
      errorList.push({ text: "Date due to Other Government Department (OGD) must include four numbers", href: "#date-year" });
      if (!errorFields.includes('year')) errorFields.push('year');
    }
  }

  // Check for real date (e.g. 31 Feb)
  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) {
        errorList.push({ text: "Enter a real date", href: "#date-day" });
        errorFields = ['day', 'month', 'year'];
     }
  }

  // If there are errors, reload page
  if (errorList.length > 0) {
    return res.render('cases/edit/ogd-due-date', {
      ref: ref,
      errorList: errorList,
      errorFields: errorFields,
      day: day, month: month, year: year
    });
  }

  // 3. Save
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var monthName = month ? months[month - 1] : "";
  var formatted = day + " " + monthName + " " + year;

  c.ogdDueDate = {
    day: day,
    month: month,
    year: year,
    formatted: formatted
  };

  res.redirect('/cases/case-details?ref=' + ref + '#timetable');
});


// --- 10. PROPOSAL LETTER DATE ---

router.get('/cases/edit/proposal-letter-date', function(req, res) {
  var c = getCase(req);
  var val = c.proposalLetterDate || {};
  
  res.render('cases/edit/proposal-letter-date', {
    ref: c.reference,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/edit/proposal-letter-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Get inputs
  var day = req.body['date-day'];
  var month = req.body['date-month'];
  var year = req.body['date-year'];
  var action = req.body.action;

  // 1. Handle Remove
  if (action === 'remove') {
    delete c.proposalLetterDate;
    return res.redirect('/cases/case-details?ref=' + ref + '#timetable');
  }

  // 2. Validation Logic
  var errorList = [];
  var errorFields = [];

  // Check if everything is empty
  if (!day && !month && !year) {
    errorList.push({ text: "Enter the proposal letter date", href: "#date-day" });
    errorFields = ['day', 'month', 'year'];
  } 
  else {
    // Check for missing parts
    var missing = [];
    if (!day) missing.push('day');
    if (!month) missing.push('month');
    if (!year) missing.push('year');
  
    if (missing.length > 0) {
      var missingText = "";
      if (missing.length === 2) {
        missingText = "Proposal letter date must include a " + missing[0] + " and " + missing[1];
      } else {
        missingText = "Proposal letter date must include a " + missing[0];
      }
      errorList.push({ text: missingText, href: "#date-" + missing[0] });
      errorFields = errorFields.concat(missing);
    }
  }

  // Validate Day (1-31)
  if (day) {
    var dayNum = Number(day);
    if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) {
      errorList.push({ text: "Proposal letter date day must be a real day", href: "#date-day" });
      if (!errorFields.includes('day')) errorFields.push('day');
    }
  }

  // Validate Month (1-12)
  if (month) {
    var monthNum = Number(month);
    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      errorList.push({ text: "Proposal letter date month must be a real month", href: "#date-month" });
      if (!errorFields.includes('month')) errorFields.push('month');
    }
  }

  // Validate Year (4 digits)
  if (year) {
    var yearNum = Number(year);
    if (year.length != 4 || isNaN(yearNum)) {
      errorList.push({ text: "Proposal letter date year must include four numbers", href: "#date-year" });
      if (!errorFields.includes('year')) errorFields.push('year');
    }
  }

  // Check for real date (e.g. 31 Feb)
  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) {
        errorList.push({ text: "Enter a real date", href: "#date-day" });
        errorFields = ['day', 'month', 'year'];
     }
  }

  // If there are errors, reload page
  if (errorList.length > 0) {
    return res.render('cases/edit/proposal-letter-date', {
      ref: ref,
      errorList: errorList,
      errorFields: errorFields,
      day: day, month: month, year: year
    });
  }

  // 3. Save
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var monthName = month ? months[month - 1] : "";
  var formatted = day + " " + monthName + " " + year;

  c.proposalLetterDate = {
    day: day,
    month: month,
    year: year,
    formatted: formatted
  };

  res.redirect('/cases/case-details?ref=' + ref + '#timetable');
});


// --- 11. DECISION ISSUED BY DATE ---

router.get('/cases/edit/decision-issued-by-date', function(req, res) {
  var c = getCase(req);
  var val = c.decisionIssuedByDate || {};
  
  res.render('cases/edit/decision-issued-by-date', {
    ref: c.reference,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/edit/decision-issued-by-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Get inputs
  var day = req.body['date-day'];
  var month = req.body['date-month'];
  var year = req.body['date-year'];
  var action = req.body.action;

  // 1. Handle Remove
  if (action === 'remove') {
    delete c.decisionIssuedByDate;
    return res.redirect('/cases/case-details?ref=' + ref + '#timetable');
  }

  // 2. Validation Logic
  var errorList = [];
  var errorFields = [];

  // Check if everything is empty
  if (!day && !month && !year) {
    errorList.push({ text: "Enter the date decision must be issued by", href: "#date-day" });
    errorFields = ['day', 'month', 'year'];
  } 
  else {
    // Check for missing parts
    var missing = [];
    if (!day) missing.push('day');
    if (!month) missing.push('month');
    if (!year) missing.push('year');
  
    if (missing.length > 0) {
      var missingText = "";
      if (missing.length === 2) {
        missingText = "Date decision must be issued by must include a " + missing[0] + " and " + missing[1];
      } else {
        missingText = "Date decision must be issued by must include a " + missing[0];
      }
      errorList.push({ text: missingText, href: "#date-" + missing[0] });
      errorFields = errorFields.concat(missing);
    }
  }

  // Validate Day (1-31)
  if (day) {
    var dayNum = Number(day);
    if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) {
      errorList.push({ text: "Date decision must be issued by day must be a real day", href: "#date-day" });
      if (!errorFields.includes('day')) errorFields.push('day');
    }
  }

  // Validate Month (1-12)
  if (month) {
    var monthNum = Number(month);
    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      errorList.push({ text: "Date decision must be issued by month must be a real month", href: "#date-month" });
      if (!errorFields.includes('month')) errorFields.push('month');
    }
  }

  // Validate Year (4 digits)
  if (year) {
    var yearNum = Number(year);
    if (year.length != 4 || isNaN(yearNum)) {
      errorList.push({ text: "Date decision must be issued by year must include four numbers", href: "#date-year" });
      if (!errorFields.includes('year')) errorFields.push('year');
    }
  }

  // Check for real date (e.g. 31 Feb)
  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) {
        errorList.push({ text: "Enter a real date", href: "#date-day" });
        errorFields = ['day', 'month', 'year'];
     }
  }

  // If there are errors, reload page
  if (errorList.length > 0) {
    return res.render('cases/edit/decision-issued-by-date', {
      ref: ref,
      errorList: errorList,
      errorFields: errorFields,
      day: day, month: month, year: year
    });
  }

  // 3. Save
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var monthName = month ? months[month - 1] : "";
  var formatted = day + " " + monthName + " " + year;

  c.decisionIssuedByDate = {
    day: day,
    month: month,
    year: year,
    formatted: formatted
  };

  res.redirect('/cases/case-details?ref=' + ref + '#timetable');
});


// --- 12. DECISION NOTIFICATION DATE ---

router.get('/cases/edit/decision-notification-date', function(req, res) {
  var c = getCase(req);
  var val = c.decisionNotificationDate || {};
  
  res.render('cases/edit/decision-notification-date', {
    ref: c.reference,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/edit/decision-notification-date', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Get inputs
  var day = req.body['date-day'];
  var month = req.body['date-month'];
  var year = req.body['date-year'];
  var action = req.body.action;

  // 1. Handle Remove
  if (action === 'remove') {
    delete c.decisionNotificationDate;
    return res.redirect('/cases/case-details?ref=' + ref + '#timetable');
  }

  // 2. Validation Logic
  var errorList = [];
  var errorFields = [];

  // Check if everything is empty
  if (!day && !month && !year) {
    errorList.push({ text: "Enter the date to notify parties of decision", href: "#date-day" });
    errorFields = ['day', 'month', 'year'];
  } 
  else {
    // Check for missing parts
    var missing = [];
    if (!day) missing.push('day');
    if (!month) missing.push('month');
    if (!year) missing.push('year');
  
    if (missing.length > 0) {
      var missingText = "";
      if (missing.length === 2) {
        missingText = "Date to notify parties of decision must include a " + missing[0] + " and " + missing[1];
      } else {
        missingText = "Date to notify parties of decision must include a " + missing[0];
      }
      errorList.push({ text: missingText, href: "#date-" + missing[0] });
      errorFields = errorFields.concat(missing);
    }
  }

  // Validate Day (1-31)
  if (day) {
    var dayNum = Number(day);
    if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) {
      errorList.push({ text: "Date to notify parties of decision day must be a real day", href: "#date-day" });
      if (!errorFields.includes('day')) errorFields.push('day');
    }
  }

  // Validate Month (1-12)
  if (month) {
    var monthNum = Number(month);
    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      errorList.push({ text: "Date to notify parties of decision month must be a real month", href: "#date-month" });
      if (!errorFields.includes('month')) errorFields.push('month');
    }
  }

  // Validate Year (4 digits)
  if (year) {
    var yearNum = Number(year);
    if (year.length != 4 || isNaN(yearNum)) {
      errorList.push({ text: "Date to notify parties of decision year must include four numbers", href: "#date-year" });
      if (!errorFields.includes('year')) errorFields.push('year');
    }
  }

  // Check for real date (e.g. 31 Feb)
  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) {
        errorList.push({ text: "Enter a real date", href: "#date-day" });
        errorFields = ['day', 'month', 'year'];
     }
  }

  // If there are errors, reload page
  if (errorList.length > 0) {
    return res.render('cases/edit/decision-notification-date', {
      ref: ref,
      errorList: errorList,
      errorFields: errorFields,
      day: day, month: month, year: year
    });
  }

  // 3. Save
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var monthName = month ? months[month - 1] : "";
  var formatted = day + " " + monthName + " " + year;

  c.decisionNotificationDate = {
    day: day,
    month: month,
    year: year,
    formatted: formatted
  };

  res.redirect('/cases/case-details?ref=' + ref + '#timetable');
});









// ==============================================
// SHARED HELPER: ADDRESS VALIDATION & SAVING
// ==============================================
function validateAndSaveAddress(req, res, fieldName, displayName, storageObj, storageKey) {
  // 1. Get Values
  var line1 = req.body[fieldName + '-line1'];
  var line2 = req.body[fieldName + '-line2'];
  var town = req.body[fieldName + '-town'];
  var county = req.body[fieldName + '-county'];
  var postcode = req.body[fieldName + '-postcode'];
  var action = req.body.action;

  // 2. Handle Remove
  if (action === 'remove') {
    delete storageObj[storageKey];
    return { status: "REMOVED" };
  }

  // 3. Validation Logic
  var errorList = [];
  var errorFields = [];

  // Postcode Validation (Strict UK)
  if (postcode && postcode.trim() !== "") {
    var cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    
    // Regex breakdown:
    // ^[A-Z]{1,2}    -> Starts with 1 or 2 letters
    // [0-9][A-Z0-9]? -> Followed by a number (and optionally another number or letter)
    // [0-9][A-Z]{2}$ -> Ends with a number and 2 letters
    var postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/;

    if (cleanPostcode.length < 5 || cleanPostcode.length > 7) {
      errorList.push({ text: "Postcode must be between 5 and 7 characters", href: "#" + fieldName + "-postcode" });
      errorFields.push('postcode');
    } 
    else if (!postcodeRegex.test(cleanPostcode)) {
      errorList.push({ text: "Enter a real postcode", href: "#" + fieldName + "-postcode" });
      errorFields.push('postcode');
    }
  }

  // If error found
  if (errorList.length > 0) {
    return { status: "ERROR", errorList: errorList, errorFields: errorFields };
  }

  // 4. Save Data
  // Create formatted string (filter out empty lines)
  var fullAddress = [line1, line2, town, county, postcode]
    .filter(Boolean)
    .join('<br>'); // Use <br> for HTML display

  storageObj[storageKey] = {
    line1: line1,
    line2: line2,
    town: town,
    county: county,
    postcode: postcode,
    formatted: fullAddress
  };

  return { status: "SUCCESS" };
}

// ==============================================
// SHARED HELPER: DATE + TIME VALIDATION
// ==============================================
function validateAndSaveDateTime(req, res, fieldName, displayName, storageObj, storageKey) {
  // 1. Get Date Parts
  var day = req.body[fieldName + '-day'];
  var month = req.body[fieldName + '-month'];
  var year = req.body[fieldName + '-year'];
  
  // 2. Get Time Parts
  var hour = req.body[fieldName + '-hour'];
  var minute = req.body[fieldName + '-minute'];
  var ampm = req.body[fieldName + '-ampm'];
  
  var action = req.body.action;

  // Handle Remove
  if (action === 'remove') {
    delete storageObj[storageKey];
    return { status: "REMOVED" };
  }

  var errorList = [];
  var errorFields = [];

  // --- DATE VALIDATION ---
  
  // 1. Check if completely empty (FIX: Trigger error instead of allowing it)
  if (!day && !month && !year) {
    errorList.push({ text: "Enter the date for the " + displayName.toLowerCase(), href: "#" + fieldName + "-day" });
    errorFields = ['day', 'month', 'year'];
  } 
  else {
    // 2. Date is partially or fully filled
    var missing = [];
    if (!day) missing.push('day');
    if (!month) missing.push('month');
    if (!year) missing.push('year');

    if (missing.length > 0) {
      errorList.push({ text: displayName + " must include a " + missing.join(' and '), href: "#" + fieldName + "-" + missing[0] });
      errorFields = errorFields.concat(missing);
    } else {
        // Validate numbers
        var dayNum = Number(day);
        var monthNum = Number(month);
        var yearNum = Number(year);
        
        if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) {
             errorList.push({ text: displayName + " day must be a real day", href: "#" + fieldName + "-day" });
             if (!errorFields.includes('day')) errorFields.push('day');
        }
        if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
             errorList.push({ text: displayName + " month must be a real month", href: "#" + fieldName + "-month" });
             if (!errorFields.includes('month')) errorFields.push('month');
        }
        if (year.length != 4 || isNaN(yearNum)) {
             errorList.push({ text: displayName + " year must include 4 numbers", href: "#" + fieldName + "-year" });
             if (!errorFields.includes('year')) errorFields.push('year');
        }
        // Real date check
        if (errorList.length === 0) {
            var dateObj = new Date(yearNum, monthNum - 1, dayNum);
            if ((dateObj.getMonth() + 1 != monthNum) || (dateObj.getDate() != dayNum)) {
                errorList.push({ text: "Enter a real date", href: "#" + fieldName + "-day" });
                errorFields = ['day', 'month', 'year'];
            }
        }
    }
  }

  // --- TIME VALIDATION ---
  // (Only runs if we haven't already failed the "Empty Date" check)
  if (errorList.length === 0) {
      // 1. Hour Validation (1-12)
      if (!hour) {
         errorList.push({ text: "Enter the hour", href: "#" + fieldName + "-hour" });
         errorFields.push('hour');
      } else {
         var h = Number(hour);
         if (isNaN(h) || h < 1 || h > 12) {
           errorList.push({ text: "Hour must be between 1 and 12", href: "#" + fieldName + "-hour" });
           errorFields.push('hour');
         }
      }

      // 2. Minute Validation (0-59)
      if (!minute) {
          minute = "00"; // Default to 00 if empty
      } else {
          var m = Number(minute);
          if (isNaN(m) || m < 0 || m > 59) {
             errorList.push({ text: "Minute must be between 0 and 59", href: "#" + fieldName + "-minute" });
             errorFields.push('minute');
          }
          // Pad minute with 0 if single digit (e.g. "5" -> "05")
          if (minute.length === 1) minute = "0" + minute;
      }

      // 3. AM/PM Validation
      if (!ampm || (ampm !== "am" && ampm !== "pm")) {
          errorList.push({ text: "Select am or pm", href: "#" + fieldName + "-ampm" });
          errorFields.push('ampm');
      }
  }

  if (errorList.length > 0) {
    return { status: "ERROR", errorList: errorList, errorFields: errorFields };
  }

  // --- FORMATTING & SAVING ---
  // If Date is empty (and we got here, meaning time is also empty), delete.
  if (!day && !month && !year) {
      delete storageObj[storageKey];
      return { status: "SUCCESS" };
  }

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var monthName = months[Number(month) - 1];
  
  // 1. Create separate Date string
  var formattedDate = day + " " + monthName + " " + year;
  
  // 2. Create separate Time string (if exists)
  var formattedTime = "";
  if (hour && minute && ampm) {
      formattedTime = hour + ":" + minute + ampm;
  }

  storageObj[storageKey] = {
    day: day,
    month: month,
    year: year,
    hour: hour,
    minute: minute,
    ampm: ampm,
    // Save them separately so we can stack them with <br> in the HTML
    formattedDate: formattedDate,
    formattedTime: formattedTime
  };

  return { status: "SUCCESS" };
}

// ==============================================
// SHARED HELPER: SIMPLE DATE VALIDATION (No Time)
// ==============================================
function validateAndSaveDate(req, res, fieldName, displayName, storageObj, storageKey) {
  var day = req.body[fieldName + '-day'];
  var month = req.body[fieldName + '-month'];
  var year = req.body[fieldName + '-year'];
  var action = req.body.action;

  // 1. Handle Remove
  if (action === 'remove') {
    delete storageObj[storageKey];
    return { status: "REMOVED" };
  }

  // 2. Validation Logic
  var errorList = [];
  var errorFields = [];

  // Check if completely empty
  if (!day && !month && !year) {
    errorList.push({ text: "Enter the " + displayName.toLowerCase(), href: "#" + fieldName + "-day" });
    errorFields = ['day', 'month', 'year'];
  } 
  else {
    // Check for missing parts
    var missing = [];
    if (!day) missing.push('day');
    if (!month) missing.push('month');
    if (!year) missing.push('year');
  
    if (missing.length > 0) {
      var missingText = "";
      if (missing.length === 2) {
        missingText = displayName + " must include a " + missing[0] + " and " + missing[1];
      } else {
        missingText = displayName + " must include a " + missing[0];
      }
      errorList.push({ text: missingText, href: "#" + fieldName + "-" + missing[0] });
      errorFields = errorFields.concat(missing);
    }
  }

  // Validate Day (1-31)
  if (day) {
    var dayNum = Number(day);
    if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) {
      errorList.push({ text: displayName + " day must be a real day", href: "#" + fieldName + "-day" });
      if (!errorFields.includes('day')) errorFields.push('day');
    }
  }

  // Validate Month (1-12)
  if (month) {
    var monthNum = Number(month);
    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      errorList.push({ text: displayName + " month must be a real month", href: "#" + fieldName + "-month" });
      if (!errorFields.includes('month')) errorFields.push('month');
    }
  }

  // Validate Year (4 digits)
  if (year) {
    var yearNum = Number(year);
    if (year.length != 4 || isNaN(yearNum)) {
      errorList.push({ text: displayName + " year must include 4 numbers", href: "#" + fieldName + "-year" });
      if (!errorFields.includes('year')) errorFields.push('year');
    }
  }

  // Check for real date (e.g. 31 Feb)
  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) {
        errorList.push({ text: "Enter a real date", href: "#" + fieldName + "-day" });
        errorFields = ['day', 'month', 'year'];
     }
  }

  // If there are errors, return them
  if (errorList.length > 0) {
    return { status: "ERROR", errorList: errorList, errorFields: errorFields };
  }

  // 3. Save Data (Format: D Month YYYY)
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var monthName = month ? months[month - 1] : "";
  var formatted = day + " " + monthName + " " + year;

  // Save as an object in the storageKey (e.g., p1.siteVisit)
  storageObj[storageKey] = {
    day: day,
    month: month,
    year: year,
    formatted: formatted
  };
  
  return { status: "SUCCESS" };
}

// ==============================================
// SHARED HELPER: NUMBER VALIDATION & SAVING
// ==============================================
function validateAndSaveNumber(req, res, fieldName, displayName, storageObj, storageKey) {
  var value = req.body[fieldName];
  var action = req.body.action;

  // 1. Handle Remove
  if (action === 'remove') {
    delete storageObj[storageKey];
    return { status: "REMOVED" };
  }

  // 2. Validation Logic
  var errorList = [];
  
  if (!value || value.trim() === "") {
    errorList.push({ text: "Enter the " + displayName.toLowerCase(), href: "#" + fieldName });
  } else {
    // Check if it is a valid number (regex allows integers and decimals)
    if (isNaN(value) || !/^\d+(\.\d+)?$/.test(value)) {
      errorList.push({ text: displayName + " must only contain numbers", href: "#" + fieldName });
    }
  }

  // If error found
  if (errorList.length > 0) {
    return { status: "ERROR", errorList: errorList };
  }

  // 3. Save Data
  storageObj[storageKey] = value;

  return { status: "SUCCESS" };
}


// ==============================================
// PROCEDURE 1 ROUTES
// ==============================================

// --- TYPE ---
router.get('/cases/procedures/procedure-1/type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var existingType = "";
  if (c.procedure1 && c.procedure1.type) {
    existingType = c.procedure1.type;
  }
  
  res.render('cases/procedures/procedure-1/type', {
    ref: ref,
    type: existingType
  });
});

router.post('/cases/procedures/procedure-1/type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var type = req.body['procedure-type'];
  var action = req.body.action;

  if (action === 'remove') {
    if (c.procedure1) delete c.procedure1;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (!type) {
    return res.render('cases/procedures/procedure-1/type', {
      ref: ref,
      errorList: [{ text: "Select a procedure type", href: "#procedure-type" }]
    });
  }

  c.procedure1 = c.procedure1 || {};
  c.procedure1.type = type;
  c.procedure1.active = true;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});


// --- STATUS ---
router.get('/cases/procedures/procedure-1/status', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  res.render('cases/procedures/procedure-1/status', {
    ref: ref,
    status: p1.status
  });
});

router.post('/cases/procedures/procedure-1/status', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var status = req.body['procedure-status'];

  if (!status) {
    return res.render('cases/procedures/procedure-1/status', {
      ref: ref,
      errorList: [{ text: "Select a procedure status", href: "#procedure-status" }]
    });
  }

  c.procedure1 = c.procedure1 || {};
  c.procedure1.status = status;
  res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});


// --- ADMIN TYPE ---
router.get('/cases/procedures/procedure-1/admin-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  res.render('cases/procedures/procedure-1/admin-type', {
    ref: ref,
    adminType: p1.adminType
  });
});

router.post('/cases/procedures/procedure-1/admin-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var adminType = req.body['admin-type'];

  if (action === 'remove') {
    if (c.procedure1) delete c.procedure1.adminType;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (!adminType) {
    return res.render('cases/procedures/procedure-1/admin-type', {
      ref: ref,
      errorList: [{ text: "Select the admin procedure type", href: "#admin-type" }]
    });
  }

  c.procedure1 = c.procedure1 || {};
  c.procedure1.adminType = adminType;
  res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});


// ==============================================
// DATE ROUTES (Using Helper)
// ==============================================

// --- IN HOUSE DATE ---
router.get('/cases/procedures/procedure-1/in-house-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.inHouse || {}; 

  res.render('cases/procedures/procedure-1/in-house-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/in-house-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || []; // Using manual find to ensure Reference
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'in-house',          
    'In house date',     
    c.procedure1,        
    'inHouse'           
  );

  // FIX: Route handles redirect now
  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/in-house-date', {
      ref: ref,
      day: req.body['in-house-day'],
      month: req.body['in-house-month'],
      year: req.body['in-house-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- SITE VISIT DATE ---
router.get('/cases/procedures/procedure-1/site-visit', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.siteVisit || {}; 

  res.render('cases/procedures/procedure-1/site-visit', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/site-visit', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'site-visit',
    'Site visit date',
    c.procedure1,
    'siteVisit'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/site-visit', {
      ref: ref,
      day: req.body['site-visit-day'],
      month: req.body['site-visit-month'],
      year: req.body['site-visit-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- TARGET HEARING DATE ---
router.get('/cases/procedures/procedure-1/target-hearing-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.targetHearing || {}; 

  res.render('cases/procedures/procedure-1/target-hearing-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/target-hearing-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'target-hearing',
    'Target hearing date',
    c.procedure1,
    'targetHearing'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/target-hearing-date', {
      ref: ref,
      day: req.body['target-hearing-day'],
      month: req.body['target-hearing-month'],
      year: req.body['target-hearing-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- NOTIFIED DATE ---
router.get('/cases/procedures/procedure-1/hearing-notified-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.hearingNotified || {}; 

  res.render('cases/procedures/procedure-1/hearing-notified-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/hearing-notified-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'hearing-notified',
    'Date parties must be notified of hearing',
    c.procedure1,
    'hearingNotified'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/hearing-notified-date', {
      ref: ref,
      day: req.body['hearing-notified-day'],
      month: req.body['hearing-notified-month'],
      year: req.body['hearing-notified-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- PROOFS RECEIVED (Hearing/Inquiry) ---
router.get('/cases/procedures/procedure-1/proofs-received', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.proofsReceived || {}; 

  res.render('cases/procedures/procedure-1/proofs-received', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/proofs-received', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure1 = c.procedure1 || {};

  var day = req.body['proofs-received-day'];
  var month = req.body['proofs-received-month'];
  var year = req.body['proofs-received-year'];
  
  var result = validateAndSaveDate(
    req, res,
    'proofs-received',
    'Proofs of evidence received date',
    c.procedure1,
    'proofsReceived'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/proofs-received', {
      ref: ref,
      day: day,
      month: month,
      year: year,
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- STATEMENTS OF CASE RECEIVED ---
router.get('/cases/procedures/procedure-1/statements-received', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.statementsReceived || {}; 

  res.render('cases/procedures/procedure-1/statements-received', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/statements-received', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'statements-received',
    'Statements of case received date',
    c.procedure1,
    'statementsReceived'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/statements-received', {
      ref: ref,
      day: req.body['statements-received-day'],
      month: req.body['statements-received-month'],
      year: req.body['statements-received-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- CASE OFFICER VERIFICATION DATE ---
router.get('/cases/procedures/procedure-1/verification-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.verification || {}; 

  res.render('cases/procedures/procedure-1/verification-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/verification-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'verification-date',
    'Verification date',
    c.procedure1,
    'verification'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/verification-date', {
      ref: ref,
      day: req.body['verification-date-day'],
      month: req.body['verification-date-month'],
      year: req.body['verification-date-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- CMC ROUTES (Place this with your other Procedure 1 routes) ---

// GET
router.get('/cases/procedures/procedure-1/cmc-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.cmcDate || {}; 

  res.render('cases/procedures/procedure-1/cmc-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year,
    hour: val.hour,
    minute: val.minute,
    ampm: val.ampm,

    errorFields: []
  });
});

// POST
router.post('/cases/procedures/procedure-1/cmc-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDateTime(
    req, res,
    'cmc',
    'Case management conference',
    c.procedure1,
    'cmcDate'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/cmc-date', {
      ref: ref,
      day: req.body['cmc-day'],
      month: req.body['cmc-month'],
      year: req.body['cmc-year'],
      hour: req.body['cmc-hour'],
      minute: req.body['cmc-minute'],
      ampm: req.body['cmc-ampm'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- CMC TYPE ---
router.get('/cases/procedures/procedure-1/cmc-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};

  res.render('cases/procedures/procedure-1/cmc-type', {
    ref: ref,
    cmcType: p1.cmcType
  });
});

router.post('/cases/procedures/procedure-1/cmc-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var cmcType = req.body['cmc-type'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure1) delete c.procedure1.cmcType;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  // 2. Validation
  if (!cmcType) {
    return res.render('cases/procedures/procedure-1/cmc-type', {
      ref: ref,
      errorList: [{ text: "Select the case management conference type", href: "#cmc-type" }]
    });
  }

  // 3. Save Data
  c.procedure1 = c.procedure1 || {};
  c.procedure1.cmcType = cmcType;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});

// --- CMC VENUE ---
router.get('/cases/procedures/procedure-1/cmc-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.cmcVenue || {}; 

  res.render('cases/procedures/procedure-1/cmc-venue', {
    ref: ref,
    line1: val.line1,
    line2: val.line2,
    town: val.town,
    county: val.county,
    postcode: val.postcode,
    errorFields: []
  });
});

router.post('/cases/procedures/procedure-1/cmc-venue', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveAddress(
    req, res,
    'venue',          // Field prefix (e.g. venue-line1)
    'Venue address',  // Display name
    c.procedure1,     // Storage object
    'cmcVenue'        // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/cmc-venue', {
      ref: ref,
      line1: req.body['venue-line1'],
      line2: req.body['venue-line2'],
      town: req.body['venue-town'],
      county: req.body['venue-county'],
      postcode: req.body['venue-postcode'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- CMC NOTE SENT ---
router.get('/cases/procedures/procedure-1/cmc-note-sent', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.cmcNoteSent || {}; 

  res.render('cases/procedures/procedure-1/cmc-note-sent', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/cmc-note-sent', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'cmc-note',
    'Case management conference note sent date',
    c.procedure1,
    'cmcNoteSent'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/cmc-note-sent', {
      ref: ref,
      day: req.body['cmc-note-day'],
      month: req.body['cmc-note-month'],
      year: req.body['cmc-note-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- CONFIRMED HEARING DATE ---
router.get('/cases/procedures/procedure-1/confirmed-hearing-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.confirmedHearing || {}; 

  res.render('cases/procedures/procedure-1/confirmed-hearing-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year,
    hour: val.hour,
    minute: val.minute,
    ampm: val.ampm,
    errorFields: [] // Important to prevent Nunjucks error on load
  });
});

router.post('/cases/procedures/procedure-1/confirmed-hearing-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDateTime(
    req, res,
    'confirmed-hearing',       // HTML Field prefix
    'Confirmed hearing date',  // Display name for errors
    c.procedure1,              // Storage Object
    'confirmedHearing'         // Storage Key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/confirmed-hearing-date', {
      ref: ref,
      day: req.body['confirmed-hearing-day'],
      month: req.body['confirmed-hearing-month'],
      year: req.body['confirmed-hearing-year'],
      hour: req.body['confirmed-hearing-hour'],
      minute: req.body['confirmed-hearing-minute'],
      ampm: req.body['confirmed-hearing-ampm'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- HEARING TYPE ---
router.get('/cases/procedures/procedure-1/hearing-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};

  res.render('cases/procedures/procedure-1/hearing-type', {
    ref: ref,
    hearingType: p1.hearingType
  });
});

router.post('/cases/procedures/procedure-1/hearing-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var hearingType = req.body['hearing-type'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure1) delete c.procedure1.hearingType;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  // 2. Validation
  if (!hearingType) {
    return res.render('cases/procedures/procedure-1/hearing-type', {
      ref: ref,
      errorList: [{ text: "Select type of hearing", href: "#hearing-type" }]
    });
  }

  // 3. Save Data
  c.procedure1 = c.procedure1 || {};
  c.procedure1.hearingType = hearingType;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});

// --- HEARING VENUE ---
router.get('/cases/procedures/procedure-1/hearing-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.hearingVenue || {}; 

  res.render('cases/procedures/procedure-1/hearing-venue', {
    ref: ref,
    line1: val.line1,
    line2: val.line2,
    town: val.town,
    county: val.county,
    postcode: val.postcode,
    errorFields: []
  });
});

router.post('/cases/procedures/procedure-1/hearing-venue', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveAddress(
    req, res,
    'venue',          // HTML field prefix
    'Hearing venue',  // Error display name
    c.procedure1,     // Storage object
    'hearingVenue'    // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/hearing-venue', {
      ref: ref,
      line1: req.body['venue-line1'],
      line2: req.body['venue-line2'],
      town: req.body['venue-town'],
      county: req.body['venue-county'],
      postcode: req.body['venue-postcode'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- 1. DATE PARTIES NOTIFIED OF HEARING DATE ---
router.get('/cases/procedures/procedure-1/notified-hearing-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.notifiedHearingDate || {}; 

  res.render('cases/procedures/procedure-1/notified-hearing-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/notified-hearing-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'notified-date',          // HTML prefix
    'Date parties notified',  // Error name
    c.procedure1,             // Storage object
    'notifiedHearingDate'     // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/notified-hearing-date', {
      ref: ref,
      day: req.body['notified-date-day'],
      month: req.body['notified-date-month'],
      year: req.body['notified-date-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- 2. DATE PARTIES NOTIFIED OF HEARING VENUE ---
router.get('/cases/procedures/procedure-1/notified-hearing-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.notifiedHearingVenue || {}; 

  res.render('cases/procedures/procedure-1/notified-hearing-venue', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/notified-hearing-venue', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'notified-venue',
    'Date parties notified of venue',
    c.procedure1,
    'notifiedHearingVenue'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/notified-hearing-venue', {
      ref: ref,
      day: req.body['notified-venue-day'],
      month: req.body['notified-venue-month'],
      year: req.body['notified-venue-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- 3. EARLIEST POTENTIAL HEARING DATE ---
router.get('/cases/procedures/procedure-1/earliest-hearing-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.earliestHearingDate || {}; 

  res.render('cases/procedures/procedure-1/earliest-hearing-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/earliest-hearing-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'earliest-date',
    'Earliest potential hearing date',
    c.procedure1,
    'earliestHearingDate'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/earliest-hearing-date', {
      ref: ref,
      day: req.body['earliest-date-day'],
      month: req.body['earliest-date-month'],
      year: req.body['earliest-date-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- HEARING: LENGTH OF EVENT ---
router.get('/cases/procedures/procedure-1/hearing-length-of-event', function(req, res) {
  var ref = req.query.ref;
  var c = req.session.data['cases'].find(x => x.reference === ref);
  res.render('cases/procedures/procedure-1/hearing-length-of-event', {
    ref: ref,
    value: c.procedure1.hearingLengthOfEvent // NEW KEY
  });
});

router.post('/cases/procedures/procedure-1/hearing-length-of-event', function(req, res) {
  var ref = req.body.ref;
  var c = req.session.data['cases'].find(x => x.reference === ref);
  
  // Reuse your existing helper
  var result = validateAndSaveNumber(req, res, 'length-event', 'Length of event', c.procedure1, 'hearingLengthOfEvent');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/hearing-length-of-event', {
      ref: ref,
      value: req.body['length-event'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});


// --- HEARING IN TARGET? ---
router.get('/cases/procedures/procedure-1/hearing-in-target', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};

  res.render('cases/procedures/procedure-1/hearing-in-target', {
    ref: ref,
    hearingInTarget: p1.hearingInTarget
  });
});

router.post('/cases/procedures/procedure-1/hearing-in-target', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var val = req.body['hearing-in-target'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure1) delete c.procedure1.hearingInTarget;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  // 2. Validation
  if (!val) {
    return res.render('cases/procedures/procedure-1/hearing-in-target', {
      ref: ref,
      errorList: [{ text: "Select yes if the hearing was completed in the target timeframe", href: "#hearing-in-target" }]
    });
  }

  // 3. Save Data
  c.procedure1 = c.procedure1 || {};
  c.procedure1.hearingInTarget = val;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});

// --- HEARING CLOSED DATE ---
router.get('/cases/procedures/procedure-1/hearing-closed-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.hearingClosed || {}; 

  res.render('cases/procedures/procedure-1/hearing-closed-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/hearing-closed-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'hearing-closed',
    'Date hearing closed',
    c.procedure1,
    'hearingClosed'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/hearing-closed-date', {
      ref: ref,
      day: req.body['hearing-closed-day'],
      month: req.body['hearing-closed-month'],
      year: req.body['hearing-closed-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- HEARING PREPARATION TIME ---
router.get('/cases/procedures/procedure-1/hearing-preparation-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-1/hearing-preparation-time', {
    ref: ref,
    value: c.procedure1.hearingPrepTime // Specific Key
  });
});

router.post('/cases/procedures/procedure-1/hearing-preparation-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  
  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveNumber(
    req, res, 
    'prep-time', 
    'Preparation time', 
    c.procedure1, 
    'hearingPrepTime' // Specific Key
  );

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/hearing-preparation-time', {
      ref: ref,
      value: req.body['prep-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});


// --- HEARING TRAVEL TIME ---
router.get('/cases/procedures/procedure-1/hearing-travel-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-1/hearing-travel-time', {
    ref: ref,
    value: c.procedure1.hearingTravelTime
  });
});

router.post('/cases/procedures/procedure-1/hearing-travel-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveNumber(req, res, 'travel-time', 'Travel time', c.procedure1, 'hearingTravelTime');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/hearing-travel-time', {
      ref: ref,
      value: req.body['travel-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});


// --- HEARING SITTING TIME ---
router.get('/cases/procedures/procedure-1/hearing-sitting-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-1/hearing-sitting-time', {
    ref: ref,
    value: c.procedure1.hearingSittingTime
  });
});

router.post('/cases/procedures/procedure-1/hearing-sitting-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveNumber(req, res, 'sitting-time', 'Sitting time', c.procedure1, 'hearingSittingTime');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/hearing-sitting-time', {
      ref: ref,
      value: req.body['sitting-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});


// --- HEARING REPORTING TIME---
router.get('/cases/procedures/procedure-1/hearing-reporting-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-1/hearing-reporting-time', {
    ref: ref,
    value: c.procedure1.hearingReportingTime
  });
});

router.post('/cases/procedures/procedure-1/hearing-reporting-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveNumber(req, res, 'reporting-time', 'Reporting time', c.procedure1, 'hearingReportingTime');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/hearing-reporting-time', {
      ref: ref,
      value: req.body['reporting-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});









// --- TARGET INQUIRY DATE ---
router.get('/cases/procedures/procedure-1/target-inquiry-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.targetInquiry || {}; 

  res.render('cases/procedures/procedure-1/target-inquiry-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/target-inquiry-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'target-inquiry',
    'Target inquiry date',
    c.procedure1,
    'targetInquiry'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/target-inquiry-date', {
      ref: ref,
      day: req.body['target-inquiry-day'],
      month: req.body['target-inquiry-month'],
      year: req.body['target-inquiry-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- INQUIRY NOTIFIED DATE ---
router.get('/cases/procedures/procedure-1/inquiry-notified-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.inquiryNotified || {}; 

  res.render('cases/procedures/procedure-1/inquiry-notified-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/inquiry-notified-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'inquiry-notified',
    'Date parties must be notified of inquiry',
    c.procedure1,
    'inquiryNotified'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/inquiry-notified-date', {
      ref: ref,
      day: req.body['inquiry-notified-day'],
      month: req.body['inquiry-notified-month'],
      year: req.body['inquiry-notified-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- PRE-INQUIRY MEETING OR CMC ---
router.get('/cases/procedures/procedure-1/pre-inquiry-meeting-cmc', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};

  res.render('cases/procedures/procedure-1/pre-inquiry-meeting-cmc', {
    ref: ref,
    meetingType: p1.preInquiryMeetingCmc
  });
});

router.post('/cases/procedures/procedure-1/pre-inquiry-meeting-cmc', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var meetingType = req.body['meeting-type'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure1) delete c.procedure1.preInquiryMeetingCmc;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  // 2. Validation
  if (!meetingType) {
    return res.render('cases/procedures/procedure-1/pre-inquiry-meeting-cmc', {
      ref: ref,
      errorList: [{ text: "Select whether there will be a pre inquiry meeting or case management conference", href: "#meeting-type" }]
    });
  }

  // 3. Save Data
  c.procedure1 = c.procedure1 || {};
  c.procedure1.preInquiryMeetingCmc = meetingType;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});


// --- PIM ROUTES ---

// GET
router.get('/cases/procedures/procedure-1/pim-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.pimDate || {}; 

  res.render('cases/procedures/procedure-1/pim-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year,
    hour: val.hour,
    minute: val.minute,
    ampm: val.ampm,

    errorFields: []
  });
});

// POST
router.post('/cases/procedures/procedure-1/pim-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDateTime(
    req, res,
    'pim',
    'Pre inquiry meeting date',
    c.procedure1,
    'pimDate'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/pim-date', {
      ref: ref,
      day: req.body['pim-day'],
      month: req.body['pim-month'],
      year: req.body['pim-year'],
      hour: req.body['pim-hour'],
      minute: req.body['pim-minute'],
      ampm: req.body['pim-ampm'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- PIM TYPE ---
router.get('/cases/procedures/procedure-1/pim-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};

  res.render('cases/procedures/procedure-1/pim-type', {
    ref: ref,
    pimType: p1.pimType
  });
});

router.post('/cases/procedures/procedure-1/pim-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var pimType = req.body['pim-type'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure1) delete c.procedure1.pimType;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  // 2. Validation
  if (!pimType) {
    return res.render('cases/procedures/procedure-1/pim-type', {
      ref: ref,
      errorList: [{ text: "Select the format of the pre inquiry meeting", href: "#pim-type" }]
    });
  }

  // 3. Save Data
  c.procedure1 = c.procedure1 || {};
  c.procedure1.pimType = pimType;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});



// --- PIM NOTE SENT ---
router.get('/cases/procedures/procedure-1/pim-note-sent', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.pimNoteSent || {}; 

  res.render('cases/procedures/procedure-1/pim-note-sent', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/pim-note-sent', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'pim-note',
    'Pre inquiry meeting note sent',
    c.procedure1,
    'pimNoteSent'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/pim-note-sent', {
      ref: ref,
      day: req.body['pim-note-day'],
      month: req.body['pim-note-month'],
      year: req.body['pim-note-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- CONFIRMED INQUIRY DATE ---
router.get('/cases/procedures/procedure-1/confirmed-inquiry-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.confirmedInquiry || {}; 

  res.render('cases/procedures/procedure-1/confirmed-inquiry-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year,
    hour: val.hour,
    minute: val.minute,
    ampm: val.ampm,
    errorFields: [] // Important to prevent Nunjucks error on load
  });
});

router.post('/cases/procedures/procedure-1/confirmed-inquiry-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'confirmed-inquiry',       // HTML Field prefix
    'Confirmed inquiry date',  // Display name for errors
    c.procedure1,              // Storage Object
    'confirmedInquiry'         // Storage Key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/confirmed-inquiry-date', {
      ref: ref,
      day: req.body['confirmed-inquiry-day'],
      month: req.body['confirmed-inquiry-month'],
      year: req.body['confirmed-inquiry-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- INQUIRY TYPE ---
router.get('/cases/procedures/procedure-1/inquiry-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};

  res.render('cases/procedures/procedure-1/inquiry-type', {
    ref: ref,
    inquiryType: p1.inquiryType
  });
});

router.post('/cases/procedures/procedure-1/inquiry-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var inquiryType = req.body['inquiry-type'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure1) delete c.procedure1.inquiryType;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  // 2. Validation
  if (!inquiryType) {
    return res.render('cases/procedures/procedure-1/inquiry-type', {
      ref: ref,
      errorList: [{ text: "Select the inquiry type", href: "#inquiry-type" }]
    });
  }

  // 3. Save Data
  c.procedure1 = c.procedure1 || {};
  c.procedure1.inquiryType = inquiryType;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});


// --- INQUIRY VENUE ---
router.get('/cases/procedures/procedure-1/inquiry-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.inquiryVenue || {}; 

  res.render('cases/procedures/procedure-1/inquiry-venue', {
    ref: ref,
    line1: val.line1,
    line2: val.line2,
    town: val.town,
    county: val.county,
    postcode: val.postcode,
    errorFields: []
  });
});

router.post('/cases/procedures/procedure-1/inquiry-venue', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveAddress(
    req, res,
    'venue',          // HTML field prefix
    'Inquiry venue',  // Error display name
    c.procedure1,     // Storage object
    'inquiryVenue'    // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/inquiry-venue', {
      ref: ref,
      line1: req.body['venue-line1'],
      line2: req.body['venue-line2'],
      town: req.body['venue-town'],
      county: req.body['venue-county'],
      postcode: req.body['venue-postcode'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- 1. DATE PARTIES NOTIFIED OF INQUIRY DATE ---
router.get('/cases/procedures/procedure-1/notified-inquiry-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.notifiedInquiryDate || {}; 

  res.render('cases/procedures/procedure-1/notified-inquiry-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/notified-inquiry-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'notified-inquiry-date',  // HTML prefix
    'Date parties notified of inquiry date',
    c.procedure1,
    'notifiedInquiryDate'     // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/notified-inquiry-date', {
      ref: ref,
      day: req.body['notified-inquiry-date-day'],
      month: req.body['notified-inquiry-date-month'],
      year: req.body['notified-inquiry-date-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- 2. DATE PARTIES NOTIFIED OF INQUIRY VENUE ---
router.get('/cases/procedures/procedure-1/notified-inquiry-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.notifiedInquiryVenue || {}; 

  res.render('cases/procedures/procedure-1/notified-inquiry-venue', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/notified-inquiry-venue', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'notified-inquiry-venue', // HTML prefix
    'Date parties notified of inquiry venue',
    c.procedure1,
    'notifiedInquiryVenue'    // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/notified-inquiry-venue', {
      ref: ref,
      day: req.body['notified-inquiry-venue-day'],
      month: req.body['notified-inquiry-venue-month'],
      year: req.body['notified-inquiry-venue-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- EARLIEST POTENTIAL INQUIRY DATE ---
router.get('/cases/procedures/procedure-1/earliest-inquiry-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.earliestInquiryDate || {}; 

  res.render('cases/procedures/procedure-1/earliest-inquiry-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/earliest-inquiry-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'earliest-inquiry-date',           // HTML prefix
    'Earliest potential inquiry date', // Error display name
    c.procedure1,                      // Storage object
    'earliestInquiryDate'              // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/earliest-inquiry-date', {
      ref: ref,
      day: req.body['earliest-inquiry-date-day'],
      month: req.body['earliest-inquiry-date-month'],
      year: req.body['earliest-inquiry-date-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- INQUIRY: LENGTH OF EVENT ---
router.get('/cases/procedures/procedure-1/inquiry-length-of-event', function(req, res) {
  var ref = req.query.ref;
  var c = req.session.data['cases'].find(x => x.reference === ref);
  res.render('cases/procedures/procedure-1/inquiry-length-of-event', {
    ref: ref,
    value: c.procedure1.inquiryLengthOfEvent // NEW KEY
  });
});

router.post('/cases/procedures/procedure-1/inquiry-length-of-event', function(req, res) {
  var ref = req.body.ref;
  var c = req.session.data['cases'].find(x => x.reference === ref);
  
  var result = validateAndSaveNumber(req, res, 'length-event', 'Length of event', c.procedure1, 'inquiryLengthOfEvent');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/inquiry-length-of-event', {
      ref: ref,
      value: req.body['length-event'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});


// --- 1. DATE INQUIRY FINISHED ---
router.get('/cases/procedures/procedure-1/inquiry-finished-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.inquiryFinished || {}; 

  res.render('cases/procedures/procedure-1/inquiry-finished-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/inquiry-finished-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'inquiry-finished',      // HTML prefix
    'Date inquiry finished', // Error name
    c.procedure1,
    'inquiryFinished'        // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/inquiry-finished-date', {
      ref: ref,
      day: req.body['inquiry-finished-day'],
      month: req.body['inquiry-finished-month'],
      year: req.body['inquiry-finished-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- 2. EVENT IN TARGET? ---
router.get('/cases/procedures/procedure-1/event-in-target', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};

  res.render('cases/procedures/procedure-1/event-in-target', {
    ref: ref,
    eventInTarget: p1.eventInTarget
  });
});

router.post('/cases/procedures/procedure-1/event-in-target', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var val = req.body['event-in-target'];

  // Handle Remove
  if (action === 'remove') {
    if (c.procedure1) delete c.procedure1.eventInTarget;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  // Validation
  if (!val) {
    return res.render('cases/procedures/procedure-1/event-in-target', {
      ref: ref,
      errorList: [{ text: "Select if the event is in target", href: "#event-in-target" }]
    });
  }

  // Save Data
  c.procedure1 = c.procedure1 || {};
  c.procedure1.eventInTarget = val;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});


// --- 3. DATE INQUIRY CLOSED ---
router.get('/cases/procedures/procedure-1/inquiry-closed-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.inquiryClosed || {}; 

  res.render('cases/procedures/procedure-1/inquiry-closed-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/inquiry-closed-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'inquiry-closed',      // HTML prefix
    'Date inquiry closed', // Error name
    c.procedure1,
    'inquiryClosed'        // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/inquiry-closed-date', {
      ref: ref,
      day: req.body['inquiry-closed-day'],
      month: req.body['inquiry-closed-month'],
      year: req.body['inquiry-closed-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- INQUIRY: PREPARATION TIME ---
router.get('/cases/procedures/procedure-1/inquiry-preparation-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-1/inquiry-preparation-time', {
    ref: ref,
    value: c.procedure1.inquiryPrepTime // Specific Key
  });
});

router.post('/cases/procedures/procedure-1/inquiry-preparation-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  
  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveNumber(
    req, res, 
    'prep-time', 
    'Preparation time', 
    c.procedure1, 
    'inquiryPrepTime' // Specific Key
  );

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/inquiry-preparation-time', {
      ref: ref,
      value: req.body['prep-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});


// --- INQUIRY: TRAVEL TIME ---
router.get('/cases/procedures/procedure-1/inquiry-travel-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-1/inquiry-travel-time', {
    ref: ref,
    value: c.procedure1.inquiryTravelTime
  });
});

router.post('/cases/procedures/procedure-1/inquiry-travel-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveNumber(req, res, 'travel-time', 'Travel time', c.procedure1, 'inquiryTravelTime');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/inquiry-travel-time', {
      ref: ref,
      value: req.body['travel-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});


// --- INQUIRY: SITTING TIME ---
router.get('/cases/procedures/procedure-1/inquiry-sitting-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-1/inquiry-sitting-time', {
    ref: ref,
    value: c.procedure1.inquirySittingTime
  });
});

router.post('/cases/procedures/procedure-1/inquiry-sitting-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveNumber(req, res, 'sitting-time', 'Sitting time', c.procedure1, 'inquirySittingTime');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/inquiry-sitting-time', {
      ref: ref,
      value: req.body['sitting-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});


// --- INQUIRY: REPORTING TIME ---
router.get('/cases/procedures/procedure-1/inquiry-reporting-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-1/inquiry-reporting-time', {
    ref: ref,
    value: c.procedure1.inquiryReportingTime
  });
});

router.post('/cases/procedures/procedure-1/inquiry-reporting-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveNumber(req, res, 'reporting-time', 'Reporting time', c.procedure1, 'inquiryReportingTime');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/inquiry-reporting-time', {
      ref: ref,
      value: req.body['reporting-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});



// --- SITE VISIT TYPE ---
router.get('/cases/procedures/procedure-1/site-visit-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};

  res.render('cases/procedures/procedure-1/site-visit-type', {
    ref: ref,
    siteVisitType: p1.siteVisitType
  });
});

router.post('/cases/procedures/procedure-1/site-visit-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var val = req.body['site-visit-type'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure1) delete c.procedure1.siteVisitType;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  // 2. Validation
  if (!val) {
    return res.render('cases/procedures/procedure-1/site-visit-type', {
      ref: ref,
      errorList: [{ text: "Select the type of site visit", href: "#site-visit-type" }]
    });
  }

  // 3. Save Data
  c.procedure1 = c.procedure1 || {};
  c.procedure1.siteVisitType = val;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
});



// --- WRITTEN REPS: DATE OFFER ---
router.get('/cases/procedures/procedure-1/written-reps-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.writtenRepsDate || {}; 

  res.render('cases/procedures/procedure-1/written-reps-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/written-reps-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'written-reps-date',                  // HTML prefix
    'Date offer for written representations', // Error display name
    c.procedure1,                         // Storage object
    'writtenRepsDate'                     // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure1');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/written-reps-date', {
      ref: ref,
      day: req.body['written-reps-date-day'],
      month: req.body['written-reps-date-month'],
      year: req.body['written-reps-date-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// ==============================================
// PROCEDURE 2 ROUTES
// ==============================================

// --- TYPE ---
router.get('/cases/procedures/procedure-2/type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var existingType = "";
  if (c.procedure2 && c.procedure2.type) {
    existingType = c.procedure2.type;
  }
  
  res.render('cases/procedures/procedure-2/type', {
    ref: ref,
    type: existingType
  });
});

router.post('/cases/procedures/procedure-2/type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var type = req.body['procedure-type'];
  var action = req.body.action;

  if (action === 'remove') {
    if (c.procedure2) delete c.procedure2;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (!type) {
    return res.render('cases/procedures/procedure-2/type', {
      ref: ref,
      errorList: [{ text: "Select a procedure type", href: "#procedure-type" }]
    });
  }

  c.procedure2 = c.procedure2 || {};
  c.procedure2.type = type;
  c.procedure2.active = true;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});


// --- STATUS ---
router.get('/cases/procedures/procedure-2/status', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  res.render('cases/procedures/procedure-2/status', {
    ref: ref,
    status: p1.status
  });
});

router.post('/cases/procedures/procedure-2/status', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var status = req.body['procedure-status'];

  if (!status) {
    return res.render('cases/procedures/procedure-2/status', {
      ref: ref,
      errorList: [{ text: "Select a procedure status", href: "#procedure-status" }]
    });
  }

  c.procedure2 = c.procedure2 || {};
  c.procedure2.status = status;
  res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});


// --- ADMIN TYPE ---
router.get('/cases/procedures/procedure-2/admin-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  res.render('cases/procedures/procedure-2/admin-type', {
    ref: ref,
    adminType: p1.adminType
  });
});

router.post('/cases/procedures/procedure-2/admin-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var adminType = req.body['admin-type'];

  if (action === 'remove') {
    if (c.procedure2) delete c.procedure2.adminType;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (!adminType) {
    return res.render('cases/procedures/procedure-2/admin-type', {
      ref: ref,
      errorList: [{ text: "Select the admin procedure type", href: "#admin-type" }]
    });
  }

  c.procedure2 = c.procedure2 || {};
  c.procedure2.adminType = adminType;
  res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});


// ==============================================
// DATE ROUTES (Using Helper)
// ==============================================

// --- IN HOUSE DATE ---
router.get('/cases/procedures/procedure-2/in-house-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.inHouse || {}; 

  res.render('cases/procedures/procedure-2/in-house-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/in-house-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || []; // Using manual find to ensure Reference
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'in-house',          
    'In house date',     
    c.procedure2,        
    'inHouse'           
  );

  // FIX: Route handles redirect now
  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/in-house-date', {
      ref: ref,
      day: req.body['in-house-day'],
      month: req.body['in-house-month'],
      year: req.body['in-house-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- SITE VISIT DATE ---
router.get('/cases/procedures/procedure-2/site-visit', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.siteVisit || {}; 

  res.render('cases/procedures/procedure-2/site-visit', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/site-visit', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'site-visit',
    'Site visit date',
    c.procedure2,
    'siteVisit'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/site-visit', {
      ref: ref,
      day: req.body['site-visit-day'],
      month: req.body['site-visit-month'],
      year: req.body['site-visit-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- TARGET HEARING DATE ---
router.get('/cases/procedures/procedure-2/target-hearing-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.targetHearing || {}; 

  res.render('cases/procedures/procedure-2/target-hearing-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/target-hearing-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'target-hearing',
    'Target hearing date',
    c.procedure2,
    'targetHearing'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/target-hearing-date', {
      ref: ref,
      day: req.body['target-hearing-day'],
      month: req.body['target-hearing-month'],
      year: req.body['target-hearing-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- NOTIFIED DATE ---
router.get('/cases/procedures/procedure-2/hearing-notified-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.hearingNotified || {}; 

  res.render('cases/procedures/procedure-2/hearing-notified-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/hearing-notified-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'hearing-notified',
    'Date parties must be notified of hearing',
    c.procedure2,
    'hearingNotified'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/hearing-notified-date', {
      ref: ref,
      day: req.body['hearing-notified-day'],
      month: req.body['hearing-notified-month'],
      year: req.body['hearing-notified-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- PROOFS RECEIVED (Hearing/Inquiry) ---
router.get('/cases/procedures/procedure-2/proofs-received', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.proofsReceived || {}; 

  res.render('cases/procedures/procedure-2/proofs-received', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/proofs-received', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure2 = c.procedure2 || {};

  var day = req.body['proofs-received-day'];
  var month = req.body['proofs-received-month'];
  var year = req.body['proofs-received-year'];
  
  var result = validateAndSaveDate(
    req, res,
    'proofs-received',
    'Proofs of evidence received date',
    c.procedure2,
    'proofsReceived'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/proofs-received', {
      ref: ref,
      day: day,
      month: month,
      year: year,
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- STATEMENTS OF CASE RECEIVED ---
router.get('/cases/procedures/procedure-2/statements-received', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.statementsReceived || {}; 

  res.render('cases/procedures/procedure-2/statements-received', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/statements-received', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'statements-received',
    'Statements of case received date',
    c.procedure2,
    'statementsReceived'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/statements-received', {
      ref: ref,
      day: req.body['statements-received-day'],
      month: req.body['statements-received-month'],
      year: req.body['statements-received-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- CASE OFFICER VERIFICATION DATE ---
router.get('/cases/procedures/procedure-2/verification-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.verification || {}; 

  res.render('cases/procedures/procedure-2/verification-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/verification-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'verification-date',
    'Verification date',
    c.procedure2,
    'verification'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/verification-date', {
      ref: ref,
      day: req.body['verification-date-day'],
      month: req.body['verification-date-month'],
      year: req.body['verification-date-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- CMC ROUTES (Place this with your other Procedure 1 routes) ---

// GET
router.get('/cases/procedures/procedure-2/cmc-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.cmcDate || {}; 

  res.render('cases/procedures/procedure-2/cmc-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year,
    hour: val.hour,
    minute: val.minute,
    ampm: val.ampm,

    errorFields: []
  });
});

// POST
router.post('/cases/procedures/procedure-2/cmc-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDateTime(
    req, res,
    'cmc',
    'Case management conference',
    c.procedure2,
    'cmcDate'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/cmc-date', {
      ref: ref,
      day: req.body['cmc-day'],
      month: req.body['cmc-month'],
      year: req.body['cmc-year'],
      hour: req.body['cmc-hour'],
      minute: req.body['cmc-minute'],
      ampm: req.body['cmc-ampm'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- CMC TYPE ---
router.get('/cases/procedures/procedure-2/cmc-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};

  res.render('cases/procedures/procedure-2/cmc-type', {
    ref: ref,
    cmcType: p1.cmcType
  });
});

router.post('/cases/procedures/procedure-2/cmc-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var cmcType = req.body['cmc-type'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure2) delete c.procedure2.cmcType;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  // 2. Validation
  if (!cmcType) {
    return res.render('cases/procedures/procedure-2/cmc-type', {
      ref: ref,
      errorList: [{ text: "Select the case management conference type", href: "#cmc-type" }]
    });
  }

  // 3. Save Data
  c.procedure2 = c.procedure2 || {};
  c.procedure2.cmcType = cmcType;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});

// --- CMC VENUE ---
router.get('/cases/procedures/procedure-2/cmc-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.cmcVenue || {}; 

  res.render('cases/procedures/procedure-2/cmc-venue', {
    ref: ref,
    line1: val.line1,
    line2: val.line2,
    town: val.town,
    county: val.county,
    postcode: val.postcode,
    errorFields: []
  });
});

router.post('/cases/procedures/procedure-2/cmc-venue', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveAddress(
    req, res,
    'venue',          // Field prefix (e.g. venue-line1)
    'Venue address',  // Display name
    c.procedure2,     // Storage object
    'cmcVenue'        // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/cmc-venue', {
      ref: ref,
      line1: req.body['venue-line1'],
      line2: req.body['venue-line2'],
      town: req.body['venue-town'],
      county: req.body['venue-county'],
      postcode: req.body['venue-postcode'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- CMC NOTE SENT ---
router.get('/cases/procedures/procedure-2/cmc-note-sent', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.cmcNoteSent || {}; 

  res.render('cases/procedures/procedure-2/cmc-note-sent', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/cmc-note-sent', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'cmc-note',
    'Case management conference note sent date',
    c.procedure2,
    'cmcNoteSent'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/cmc-note-sent', {
      ref: ref,
      day: req.body['cmc-note-day'],
      month: req.body['cmc-note-month'],
      year: req.body['cmc-note-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- CONFIRMED HEARING DATE ---
router.get('/cases/procedures/procedure-2/confirmed-hearing-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.confirmedHearing || {}; 

  res.render('cases/procedures/procedure-2/confirmed-hearing-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year,
    hour: val.hour,
    minute: val.minute,
    ampm: val.ampm,
    errorFields: [] // Important to prevent Nunjucks error on load
  });
});

router.post('/cases/procedures/procedure-2/confirmed-hearing-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDateTime(
    req, res,
    'confirmed-hearing',       // HTML Field prefix
    'Confirmed hearing date',  // Display name for errors
    c.procedure2,              // Storage Object
    'confirmedHearing'         // Storage Key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/confirmed-hearing-date', {
      ref: ref,
      day: req.body['confirmed-hearing-day'],
      month: req.body['confirmed-hearing-month'],
      year: req.body['confirmed-hearing-year'],
      hour: req.body['confirmed-hearing-hour'],
      minute: req.body['confirmed-hearing-minute'],
      ampm: req.body['confirmed-hearing-ampm'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- HEARING TYPE ---
router.get('/cases/procedures/procedure-2/hearing-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};

  res.render('cases/procedures/procedure-2/hearing-type', {
    ref: ref,
    hearingType: p1.hearingType
  });
});

router.post('/cases/procedures/procedure-2/hearing-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var hearingType = req.body['hearing-type'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure2) delete c.procedure2.hearingType;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  // 2. Validation
  if (!hearingType) {
    return res.render('cases/procedures/procedure-2/hearing-type', {
      ref: ref,
      errorList: [{ text: "Select type of hearing", href: "#hearing-type" }]
    });
  }

  // 3. Save Data
  c.procedure2 = c.procedure2 || {};
  c.procedure2.hearingType = hearingType;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});

// --- HEARING VENUE ---
router.get('/cases/procedures/procedure-2/hearing-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.hearingVenue || {}; 

  res.render('cases/procedures/procedure-2/hearing-venue', {
    ref: ref,
    line1: val.line1,
    line2: val.line2,
    town: val.town,
    county: val.county,
    postcode: val.postcode,
    errorFields: []
  });
});

router.post('/cases/procedures/procedure-2/hearing-venue', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveAddress(
    req, res,
    'venue',          // HTML field prefix
    'Hearing venue',  // Error display name
    c.procedure2,     // Storage object
    'hearingVenue'    // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/hearing-venue', {
      ref: ref,
      line1: req.body['venue-line1'],
      line2: req.body['venue-line2'],
      town: req.body['venue-town'],
      county: req.body['venue-county'],
      postcode: req.body['venue-postcode'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- 1. DATE PARTIES NOTIFIED OF HEARING DATE ---
router.get('/cases/procedures/procedure-2/notified-hearing-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.notifiedHearingDate || {}; 

  res.render('cases/procedures/procedure-2/notified-hearing-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/notified-hearing-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'notified-date',          // HTML prefix
    'Date parties notified',  // Error name
    c.procedure2,             // Storage object
    'notifiedHearingDate'     // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/notified-hearing-date', {
      ref: ref,
      day: req.body['notified-date-day'],
      month: req.body['notified-date-month'],
      year: req.body['notified-date-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- 2. DATE PARTIES NOTIFIED OF HEARING VENUE ---
router.get('/cases/procedures/procedure-2/notified-hearing-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.notifiedHearingVenue || {}; 

  res.render('cases/procedures/procedure-2/notified-hearing-venue', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/notified-hearing-venue', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'notified-venue',
    'Date parties notified of venue',
    c.procedure2,
    'notifiedHearingVenue'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/notified-hearing-venue', {
      ref: ref,
      day: req.body['notified-venue-day'],
      month: req.body['notified-venue-month'],
      year: req.body['notified-venue-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- 3. EARLIEST POTENTIAL HEARING DATE ---
router.get('/cases/procedures/procedure-2/earliest-hearing-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.earliestHearingDate || {}; 

  res.render('cases/procedures/procedure-2/earliest-hearing-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/earliest-hearing-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'earliest-date',
    'Earliest potential hearing date',
    c.procedure2,
    'earliestHearingDate'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/earliest-hearing-date', {
      ref: ref,
      day: req.body['earliest-date-day'],
      month: req.body['earliest-date-month'],
      year: req.body['earliest-date-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- HEARING: LENGTH OF EVENT ---
router.get('/cases/procedures/procedure-2/hearing-length-of-event', function(req, res) {
  var ref = req.query.ref;
  var c = req.session.data['cases'].find(x => x.reference === ref);
  res.render('cases/procedures/procedure-2/hearing-length-of-event', {
    ref: ref,
    value: c.procedure2.hearingLengthOfEvent // NEW KEY
  });
});

router.post('/cases/procedures/procedure-2/hearing-length-of-event', function(req, res) {
  var ref = req.body.ref;
  var c = req.session.data['cases'].find(x => x.reference === ref);
  
  // Reuse your existing helper
  var result = validateAndSaveNumber(req, res, 'length-event', 'Length of event', c.procedure2, 'hearingLengthOfEvent');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/hearing-length-of-event', {
      ref: ref,
      value: req.body['length-event'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});


// --- HEARING IN TARGET? ---
router.get('/cases/procedures/procedure-2/hearing-in-target', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};

  res.render('cases/procedures/procedure-2/hearing-in-target', {
    ref: ref,
    hearingInTarget: p1.hearingInTarget
  });
});

router.post('/cases/procedures/procedure-2/hearing-in-target', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var val = req.body['hearing-in-target'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure2) delete c.procedure2.hearingInTarget;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  // 2. Validation
  if (!val) {
    return res.render('cases/procedures/procedure-2/hearing-in-target', {
      ref: ref,
      errorList: [{ text: "Select yes if the hearing was completed in the target timeframe", href: "#hearing-in-target" }]
    });
  }

  // 3. Save Data
  c.procedure2 = c.procedure2 || {};
  c.procedure2.hearingInTarget = val;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});

// --- HEARING CLOSED DATE ---
router.get('/cases/procedures/procedure-2/hearing-closed-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.hearingClosed || {}; 

  res.render('cases/procedures/procedure-2/hearing-closed-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/hearing-closed-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'hearing-closed',
    'Date hearing closed',
    c.procedure2,
    'hearingClosed'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/hearing-closed-date', {
      ref: ref,
      day: req.body['hearing-closed-day'],
      month: req.body['hearing-closed-month'],
      year: req.body['hearing-closed-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- HEARING PREPARATION TIME ---
router.get('/cases/procedures/procedure-2/hearing-preparation-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-2/hearing-preparation-time', {
    ref: ref,
    value: c.procedure2.hearingPrepTime // Specific Key
  });
});

router.post('/cases/procedures/procedure-2/hearing-preparation-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  
  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveNumber(
    req, res, 
    'prep-time', 
    'Preparation time', 
    c.procedure2, 
    'hearingPrepTime' // Specific Key
  );

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/hearing-preparation-time', {
      ref: ref,
      value: req.body['prep-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});


// --- HEARING TRAVEL TIME ---
router.get('/cases/procedures/procedure-2/hearing-travel-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-2/hearing-travel-time', {
    ref: ref,
    value: c.procedure2.hearingTravelTime
  });
});

router.post('/cases/procedures/procedure-2/hearing-travel-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveNumber(req, res, 'travel-time', 'Travel time', c.procedure2, 'hearingTravelTime');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/hearing-travel-time', {
      ref: ref,
      value: req.body['travel-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});


// --- HEARING SITTING TIME ---
router.get('/cases/procedures/procedure-2/hearing-sitting-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-2/hearing-sitting-time', {
    ref: ref,
    value: c.procedure2.hearingSittingTime
  });
});

router.post('/cases/procedures/procedure-2/hearing-sitting-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveNumber(req, res, 'sitting-time', 'Sitting time', c.procedure2, 'hearingSittingTime');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/hearing-sitting-time', {
      ref: ref,
      value: req.body['sitting-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});


// --- HEARING REPORTING TIME---
router.get('/cases/procedures/procedure-2/hearing-reporting-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-2/hearing-reporting-time', {
    ref: ref,
    value: c.procedure2.hearingReportingTime
  });
});

router.post('/cases/procedures/procedure-2/hearing-reporting-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveNumber(req, res, 'reporting-time', 'Reporting time', c.procedure2, 'hearingReportingTime');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/hearing-reporting-time', {
      ref: ref,
      value: req.body['reporting-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});









// --- TARGET INQUIRY DATE ---
router.get('/cases/procedures/procedure-2/target-inquiry-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.targetInquiry || {}; 

  res.render('cases/procedures/procedure-2/target-inquiry-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/target-inquiry-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'target-inquiry',
    'Target inquiry date',
    c.procedure2,
    'targetInquiry'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/target-inquiry-date', {
      ref: ref,
      day: req.body['target-inquiry-day'],
      month: req.body['target-inquiry-month'],
      year: req.body['target-inquiry-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- INQUIRY NOTIFIED DATE ---
router.get('/cases/procedures/procedure-2/inquiry-notified-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.inquiryNotified || {}; 

  res.render('cases/procedures/procedure-2/inquiry-notified-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/inquiry-notified-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'inquiry-notified',
    'Date parties must be notified of inquiry',
    c.procedure2,
    'inquiryNotified'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/inquiry-notified-date', {
      ref: ref,
      day: req.body['inquiry-notified-day'],
      month: req.body['inquiry-notified-month'],
      year: req.body['inquiry-notified-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- PRE-INQUIRY MEETING OR CMC ---
router.get('/cases/procedures/procedure-2/pre-inquiry-meeting-cmc', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};

  res.render('cases/procedures/procedure-2/pre-inquiry-meeting-cmc', {
    ref: ref,
    meetingType: p1.preInquiryMeetingCmc
  });
});

router.post('/cases/procedures/procedure-2/pre-inquiry-meeting-cmc', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var meetingType = req.body['meeting-type'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure2) delete c.procedure2.preInquiryMeetingCmc;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  // 2. Validation
  if (!meetingType) {
    return res.render('cases/procedures/procedure-2/pre-inquiry-meeting-cmc', {
      ref: ref,
      errorList: [{ text: "Select whether there will be a pre inquiry meeting or case management conference", href: "#meeting-type" }]
    });
  }

  // 3. Save Data
  c.procedure2 = c.procedure2 || {};
  c.procedure2.preInquiryMeetingCmc = meetingType;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});


// --- PIM ROUTES ---

// GET
router.get('/cases/procedures/procedure-2/pim-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.pimDate || {}; 

  res.render('cases/procedures/procedure-2/pim-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year,
    hour: val.hour,
    minute: val.minute,
    ampm: val.ampm,

    errorFields: []
  });
});

// POST
router.post('/cases/procedures/procedure-2/pim-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDateTime(
    req, res,
    'pim',
    'Pre inquiry meeting date',
    c.procedure2,
    'pimDate'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/pim-date', {
      ref: ref,
      day: req.body['pim-day'],
      month: req.body['pim-month'],
      year: req.body['pim-year'],
      hour: req.body['pim-hour'],
      minute: req.body['pim-minute'],
      ampm: req.body['pim-ampm'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- PIM TYPE ---
router.get('/cases/procedures/procedure-2/pim-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};

  res.render('cases/procedures/procedure-2/pim-type', {
    ref: ref,
    pimType: p1.pimType
  });
});

router.post('/cases/procedures/procedure-2/pim-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var pimType = req.body['pim-type'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure2) delete c.procedure2.pimType;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  // 2. Validation
  if (!pimType) {
    return res.render('cases/procedures/procedure-2/pim-type', {
      ref: ref,
      errorList: [{ text: "Select the format of the pre inquiry meeting", href: "#pim-type" }]
    });
  }

  // 3. Save Data
  c.procedure2 = c.procedure2 || {};
  c.procedure2.pimType = pimType;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});



// --- PIM NOTE SENT ---
router.get('/cases/procedures/procedure-2/pim-note-sent', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.pimNoteSent || {}; 

  res.render('cases/procedures/procedure-2/pim-note-sent', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/pim-note-sent', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'pim-note',
    'Pre inquiry meeting note sent',
    c.procedure2,
    'pimNoteSent'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/pim-note-sent', {
      ref: ref,
      day: req.body['pim-note-day'],
      month: req.body['pim-note-month'],
      year: req.body['pim-note-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- CONFIRMED INQUIRY DATE ---
router.get('/cases/procedures/procedure-2/confirmed-inquiry-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.confirmedInquiry || {}; 

  res.render('cases/procedures/procedure-2/confirmed-inquiry-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year,
    hour: val.hour,
    minute: val.minute,
    ampm: val.ampm,
    errorFields: [] // Important to prevent Nunjucks error on load
  });
});

router.post('/cases/procedures/procedure-2/confirmed-inquiry-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'confirmed-inquiry',       // HTML Field prefix
    'Confirmed inquiry date',  // Display name for errors
    c.procedure2,              // Storage Object
    'confirmedInquiry'         // Storage Key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/confirmed-inquiry-date', {
      ref: ref,
      day: req.body['confirmed-inquiry-day'],
      month: req.body['confirmed-inquiry-month'],
      year: req.body['confirmed-inquiry-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- INQUIRY TYPE ---
router.get('/cases/procedures/procedure-2/inquiry-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};

  res.render('cases/procedures/procedure-2/inquiry-type', {
    ref: ref,
    inquiryType: p1.inquiryType
  });
});

router.post('/cases/procedures/procedure-2/inquiry-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var inquiryType = req.body['inquiry-type'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure2) delete c.procedure2.inquiryType;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  // 2. Validation
  if (!inquiryType) {
    return res.render('cases/procedures/procedure-2/inquiry-type', {
      ref: ref,
      errorList: [{ text: "Select the inquiry type", href: "#inquiry-type" }]
    });
  }

  // 3. Save Data
  c.procedure2 = c.procedure2 || {};
  c.procedure2.inquiryType = inquiryType;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});


// --- INQUIRY VENUE ---
router.get('/cases/procedures/procedure-2/inquiry-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.inquiryVenue || {}; 

  res.render('cases/procedures/procedure-2/inquiry-venue', {
    ref: ref,
    line1: val.line1,
    line2: val.line2,
    town: val.town,
    county: val.county,
    postcode: val.postcode,
    errorFields: []
  });
});

router.post('/cases/procedures/procedure-2/inquiry-venue', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveAddress(
    req, res,
    'venue',          // HTML field prefix
    'Inquiry venue',  // Error display name
    c.procedure2,     // Storage object
    'inquiryVenue'    // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/inquiry-venue', {
      ref: ref,
      line1: req.body['venue-line1'],
      line2: req.body['venue-line2'],
      town: req.body['venue-town'],
      county: req.body['venue-county'],
      postcode: req.body['venue-postcode'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- 1. DATE PARTIES NOTIFIED OF INQUIRY DATE ---
router.get('/cases/procedures/procedure-2/notified-inquiry-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.notifiedInquiryDate || {}; 

  res.render('cases/procedures/procedure-2/notified-inquiry-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/notified-inquiry-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'notified-inquiry-date',  // HTML prefix
    'Date parties notified of inquiry date',
    c.procedure2,
    'notifiedInquiryDate'     // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/notified-inquiry-date', {
      ref: ref,
      day: req.body['notified-inquiry-date-day'],
      month: req.body['notified-inquiry-date-month'],
      year: req.body['notified-inquiry-date-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- 2. DATE PARTIES NOTIFIED OF INQUIRY VENUE ---
router.get('/cases/procedures/procedure-2/notified-inquiry-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.notifiedInquiryVenue || {}; 

  res.render('cases/procedures/procedure-2/notified-inquiry-venue', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/notified-inquiry-venue', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'notified-inquiry-venue', // HTML prefix
    'Date parties notified of inquiry venue',
    c.procedure2,
    'notifiedInquiryVenue'    // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/notified-inquiry-venue', {
      ref: ref,
      day: req.body['notified-inquiry-venue-day'],
      month: req.body['notified-inquiry-venue-month'],
      year: req.body['notified-inquiry-venue-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- EARLIEST POTENTIAL INQUIRY DATE ---
router.get('/cases/procedures/procedure-2/earliest-inquiry-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.earliestInquiryDate || {}; 

  res.render('cases/procedures/procedure-2/earliest-inquiry-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/earliest-inquiry-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'earliest-inquiry-date',           // HTML prefix
    'Earliest potential inquiry date', // Error display name
    c.procedure2,                      // Storage object
    'earliestInquiryDate'              // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/earliest-inquiry-date', {
      ref: ref,
      day: req.body['earliest-inquiry-date-day'],
      month: req.body['earliest-inquiry-date-month'],
      year: req.body['earliest-inquiry-date-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- INQUIRY: LENGTH OF EVENT ---
router.get('/cases/procedures/procedure-2/inquiry-length-of-event', function(req, res) {
  var ref = req.query.ref;
  var c = req.session.data['cases'].find(x => x.reference === ref);
  res.render('cases/procedures/procedure-2/inquiry-length-of-event', {
    ref: ref,
    value: c.procedure2.inquiryLengthOfEvent // NEW KEY
  });
});

router.post('/cases/procedures/procedure-2/inquiry-length-of-event', function(req, res) {
  var ref = req.body.ref;
  var c = req.session.data['cases'].find(x => x.reference === ref);
  
  var result = validateAndSaveNumber(req, res, 'length-event', 'Length of event', c.procedure2, 'inquiryLengthOfEvent');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/inquiry-length-of-event', {
      ref: ref,
      value: req.body['length-event'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});


// --- 1. DATE INQUIRY FINISHED ---
router.get('/cases/procedures/procedure-2/inquiry-finished-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.inquiryFinished || {}; 

  res.render('cases/procedures/procedure-2/inquiry-finished-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/inquiry-finished-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'inquiry-finished',      // HTML prefix
    'Date inquiry finished', // Error name
    c.procedure2,
    'inquiryFinished'        // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/inquiry-finished-date', {
      ref: ref,
      day: req.body['inquiry-finished-day'],
      month: req.body['inquiry-finished-month'],
      year: req.body['inquiry-finished-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- 2. EVENT IN TARGET? ---
router.get('/cases/procedures/procedure-2/event-in-target', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};

  res.render('cases/procedures/procedure-2/event-in-target', {
    ref: ref,
    eventInTarget: p1.eventInTarget
  });
});

router.post('/cases/procedures/procedure-2/event-in-target', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var val = req.body['event-in-target'];

  // Handle Remove
  if (action === 'remove') {
    if (c.procedure2) delete c.procedure2.eventInTarget;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  // Validation
  if (!val) {
    return res.render('cases/procedures/procedure-2/event-in-target', {
      ref: ref,
      errorList: [{ text: "Select if the event is in target", href: "#event-in-target" }]
    });
  }

  // Save Data
  c.procedure2 = c.procedure2 || {};
  c.procedure2.eventInTarget = val;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});


// --- 3. DATE INQUIRY CLOSED ---
router.get('/cases/procedures/procedure-2/inquiry-closed-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.inquiryClosed || {}; 

  res.render('cases/procedures/procedure-2/inquiry-closed-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/inquiry-closed-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'inquiry-closed',      // HTML prefix
    'Date inquiry closed', // Error name
    c.procedure2,
    'inquiryClosed'        // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/inquiry-closed-date', {
      ref: ref,
      day: req.body['inquiry-closed-day'],
      month: req.body['inquiry-closed-month'],
      year: req.body['inquiry-closed-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- INQUIRY: PREPARATION TIME ---
router.get('/cases/procedures/procedure-2/inquiry-preparation-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-2/inquiry-preparation-time', {
    ref: ref,
    value: c.procedure2.inquiryPrepTime // Specific Key
  });
});

router.post('/cases/procedures/procedure-2/inquiry-preparation-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  
  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveNumber(
    req, res, 
    'prep-time', 
    'Preparation time', 
    c.procedure2, 
    'inquiryPrepTime' // Specific Key
  );

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/inquiry-preparation-time', {
      ref: ref,
      value: req.body['prep-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});


// --- INQUIRY: TRAVEL TIME ---
router.get('/cases/procedures/procedure-2/inquiry-travel-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-2/inquiry-travel-time', {
    ref: ref,
    value: c.procedure2.inquiryTravelTime
  });
});

router.post('/cases/procedures/procedure-2/inquiry-travel-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveNumber(req, res, 'travel-time', 'Travel time', c.procedure2, 'inquiryTravelTime');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/inquiry-travel-time', {
      ref: ref,
      value: req.body['travel-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});


// --- INQUIRY: SITTING TIME ---
router.get('/cases/procedures/procedure-2/inquiry-sitting-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-2/inquiry-sitting-time', {
    ref: ref,
    value: c.procedure2.inquirySittingTime
  });
});

router.post('/cases/procedures/procedure-2/inquiry-sitting-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveNumber(req, res, 'sitting-time', 'Sitting time', c.procedure2, 'inquirySittingTime');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/inquiry-sitting-time', {
      ref: ref,
      value: req.body['sitting-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});


// --- INQUIRY: REPORTING TIME ---
router.get('/cases/procedures/procedure-2/inquiry-reporting-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-2/inquiry-reporting-time', {
    ref: ref,
    value: c.procedure2.inquiryReportingTime
  });
});

router.post('/cases/procedures/procedure-2/inquiry-reporting-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveNumber(req, res, 'reporting-time', 'Reporting time', c.procedure2, 'inquiryReportingTime');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/inquiry-reporting-time', {
      ref: ref,
      value: req.body['reporting-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});



// --- SITE VISIT TYPE ---
router.get('/cases/procedures/procedure-2/site-visit-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};

  res.render('cases/procedures/procedure-2/site-visit-type', {
    ref: ref,
    siteVisitType: p1.siteVisitType
  });
});

router.post('/cases/procedures/procedure-2/site-visit-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var val = req.body['site-visit-type'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure2) delete c.procedure2.siteVisitType;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  // 2. Validation
  if (!val) {
    return res.render('cases/procedures/procedure-2/site-visit-type', {
      ref: ref,
      errorList: [{ text: "Select the type of site visit", href: "#site-visit-type" }]
    });
  }

  // 3. Save Data
  c.procedure2 = c.procedure2 || {};
  c.procedure2.siteVisitType = val;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
});



// --- WRITTEN REPS: DATE OFFER ---
router.get('/cases/procedures/procedure-2/written-reps-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure2 || {};
  var val = p1.writtenRepsDate || {}; 

  res.render('cases/procedures/procedure-2/written-reps-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/written-reps-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'written-reps-date',                  // HTML prefix
    'Date offer for written representations', // Error display name
    c.procedure2,                         // Storage object
    'writtenRepsDate'                     // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure2');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/written-reps-date', {
      ref: ref,
      day: req.body['written-reps-date-day'],
      month: req.body['written-reps-date-month'],
      year: req.body['written-reps-date-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// ==============================================
// PROCEDURE 3 ROUTES
// ==============================================

// --- TYPE ---
router.get('/cases/procedures/procedure-3/type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var existingType = "";
  if (c.procedure3 && c.procedure3.type) {
    existingType = c.procedure3.type;
  }
  
  res.render('cases/procedures/procedure-3/type', {
    ref: ref,
    type: existingType
  });
});

router.post('/cases/procedures/procedure-3/type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var type = req.body['procedure-type'];
  var action = req.body.action;

  if (action === 'remove') {
    if (c.procedure3) delete c.procedure3;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (!type) {
    return res.render('cases/procedures/procedure-3/type', {
      ref: ref,
      errorList: [{ text: "Select a procedure type", href: "#procedure-type" }]
    });
  }

  c.procedure3 = c.procedure3 || {};
  c.procedure3.type = type;
  c.procedure3.active = true;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});


// --- STATUS ---
router.get('/cases/procedures/procedure-3/status', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  res.render('cases/procedures/procedure-3/status', {
    ref: ref,
    status: p1.status
  });
});

router.post('/cases/procedures/procedure-3/status', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var status = req.body['procedure-status'];

  if (!status) {
    return res.render('cases/procedures/procedure-3/status', {
      ref: ref,
      errorList: [{ text: "Select a procedure status", href: "#procedure-status" }]
    });
  }

  c.procedure3 = c.procedure3 || {};
  c.procedure3.status = status;
  res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});


// --- ADMIN TYPE ---
router.get('/cases/procedures/procedure-3/admin-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  res.render('cases/procedures/procedure-3/admin-type', {
    ref: ref,
    adminType: p1.adminType
  });
});

router.post('/cases/procedures/procedure-3/admin-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var adminType = req.body['admin-type'];

  if (action === 'remove') {
    if (c.procedure3) delete c.procedure3.adminType;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (!adminType) {
    return res.render('cases/procedures/procedure-3/admin-type', {
      ref: ref,
      errorList: [{ text: "Select the admin procedure type", href: "#admin-type" }]
    });
  }

  c.procedure3 = c.procedure3 || {};
  c.procedure3.adminType = adminType;
  res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});


// ==============================================
// DATE ROUTES (Using Helper)
// ==============================================

// --- IN HOUSE DATE ---
router.get('/cases/procedures/procedure-3/in-house-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.inHouse || {}; 

  res.render('cases/procedures/procedure-3/in-house-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/in-house-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || []; // Using manual find to ensure Reference
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'in-house',          
    'In house date',     
    c.procedure3,        
    'inHouse'           
  );

  // FIX: Route handles redirect now
  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/in-house-date', {
      ref: ref,
      day: req.body['in-house-day'],
      month: req.body['in-house-month'],
      year: req.body['in-house-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- SITE VISIT DATE ---
router.get('/cases/procedures/procedure-3/site-visit', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.siteVisit || {}; 

  res.render('cases/procedures/procedure-3/site-visit', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/site-visit', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'site-visit',
    'Site visit date',
    c.procedure3,
    'siteVisit'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/site-visit', {
      ref: ref,
      day: req.body['site-visit-day'],
      month: req.body['site-visit-month'],
      year: req.body['site-visit-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- TARGET HEARING DATE ---
router.get('/cases/procedures/procedure-3/target-hearing-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.targetHearing || {}; 

  res.render('cases/procedures/procedure-3/target-hearing-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/target-hearing-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'target-hearing',
    'Target hearing date',
    c.procedure3,
    'targetHearing'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/target-hearing-date', {
      ref: ref,
      day: req.body['target-hearing-day'],
      month: req.body['target-hearing-month'],
      year: req.body['target-hearing-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- NOTIFIED DATE ---
router.get('/cases/procedures/procedure-3/hearing-notified-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.hearingNotified || {}; 

  res.render('cases/procedures/procedure-3/hearing-notified-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/hearing-notified-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'hearing-notified',
    'Date parties must be notified of hearing',
    c.procedure3,
    'hearingNotified'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/hearing-notified-date', {
      ref: ref,
      day: req.body['hearing-notified-day'],
      month: req.body['hearing-notified-month'],
      year: req.body['hearing-notified-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- PROOFS RECEIVED (Hearing/Inquiry) ---
router.get('/cases/procedures/procedure-3/proofs-received', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.proofsReceived || {}; 

  res.render('cases/procedures/procedure-3/proofs-received', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/proofs-received', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure3 = c.procedure3 || {};

  var day = req.body['proofs-received-day'];
  var month = req.body['proofs-received-month'];
  var year = req.body['proofs-received-year'];
  
  var result = validateAndSaveDate(
    req, res,
    'proofs-received',
    'Proofs of evidence received date',
    c.procedure3,
    'proofsReceived'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/proofs-received', {
      ref: ref,
      day: day,
      month: month,
      year: year,
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- STATEMENTS OF CASE RECEIVED ---
router.get('/cases/procedures/procedure-3/statements-received', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.statementsReceived || {}; 

  res.render('cases/procedures/procedure-3/statements-received', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/statements-received', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'statements-received',
    'Statements of case received date',
    c.procedure3,
    'statementsReceived'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/statements-received', {
      ref: ref,
      day: req.body['statements-received-day'],
      month: req.body['statements-received-month'],
      year: req.body['statements-received-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- CASE OFFICER VERIFICATION DATE ---
router.get('/cases/procedures/procedure-3/verification-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.verification || {}; 

  res.render('cases/procedures/procedure-3/verification-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/verification-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'verification-date',
    'Verification date',
    c.procedure3,
    'verification'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/verification-date', {
      ref: ref,
      day: req.body['verification-date-day'],
      month: req.body['verification-date-month'],
      year: req.body['verification-date-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- CMC ROUTES (Place this with your other Procedure 1 routes) ---

// GET
router.get('/cases/procedures/procedure-3/cmc-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.cmcDate || {}; 

  res.render('cases/procedures/procedure-3/cmc-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year,
    hour: val.hour,
    minute: val.minute,
    ampm: val.ampm,

    errorFields: []
  });
});

// POST
router.post('/cases/procedures/procedure-3/cmc-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDateTime(
    req, res,
    'cmc',
    'Case management conference',
    c.procedure3,
    'cmcDate'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/cmc-date', {
      ref: ref,
      day: req.body['cmc-day'],
      month: req.body['cmc-month'],
      year: req.body['cmc-year'],
      hour: req.body['cmc-hour'],
      minute: req.body['cmc-minute'],
      ampm: req.body['cmc-ampm'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- CMC TYPE ---
router.get('/cases/procedures/procedure-3/cmc-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};

  res.render('cases/procedures/procedure-3/cmc-type', {
    ref: ref,
    cmcType: p1.cmcType
  });
});

router.post('/cases/procedures/procedure-3/cmc-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var cmcType = req.body['cmc-type'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure3) delete c.procedure3.cmcType;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  // 2. Validation
  if (!cmcType) {
    return res.render('cases/procedures/procedure-3/cmc-type', {
      ref: ref,
      errorList: [{ text: "Select the case management conference type", href: "#cmc-type" }]
    });
  }

  // 3. Save Data
  c.procedure3 = c.procedure3 || {};
  c.procedure3.cmcType = cmcType;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});

// --- CMC VENUE ---
router.get('/cases/procedures/procedure-3/cmc-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.cmcVenue || {}; 

  res.render('cases/procedures/procedure-3/cmc-venue', {
    ref: ref,
    line1: val.line1,
    line2: val.line2,
    town: val.town,
    county: val.county,
    postcode: val.postcode,
    errorFields: []
  });
});

router.post('/cases/procedures/procedure-3/cmc-venue', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveAddress(
    req, res,
    'venue',          // Field prefix (e.g. venue-line1)
    'Venue address',  // Display name
    c.procedure3,     // Storage object
    'cmcVenue'        // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/cmc-venue', {
      ref: ref,
      line1: req.body['venue-line1'],
      line2: req.body['venue-line2'],
      town: req.body['venue-town'],
      county: req.body['venue-county'],
      postcode: req.body['venue-postcode'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- CMC NOTE SENT ---
router.get('/cases/procedures/procedure-3/cmc-note-sent', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.cmcNoteSent || {}; 

  res.render('cases/procedures/procedure-3/cmc-note-sent', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/cmc-note-sent', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'cmc-note',
    'Case management conference note sent date',
    c.procedure3,
    'cmcNoteSent'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/cmc-note-sent', {
      ref: ref,
      day: req.body['cmc-note-day'],
      month: req.body['cmc-note-month'],
      year: req.body['cmc-note-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- CONFIRMED HEARING DATE ---
router.get('/cases/procedures/procedure-3/confirmed-hearing-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.confirmedHearing || {}; 

  res.render('cases/procedures/procedure-3/confirmed-hearing-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year,
    hour: val.hour,
    minute: val.minute,
    ampm: val.ampm,
    errorFields: [] // Important to prevent Nunjucks error on load
  });
});

router.post('/cases/procedures/procedure-3/confirmed-hearing-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDateTime(
    req, res,
    'confirmed-hearing',       // HTML Field prefix
    'Confirmed hearing date',  // Display name for errors
    c.procedure3,              // Storage Object
    'confirmedHearing'         // Storage Key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/confirmed-hearing-date', {
      ref: ref,
      day: req.body['confirmed-hearing-day'],
      month: req.body['confirmed-hearing-month'],
      year: req.body['confirmed-hearing-year'],
      hour: req.body['confirmed-hearing-hour'],
      minute: req.body['confirmed-hearing-minute'],
      ampm: req.body['confirmed-hearing-ampm'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- HEARING TYPE ---
router.get('/cases/procedures/procedure-3/hearing-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};

  res.render('cases/procedures/procedure-3/hearing-type', {
    ref: ref,
    hearingType: p1.hearingType
  });
});

router.post('/cases/procedures/procedure-3/hearing-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var hearingType = req.body['hearing-type'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure3) delete c.procedure3.hearingType;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  // 2. Validation
  if (!hearingType) {
    return res.render('cases/procedures/procedure-3/hearing-type', {
      ref: ref,
      errorList: [{ text: "Select type of hearing", href: "#hearing-type" }]
    });
  }

  // 3. Save Data
  c.procedure3 = c.procedure3 || {};
  c.procedure3.hearingType = hearingType;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});

// --- HEARING VENUE ---
router.get('/cases/procedures/procedure-3/hearing-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.hearingVenue || {}; 

  res.render('cases/procedures/procedure-3/hearing-venue', {
    ref: ref,
    line1: val.line1,
    line2: val.line2,
    town: val.town,
    county: val.county,
    postcode: val.postcode,
    errorFields: []
  });
});

router.post('/cases/procedures/procedure-3/hearing-venue', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveAddress(
    req, res,
    'venue',          // HTML field prefix
    'Hearing venue',  // Error display name
    c.procedure3,     // Storage object
    'hearingVenue'    // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/hearing-venue', {
      ref: ref,
      line1: req.body['venue-line1'],
      line2: req.body['venue-line2'],
      town: req.body['venue-town'],
      county: req.body['venue-county'],
      postcode: req.body['venue-postcode'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- 1. DATE PARTIES NOTIFIED OF HEARING DATE ---
router.get('/cases/procedures/procedure-3/notified-hearing-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.notifiedHearingDate || {}; 

  res.render('cases/procedures/procedure-3/notified-hearing-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/notified-hearing-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'notified-date',          // HTML prefix
    'Date parties notified',  // Error name
    c.procedure3,             // Storage object
    'notifiedHearingDate'     // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/notified-hearing-date', {
      ref: ref,
      day: req.body['notified-date-day'],
      month: req.body['notified-date-month'],
      year: req.body['notified-date-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- 2. DATE PARTIES NOTIFIED OF HEARING VENUE ---
router.get('/cases/procedures/procedure-3/notified-hearing-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.notifiedHearingVenue || {}; 

  res.render('cases/procedures/procedure-3/notified-hearing-venue', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/notified-hearing-venue', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'notified-venue',
    'Date parties notified of venue',
    c.procedure3,
    'notifiedHearingVenue'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/notified-hearing-venue', {
      ref: ref,
      day: req.body['notified-venue-day'],
      month: req.body['notified-venue-month'],
      year: req.body['notified-venue-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- 3. EARLIEST POTENTIAL HEARING DATE ---
router.get('/cases/procedures/procedure-3/earliest-hearing-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.earliestHearingDate || {}; 

  res.render('cases/procedures/procedure-3/earliest-hearing-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/earliest-hearing-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'earliest-date',
    'Earliest potential hearing date',
    c.procedure3,
    'earliestHearingDate'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/earliest-hearing-date', {
      ref: ref,
      day: req.body['earliest-date-day'],
      month: req.body['earliest-date-month'],
      year: req.body['earliest-date-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- HEARING: LENGTH OF EVENT ---
router.get('/cases/procedures/procedure-3/hearing-length-of-event', function(req, res) {
  var ref = req.query.ref;
  var c = req.session.data['cases'].find(x => x.reference === ref);
  res.render('cases/procedures/procedure-3/hearing-length-of-event', {
    ref: ref,
    value: c.procedure3.hearingLengthOfEvent // NEW KEY
  });
});

router.post('/cases/procedures/procedure-3/hearing-length-of-event', function(req, res) {
  var ref = req.body.ref;
  var c = req.session.data['cases'].find(x => x.reference === ref);
  
  // Reuse your existing helper
  var result = validateAndSaveNumber(req, res, 'length-event', 'Length of event', c.procedure3, 'hearingLengthOfEvent');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/hearing-length-of-event', {
      ref: ref,
      value: req.body['length-event'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});


// --- HEARING IN TARGET? ---
router.get('/cases/procedures/procedure-3/hearing-in-target', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};

  res.render('cases/procedures/procedure-3/hearing-in-target', {
    ref: ref,
    hearingInTarget: p1.hearingInTarget
  });
});

router.post('/cases/procedures/procedure-3/hearing-in-target', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var val = req.body['hearing-in-target'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure3) delete c.procedure3.hearingInTarget;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  // 2. Validation
  if (!val) {
    return res.render('cases/procedures/procedure-3/hearing-in-target', {
      ref: ref,
      errorList: [{ text: "Select yes if the hearing was completed in the target timeframe", href: "#hearing-in-target" }]
    });
  }

  // 3. Save Data
  c.procedure3 = c.procedure3 || {};
  c.procedure3.hearingInTarget = val;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});

// --- HEARING CLOSED DATE ---
router.get('/cases/procedures/procedure-3/hearing-closed-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.hearingClosed || {}; 

  res.render('cases/procedures/procedure-3/hearing-closed-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/hearing-closed-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'hearing-closed',
    'Date hearing closed',
    c.procedure3,
    'hearingClosed'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/hearing-closed-date', {
      ref: ref,
      day: req.body['hearing-closed-day'],
      month: req.body['hearing-closed-month'],
      year: req.body['hearing-closed-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- HEARING PREPARATION TIME ---
router.get('/cases/procedures/procedure-3/hearing-preparation-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-3/hearing-preparation-time', {
    ref: ref,
    value: c.procedure3.hearingPrepTime // Specific Key
  });
});

router.post('/cases/procedures/procedure-3/hearing-preparation-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  
  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveNumber(
    req, res, 
    'prep-time', 
    'Preparation time', 
    c.procedure3, 
    'hearingPrepTime' // Specific Key
  );

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/hearing-preparation-time', {
      ref: ref,
      value: req.body['prep-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});


// --- HEARING TRAVEL TIME ---
router.get('/cases/procedures/procedure-3/hearing-travel-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-3/hearing-travel-time', {
    ref: ref,
    value: c.procedure3.hearingTravelTime
  });
});

router.post('/cases/procedures/procedure-3/hearing-travel-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveNumber(req, res, 'travel-time', 'Travel time', c.procedure3, 'hearingTravelTime');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/hearing-travel-time', {
      ref: ref,
      value: req.body['travel-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});


// --- HEARING SITTING TIME ---
router.get('/cases/procedures/procedure-3/hearing-sitting-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-3/hearing-sitting-time', {
    ref: ref,
    value: c.procedure3.hearingSittingTime
  });
});

router.post('/cases/procedures/procedure-3/hearing-sitting-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveNumber(req, res, 'sitting-time', 'Sitting time', c.procedure3, 'hearingSittingTime');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/hearing-sitting-time', {
      ref: ref,
      value: req.body['sitting-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});


// --- HEARING REPORTING TIME---
router.get('/cases/procedures/procedure-3/hearing-reporting-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-3/hearing-reporting-time', {
    ref: ref,
    value: c.procedure3.hearingReportingTime
  });
});

router.post('/cases/procedures/procedure-3/hearing-reporting-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveNumber(req, res, 'reporting-time', 'Reporting time', c.procedure3, 'hearingReportingTime');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/hearing-reporting-time', {
      ref: ref,
      value: req.body['reporting-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});









// --- TARGET INQUIRY DATE ---
router.get('/cases/procedures/procedure-3/target-inquiry-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.targetInquiry || {}; 

  res.render('cases/procedures/procedure-3/target-inquiry-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/target-inquiry-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'target-inquiry',
    'Target inquiry date',
    c.procedure3,
    'targetInquiry'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/target-inquiry-date', {
      ref: ref,
      day: req.body['target-inquiry-day'],
      month: req.body['target-inquiry-month'],
      year: req.body['target-inquiry-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- INQUIRY NOTIFIED DATE ---
router.get('/cases/procedures/procedure-3/inquiry-notified-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.inquiryNotified || {}; 

  res.render('cases/procedures/procedure-3/inquiry-notified-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/inquiry-notified-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'inquiry-notified',
    'Date parties must be notified of inquiry',
    c.procedure3,
    'inquiryNotified'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/inquiry-notified-date', {
      ref: ref,
      day: req.body['inquiry-notified-day'],
      month: req.body['inquiry-notified-month'],
      year: req.body['inquiry-notified-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- PRE-INQUIRY MEETING OR CMC ---
router.get('/cases/procedures/procedure-3/pre-inquiry-meeting-cmc', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};

  res.render('cases/procedures/procedure-3/pre-inquiry-meeting-cmc', {
    ref: ref,
    meetingType: p1.preInquiryMeetingCmc
  });
});

router.post('/cases/procedures/procedure-3/pre-inquiry-meeting-cmc', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var meetingType = req.body['meeting-type'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure3) delete c.procedure3.preInquiryMeetingCmc;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  // 2. Validation
  if (!meetingType) {
    return res.render('cases/procedures/procedure-3/pre-inquiry-meeting-cmc', {
      ref: ref,
      errorList: [{ text: "Select whether there will be a pre inquiry meeting or case management conference", href: "#meeting-type" }]
    });
  }

  // 3. Save Data
  c.procedure3 = c.procedure3 || {};
  c.procedure3.preInquiryMeetingCmc = meetingType;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});


// --- PIM ROUTES ---

// GET
router.get('/cases/procedures/procedure-3/pim-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.pimDate || {}; 

  res.render('cases/procedures/procedure-3/pim-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year,
    hour: val.hour,
    minute: val.minute,
    ampm: val.ampm,

    errorFields: []
  });
});

// POST
router.post('/cases/procedures/procedure-3/pim-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDateTime(
    req, res,
    'pim',
    'Pre inquiry meeting date',
    c.procedure3,
    'pimDate'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/pim-date', {
      ref: ref,
      day: req.body['pim-day'],
      month: req.body['pim-month'],
      year: req.body['pim-year'],
      hour: req.body['pim-hour'],
      minute: req.body['pim-minute'],
      ampm: req.body['pim-ampm'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// --- PIM TYPE ---
router.get('/cases/procedures/procedure-3/pim-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};

  res.render('cases/procedures/procedure-3/pim-type', {
    ref: ref,
    pimType: p1.pimType
  });
});

router.post('/cases/procedures/procedure-3/pim-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var pimType = req.body['pim-type'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure3) delete c.procedure3.pimType;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  // 2. Validation
  if (!pimType) {
    return res.render('cases/procedures/procedure-3/pim-type', {
      ref: ref,
      errorList: [{ text: "Select the format of the pre inquiry meeting", href: "#pim-type" }]
    });
  }

  // 3. Save Data
  c.procedure3 = c.procedure3 || {};
  c.procedure3.pimType = pimType;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});



// --- PIM NOTE SENT ---
router.get('/cases/procedures/procedure-3/pim-note-sent', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.pimNoteSent || {}; 

  res.render('cases/procedures/procedure-3/pim-note-sent', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/pim-note-sent', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'pim-note',
    'Pre inquiry meeting note sent',
    c.procedure3,
    'pimNoteSent'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/pim-note-sent', {
      ref: ref,
      day: req.body['pim-note-day'],
      month: req.body['pim-note-month'],
      year: req.body['pim-note-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- CONFIRMED INQUIRY DATE ---
router.get('/cases/procedures/procedure-3/confirmed-inquiry-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.confirmedInquiry || {}; 

  res.render('cases/procedures/procedure-3/confirmed-inquiry-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year,
    hour: val.hour,
    minute: val.minute,
    ampm: val.ampm,
    errorFields: [] // Important to prevent Nunjucks error on load
  });
});

router.post('/cases/procedures/procedure-3/confirmed-inquiry-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'confirmed-inquiry',       // HTML Field prefix
    'Confirmed inquiry date',  // Display name for errors
    c.procedure3,              // Storage Object
    'confirmedInquiry'         // Storage Key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/confirmed-inquiry-date', {
      ref: ref,
      day: req.body['confirmed-inquiry-day'],
      month: req.body['confirmed-inquiry-month'],
      year: req.body['confirmed-inquiry-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- INQUIRY TYPE ---
router.get('/cases/procedures/procedure-3/inquiry-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};

  res.render('cases/procedures/procedure-3/inquiry-type', {
    ref: ref,
    inquiryType: p1.inquiryType
  });
});

router.post('/cases/procedures/procedure-3/inquiry-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var inquiryType = req.body['inquiry-type'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure3) delete c.procedure3.inquiryType;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  // 2. Validation
  if (!inquiryType) {
    return res.render('cases/procedures/procedure-3/inquiry-type', {
      ref: ref,
      errorList: [{ text: "Select the inquiry type", href: "#inquiry-type" }]
    });
  }

  // 3. Save Data
  c.procedure3 = c.procedure3 || {};
  c.procedure3.inquiryType = inquiryType;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});


// --- INQUIRY VENUE ---
router.get('/cases/procedures/procedure-3/inquiry-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.inquiryVenue || {}; 

  res.render('cases/procedures/procedure-3/inquiry-venue', {
    ref: ref,
    line1: val.line1,
    line2: val.line2,
    town: val.town,
    county: val.county,
    postcode: val.postcode,
    errorFields: []
  });
});

router.post('/cases/procedures/procedure-3/inquiry-venue', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveAddress(
    req, res,
    'venue',          // HTML field prefix
    'Inquiry venue',  // Error display name
    c.procedure3,     // Storage object
    'inquiryVenue'    // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/inquiry-venue', {
      ref: ref,
      line1: req.body['venue-line1'],
      line2: req.body['venue-line2'],
      town: req.body['venue-town'],
      county: req.body['venue-county'],
      postcode: req.body['venue-postcode'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- 1. DATE PARTIES NOTIFIED OF INQUIRY DATE ---
router.get('/cases/procedures/procedure-3/notified-inquiry-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.notifiedInquiryDate || {}; 

  res.render('cases/procedures/procedure-3/notified-inquiry-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/notified-inquiry-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'notified-inquiry-date',  // HTML prefix
    'Date parties notified of inquiry date',
    c.procedure3,
    'notifiedInquiryDate'     // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/notified-inquiry-date', {
      ref: ref,
      day: req.body['notified-inquiry-date-day'],
      month: req.body['notified-inquiry-date-month'],
      year: req.body['notified-inquiry-date-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- 2. DATE PARTIES NOTIFIED OF INQUIRY VENUE ---
router.get('/cases/procedures/procedure-3/notified-inquiry-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.notifiedInquiryVenue || {}; 

  res.render('cases/procedures/procedure-3/notified-inquiry-venue', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/notified-inquiry-venue', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'notified-inquiry-venue', // HTML prefix
    'Date parties notified of inquiry venue',
    c.procedure3,
    'notifiedInquiryVenue'    // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/notified-inquiry-venue', {
      ref: ref,
      day: req.body['notified-inquiry-venue-day'],
      month: req.body['notified-inquiry-venue-month'],
      year: req.body['notified-inquiry-venue-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- EARLIEST POTENTIAL INQUIRY DATE ---
router.get('/cases/procedures/procedure-3/earliest-inquiry-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.earliestInquiryDate || {}; 

  res.render('cases/procedures/procedure-3/earliest-inquiry-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/earliest-inquiry-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'earliest-inquiry-date',           // HTML prefix
    'Earliest potential inquiry date', // Error display name
    c.procedure3,                      // Storage object
    'earliestInquiryDate'              // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/earliest-inquiry-date', {
      ref: ref,
      day: req.body['earliest-inquiry-date-day'],
      month: req.body['earliest-inquiry-date-month'],
      year: req.body['earliest-inquiry-date-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- INQUIRY: LENGTH OF EVENT ---
router.get('/cases/procedures/procedure-3/inquiry-length-of-event', function(req, res) {
  var ref = req.query.ref;
  var c = req.session.data['cases'].find(x => x.reference === ref);
  res.render('cases/procedures/procedure-3/inquiry-length-of-event', {
    ref: ref,
    value: c.procedure3.inquiryLengthOfEvent // NEW KEY
  });
});

router.post('/cases/procedures/procedure-3/inquiry-length-of-event', function(req, res) {
  var ref = req.body.ref;
  var c = req.session.data['cases'].find(x => x.reference === ref);
  
  var result = validateAndSaveNumber(req, res, 'length-event', 'Length of event', c.procedure3, 'inquiryLengthOfEvent');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/inquiry-length-of-event', {
      ref: ref,
      value: req.body['length-event'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});


// --- 1. DATE INQUIRY FINISHED ---
router.get('/cases/procedures/procedure-3/inquiry-finished-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.inquiryFinished || {}; 

  res.render('cases/procedures/procedure-3/inquiry-finished-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/inquiry-finished-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'inquiry-finished',      // HTML prefix
    'Date inquiry finished', // Error name
    c.procedure3,
    'inquiryFinished'        // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/inquiry-finished-date', {
      ref: ref,
      day: req.body['inquiry-finished-day'],
      month: req.body['inquiry-finished-month'],
      year: req.body['inquiry-finished-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- 2. EVENT IN TARGET? ---
router.get('/cases/procedures/procedure-3/event-in-target', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};

  res.render('cases/procedures/procedure-3/event-in-target', {
    ref: ref,
    eventInTarget: p1.eventInTarget
  });
});

router.post('/cases/procedures/procedure-3/event-in-target', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var val = req.body['event-in-target'];

  // Handle Remove
  if (action === 'remove') {
    if (c.procedure3) delete c.procedure3.eventInTarget;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  // Validation
  if (!val) {
    return res.render('cases/procedures/procedure-3/event-in-target', {
      ref: ref,
      errorList: [{ text: "Select if the event is in target", href: "#event-in-target" }]
    });
  }

  // Save Data
  c.procedure3 = c.procedure3 || {};
  c.procedure3.eventInTarget = val;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});


// --- 3. DATE INQUIRY CLOSED ---
router.get('/cases/procedures/procedure-3/inquiry-closed-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.inquiryClosed || {}; 

  res.render('cases/procedures/procedure-3/inquiry-closed-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/inquiry-closed-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'inquiry-closed',      // HTML prefix
    'Date inquiry closed', // Error name
    c.procedure3,
    'inquiryClosed'        // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/inquiry-closed-date', {
      ref: ref,
      day: req.body['inquiry-closed-day'],
      month: req.body['inquiry-closed-month'],
      year: req.body['inquiry-closed-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- INQUIRY: PREPARATION TIME ---
router.get('/cases/procedures/procedure-3/inquiry-preparation-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-3/inquiry-preparation-time', {
    ref: ref,
    value: c.procedure3.inquiryPrepTime // Specific Key
  });
});

router.post('/cases/procedures/procedure-3/inquiry-preparation-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  
  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveNumber(
    req, res, 
    'prep-time', 
    'Preparation time', 
    c.procedure3, 
    'inquiryPrepTime' // Specific Key
  );

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/inquiry-preparation-time', {
      ref: ref,
      value: req.body['prep-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});


// --- INQUIRY: TRAVEL TIME ---
router.get('/cases/procedures/procedure-3/inquiry-travel-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-3/inquiry-travel-time', {
    ref: ref,
    value: c.procedure3.inquiryTravelTime
  });
});

router.post('/cases/procedures/procedure-3/inquiry-travel-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveNumber(req, res, 'travel-time', 'Travel time', c.procedure3, 'inquiryTravelTime');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/inquiry-travel-time', {
      ref: ref,
      value: req.body['travel-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});


// --- INQUIRY: SITTING TIME ---
router.get('/cases/procedures/procedure-3/inquiry-sitting-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-3/inquiry-sitting-time', {
    ref: ref,
    value: c.procedure3.inquirySittingTime
  });
});

router.post('/cases/procedures/procedure-3/inquiry-sitting-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveNumber(req, res, 'sitting-time', 'Sitting time', c.procedure3, 'inquirySittingTime');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/inquiry-sitting-time', {
      ref: ref,
      value: req.body['sitting-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});


// --- INQUIRY: REPORTING TIME ---
router.get('/cases/procedures/procedure-3/inquiry-reporting-time', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/procedure-3/inquiry-reporting-time', {
    ref: ref,
    value: c.procedure3.inquiryReportingTime
  });
});

router.post('/cases/procedures/procedure-3/inquiry-reporting-time', function(req, res) {
  var ref = req.body.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveNumber(req, res, 'reporting-time', 'Reporting time', c.procedure3, 'inquiryReportingTime');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/inquiry-reporting-time', {
      ref: ref,
      value: req.body['reporting-time'],
      errorList: result.errorList
    });
  }
  return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});



// --- SITE VISIT TYPE ---
router.get('/cases/procedures/procedure-3/site-visit-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};

  res.render('cases/procedures/procedure-3/site-visit-type', {
    ref: ref,
    siteVisitType: p1.siteVisitType
  });
});

router.post('/cases/procedures/procedure-3/site-visit-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var val = req.body['site-visit-type'];

  // 1. Handle Remove
  if (action === 'remove') {
    if (c.procedure3) delete c.procedure3.siteVisitType;
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  // 2. Validation
  if (!val) {
    return res.render('cases/procedures/procedure-3/site-visit-type', {
      ref: ref,
      errorList: [{ text: "Select the type of site visit", href: "#site-visit-type" }]
    });
  }

  // 3. Save Data
  c.procedure3 = c.procedure3 || {};
  c.procedure3.siteVisitType = val;

  res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
});



// --- WRITTEN REPS: DATE OFFER ---
router.get('/cases/procedures/procedure-3/written-reps-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure3 || {};
  var val = p1.writtenRepsDate || {}; 

  res.render('cases/procedures/procedure-3/written-reps-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/written-reps-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'written-reps-date',                  // HTML prefix
    'Date offer for written representations', // Error display name
    c.procedure3,                         // Storage object
    'writtenRepsDate'                     // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    return res.redirect('/cases/case-details?ref=' + ref + '#procedure3');
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/written-reps-date', {
      ref: ref,
      day: req.body['written-reps-date-day'],
      month: req.body['written-reps-date-month'],
      year: req.body['written-reps-date-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// ------------------------------------------------ SMART EDIT ROUTES ---------------------------------------------
// NOTE: For any generic routes, add below SMART EDIT ROUTES. For any specific routes e.g. /cases/edit/case-received-date add ABOVE this.

// 1. GET request: Renders the page dynamically
// Example: /cases/edit/act -> renders 'app/views/cases/edit/act.html'
router.get('/cases/edit/:field', function (req, res) {
  var field = req.params.field;
  var ref = req.query.ref; // Get the reference from the URL
  
  // Pass the ref to the page so the back link works
  res.render('cases/edit/' + field, { 
    ref: ref 
  });
});

// 2. POST request: Saves OR Removes the data
router.post('/cases/edit/:field', function (req, res) {
  var field = req.params.field;
  var ref = req.session.data['ref'] || req.query.ref;
  
  // Check if the user clicked the "Remove" button
  // We will name the remove button 'action' and give it value 'remove'
  var action = req.body.action;

  // Find the case
  var cases = req.session.data['cases'];
  var caseToUpdate = cases.find(c => c.reference === ref);

  if (caseToUpdate) {
    if (action === 'remove') {
      // User clicked "Remove and save" -> Delete the data
      console.log(`--- REMOVING: ${field} from case ${ref} ---`);
      delete caseToUpdate[field]; 
      
      // Also clear it from the session so the form is empty next time
      delete req.session.data[field];
    } 
    else {
      // User clicked "Save and continue" -> Update the data
      var newValue = req.body[field];
      console.log(`--- SAVING: ${field} = ${newValue} for case ${ref} ---`);
      caseToUpdate[field] = newValue;
    }
  } else {
    console.log("ERROR: Case not found");
  }

  // Redirect back to details
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- RELATED CASES LOGIC (With Validation) ---

// 1. SHOW THE LIST PAGE
router.get('/cases/edit/check-related-cases', function (req, res) {
  res.render('cases/edit/check-related-cases', { ref: req.query.ref });
});

// 2. SHOW THE ADD PAGE
router.get('/cases/related-cases/add', function (req, res) {
  res.render('cases/edit/related-case-input', { 
    ref: req.query.ref,
    id: "",      
    value: "",
    error: false 
  });
});

// 3. SHOW THE EDIT PAGE
router.get('/cases/related-cases/edit', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  
  var cases = req.session.data['cases'];
  var myCase = cases.find(c => c.reference === ref);
  
  var item = null;
  if (myCase && myCase.relatedCases) {
    item = myCase.relatedCases.find(i => i.id === id);
  }

  res.render('cases/edit/related-case-input', { 
    ref: ref,
    id: id,
    value: item ? item.reference : "",
    error: false 
  });
});

// 4. SAVE (Add or Update) - WITH VALIDATION
router.post('/cases/related-cases/save', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var newVal = req.body.relatedCaseRef;

  // VALIDATION CHECK
  if (!newVal || newVal.trim() === "") {
    return res.render('cases/edit/related-case-input', {
      ref: ref,
      id: id,
      value: newVal,
      error: true,
      errorMessage: { text: "Enter related case reference" }
    });
  }

  // If valid, proceed to save
  var cases = req.session.data['cases'];
  var myCase = cases.find(c => c.reference === ref);
  
  if (myCase) {
    if (!myCase.relatedCases) { myCase.relatedCases = []; }

    if (id) {
      // Update existing
      var item = myCase.relatedCases.find(i => i.id === id);
      if (item) { item.reference = newVal; }
    } else {
      // Add new
      var newId = 'rc-' + Math.floor(Math.random() * 10000);
      myCase.relatedCases.push({ id: newId, reference: newVal });
    }
  }

  res.redirect('/cases/edit/check-related-cases?ref=' + ref);
});

// 5. REMOVE
router.get('/cases/related-cases/remove', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;

  var cases = req.session.data['cases'];
  var myCase = cases.find(c => c.reference === ref);
  
  if (myCase && myCase.relatedCases) {
    myCase.relatedCases = myCase.relatedCases.filter(i => i.id !== id);
  }

  res.redirect('/cases/edit/check-related-cases?ref=' + ref);
});




// --- LINKED CASES LOGIC (2-Step Flow with Validation) ---

// 1. SHOW THE LIST PAGE
router.get('/cases/edit/check-linked-cases', function (req, res) {
  res.render('cases/edit/check-linked-cases', { ref: req.query.ref });
});

// 2. STEP 1: SHOW INPUT (Reference)
router.get('/cases/linked-cases/step-1', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var value = "";

  // If editing, find the existing value
  if (id) {
    var myCase = req.session.data['cases'].find(c => c.reference === ref);
    var item = myCase.linkedCases ? myCase.linkedCases.find(i => i.id === id) : null;
    if (item) value = item.reference;
  }

  res.render('cases/edit/linked-case-input', { 
    ref: ref, 
    id: id, 
    value: value,
    error: false // No error initially
  });
});

// 3. STEP 1: VALIDATE & POST
router.post('/cases/linked-cases/step-1', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var val = req.body.linkedCaseRef;

  // VALIDATION: Check if empty
  if (!val || val.trim() === "") {
    return res.render('cases/edit/linked-case-input', {
      ref: ref,
      id: id,
      value: val,
      error: true, // Trigger error state
      errorMessage: { text: "Enter linked case reference" }
    });
  }

  // Success: Store in session temporarily and go to Step 2
  req.session.data['tempLinkedRef'] = val;
  res.redirect(`/cases/linked-cases/step-2?ref=${ref}&id=${id}`);
});

// 4. STEP 2: SHOW RADIOS (Is Lead?)
router.get('/cases/linked-cases/step-2', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var isLead = "";

  // If editing, find existing value
  if (id) {
    var myCase = req.session.data['cases'].find(c => c.reference === ref);
    var item = myCase.linkedCases ? myCase.linkedCases.find(i => i.id === id) : null;
    if (item) isLead = item.isLead;
  }

  res.render('cases/edit/linked-case-lead', { 
    ref: ref, 
    id: id, 
    isLead: isLead,
    error: false 
  });
});

// 5. STEP 2: VALIDATE & SAVE
router.post('/cases/linked-cases/save', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var isLead = req.body.isLead;

  // VALIDATION: Check if empty
  if (!isLead) {
    return res.render('cases/edit/linked-case-lead', {
      ref: ref,
      id: id,
      isLead: isLead,
      error: true,
      errorMessage: { text: "Select yes if this is the lead case" }
    });
  }

  // SUCCESS: Save everything
  var cases = req.session.data['cases'];
  var myCase = cases.find(c => c.reference === ref);
  var refVal = req.session.data['tempLinkedRef']; // Retrieve from temp session

  if (myCase) {
    if (!myCase.linkedCases) { myCase.linkedCases = []; }

    if (id) {
      // Edit existing
      var item = myCase.linkedCases.find(i => i.id === id);
      if (item) {
        // If we came from Step 1, update ref. If we jumped straight here (unlikely), keep old ref.
        if(refVal) item.reference = refVal; 
        item.isLead = isLead;
      }
    } else {
      // Add new
      var newId = 'lc-' + Math.floor(Math.random() * 10000);
      myCase.linkedCases.push({ 
        id: newId, 
        reference: refVal, 
        isLead: isLead 
      });
    }
  }

  // Clear temp data
  delete req.session.data['tempLinkedRef'];
  
  res.redirect('/cases/edit/check-linked-cases?ref=' + ref);
});

// 6. REMOVE LINKED CASE
router.get('/cases/linked-cases/remove', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var myCase = req.session.data['cases'].find(c => c.reference === ref);
  
  if (myCase && myCase.linkedCases) {
    myCase.linkedCases = myCase.linkedCases.filter(i => i.id !== id);
  }
  res.redirect('/cases/edit/check-linked-cases?ref=' + ref);
});



// CASE DETAILS ROUTE
router.get('/cases/case-details', function (req, res) {
  var ref = req.query.ref;
  var c = getCase(req); // Use your existing helper function

  res.render('cases/case-details', { 
    ref: ref,
    currentCase: c  // <--- Pass the whole object here
  });
});



// --- KEY CONTACTS: OBJECTORS ---

// 1. LIST VIEW
router.get('/cases/key-contacts/objectors', function(req, res) {
  var c = getCase(req);
  c.objectors = c.objectors || [];
  res.render('cases/key-contacts/objectors/check', {
    ref: c.reference,
    objectors: c.objectors
  });
});

// --- ADD / EDIT FLOW ---

// STEP 1: Who is the objector?
router.get('/cases/key-contacts/objectors/step-1', function(req, res) {
  var c = getCase(req);
  var id = req.query.id;
  var objector = {};

  // Find existing if editing
  if (id && c.objectors) {
    objector = c.objectors.find(x => x.id == id) || {};
  }

  res.render('cases/key-contacts/objectors/step-1', {
    ref: c.reference,
    id: id,
    // Use session (if user hit back) OR existing DB value
    fname: req.session.data['temp_obj_fname'] || objector.fname,
    lname: req.session.data['temp_obj_lname'] || objector.lname,
    org: req.session.data['temp_obj_org']     || objector.org
  });
});

router.post('/cases/key-contacts/objectors/step-1', function(req, res) {
  req.session.data['temp_obj_fname'] = req.body['obj-fname'];
  req.session.data['temp_obj_lname'] = req.body['obj-lname'];
  req.session.data['temp_obj_org']   = req.body['obj-org'];
  
  res.redirect(`/cases/key-contacts/objectors/step-2?ref=${req.query.ref}&id=${req.query.id}`);
});

// STEP 2: Address
router.get('/cases/key-contacts/objectors/step-2', function(req, res) {
  var c = getCase(req);
  var id = req.query.id;
  var objector = {};

  if (id && c.objectors) {
    objector = c.objectors.find(x => x.id == id) || {};
  }

  res.render('cases/key-contacts/objectors/step-2', {
    ref: c.reference,
    id: id,
    // PRE-FILL LOGIC: Session -> DB -> Empty
    address1: req.session.data['temp_obj_address1'] || objector.address1,
    address2: req.session.data['temp_obj_address2'] || objector.address2,
    town:     req.session.data['temp_obj_town']     || objector.town,
    county:   req.session.data['temp_obj_county']   || objector.county, // NEW
    postcode: req.session.data['temp_obj_postcode'] || objector.postcode
  });
});

router.post('/cases/key-contacts/objectors/step-2', function(req, res) {
  req.session.data['temp_obj_address1'] = req.body['obj-address1'];
  req.session.data['temp_obj_address2'] = req.body['obj-address2'];
  req.session.data['temp_obj_town']     = req.body['obj-town'];
  req.session.data['temp_obj_county']   = req.body['obj-county']; // NEW
  req.session.data['temp_obj_postcode'] = req.body['obj-postcode'];

  res.redirect(`/cases/key-contacts/objectors/step-3?ref=${req.query.ref}&id=${req.query.id}`);
});

// STEP 3: Contact Details
router.get('/cases/key-contacts/objectors/step-3', function(req, res) {
  var c = getCase(req);
  var id = req.query.id;
  var objector = {};

  if (id && c.objectors) {
    objector = c.objectors.find(x => x.id == id) || {};
  }

  res.render('cases/key-contacts/objectors/step-3', {
    ref: c.reference,
    id: id,
    // PRE-FILL LOGIC: Session -> DB -> Empty
    email: req.session.data['temp_obj_email'] || objector.email,
    phone: req.session.data['temp_obj_phone'] || objector.phone
  });
});

router.post('/cases/key-contacts/objectors/step-3', function(req, res) {
  req.session.data['temp_obj_email'] = req.body['obj-email'];
  req.session.data['temp_obj_phone'] = req.body['obj-phone'];

  res.redirect(`/cases/key-contacts/objectors/step-4?ref=${req.query.ref}&id=${req.query.id}`);
});

// STEP 4: Status (Final Save)
router.get('/cases/key-contacts/objectors/step-4', function(req, res) {
  var c = getCase(req);
  var id = req.query.id;
  var objector = {};

  if (id && c.objectors) {
    objector = c.objectors.find(x => x.id == id) || {};
  }

  res.render('cases/key-contacts/objectors/step-4', {
    ref: c.reference,
    id: id,
    status: req.session.data['temp_obj_status'] || objector.status
  });
});

router.post('/cases/key-contacts/objectors/step-4', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var c = getCase(req);
  var status = req.body['obj-status'];

  // 1. Validation
  if (!status) {
    return res.render('cases/key-contacts/objectors/step-4', {
      ref: ref,
      id: id,
      errorList: [{ text: "Select the status of the objector", href: "#obj-status" }]
    });
  }

  // 2. Find existing data (if editing) so we don't lose it
  var existingObjector = {};
  if (id && c.objectors) {
    existingObjector = c.objectors.find(x => x.id == id) || {};
  }

  // 3. Helper function: Use New Data if it exists, otherwise keep Old Data
  // This prevents overwriting data with 'undefined' if you skipped a step
  function getVal(sessionName, dbName) {
    if (req.session.data[sessionName] !== undefined) {
      return req.session.data[sessionName];
    }
    return dbName;
  }

  // 4. Build the final object
  var newObjector = {
    id: id || Date.now().toString(),
    
    // Step 1 Fields
    fname: getVal('temp_obj_fname', existingObjector.fname),
    lname: getVal('temp_obj_lname', existingObjector.lname),
    org:   getVal('temp_obj_org',   existingObjector.org),
    
    // Step 2 Fields
    address1: getVal('temp_obj_address1', existingObjector.address1),
    address2: getVal('temp_obj_address2', existingObjector.address2),
    town:     getVal('temp_obj_town',     existingObjector.town),
    county:   getVal('temp_obj_county',   existingObjector.county), // NEW
    postcode: getVal('temp_obj_postcode', existingObjector.postcode),
    
    // Step 3 Fields
    email: getVal('temp_obj_email', existingObjector.email),
    phone: getVal('temp_obj_phone', existingObjector.phone),
    
    // Step 4 Field (We just got this from body)
    status: status
  };

  // 5. Save to Array
  c.objectors = c.objectors || [];
  var existingIndex = c.objectors.findIndex(x => x.id == id);
  
  if (existingIndex >= 0) {
    c.objectors[existingIndex] = newObjector; // Update
  } else {
    c.objectors.push(newObjector); // Add New
  }

  // 6. Clear temp session data
  delete req.session.data['temp_obj_fname'];
  delete req.session.data['temp_obj_lname'];
  delete req.session.data['temp_obj_org'];
  delete req.session.data['temp_obj_address1'];
  delete req.session.data['temp_obj_address2'];
  delete req.session.data['temp_obj_town'];
  delete req.session.data['temp_obj_county'];
  delete req.session.data['temp_obj_postcode'];
  delete req.session.data['temp_obj_email'];
  delete req.session.data['temp_obj_phone'];
  delete req.session.data['temp_obj_status'];

  res.redirect('/cases/key-contacts/objectors?ref=' + ref);
});

// REMOVE ROUTE
router.get('/cases/key-contacts/objectors/remove', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var c = getCase(req);
  
  if (c.objectors) {
    c.objectors = c.objectors.filter(x => x.id != id);
  }
  
  res.redirect('/cases/key-contacts/objectors?ref=' + ref);
});




// --- KEY CONTACTS: CONTACTS ---

// 1. LIST VIEW
router.get('/cases/key-contacts/contacts', function(req, res) {
  var c = getCase(req);
  c.contacts = c.contacts || [];
  res.render('cases/key-contacts/contacts/check', {
    ref: c.reference,
    contacts: c.contacts
  });
});

// --- ADD / EDIT FLOW ---

// STEP 1: Contact Type (New Step 1)
router.get('/cases/key-contacts/contacts/step-1', function(req, res) {
  var c = getCase(req);
  var id = req.query.id;
  var contact = {};

  if (id && c.contacts) {
    contact = c.contacts.find(x => x.id == id) || {};
  }

  res.render('cases/key-contacts/contacts/step-1', {
    ref: c.reference,
    id: id,
    // PRE-FILL: Session -> DB
    type: req.session.data['temp_con_type'] || contact.type
  });
});

router.post('/cases/key-contacts/contacts/step-1', function(req, res) {
  var type = req.body['con-type'];
  
  // Validation
  if (!type) {
    return res.render('cases/key-contacts/contacts/step-1', {
      ref: req.query.ref,
      id: req.query.id,
      errorList: [{ text: "Select contact type", href: "#con-type" }]
    });
  }

  req.session.data['temp_con_type'] = type;
  res.redirect(`/cases/key-contacts/contacts/step-2?ref=${req.query.ref}&id=${req.query.id}`);
});

// STEP 2: Who is the contact? (Was Objector Step 1)
router.get('/cases/key-contacts/contacts/step-2', function(req, res) {
  var c = getCase(req);
  var id = req.query.id;
  var contact = {};
  if (id && c.contacts) contact = c.contacts.find(x => x.id == id) || {};

  res.render('cases/key-contacts/contacts/step-2', {
    ref: c.reference,
    id: id,
    fname: req.session.data['temp_con_fname'] || contact.fname,
    lname: req.session.data['temp_con_lname'] || contact.lname,
    org:   req.session.data['temp_con_org']   || contact.org,
  });
});

router.post('/cases/key-contacts/contacts/step-2', function(req, res) {
  req.session.data['temp_con_fname'] = req.body['con-fname'];
  req.session.data['temp_con_lname'] = req.body['con-lname'];
  req.session.data['temp_con_org']   = req.body['con-org'];

  res.redirect(`/cases/key-contacts/contacts/step-3?ref=${req.query.ref}&id=${req.query.id}`);
});

// STEP 3: Address (Was Objector Step 2)
router.get('/cases/key-contacts/contacts/step-3', function(req, res) {
  var c = getCase(req);
  var id = req.query.id;
  var contact = {};
  if (id && c.contacts) contact = c.contacts.find(x => x.id == id) || {};

  res.render('cases/key-contacts/contacts/step-3', {
    ref: c.reference,
    id: id,
    address1: req.session.data['temp_con_address1'] || contact.address1,
    address2: req.session.data['temp_con_address2'] || contact.address2,
    town:     req.session.data['temp_con_town']     || contact.town,
    county:   req.session.data['temp_con_county']   || contact.county,
    postcode: req.session.data['temp_con_postcode'] || contact.postcode
  });
});

router.post('/cases/key-contacts/contacts/step-3', function(req, res) {
  req.session.data['temp_con_address1'] = req.body['con-address1'];
  req.session.data['temp_con_address2'] = req.body['con-address2'];
  req.session.data['temp_con_town']     = req.body['con-town'];
  req.session.data['temp_con_county']   = req.body['con-county'];
  req.session.data['temp_con_postcode'] = req.body['con-postcode'];

  res.redirect(`/cases/key-contacts/contacts/step-4?ref=${req.query.ref}&id=${req.query.id}`);
});

// STEP 4: Contact Details + SAVE (Was Objector Step 3)
router.get('/cases/key-contacts/contacts/step-4', function(req, res) {
  var c = getCase(req);
  var id = req.query.id;
  var contact = {};
  if (id && c.contacts) contact = c.contacts.find(x => x.id == id) || {};

  res.render('cases/key-contacts/contacts/step-4', {
    ref: c.reference,
    id: id,
    email: req.session.data['temp_con_email'] || contact.email,
    phone: req.session.data['temp_con_phone'] || contact.phone
  });
});

router.post('/cases/key-contacts/contacts/step-4', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var c = getCase(req);

  // 1. Get inputs from this step
  var email = req.body['con-email'];
  var phone = req.body['con-phone'];

  // 2. Find existing data (if editing)
  var existing = {};
  if (id && c.contacts) {
    existing = c.contacts.find(x => x.id == id) || {};
  }

  // 3. Helper to get New Session Data OR Old DB Data
  function getVal(sess, db) { return (req.session.data[sess] !== undefined) ? req.session.data[sess] : db; }

  // 4. Build Object
  var newContact = {
    id: id || Date.now().toString(),
    
    // Step 1: Type
    type: getVal('temp_con_type', existing.type),

    // Step 2: Name
    fname: getVal('temp_con_fname', existing.fname),
    lname: getVal('temp_con_lname', existing.lname),
    org:   getVal('temp_con_org',   existing.org),

    // Step 3: Address
    address1: getVal('temp_con_address1', existing.address1),
    address2: getVal('temp_con_address2', existing.address2),
    town:     getVal('temp_con_town',     existing.town),
    county:   getVal('temp_con_county',   existing.county),
    postcode: getVal('temp_con_postcode', existing.postcode),

    // Step 4: Contact
    email: email,
    phone: phone
  };

  // 5. Save
  c.contacts = c.contacts || [];
  var idx = c.contacts.findIndex(x => x.id == id);
  if (idx >= 0) c.contacts[idx] = newContact;
  else c.contacts.push(newContact);

  // 6. Cleanup
  delete req.session.data['temp_con_type'];
  delete req.session.data['temp_con_fname'];
  delete req.session.data['temp_con_lname'];
  delete req.session.data['temp_con_org'];
  delete req.session.data['temp_con_address1'];
  delete req.session.data['temp_con_address2'];
  delete req.session.data['temp_con_town'];
  delete req.session.data['temp_con_county'];
  delete req.session.data['temp_con_postcode'];
  delete req.session.data['temp_con_email']; // Clean up specific keys

  res.redirect('/cases/key-contacts/contacts?ref=' + ref);
});

// REMOVE ROUTE
router.get('/cases/key-contacts/contacts/remove', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var c = getCase(req);
  if (c.contacts) c.contacts = c.contacts.filter(x => x.id != id);
  res.redirect('/cases/key-contacts/contacts?ref=' + ref);
});




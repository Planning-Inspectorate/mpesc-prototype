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


// --- SMART EDIT ROUTES ---

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
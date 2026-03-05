//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')

const {applyAzureHostingFix} = require('./azure-hosting-fix');
applyAzureHostingFix();


const router = govukPrototypeKit.requests.setupRouter()


// Page routes

// --- COMBINED RESET AND START ROUTE ---
router.get('/create-case-start', function (req, res) {
  
  // 1. "Nuclear" capture: Save the database (the cases already created)
  const savedCases = req.session.data['cases'] || [];

  // 2. Wipe EVERYTHING: This kills ghost data from 'Edit' and 'Create' flows alike
  req.session.data = {};

  // 3. Restore only the database
  req.session.data['cases'] = savedCases;

  // 4. (Optional) Restore global settings if you have any
  // req.session.data['userRole'] = 'Admin';

  // 5. Redirect to the first page of the creation journey
  res.redirect('/cases/create-a-case/questions/casework-area');
});

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
    res.redirect('/cases/create-a-case/questions/applicant-check')
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

// Define case work area slug for both display and filtering (This is crucial for your checkboxes to work on the All Cases page)

var areaSelection = req.session.data['casework-area'];
  var areaSlug = "";

  if (areaSelection === "Planning, Environmental and Applications") {
    areaSlug = "planning-environment-applications";
  } else if (areaSelection === "Rights of Way and Common Land") {
    areaSlug = "rights-of-way-common-land";
  }

  // 1. Construct the address string
  var fullAddress = [
    req.session.data['addressLine1'],
    req.session.data['addressLine2'],
    req.session.data['addressTown'],
    req.session.data['addressCounty'],
    req.session.data['addressPostcode']
  ].filter(Boolean).join(',\n');

  // 2. Create the case object with Filter-Ready Slugs
  var newCase = {
    "reference": finalRef,
    
    // Status: Take from the radio selection, fallback to "New case" if empty
    "caseStatus": "",
    
    // Display Labels (for the table)
    "type": caseType,
    "subtype": subtype,
    // In routes.js - Updated to create cleaner, predictable slugs
    "areaValue": (areaSelection || "").toLowerCase()
                  .replace(/\band\b/g, '')  // Removes "and"
                  .replace(/\bof\b/g, '')   // Removes "of"
                  .replace(/,?\s+/g, '-')   // Replaces spaces with dashes
                  .replace(/-+/g, '-'),     // Fixes double dashes

    // Filter Slugs (Crucial for your checkboxes to work)
    // We convert "Rights of Way" to "rights-of-way" automatically
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

    applicants: req.session.data['applicants'] || [],
    "authorityName": req.session.data['authorityName'] || req.session.data['authority-name'],
    "externalReference": req.session.data['externalReference'] || req.session.data['external-reference'],
    "siteLocation": req.session.data['siteLocation'] || req.session.data['site-location']
  };

  // 3. Push to database
  if (!req.session.data['cases']) { req.session.data['cases'] = []; }
  req.session.data['cases'].push(newCase);



// --- 6.5 SAVE, CLEANUP & REDIRECT ---

  // 1. Capture the "database" (the cases you've already saved)
  const savedCases = req.session.data['cases'] || [];

  // 2. Clear the session but restore the database
  // This wipes all the form data used during creation
  req.session.data = { 'cases': savedCases };

  addAuditLog(req, finalRef, "Case created");

  // 3. Log the success for your own terminal debugging
  console.log("SUCCESS: Case Saved with Ref:", finalRef);
  
  // 4. Perform the SINGLE redirect to the success page
  // We pass the caseRef in the URL so the success page can display "Case [Ref] created"
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

  req.session.flashSection = "case-details"; 

addAuditLog(req, ref, "Case name updated to '" + val + "'"); 
  
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

  req.session.flashSection = "case-details"; 

addAuditLog(req, ref, "External reference updated to '" + val + "'");
  
  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});

// --- 3. EDIT/CHECK APPLICANTS HUB (Post-Creation) ---
// 0. Hub Page: Check Applicants
router.get('/cases/edit/check-applicants', (req, res) => {
  let c = getCase(req);
  if (!c) return res.redirect('/cases/all-cases');
  
  res.render('cases/edit/check-applicants', { 
    ref: req.query.ref, 
    applicants: c.applicants || [] 
  });
});

// 1. Applicant Name (Edit Mode)
router.get('/cases/edit/applicant-name', (req, res) => {
  let c = getCase(req);
  let id = req.query.id;

  if (id && (!req.session.data['tempApplicant'] || req.session.data['tempApplicant'].id !== id)) {
    if (c && c.applicants) {
      let existingApp = c.applicants.find(a => a.id === id);
      if (existingApp) {
        req.session.data['tempApplicant'] = JSON.parse(JSON.stringify(existingApp));
      }
    }
  } else if (!id) {
    req.session.data['tempApplicant'] = {};
  }

  res.render('cases/create-a-case/questions/applicant-name', { 
    ref: req.query.ref, 
    id: id, 
    val: req.session.data['tempApplicant'] || {}, 
    editMode: true 
  });
});

router.post('/cases/edit/applicant-name', (req, res) => {
  if (!req.session.data['tempApplicant']) req.session.data['tempApplicant'] = {};
  req.session.data['tempApplicant'].firstName = req.body.firstName;
  req.session.data['tempApplicant'].lastName = req.body.lastName;
  req.session.data['tempApplicant'].companyName = req.body.companyName;

  res.redirect(`/cases/edit/applicant-address?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// 2. Applicant Address (Edit Mode)
router.get('/cases/edit/applicant-address', (req, res) => {
  let temp = req.session.data['tempApplicant'] || {};
  res.render('cases/create-a-case/questions/applicant-address', { 
    ref: req.query.ref, 
    id: req.query.id, 
    val: temp,
    address: temp.address || {}, 
    editMode: true 
  });
});

router.post('/cases/edit/applicant-address', (req, res) => {
  var result = validateAndSaveAddress(req, res, 'applicant', 'Applicant address', req.session.data['tempApplicant'], 'address');

  if (result.status === "ERROR") {
    return res.render('cases/create-a-case/questions/applicant-address', { 
      ref: req.query.ref, 
      id: req.query.id,
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
      editMode: true
    });
  }
  res.redirect(`/cases/edit/applicant-contact?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// 3. Applicant Contact & Final Save (Edit Mode)
router.get('/cases/edit/applicant-contact', (req, res) => {
  res.render('cases/create-a-case/questions/applicant-contact', { 
    ref: req.query.ref, 
    id: req.query.id, 
    val: req.session.data['tempApplicant'] || {}, 
    editMode: true 
  });
});

router.post('/cases/edit/applicant-contact', (req, res) => {
  let c = getCase(req);
  let id = req.query.id;
  
  if (!req.session.data['tempApplicant']) req.session.data['tempApplicant'] = {};
  req.session.data['tempApplicant'].email = req.body.email;
  req.session.data['tempApplicant'].phone = req.body.phone;

  if (!c.applicants) c.applicants = [];
  let completedApplicant = req.session.data['tempApplicant'];

  if (id) {
    let index = c.applicants.findIndex(a => a.id === id);
    if (index > -1) c.applicants[index] = { ...completedApplicant };
  } else {
    completedApplicant.id = 'app-' + Date.now();
    c.applicants.push(completedApplicant);
  }

  req.session.data['tempApplicant'] = {}; 
  res.redirect(`/cases/edit/check-applicants?ref=${req.query.ref}`);
});

// 4. Instant Remove (Fixed Redirect)
router.get('/cases/edit/applicant-remove', (req, res) => {
  let c = getCase(req);
  let id = req.query.id;
  
  if (c && c.applicants) {
    c.applicants = c.applicants.filter(a => a.id !== id);
  }
  
  // Pointed back to check-applicants
  res.redirect(`/cases/edit/check-applicants?ref=${req.query.ref}`);
});

// 5. Return to Case Details (From Check Applicants Hub)
router.get('/cases/applicant-appellant/return-to-case', function (req, res) {
  // 1. Attach the success banner to jump to the 'Overview' card
  req.session.flashSection = "case-details"; 

addAuditLog(req, req.query.ref, "Applicant details updated");
  
  // 2. Send them back to the main Case Details page
  res.redirect('/cases/case-details?ref=' + req.query.ref);
});

// --- 4. EDIT SITE ADDRESS (With Strict Postcode Validation) ---
router.get('/cases/edit/site-address', function(req, res) {
  var c = getCase(req);
  var ref = req.query.ref;

  // 1. Still re-hydrate for subsequent form logic
  req.session.data['addressLine1'] = c.addressLine1;
  req.session.data['addressLine2'] = c.addressLine2;
  req.session.data['addressTown'] = c.addressTown;
  req.session.data['addressCounty'] = c.addressCounty;
  req.session.data['addressPostcode'] = c.addressPostcode;

  // 2. Pass values DIRECTLY to the template to fix the "refresh bug"
  res.render('cases/edit/site-address', { 
    ref: ref,
    addressLine1: c.addressLine1,
    addressLine2: c.addressLine2,
    addressTown: c.addressTown,
    addressCounty: c.addressCounty,
    addressPostcode: c.addressPostcode
  });
});

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

  req.session.flashSection = "case-details"; 

addAuditLog(req, ref, "Site address updated to '" + fullAddress.replace(/\n/g, ', ') + "'");

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

  req.session.flashSection = "case-details"; 

addAuditLog(req, ref, "Site location updated to '" + val + "'");

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

  req.session.flashSection = "case-details"; 

addAuditLog(req, ref, "Authority updated to '" + val + "'");

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

  req.session.flashSection = "case-details"; 

addAuditLog(req, ref, "Historical reference updated to '" + c.historicalReference + "'");

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

    req.session.flashSection = "case-details"; 

addAuditLog(req, ref, "Case status removed");

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

  req.session.flashSection = "case-details"; 

addAuditLog(req, ref, "Case status updated to '" + val + "'");

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
    req.session.flashSection = "case-details"; 

addAuditLog(req, ref, "Modification status removed");
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
  req.session.flashSection = "case-details"; 

addAuditLog(req, ref, "Modification status updated to '" + val + "'");
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

    req.session.flashSection = "case-details"; 

addAuditLog(req, ref, "Priority removed");
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

  req.session.flashSection = "case-details"; 

addAuditLog(req, ref, "Priority updated to '" + val + "'");
  res.redirect('/cases/case-details?ref=' + ref + '&updated=case-details');
});

// --- LEGISLATION / ACT LOGIC ---

router.get('/cases/edit/act', function(req, res) {
  var c = getCase(req);
  // Get existing value from the case object
  var val = c.act || "";
  
  res.render('cases/edit/act', { 
    ref: c.reference, 
    value: val 
  });
});

router.post('/cases/edit/act', function(req, res) {
  var ref = req.query.ref;
  var val = req.body.act; // matches the 'name' attribute in your autocomplete
  var c = getCase(req);

  // 1. The Allowed List (from your image)
  const legislationList = [
    "Acquisition of Land Act 1981, 32",
    "Acquisition of Land Act 1981, 19 and Schedule 3, para 6",
    "Commons Act 2006, 16",
    "Commons Act 2006, 38",
    "Commons Act 2006, Part 1 Schedule 6",
    "Greater London Parks & Open Spaces Order 1967, Article 12",
    "Greater London Parks & Open Spaces Order 1967, Article 17",
    "Highways Act 1980, 26",
    "Highways Act 1980, 118",
    "Highways Act 1980, 119",
    "Highways Act 1980, 118A",
    "Highways Act 1980, 118B",
    "Highways Act 1980, 119A",
    "Highways Act 1980, 119B",
    "Highways Act 1980, 119D",
    "Inclosure Act 1845, 149",
    "Law of Property Act 1925, 193",
    "National Trust Act 1971, 23",
    "Town and Country Planning Act 1990, 78",
    "Town and Country Planning Act 1990, 247",
    "Town and Country Planning Act 1990, 251",
    "Town and Country Planning Act 1990, 257",
    "Town and Country Planning Act 1990, 61",
    "Wildlife and Countryside Act 1981, 53",
    "Wildlife and Countryside Act 1981, 54",
    "Wildlife and Countryside Act 1981, Schedule 14 A",
    "Wildlife and Countryside Act 1981, Schedule 14 D"
  ];

  // 2. Validation: Check if empty
  if (!val || val.trim() === "") {
    return res.render('cases/edit/act', {
      ref: ref,
      error: true,
      errorMessage: { text: "Enter the relevant legislation or act" }
    });
  }

  // 3. Validation: Check if the typed value exists in the list
  // This prevents users from typing "Fake Act 2024" and saving it
  if (!legislationList.includes(val)) {
     return res.render('cases/edit/act', {
      ref: ref,
      value: val, // persists the invalid entry so they can fix it
      error: true,
      errorMessage: { text: "Select an act from the list" }
    });   
  }

  // 4. Save to the case object
  c.act = val;

  req.session.flashSection = "overview"; 

addAuditLog(req, ref, "Act updated to '" + val + "'");
  
  // Redirect back to case details with a success parameter
  // 'updated=legislation' can be used to trigger a success banner
  res.redirect('/cases/case-details?ref=' + ref + '&updated=legislation');
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
    req.session.flashSection = "team"; 

addAuditLog(req, req.query.ref, "Case officer removed");
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
  req.session.flashSection = "team"; 

addAuditLog(req, req.query.ref, "Case officer updated to '" + val + "'");
  
  // Note: updated=team refers to the ID of the new summary card below
  res.redirect('/cases/case-details?ref=' + ref + '&updated=team');
});


// --- CONSENT SOUGHT ---
router.get('/cases/edit/consent-sought', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Pass the case reference and the current saved value to the page
  res.render('cases/edit/consent-sought', {
    ref: ref,
    currentValue: c['consent-sought'] // Sends the current answer (e.g., "Yes")
  });
});

router.post('/cases/edit/consent-sought', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // 1. Grab the value from the form 
  // (IMPORTANT: Make sure your HTML input/radio buttons have name="consent-sought")
  var val = req.body['consent-sought'];

  // 2. Save the value directly to the case object
  // (Using bracket notation because of the hyphen in the name)
  c['consent-sought'] = val;

  // 3. Set the flash message for the 'Overview' card
  req.session.flashSection = "overview"; 

addAuditLog(req, ref, "Consent sought updated to '" + val + "'");

  // 4. Redirect smoothly back to the case details page
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- INSPECTOR BAND ---
router.get('/cases/edit/inspector-band', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // If the case doesn't exist, bounce them back to the case list
  if (!c) {
    return res.redirect('/cases');
  }

  // Render the page and pass the existing value so the form can pre-fill
  res.render('cases/edit/inspector-band', {
    ref: ref,
    currentValue: c['inspector-band'] // Sends "Band 1", "Band 2", etc.
  });
});

router.post('/cases/edit/inspector-band', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  if (req.body.action === "remove") {
    
    c['inspector-band'] = ""; 

    req.session.flashSection = "overview"; 

addAuditLog(req, ref, "Inspector band removed");
    return res.redirect('/cases/case-details?ref=' + ref);
  }
  var val = req.body['inspector-band'];

  c['inspector-band'] = val;

  req.session.flashSection = "overview"; 

addAuditLog(req, ref, "Inspector band updated to '" + val + "'");

  
  res.redirect('/cases/case-details?ref=' + ref);
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

// 7. Return to Case Details (From Linked Cases Hub)
router.get('/cases/check-inspectors/return-to-case', function (req, res) {
  // 1. Attach the success banner to jump to the 'Overview' card
  req.session.flashSection = "team"; 

addAuditLog(req, req.query.ref, "Inspector details updated");
  
  // 2. Send them back to the main Case Details page
  res.redirect('/cases/case-details?ref=' + req.query.ref);
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
    return res.redirect('/cases/case-details?ref=' + ref);
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

  req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Case received / submitted date updated to '" + formatted + "'"); 

  res.redirect('/cases/case-details?ref=' + ref);
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
    req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Start date removed");
    return res.redirect('/cases/case-details?ref=' + ref);
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

  req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Start date updated to '" + formatted + "'");

  res.redirect('/cases/case-details?ref=' + ref);
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
    req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Expected submission date removed");
    return res.redirect('/cases/case-details?ref=' + ref);
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
  req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Expected submission date updated to '" + formatted + "'");

  res.redirect('/cases/case-details?ref=' + ref);
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
    req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Target decision date removed");
    return res.redirect('/cases/case-details?ref=' + ref);
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

  req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Target decision date updated to '" + formatted + "'");

  res.redirect('/cases/case-details?ref=' + ref);
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
    req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Case officer verification date removed");
    return res.redirect('/cases/case-details?ref=' + ref);
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

  req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Case officer verification date updated to '" + formatted + "'");

  res.redirect('/cases/case-details?ref=' + ref);
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
    req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Date proposed modifications advertised removed");
    return res.redirect('/cases/case-details?ref=' + ref);
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

  req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Date proposed modifications advertised updated to '" + formatted + "'");

  res.redirect('/cases/case-details?ref=' + ref);
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
    req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Objection period end date removed");
    return res.redirect('/cases/case-details?ref=' + ref);
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

  req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Objection period end date updated to '" + formatted + "'");

  res.redirect('/cases/case-details?ref=' + ref);
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
    req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Consent deadline date removed");
    return res.redirect('/cases/case-details?ref=' + ref);
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

  req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Consent deadline date updated to '" + formatted + "'");

  res.redirect('/cases/case-details?ref=' + ref);
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
    req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Date due to Other Government Department (OGD) removed");
    return res.redirect('/cases/case-details?ref=' + ref);
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

  req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Date due to Other Government Department (OGD) updated to '" + formatted + "'");
  res.redirect('/cases/case-details?ref=' + ref);
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
    req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Proposal letter date removed");
    return res.redirect('/cases/case-details?ref=' + ref);
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

  req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Proposal letter date updated to '" + formatted + "'");

  res.redirect('/cases/case-details?ref=' + ref);
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
    req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Decision issued by date removed");
    return res.redirect('/cases/case-details?ref=' + ref);
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

  req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Decision issued by date updated to '" + formatted + "'");

  res.redirect('/cases/case-details?ref=' + ref);
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
    req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Decision notification date removed");
    return res.redirect('/cases/case-details?ref=' + ref);
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

  req.session.flashSection = "timetable"; 

addAuditLog(req, ref, "Decision notification date updated to '" + formatted + "'");

  res.redirect('/cases/case-details?ref=' + ref);
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

// =========================================================
// AUDIT LOG HELPER FUNCTION
// =========================================================
function addAuditLog(req, caseRef, details) {
  let cases = req.session.data['cases'] || [];
  let targetCase = cases.find(c => c.reference === caseRef);

  if (targetCase) {
    // 1. If this case doesn't have an audit log yet, create an empty one
    if (!targetCase.auditLog) {
      targetCase.auditLog = [];
    }

    // 2. Generate the current date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();

    // 3. Add the new entry to the START of the array (so newest is always at the top)
    targetCase.auditLog.unshift({
      date: `${dateStr}<br>${timeStr}`,
      details: details,
      user: req.session.data['currentUser'] || "User Account" // Change this if you have dynamic users
    });

    // 4. Update the top-level case fields so your summary card is always perfectly accurate
    targetCase.lastModified = `${dateStr} at ${timeStr}`;
    targetCase.lastModifiedBy = req.session.data['currentUser'] || "User Account";
  }
}


// ==============================================
// AUDIT LOG HELPER FOR PROCEDURE 1
// ==============================================
function getProcType(c) {
  if (!c || !c.procedure1) return 'Procedure';
  
  let type = c.procedure1.type || 'Procedure';
  // Grab the status. If they haven't explicitly set one yet, default to 'Not Selected'
  let status = c.procedure1.status || 'Not Selected'; 
  
  return `${type} (${status})`;
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

    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Procedure type removed`);

    // --- TRIGGER REVERSE SYNC ---
    syncDetailedToOverview(c);

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Procedure type updated to ${type}`);

  // --- TRIGGER REVERSE SYNC ---
  syncDetailedToOverview(c);

  req.session.flashSection = "procedure1";
  res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Procedure status for ${getProcType(c)} updated to ${status}`);

  // --- TRIGGER REVERSE SYNC ---
  syncDetailedToOverview(c);

  req.session.flashSection = "procedure1";
  res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Admin procedure type for ${getProcType(c)} removed`);
    
    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  if (!adminType) {
    return res.render('cases/procedures/procedure-1/admin-type', {
      ref: ref,
      errorList: [{ text: "Select the admin procedure type", href: "#admin-type" }]
    });
  }

  c.procedure1 = c.procedure1 || {};
  c.procedure1.adminType = adminType;

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Admin procedure type for ${getProcType(c)} updated to ${adminType}`);

  // --- TRIGGER REVERSE SYNC ---
  syncDetailedToOverview(c);
  
  req.session.flashSection = "procedure1";
  res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `In house date for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `In house date for ${getProcType(c)} updated to ${c.procedure1.inHouse.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Site visit date for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Site visit date for ${getProcType(c)} updated to ${c.procedure1.siteVisit.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Target hearing date for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Target hearing date for ${getProcType(c)} updated to ${c.procedure1.targetHearing.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date parties must be notified of hearing for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date parties must be notified of hearing for ${getProcType(c)} updated to ${c.procedure1.hearingNotified.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Proofs of evidence received date for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Proofs of evidence received date for ${getProcType(c)} updated to ${c.procedure1.proofsReceived.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Statements of case received date for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Statements of case received date for ${getProcType(c)} updated to ${c.procedure1.statementsReceived.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Verification date for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Verification date for ${getProcType(c)} updated to ${c.procedure1.verification.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Case management conference date for ${getProcType(c)} removed`);
    } else {
      let dtStr = c.procedure1.cmcDate.formattedDate + (c.procedure1.cmcDate.formattedTime ? ' at ' + c.procedure1.cmcDate.formattedTime : '');
      addAuditLog(req, ref, `Case management conference date for ${getProcType(c)} updated to ${dtStr}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Case management conference type for ${getProcType(c)} removed`);
    
    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Case management conference type for ${getProcType(c)} updated to ${cmcType}`);

  req.session.flashSection = "procedure1";
  res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Case management venue address for ${getProcType(c)} removed`);
    } else {
      let addStr = c.procedure1.cmcVenue.formatted.replace(/<br>/g, ', ');
      addAuditLog(req, ref, `Case management venue address for ${getProcType(c)} updated to ${addStr}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Case management conference note sent date for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Case management conference note sent date for ${getProcType(c)} updated to ${c.procedure1.cmcNoteSent.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Confirmed hearing date for ${getProcType(c)} removed`);
    } else {
      let dtStr = c.procedure1.confirmedHearing.formattedDate + (c.procedure1.confirmedHearing.formattedTime ? ' at ' + c.procedure1.confirmedHearing.formattedTime : '');
      addAuditLog(req, ref, `Confirmed hearing date for ${getProcType(c)} updated to ${dtStr}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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

// --- DEADLINE FOR CONSENT ---
router.get('/cases/procedures/procedure-1/deadline-for-consent', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p1 = c.procedure1 || {};
  var val = p1.deadlineForConsent || {}; 

  res.render('cases/procedures/procedure-1/deadline-for-consent', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-1/deadline-for-consent', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || []; // Using manual find to ensure Reference
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure1 = c.procedure1 || {};

  var result = validateAndSaveDate(
    req, res,
    'deadline-for-consent',          
    'Deadline for consent',     
    c.procedure1,        
    'deadlineForConsent'            
  );

  // FIX: Route handles redirect now
  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Deadline for consent for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Deadline for consent for ${getProcType(c)} updated to ${c.procedure1.deadlineForConsent.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-1/deadline-for-consent', {
      ref: ref,
      day: req.body['deadline-for-consent-day'],
      month: req.body['deadline-for-consent-month'],
      year: req.body['deadline-for-consent-year'],
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
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Hearing type for ${getProcType(c)} removed`);
    
    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Hearing type for ${getProcType(c)} updated to ${hearingType}`);

  req.session.flashSection = "procedure1";
  res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Hearing venue for ${getProcType(c)} removed`);
    } else {
      let addStr = c.procedure1.hearingVenue.formatted.replace(/<br>/g, ', ');
      addAuditLog(req, ref, `Hearing venue for ${getProcType(c)} updated to ${addStr}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date parties notified of hearing date for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date parties notified of hearing date for ${getProcType(c)} updated to ${c.procedure1.notifiedHearingDate.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date parties notified of hearing venue for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date parties notified of hearing venue for ${getProcType(c)} updated to ${c.procedure1.notifiedHearingVenue.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Earliest potential hearing date for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Earliest potential hearing date for ${getProcType(c)} updated to ${c.procedure1.earliestHearingDate.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Length of event for ${getProcType(c)} removed`);
  } else {
    addAuditLog(req, ref, `Length of event for ${getProcType(c)} updated to ${c.procedure1.hearingLengthOfEvent} days`);
  }

  req.session.flashSection = "procedure1";
  return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Hearing in target for ${getProcType(c)} removed`);
    
    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Hearing in target for ${getProcType(c)} updated to ${val}`);

  req.session.flashSection = "procedure1";
  res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date hearing closed for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date hearing closed for ${getProcType(c)} updated to ${c.procedure1.hearingClosed.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Preparation time for ${getProcType(c)} removed`);
  } else {
    addAuditLog(req, ref, `Preparation time for ${getProcType(c)} updated to ${c.procedure1.hearingPrepTime} days`);
  }

  req.session.flashSection = "procedure1";
  return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Travel time for ${getProcType(c)} removed`);
  } else {
    addAuditLog(req, ref, `Travel time for ${getProcType(c)} updated to ${c.procedure1.hearingTravelTime} days`);
  }

  req.session.flashSection = "procedure1";
  return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Sitting time for ${getProcType(c)} removed`);
  } else {
    addAuditLog(req, ref, `Sitting time for ${getProcType(c)} updated to ${c.procedure1.hearingSittingTime} days`);
  }

  req.session.flashSection = "procedure1";
  return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Reporting time for ${getProcType(c)} removed`);
  } else {
    addAuditLog(req, ref, `Reporting time for ${getProcType(c)} updated to ${c.procedure1.hearingReportingTime} days`);
  }

  req.session.flashSection = "procedure1";
  return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Target inquiry date for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Target inquiry date for ${getProcType(c)} updated to ${c.procedure1.targetInquiry.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date parties must be notified of inquiry for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date parties must be notified of inquiry for ${getProcType(c)} updated to ${c.procedure1.inquiryNotified.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Pre inquiry meeting or case management conference for ${getProcType(c)} removed`);
    
    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Pre inquiry meeting or case management conference for ${getProcType(c)} updated to ${meetingType}`);

  req.session.flashSection = "procedure1";
  res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Pre inquiry meeting date for ${getProcType(c)} removed`);
    } else {
      let dtStr = c.procedure1.pimDate.formattedDate + (c.procedure1.pimDate.formattedTime ? ' at ' + c.procedure1.pimDate.formattedTime : '');
      addAuditLog(req, ref, `Pre inquiry meeting date for ${getProcType(c)} updated to ${dtStr}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Pre inquiry meeting type for ${getProcType(c)} removed`);
    
    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Pre inquiry meeting type for ${getProcType(c)} updated to ${pimType}`);

  req.session.flashSection = "procedure1";
  res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Pre inquiry meeting note sent date for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Pre inquiry meeting note sent date for ${getProcType(c)} updated to ${c.procedure1.pimNoteSent.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Confirmed inquiry date for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Confirmed inquiry date for ${getProcType(c)} updated to ${c.procedure1.confirmedInquiry.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Inquiry type for ${getProcType(c)} removed`);
    
    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Inquiry type for ${getProcType(c)} updated to ${inquiryType}`);

  req.session.flashSection = "procedure1";
  res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Inquiry venue for ${getProcType(c)} removed`);
    } else {
      let addStr = c.procedure1.inquiryVenue.formatted.replace(/<br>/g, ', ');
      addAuditLog(req, ref, `Inquiry venue for ${getProcType(c)} updated to ${addStr}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date parties notified of inquiry date for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date parties notified of inquiry date for ${getProcType(c)} updated to ${c.procedure1.notifiedInquiryDate.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date parties notified of inquiry venue for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date parties notified of inquiry venue for ${getProcType(c)} updated to ${c.procedure1.notifiedInquiryVenue.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Earliest potential inquiry date for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Earliest potential inquiry date for ${getProcType(c)} updated to ${c.procedure1.earliestInquiryDate.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Length of event for ${getProcType(c)} removed`);
  } else {
    addAuditLog(req, ref, `Length of event for ${getProcType(c)} updated to ${c.procedure1.inquiryLengthOfEvent} days`);
  }

  req.session.flashSection = "procedure1";
  return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date inquiry finished for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date inquiry finished for ${getProcType(c)} updated to ${c.procedure1.inquiryFinished.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Event in target for ${getProcType(c)} removed`);
    
    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Event in target for ${getProcType(c)} updated to ${val}`);

  req.session.flashSection = "procedure1";
  res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date inquiry closed for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date inquiry closed for ${getProcType(c)} updated to ${c.procedure1.inquiryClosed.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Preparation time for ${getProcType(c)} removed`);
  } else {
    addAuditLog(req, ref, `Preparation time for ${getProcType(c)} updated to ${c.procedure1.inquiryPrepTime} days`);
  }

  req.session.flashSection = "procedure1";
  return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Travel time for ${getProcType(c)} removed`);
  } else {
    addAuditLog(req, ref, `Travel time for ${getProcType(c)} updated to ${c.procedure1.inquiryTravelTime} days`);
  }

  req.session.flashSection = "procedure1";
  return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Sitting time for ${getProcType(c)} removed`);
  } else {
    addAuditLog(req, ref, `Sitting time for ${getProcType(c)} updated to ${c.procedure1.inquirySittingTime} days`);
  }

  req.session.flashSection = "procedure1";
  return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Reporting time for ${getProcType(c)} removed`);
  } else {
    addAuditLog(req, ref, `Reporting time for ${getProcType(c)} updated to ${c.procedure1.inquiryReportingTime} days`);
  }

  req.session.flashSection = "procedure1";
  return res.redirect('/cases/case-details?ref=' + ref);
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

    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Site visit type for ${getProcType(c)} removed`);

    // --- TRIGGER REVERSE SYNC ---
    syncDetailedToOverview(c);

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Site visit type for ${getProcType(c)} updated to ${val}`);

  // --- TRIGGER REVERSE SYNC ---
  syncDetailedToOverview(c);

  req.session.flashSection = "procedure1";
  res.redirect('/cases/case-details?ref=' + ref);
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date offer for written representations for ${getProcType(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date offer for written representations for ${getProcType(c)} updated to ${c.procedure1.writtenRepsDate.formatted}`);
    }

    req.session.flashSection = "procedure1";
    return res.redirect('/cases/case-details?ref=' + ref);
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
// AUDIT LOG HELPER FOR PROCEDURE 2
// ==============================================
function getProc2Type(c) {
  if (!c || !c.procedure2) return 'Procedure';
  
  let type = c.procedure2.type || 'Procedure';
  let status = c.procedure2.status || 'Not selected'; 
  
  return `${type} (${status})`;
}

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

    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Procedure type removed`);

    // --- TRIGGER REVERSE SYNC ---
    syncDetailedToOverview(c);

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Procedure type updated to ${type}`);

  // --- TRIGGER REVERSE SYNC ---
  syncDetailedToOverview(c);

  req.session.flashSection = "procedure2";
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- STATUS ---
router.get('/cases/procedures/procedure-2/status', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p2 = c.procedure2 || {};
  res.render('cases/procedures/procedure-2/status', {
    ref: ref,
    status: p2.status
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Procedure status for ${getProc2Type(c)} updated to ${status}`);

  // --- TRIGGER REVERSE SYNC ---
  syncDetailedToOverview(c);

  req.session.flashSection = "procedure2";
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- ADMIN TYPE ---
router.get('/cases/procedures/procedure-2/admin-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p2 = c.procedure2 || {};
  res.render('cases/procedures/procedure-2/admin-type', {
    ref: ref,
    adminType: p2.adminType
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
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Admin procedure type for ${getProc2Type(c)} removed`);
    
    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  if (!adminType) {
    return res.render('cases/procedures/procedure-2/admin-type', {
      ref: ref,
      errorList: [{ text: "Select the admin procedure type", href: "#admin-type" }]
    });
  }

  c.procedure2 = c.procedure2 || {};
  c.procedure2.adminType = adminType;

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Admin procedure type for ${getProc2Type(c)} updated to ${adminType}`);

  // --- TRIGGER REVERSE SYNC ---
  syncDetailedToOverview(c);
  
  req.session.flashSection = "procedure2";
  res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};
  var val = p2.inHouse || {}; 

  res.render('cases/procedures/procedure-2/in-house-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/in-house-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || []; 
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

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `In house date for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `In house date for ${getProc2Type(c)} updated to ${c.procedure2.inHouse.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};
  var val = p2.siteVisit || {}; 

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
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Site visit date for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Site visit date for ${getProc2Type(c)} updated to ${c.procedure2.siteVisit.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};
  var val = p2.targetHearing || {}; 

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
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Target hearing date for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Target hearing date for ${getProc2Type(c)} updated to ${c.procedure2.targetHearing.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};
  var val = p2.hearingNotified || {}; 

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
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date parties must be notified of hearing for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date parties must be notified of hearing for ${getProc2Type(c)} updated to ${c.procedure2.hearingNotified.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};
  var val = p2.proofsReceived || {}; 

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
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Proofs of evidence received date for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Proofs of evidence received date for ${getProc2Type(c)} updated to ${c.procedure2.proofsReceived.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};
  var val = p2.statementsReceived || {}; 

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
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Statements of case received date for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Statements of case received date for ${getProc2Type(c)} updated to ${c.procedure2.statementsReceived.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};
  var val = p2.verification || {}; 

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
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Verification date for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Verification date for ${getProc2Type(c)} updated to ${c.procedure2.verification.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

// --- CMC ROUTES (Place this with your other Procedure 2 routes) ---

// GET
router.get('/cases/procedures/procedure-2/cmc-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p2 = c.procedure2 || {};
  var val = p2.cmcDate || {}; 

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
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Case management conference date for ${getProc2Type(c)} removed`);
    } else {
      let dtStr = c.procedure2.cmcDate.formattedDate + (c.procedure2.cmcDate.formattedTime ? ' at ' + c.procedure2.cmcDate.formattedTime : '');
      addAuditLog(req, ref, `Case management conference date for ${getProc2Type(c)} updated to ${dtStr}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};

  res.render('cases/procedures/procedure-2/cmc-type', {
    ref: ref,
    cmcType: p2.cmcType
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
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Case management conference type for ${getProc2Type(c)} removed`);
    
    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Case management conference type for ${getProc2Type(c)} updated to ${cmcType}`);

  req.session.flashSection = "procedure2";
  res.redirect('/cases/case-details?ref=' + ref);
});

// --- CMC VENUE ---
router.get('/cases/procedures/procedure-2/cmc-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p2 = c.procedure2 || {};
  var val = p2.cmcVenue || {}; 

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
    'venue',          
    'Venue address',  
    c.procedure2,     
    'cmcVenue'        
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Case management venue address for ${getProc2Type(c)} removed`);
    } else {
      let addStr = c.procedure2.cmcVenue.formatted.replace(/<br>/g, ', ');
      addAuditLog(req, ref, `Case management venue address for ${getProc2Type(c)} updated to ${addStr}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};
  var val = p2.cmcNoteSent || {}; 

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
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Case management conference note sent date for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Case management conference note sent date for ${getProc2Type(c)} updated to ${c.procedure2.cmcNoteSent.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};
  var val = p2.confirmedHearing || {}; 

  res.render('cases/procedures/procedure-2/confirmed-hearing-date', {
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

router.post('/cases/procedures/procedure-2/confirmed-hearing-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDateTime(
    req, res,
    'confirmed-hearing',       
    'Confirmed hearing date',  
    c.procedure2,              
    'confirmedHearing'         
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Confirmed hearing date for ${getProc2Type(c)} removed`);
    } else {
      let dtStr = c.procedure2.confirmedHearing.formattedDate + (c.procedure2.confirmedHearing.formattedTime ? ' at ' + c.procedure2.confirmedHearing.formattedTime : '');
      addAuditLog(req, ref, `Confirmed hearing date for ${getProc2Type(c)} updated to ${dtStr}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

// --- DEADLINE FOR CONSENT ---
router.get('/cases/procedures/procedure-2/deadline-for-consent', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p2 = c.procedure2 || {};
  var val = p2.deadlineForConsent || {}; 

  res.render('cases/procedures/procedure-2/deadline-for-consent', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-2/deadline-for-consent', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || []; 
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'deadline-for-consent',          
    'Deadline for consent',     
    c.procedure2,        
    'deadlineForConsent'            
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Deadline for consent for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Deadline for consent for ${getProc2Type(c)} updated to ${c.procedure2.deadlineForConsent.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/deadline-for-consent', {
      ref: ref,
      day: req.body['deadline-for-consent-day'],
      month: req.body['deadline-for-consent-month'],
      year: req.body['deadline-for-consent-year'],
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

  var p2 = c.procedure2 || {};

  res.render('cases/procedures/procedure-2/hearing-type', {
    ref: ref,
    hearingType: p2.hearingType
  });
});

router.post('/cases/procedures/procedure-2/hearing-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var hearingType = req.body['hearing-type'];

  if (action === 'remove') {
    if (c.procedure2) delete c.procedure2.hearingType;
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Hearing type for ${getProc2Type(c)} removed`);
    
    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  if (!hearingType) {
    return res.render('cases/procedures/procedure-2/hearing-type', {
      ref: ref,
      errorList: [{ text: "Select type of hearing", href: "#hearing-type" }]
    });
  }

  c.procedure2 = c.procedure2 || {};
  c.procedure2.hearingType = hearingType;

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Hearing type for ${getProc2Type(c)} updated to ${hearingType}`);

  req.session.flashSection = "procedure2";
  res.redirect('/cases/case-details?ref=' + ref);
});

// --- HEARING VENUE ---
router.get('/cases/procedures/procedure-2/hearing-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p2 = c.procedure2 || {};
  var val = p2.hearingVenue || {}; 

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
    'venue',          
    'Hearing venue',  
    c.procedure2,     
    'hearingVenue'    
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Hearing venue for ${getProc2Type(c)} removed`);
    } else {
      let addStr = c.procedure2.hearingVenue.formatted.replace(/<br>/g, ', ');
      addAuditLog(req, ref, `Hearing venue for ${getProc2Type(c)} updated to ${addStr}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};
  var val = p2.notifiedHearingDate || {}; 

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
    'notified-date',          
    'Date parties notified',  
    c.procedure2,             
    'notifiedHearingDate'     
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date parties notified of hearing date for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date parties notified of hearing date for ${getProc2Type(c)} updated to ${c.procedure2.notifiedHearingDate.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};
  var val = p2.notifiedHearingVenue || {}; 

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
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date parties notified of hearing venue for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date parties notified of hearing venue for ${getProc2Type(c)} updated to ${c.procedure2.notifiedHearingVenue.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};
  var val = p2.earliestHearingDate || {}; 

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
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Earliest potential hearing date for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Earliest potential hearing date for ${getProc2Type(c)} updated to ${c.procedure2.earliestHearingDate.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    value: c.procedure2.hearingLengthOfEvent 
  });
});

router.post('/cases/procedures/procedure-2/hearing-length-of-event', function(req, res) {
  var ref = req.body.ref;
  var c = req.session.data['cases'].find(x => x.reference === ref);
  
  var result = validateAndSaveNumber(req, res, 'length-event', 'Length of event', c.procedure2, 'hearingLengthOfEvent');

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/hearing-length-of-event', {
      ref: ref,
      value: req.body['length-event'],
      errorList: result.errorList
    });
  }
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Length of event for ${getProc2Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Length of event for ${getProc2Type(c)} updated to ${c.procedure2.hearingLengthOfEvent} days`);
  }

  req.session.flashSection = "procedure2";
  return res.redirect('/cases/case-details?ref=' + ref);
});


// --- HEARING IN TARGET? ---
router.get('/cases/procedures/procedure-2/hearing-in-target', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p2 = c.procedure2 || {};

  res.render('cases/procedures/procedure-2/hearing-in-target', {
    ref: ref,
    hearingInTarget: p2.hearingInTarget
  });
});

router.post('/cases/procedures/procedure-2/hearing-in-target', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var val = req.body['hearing-in-target'];

  if (action === 'remove') {
    if (c.procedure2) delete c.procedure2.hearingInTarget;
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Hearing in target for ${getProc2Type(c)} removed`);
    
    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  if (!val) {
    return res.render('cases/procedures/procedure-2/hearing-in-target', {
      ref: ref,
      errorList: [{ text: "Select yes if the hearing was completed in the target timeframe", href: "#hearing-in-target" }]
    });
  }

  c.procedure2 = c.procedure2 || {};
  c.procedure2.hearingInTarget = val;

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Hearing in target for ${getProc2Type(c)} updated to ${val}`);

  req.session.flashSection = "procedure2";
  res.redirect('/cases/case-details?ref=' + ref);
});

// --- HEARING CLOSED DATE ---
router.get('/cases/procedures/procedure-2/hearing-closed-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p2 = c.procedure2 || {};
  var val = p2.hearingClosed || {}; 

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
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date hearing closed for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date hearing closed for ${getProc2Type(c)} updated to ${c.procedure2.hearingClosed.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    value: c.procedure2.hearingPrepTime 
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
    'hearingPrepTime' 
  );

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/hearing-preparation-time', {
      ref: ref,
      value: req.body['prep-time'],
      errorList: result.errorList
    });
  }
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Preparation time for ${getProc2Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Preparation time for ${getProc2Type(c)} updated to ${c.procedure2.hearingPrepTime} days`);
  }

  req.session.flashSection = "procedure2";
  return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Travel time for ${getProc2Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Travel time for ${getProc2Type(c)} updated to ${c.procedure2.hearingTravelTime} days`);
  }

  req.session.flashSection = "procedure2";
  return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Sitting time for ${getProc2Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Sitting time for ${getProc2Type(c)} updated to ${c.procedure2.hearingSittingTime} days`);
  }

  req.session.flashSection = "procedure2";
  return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Reporting time for ${getProc2Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Reporting time for ${getProc2Type(c)} updated to ${c.procedure2.hearingReportingTime} days`);
  }

  req.session.flashSection = "procedure2";
  return res.redirect('/cases/case-details?ref=' + ref);
});









// --- TARGET INQUIRY DATE ---
router.get('/cases/procedures/procedure-2/target-inquiry-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p2 = c.procedure2 || {};
  var val = p2.targetInquiry || {}; 

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
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Target inquiry date for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Target inquiry date for ${getProc2Type(c)} updated to ${c.procedure2.targetInquiry.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};
  var val = p2.inquiryNotified || {}; 

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
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date parties must be notified of inquiry for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date parties must be notified of inquiry for ${getProc2Type(c)} updated to ${c.procedure2.inquiryNotified.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};

  res.render('cases/procedures/procedure-2/pre-inquiry-meeting-cmc', {
    ref: ref,
    meetingType: p2.preInquiryMeetingCmc
  });
});

router.post('/cases/procedures/procedure-2/pre-inquiry-meeting-cmc', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var meetingType = req.body['meeting-type'];

  if (action === 'remove') {
    if (c.procedure2) delete c.procedure2.preInquiryMeetingCmc;
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Pre inquiry meeting or case management conference for ${getProc2Type(c)} removed`);
    
    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  if (!meetingType) {
    return res.render('cases/procedures/procedure-2/pre-inquiry-meeting-cmc', {
      ref: ref,
      errorList: [{ text: "Select whether there will be a pre inquiry meeting or case management conference", href: "#meeting-type" }]
    });
  }

  c.procedure2 = c.procedure2 || {};
  c.procedure2.preInquiryMeetingCmc = meetingType;

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Pre inquiry meeting or case management conference for ${getProc2Type(c)} updated to ${meetingType}`);

  req.session.flashSection = "procedure2";
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- PIM ROUTES ---

// GET
router.get('/cases/procedures/procedure-2/pim-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p2 = c.procedure2 || {};
  var val = p2.pimDate || {}; 

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
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Pre inquiry meeting date for ${getProc2Type(c)} removed`);
    } else {
      let dtStr = c.procedure2.pimDate.formattedDate + (c.procedure2.pimDate.formattedTime ? ' at ' + c.procedure2.pimDate.formattedTime : '');
      addAuditLog(req, ref, `Pre inquiry meeting date for ${getProc2Type(c)} updated to ${dtStr}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};

  res.render('cases/procedures/procedure-2/pim-type', {
    ref: ref,
    pimType: p2.pimType
  });
});

router.post('/cases/procedures/procedure-2/pim-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var pimType = req.body['pim-type'];

  if (action === 'remove') {
    if (c.procedure2) delete c.procedure2.pimType;
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Pre inquiry meeting type for ${getProc2Type(c)} removed`);
    
    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  if (!pimType) {
    return res.render('cases/procedures/procedure-2/pim-type', {
      ref: ref,
      errorList: [{ text: "Select the format of the pre inquiry meeting", href: "#pim-type" }]
    });
  }

  c.procedure2 = c.procedure2 || {};
  c.procedure2.pimType = pimType;

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Pre inquiry meeting type for ${getProc2Type(c)} updated to ${pimType}`);

  req.session.flashSection = "procedure2";
  res.redirect('/cases/case-details?ref=' + ref);
});



// --- PIM NOTE SENT ---
router.get('/cases/procedures/procedure-2/pim-note-sent', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p2 = c.procedure2 || {};
  var val = p2.pimNoteSent || {}; 

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
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Pre inquiry meeting note sent date for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Pre inquiry meeting note sent date for ${getProc2Type(c)} updated to ${c.procedure2.pimNoteSent.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};
  var val = p2.confirmedInquiry || {}; 

  res.render('cases/procedures/procedure-2/confirmed-inquiry-date', {
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

router.post('/cases/procedures/procedure-2/confirmed-inquiry-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure2 = c.procedure2 || {};

  var result = validateAndSaveDate(
    req, res,
    'confirmed-inquiry',       
    'Confirmed inquiry date',  
    c.procedure2,              
    'confirmedInquiry'         
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Confirmed inquiry date for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Confirmed inquiry date for ${getProc2Type(c)} updated to ${c.procedure2.confirmedInquiry.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};

  res.render('cases/procedures/procedure-2/inquiry-type', {
    ref: ref,
    inquiryType: p2.inquiryType
  });
});

router.post('/cases/procedures/procedure-2/inquiry-type', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var inquiryType = req.body['inquiry-type'];

  if (action === 'remove') {
    if (c.procedure2) delete c.procedure2.inquiryType;
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Inquiry type for ${getProc2Type(c)} removed`);
    
    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  if (!inquiryType) {
    return res.render('cases/procedures/procedure-2/inquiry-type', {
      ref: ref,
      errorList: [{ text: "Select the inquiry type", href: "#inquiry-type" }]
    });
  }

  c.procedure2 = c.procedure2 || {};
  c.procedure2.inquiryType = inquiryType;

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Inquiry type for ${getProc2Type(c)} updated to ${inquiryType}`);

  req.session.flashSection = "procedure2";
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- INQUIRY VENUE ---
router.get('/cases/procedures/procedure-2/inquiry-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p2 = c.procedure2 || {};
  var val = p2.inquiryVenue || {}; 

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
    'venue',          
    'Inquiry venue',  
    c.procedure2,     
    'inquiryVenue'    
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Inquiry venue for ${getProc2Type(c)} removed`);
    } else {
      let addStr = c.procedure2.inquiryVenue.formatted.replace(/<br>/g, ', ');
      addAuditLog(req, ref, `Inquiry venue for ${getProc2Type(c)} updated to ${addStr}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};
  var val = p2.notifiedInquiryDate || {}; 

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
    'notified-inquiry-date',  
    'Date parties notified of inquiry date',
    c.procedure2,
    'notifiedInquiryDate'     
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date parties notified of inquiry date for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date parties notified of inquiry date for ${getProc2Type(c)} updated to ${c.procedure2.notifiedInquiryDate.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};
  var val = p2.notifiedInquiryVenue || {}; 

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
    'notified-inquiry-venue', 
    'Date parties notified of inquiry venue',
    c.procedure2,
    'notifiedInquiryVenue'    
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date parties notified of inquiry venue for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date parties notified of inquiry venue for ${getProc2Type(c)} updated to ${c.procedure2.notifiedInquiryVenue.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};
  var val = p2.earliestInquiryDate || {}; 

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
    'earliest-inquiry-date',           
    'Earliest potential inquiry date', 
    c.procedure2,                      
    'earliestInquiryDate'              
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Earliest potential inquiry date for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Earliest potential inquiry date for ${getProc2Type(c)} updated to ${c.procedure2.earliestInquiryDate.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    value: c.procedure2.inquiryLengthOfEvent 
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Length of event for ${getProc2Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Length of event for ${getProc2Type(c)} updated to ${c.procedure2.inquiryLengthOfEvent} days`);
  }

  req.session.flashSection = "procedure2";
  return res.redirect('/cases/case-details?ref=' + ref);
});


// --- 1. DATE INQUIRY FINISHED ---
router.get('/cases/procedures/procedure-2/inquiry-finished-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p2 = c.procedure2 || {};
  var val = p2.inquiryFinished || {}; 

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
    'inquiry-finished',      
    'Date inquiry finished', 
    c.procedure2,
    'inquiryFinished'        
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date inquiry finished for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date inquiry finished for ${getProc2Type(c)} updated to ${c.procedure2.inquiryFinished.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p2 = c.procedure2 || {};

  res.render('cases/procedures/procedure-2/event-in-target', {
    ref: ref,
    eventInTarget: p2.eventInTarget
  });
});

router.post('/cases/procedures/procedure-2/event-in-target', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var val = req.body['event-in-target'];

  if (action === 'remove') {
    if (c.procedure2) delete c.procedure2.eventInTarget;
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Event in target for ${getProc2Type(c)} removed`);
    
    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  if (!val) {
    return res.render('cases/procedures/procedure-2/event-in-target', {
      ref: ref,
      errorList: [{ text: "Select if the event is in target", href: "#event-in-target" }]
    });
  }

  c.procedure2 = c.procedure2 || {};
  c.procedure2.eventInTarget = val;

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Event in target for ${getProc2Type(c)} updated to ${val}`);

  req.session.flashSection = "procedure2";
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- 3. DATE INQUIRY CLOSED ---
router.get('/cases/procedures/procedure-2/inquiry-closed-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p2 = c.procedure2 || {};
  var val = p2.inquiryClosed || {}; 

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
    'inquiry-closed',      
    'Date inquiry closed', 
    c.procedure2,
    'inquiryClosed'        
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date inquiry closed for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date inquiry closed for ${getProc2Type(c)} updated to ${c.procedure2.inquiryClosed.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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
    value: c.procedure2.inquiryPrepTime 
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
    'inquiryPrepTime' 
  );

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-2/inquiry-preparation-time', {
      ref: ref,
      value: req.body['prep-time'],
      errorList: result.errorList
    });
  }
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Preparation time for ${getProc2Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Preparation time for ${getProc2Type(c)} updated to ${c.procedure2.inquiryPrepTime} days`);
  }

  req.session.flashSection = "procedure2";
  return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Travel time for ${getProc2Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Travel time for ${getProc2Type(c)} updated to ${c.procedure2.inquiryTravelTime} days`);
  }

  req.session.flashSection = "procedure2";
  return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Sitting time for ${getProc2Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Sitting time for ${getProc2Type(c)} updated to ${c.procedure2.inquirySittingTime} days`);
  }

  req.session.flashSection = "procedure2";
  return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Reporting time for ${getProc2Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Reporting time for ${getProc2Type(c)} updated to ${c.procedure2.inquiryReportingTime} days`);
  }

  req.session.flashSection = "procedure2";
  return res.redirect('/cases/case-details?ref=' + ref);
});



// --- SITE VISIT TYPE ---
router.get('/cases/procedures/procedure-2/site-visit-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p2 = c.procedure2 || {};

  res.render('cases/procedures/procedure-2/site-visit-type', {
    ref: ref,
    siteVisitType: p2.siteVisitType
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

    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Site visit type for ${getProc2Type(c)} removed`);

    // --- TRIGGER REVERSE SYNC ---
    syncDetailedToOverview(c);

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Site visit type for ${getProc2Type(c)} updated to ${val}`);

  // --- TRIGGER REVERSE SYNC ---
  syncDetailedToOverview(c);

  req.session.flashSection = "procedure2";
  res.redirect('/cases/case-details?ref=' + ref);
});



// --- WRITTEN REPS: DATE OFFER ---
router.get('/cases/procedures/procedure-2/written-reps-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p2 = c.procedure2 || {};
  var val = p2.writtenRepsDate || {}; 

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
    'written-reps-date',                  
    'Date offer for written representations', 
    c.procedure2,                         
    'writtenRepsDate'                     
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date offer for written representations for ${getProc2Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date offer for written representations for ${getProc2Type(c)} updated to ${c.procedure2.writtenRepsDate.formatted}`);
    }

    req.session.flashSection = "procedure2";
    return res.redirect('/cases/case-details?ref=' + ref);
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
// AUDIT LOG HELPER FOR PROCEDURE 3
// ==============================================
function getProc3Type(c) {
  if (!c || !c.procedure3) return 'Procedure';
  
  let type = c.procedure3.type || 'Procedure';
  let status = c.procedure3.status || 'Not selected'; 
  
  return `${type} (${status})`;
}

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

    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Procedure type removed`);

    // --- TRIGGER REVERSE SYNC ---
    syncDetailedToOverview(c);

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Procedure type updated to ${type}`);

  // --- TRIGGER REVERSE SYNC ---
  syncDetailedToOverview(c);

  req.session.flashSection = "procedure3";
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- STATUS ---
router.get('/cases/procedures/procedure-3/status', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p3 = c.procedure3 || {};
  res.render('cases/procedures/procedure-3/status', {
    ref: ref,
    status: p3.status
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Procedure status for ${getProc3Type(c)} updated to ${status}`);

  // --- TRIGGER REVERSE SYNC ---
  syncDetailedToOverview(c);

  req.session.flashSection = "procedure3";
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- ADMIN TYPE ---
router.get('/cases/procedures/procedure-3/admin-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p3 = c.procedure3 || {};
  res.render('cases/procedures/procedure-3/admin-type', {
    ref: ref,
    adminType: p3.adminType
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
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Admin procedure type for ${getProc3Type(c)} removed`);
    
    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  if (!adminType) {
    return res.render('cases/procedures/procedure-3/admin-type', {
      ref: ref,
      errorList: [{ text: "Select the admin procedure type", href: "#admin-type" }]
    });
  }

  c.procedure3 = c.procedure3 || {};
  c.procedure3.adminType = adminType;

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Admin procedure type for ${getProc3Type(c)} updated to ${adminType}`);

  // --- TRIGGER REVERSE SYNC ---
  syncDetailedToOverview(c);
  
  req.session.flashSection = "procedure3";
  res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};
  var val = p3.inHouse || {}; 

  res.render('cases/procedures/procedure-3/in-house-date', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/in-house-date', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || []; 
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

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `In house date for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `In house date for ${getProc3Type(c)} updated to ${c.procedure3.inHouse.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};
  var val = p3.siteVisit || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Site visit date for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Site visit date for ${getProc3Type(c)} updated to ${c.procedure3.siteVisit.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};
  var val = p3.targetHearing || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Target hearing date for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Target hearing date for ${getProc3Type(c)} updated to ${c.procedure3.targetHearing.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};
  var val = p3.hearingNotified || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date parties must be notified of hearing for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date parties must be notified of hearing for ${getProc3Type(c)} updated to ${c.procedure3.hearingNotified.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};
  var val = p3.proofsReceived || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Proofs of evidence received date for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Proofs of evidence received date for ${getProc3Type(c)} updated to ${c.procedure3.proofsReceived.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};
  var val = p3.statementsReceived || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Statements of case received date for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Statements of case received date for ${getProc3Type(c)} updated to ${c.procedure3.statementsReceived.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};
  var val = p3.verification || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Verification date for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Verification date for ${getProc3Type(c)} updated to ${c.procedure3.verification.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

// --- CMC ROUTES (Place this with your other Procedure 3 routes) ---

// GET
router.get('/cases/procedures/procedure-3/cmc-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p3 = c.procedure3 || {};
  var val = p3.cmcDate || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Case management conference date for ${getProc3Type(c)} removed`);
    } else {
      let dtStr = c.procedure3.cmcDate.formattedDate + (c.procedure3.cmcDate.formattedTime ? ' at ' + c.procedure3.cmcDate.formattedTime : '');
      addAuditLog(req, ref, `Case management conference date for ${getProc3Type(c)} updated to ${dtStr}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};

  res.render('cases/procedures/procedure-3/cmc-type', {
    ref: ref,
    cmcType: p3.cmcType
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
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Case management conference type for ${getProc3Type(c)} removed`);
    
    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Case management conference type for ${getProc3Type(c)} updated to ${cmcType}`);

  req.session.flashSection = "procedure3";
  res.redirect('/cases/case-details?ref=' + ref);
});

// --- CMC VENUE ---
router.get('/cases/procedures/procedure-3/cmc-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p3 = c.procedure3 || {};
  var val = p3.cmcVenue || {}; 

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
    'venue',          // Field prefix 
    'Venue address',  // Display name
    c.procedure3,     // Storage object
    'cmcVenue'        // Storage key
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Case management venue address for ${getProc3Type(c)} removed`);
    } else {
      let addStr = c.procedure3.cmcVenue.formatted.replace(/<br>/g, ', ');
      addAuditLog(req, ref, `Case management venue address for ${getProc3Type(c)} updated to ${addStr}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};
  var val = p3.cmcNoteSent || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Case management conference note sent date for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Case management conference note sent date for ${getProc3Type(c)} updated to ${c.procedure3.cmcNoteSent.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};
  var val = p3.confirmedHearing || {}; 

  res.render('cases/procedures/procedure-3/confirmed-hearing-date', {
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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Confirmed hearing date for ${getProc3Type(c)} removed`);
    } else {
      let dtStr = c.procedure3.confirmedHearing.formattedDate + (c.procedure3.confirmedHearing.formattedTime ? ' at ' + c.procedure3.confirmedHearing.formattedTime : '');
      addAuditLog(req, ref, `Confirmed hearing date for ${getProc3Type(c)} updated to ${dtStr}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

// --- DEADLINE FOR CONSENT ---
router.get('/cases/procedures/procedure-3/deadline-for-consent', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p3 = c.procedure3 || {};
  var val = p3.deadlineForConsent || {}; 

  res.render('cases/procedures/procedure-3/deadline-for-consent', {
    ref: ref,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/procedure-3/deadline-for-consent', function(req, res) {
  var ref = req.body.ref || req.query.ref;
  var cases = req.session.data['cases'] || []; 
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  c.procedure3 = c.procedure3 || {};

  var result = validateAndSaveDate(
    req, res,
    'deadline-for-consent',          
    'Deadline for consent',     
    c.procedure3,        
    'deadlineForConsent'            
  );

  // FIX: Route handles redirect now
  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Deadline for consent for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Deadline for consent for ${getProc3Type(c)} updated to ${c.procedure3.deadlineForConsent.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/procedure-3/deadline-for-consent', {
      ref: ref,
      day: req.body['deadline-for-consent-day'],
      month: req.body['deadline-for-consent-month'],
      year: req.body['deadline-for-consent-year'],
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

  var p3 = c.procedure3 || {};

  res.render('cases/procedures/procedure-3/hearing-type', {
    ref: ref,
    hearingType: p3.hearingType
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
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Hearing type for ${getProc3Type(c)} removed`);
    
    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Hearing type for ${getProc3Type(c)} updated to ${hearingType}`);

  req.session.flashSection = "procedure3";
  res.redirect('/cases/case-details?ref=' + ref);
});

// --- HEARING VENUE ---
router.get('/cases/procedures/procedure-3/hearing-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p3 = c.procedure3 || {};
  var val = p3.hearingVenue || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Hearing venue for ${getProc3Type(c)} removed`);
    } else {
      let addStr = c.procedure3.hearingVenue.formatted.replace(/<br>/g, ', ');
      addAuditLog(req, ref, `Hearing venue for ${getProc3Type(c)} updated to ${addStr}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};
  var val = p3.notifiedHearingDate || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date parties notified of hearing date for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date parties notified of hearing date for ${getProc3Type(c)} updated to ${c.procedure3.notifiedHearingDate.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};
  var val = p3.notifiedHearingVenue || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date parties notified of hearing venue for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date parties notified of hearing venue for ${getProc3Type(c)} updated to ${c.procedure3.notifiedHearingVenue.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};
  var val = p3.earliestHearingDate || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Earliest potential hearing date for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Earliest potential hearing date for ${getProc3Type(c)} updated to ${c.procedure3.earliestHearingDate.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Length of event for ${getProc3Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Length of event for ${getProc3Type(c)} updated to ${c.procedure3.hearingLengthOfEvent} days`);
  }

  req.session.flashSection = "procedure3";
  return res.redirect('/cases/case-details?ref=' + ref);
});


// --- HEARING IN TARGET? ---
router.get('/cases/procedures/procedure-3/hearing-in-target', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p3 = c.procedure3 || {};

  res.render('cases/procedures/procedure-3/hearing-in-target', {
    ref: ref,
    hearingInTarget: p3.hearingInTarget
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
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Hearing in target for ${getProc3Type(c)} removed`);
    
    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Hearing in target for ${getProc3Type(c)} updated to ${val}`);

  req.session.flashSection = "procedure3";
  res.redirect('/cases/case-details?ref=' + ref);
});

// --- HEARING CLOSED DATE ---
router.get('/cases/procedures/procedure-3/hearing-closed-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p3 = c.procedure3 || {};
  var val = p3.hearingClosed || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date hearing closed for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date hearing closed for ${getProc3Type(c)} updated to ${c.procedure3.hearingClosed.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Preparation time for ${getProc3Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Preparation time for ${getProc3Type(c)} updated to ${c.procedure3.hearingPrepTime} days`);
  }

  req.session.flashSection = "procedure3";
  return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Travel time for ${getProc3Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Travel time for ${getProc3Type(c)} updated to ${c.procedure3.hearingTravelTime} days`);
  }

  req.session.flashSection = "procedure3";
  return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Sitting time for ${getProc3Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Sitting time for ${getProc3Type(c)} updated to ${c.procedure3.hearingSittingTime} days`);
  }

  req.session.flashSection = "procedure3";
  return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Reporting time for ${getProc3Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Reporting time for ${getProc3Type(c)} updated to ${c.procedure3.hearingReportingTime} days`);
  }

  req.session.flashSection = "procedure3";
  return res.redirect('/cases/case-details?ref=' + ref);
});









// --- TARGET INQUIRY DATE ---
router.get('/cases/procedures/procedure-3/target-inquiry-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p3 = c.procedure3 || {};
  var val = p3.targetInquiry || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Target inquiry date for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Target inquiry date for ${getProc3Type(c)} updated to ${c.procedure3.targetInquiry.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};
  var val = p3.inquiryNotified || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date parties must be notified of inquiry for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date parties must be notified of inquiry for ${getProc3Type(c)} updated to ${c.procedure3.inquiryNotified.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};

  res.render('cases/procedures/procedure-3/pre-inquiry-meeting-cmc', {
    ref: ref,
    meetingType: p3.preInquiryMeetingCmc
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
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Pre inquiry meeting or case management conference for ${getProc3Type(c)} removed`);
    
    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Pre inquiry meeting or case management conference for ${getProc3Type(c)} updated to ${meetingType}`);

  req.session.flashSection = "procedure3";
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- PIM ROUTES ---

// GET
router.get('/cases/procedures/procedure-3/pim-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p3 = c.procedure3 || {};
  var val = p3.pimDate || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Pre inquiry meeting date for ${getProc3Type(c)} removed`);
    } else {
      let dtStr = c.procedure3.pimDate.formattedDate + (c.procedure3.pimDate.formattedTime ? ' at ' + c.procedure3.pimDate.formattedTime : '');
      addAuditLog(req, ref, `Pre inquiry meeting date for ${getProc3Type(c)} updated to ${dtStr}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};

  res.render('cases/procedures/procedure-3/pim-type', {
    ref: ref,
    pimType: p3.pimType
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
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Pre inquiry meeting type for ${getProc3Type(c)} removed`);
    
    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Pre inquiry meeting type for ${getProc3Type(c)} updated to ${pimType}`);

  req.session.flashSection = "procedure3";
  res.redirect('/cases/case-details?ref=' + ref);
});



// --- PIM NOTE SENT ---
router.get('/cases/procedures/procedure-3/pim-note-sent', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p3 = c.procedure3 || {};
  var val = p3.pimNoteSent || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Pre inquiry meeting note sent date for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Pre inquiry meeting note sent date for ${getProc3Type(c)} updated to ${c.procedure3.pimNoteSent.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};
  var val = p3.confirmedInquiry || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Confirmed inquiry date for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Confirmed inquiry date for ${getProc3Type(c)} updated to ${c.procedure3.confirmedInquiry.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};

  res.render('cases/procedures/procedure-3/inquiry-type', {
    ref: ref,
    inquiryType: p3.inquiryType
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
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Inquiry type for ${getProc3Type(c)} removed`);
    
    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Inquiry type for ${getProc3Type(c)} updated to ${inquiryType}`);

  req.session.flashSection = "procedure3";
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- INQUIRY VENUE ---
router.get('/cases/procedures/procedure-3/inquiry-venue', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p3 = c.procedure3 || {};
  var val = p3.inquiryVenue || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Inquiry venue for ${getProc3Type(c)} removed`);
    } else {
      let addStr = c.procedure3.inquiryVenue.formatted.replace(/<br>/g, ', ');
      addAuditLog(req, ref, `Inquiry venue for ${getProc3Type(c)} updated to ${addStr}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};
  var val = p3.notifiedInquiryDate || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date parties notified of inquiry date for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date parties notified of inquiry date for ${getProc3Type(c)} updated to ${c.procedure3.notifiedInquiryDate.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};
  var val = p3.notifiedInquiryVenue || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date parties notified of inquiry venue for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date parties notified of inquiry venue for ${getProc3Type(c)} updated to ${c.procedure3.notifiedInquiryVenue.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};
  var val = p3.earliestInquiryDate || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Earliest potential inquiry date for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Earliest potential inquiry date for ${getProc3Type(c)} updated to ${c.procedure3.earliestInquiryDate.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Length of event for ${getProc3Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Length of event for ${getProc3Type(c)} updated to ${c.procedure3.inquiryLengthOfEvent} days`);
  }

  req.session.flashSection = "procedure3";
  return res.redirect('/cases/case-details?ref=' + ref);
});


// --- 1. DATE INQUIRY FINISHED ---
router.get('/cases/procedures/procedure-3/inquiry-finished-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p3 = c.procedure3 || {};
  var val = p3.inquiryFinished || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date inquiry finished for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date inquiry finished for ${getProc3Type(c)} updated to ${c.procedure3.inquiryFinished.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  var p3 = c.procedure3 || {};

  res.render('cases/procedures/procedure-3/event-in-target', {
    ref: ref,
    eventInTarget: p3.eventInTarget
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
    
    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Event in target for ${getProc3Type(c)} removed`);
    
    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Event in target for ${getProc3Type(c)} updated to ${val}`);

  req.session.flashSection = "procedure3";
  res.redirect('/cases/case-details?ref=' + ref);
});


// --- 3. DATE INQUIRY CLOSED ---
router.get('/cases/procedures/procedure-3/inquiry-closed-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p3 = c.procedure3 || {};
  var val = p3.inquiryClosed || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date inquiry closed for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date inquiry closed for ${getProc3Type(c)} updated to ${c.procedure3.inquiryClosed.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Preparation time for ${getProc3Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Preparation time for ${getProc3Type(c)} updated to ${c.procedure3.inquiryPrepTime} days`);
  }

  req.session.flashSection = "procedure3";
  return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Travel time for ${getProc3Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Travel time for ${getProc3Type(c)} updated to ${c.procedure3.inquiryTravelTime} days`);
  }

  req.session.flashSection = "procedure3";
  return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Sitting time for ${getProc3Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Sitting time for ${getProc3Type(c)} updated to ${c.procedure3.inquirySittingTime} days`);
  }

  req.session.flashSection = "procedure3";
  return res.redirect('/cases/case-details?ref=' + ref);
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
  
  // --- AUDIT LOG ---
  if (result.status === "REMOVED") {
    addAuditLog(req, ref, `Reporting time for ${getProc3Type(c)} removed`);
  } else {
    addAuditLog(req, ref, `Reporting time for ${getProc3Type(c)} updated to ${c.procedure3.inquiryReportingTime} days`);
  }

  req.session.flashSection = "procedure3";
  return res.redirect('/cases/case-details?ref=' + ref);
});



// --- SITE VISIT TYPE ---
router.get('/cases/procedures/procedure-3/site-visit-type', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p3 = c.procedure3 || {};

  res.render('cases/procedures/procedure-3/site-visit-type', {
    ref: ref,
    siteVisitType: p3.siteVisitType
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

    // --- AUDIT LOG ---
    addAuditLog(req, ref, `Site visit type for ${getProc3Type(c)} removed`);

    // --- TRIGGER REVERSE SYNC ---
    syncDetailedToOverview(c);

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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

  // --- AUDIT LOG ---
  addAuditLog(req, ref, `Site visit type for ${getProc3Type(c)} updated to ${val}`);

  // --- TRIGGER REVERSE SYNC ---
  syncDetailedToOverview(c);

  req.session.flashSection = "procedure3";
  res.redirect('/cases/case-details?ref=' + ref);
});



// --- WRITTEN REPS: DATE OFFER ---
router.get('/cases/procedures/procedure-3/written-reps-date', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/'); 

  var p3 = c.procedure3 || {};
  var val = p3.writtenRepsDate || {}; 

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
    
    // --- AUDIT LOG ---
    if (result.status === "REMOVED") {
      addAuditLog(req, ref, `Date offer for written representations for ${getProc3Type(c)} removed`);
    } else {
      addAuditLog(req, ref, `Date offer for written representations for ${getProc3Type(c)} updated to ${c.procedure3.writtenRepsDate.formatted}`);
    }

    req.session.flashSection = "procedure3";
    return res.redirect('/cases/case-details?ref=' + ref);
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


// =========================================================
// EDIT: Abeyance Period (Double Date Input)
// =========================================================

router.get('/cases/edit/abeyance-period', (req, res) => {
  var c = getCase(req); 
  var abeyance = c.abeyancePeriod || {};
  var start = abeyance.startDate || {};
  var end = abeyance.endDate || {};

  res.render('cases/edit/abeyance-period', { 
    ref: req.query.ref,
    startDay: start.day, startMonth: start.month, startYear: start.year,
    endDay: end.day, endMonth: end.month, endYear: end.year
  });
});

router.post('/cases/edit/abeyance-period', (req, res) => {
  var c = getCase(req);
  if (!c) return res.redirect('/');
  
  if (!c.abeyancePeriod) c.abeyancePeriod = {};

  let sD = req.body['start-day'], sM = req.body['start-month'], sY = req.body['start-year'];
  let eD = req.body['end-day'], eM = req.body['end-month'], eY = req.body['end-year'];

  // 1. Check if they cleared everything to remove the abeyance period
  if (!sD && !sM && !sY && !eD && !eM && !eY) {
    c.abeyancePeriod = null;
    
    // AUDIT LOG: Stamp that the abeyance period was completely removed
    addAuditLog(req, req.query.ref, "Abeyance period was removed");
    
    return res.redirect('/cases/case-details?ref=' + req.query.ref);
  }

  let allErrors = [];
  let startErrorFields = [];
  let endErrorFields = [];

  // 2. Validate Start Date (Required if they entered anything on this page)
  let startResult = validateAndSaveDate(req, res, 'start', 'Abeyance start date', c.abeyancePeriod, 'startDate');
  if (startResult.status === "ERROR") {
    allErrors = allErrors.concat(startResult.errorList);
    startErrorFields = startResult.errorFields;
  }

  // 3. Validate End Date (Optional - skip if completely blank)
  if (!eD && !eM && !eY) {
    c.abeyancePeriod.endDate = null;
  } else {
    let endResult = validateAndSaveDate(req, res, 'end', 'Abeyance end date', c.abeyancePeriod, 'endDate');
    if (endResult.status === "ERROR") {
      allErrors = allErrors.concat(endResult.errorList);
      endErrorFields = endResult.errorFields;
    }
  }

 // 4. Custom Check: Start date must be before end date (Only run if both dates are valid so far)
  if (allErrors.length === 0 && c.abeyancePeriod.startDate && c.abeyancePeriod.endDate) {
    let startDateObj = new Date(c.abeyancePeriod.startDate.year, c.abeyancePeriod.startDate.month - 1, c.abeyancePeriod.startDate.day);
    let endDateObj = new Date(c.abeyancePeriod.endDate.year, c.abeyancePeriod.endDate.month - 1, c.abeyancePeriod.endDate.day);
    
    // If the start date is after OR exactly the same as the end date, throw the error
    if (startDateObj >= endDateObj) {
      allErrors.push({ 
        text: "Abeyance start date must be before the abeyance end date", 
        href: "#start-day" // Jumps the user to the start date input when clicked
      });
      
      // Highlight both date inputs in red so the user knows they conflict
      startErrorFields = ['day', 'month', 'year'];
      endErrorFields = ['day', 'month', 'year'];
    }
  }

  // 5. If there are any errors, re-render the page
  if (allErrors.length > 0) {
    return res.render('cases/edit/abeyance-period', { 
      ref: req.query.ref,
      startDay: sD, startMonth: sM, startYear: sY,
      endDay: eD, endMonth: eM, endYear: eY,
      errorList: allErrors,
      startErrorFields: startErrorFields,
      endErrorFields: endErrorFields
    });
  }

  // Success!
  req.session.flashSection = "case-details"; 

  // AUDIT LOG: Stamp the specific dates! 
  // Notice we passed req.query.ref as the second argument here.
  addAuditLog(
    req, 
    req.query.ref, 
    `Abeyance period updated: ${c.abeyancePeriod.startDate ? `${c.abeyancePeriod.startDate.day}/${c.abeyancePeriod.startDate.month}/${c.abeyancePeriod.startDate.year}` : 'N/A'} to ${c.abeyancePeriod.endDate ? `${c.abeyancePeriod.endDate.day}/${c.abeyancePeriod.endDate.month}/${c.abeyancePeriod.endDate.year}` : 'N/A'}`
  );

  res.redirect('/cases/case-details?ref=' + req.query.ref);
});



// =========================================================
// INVOICING 
// =========================================================

// 1. Rechargeable
router.get('/cases/edit/invoicing-rechargeable', (req, res) => {
  var c = getCase(req);
  res.render('cases/edit/invoicing-rechargeable', { ref: req.query.ref, value: c.invoicing?.rechargeable });
});

router.post('/cases/edit/invoicing-rechargeable', (req, res) => {
  var c = getCase(req);
  var val = req.body.rechargeable;

  if (!val) {
    return res.render('cases/edit/invoicing-rechargeable', { ref: req.query.ref, errors: { rechargeable: { text: "Select yes if the case is rechargeable" } } });
  }

  if (!c.invoicing) c.invoicing = {};
  c.invoicing.rechargeable = val;
  
  // --- SET FLASH MESSAGE ---
  req.session.flashSection = "invoicing"; 

addAuditLog(req, req.query.ref, "Invoicing rechargeable value updated to " + val);
  res.redirect('/cases/case-details?ref=' + req.query.ref);
});

// 2. Final Cost
router.get('/cases/edit/invoicing-final-cost', (req, res) => {
  var c = getCase(req);
  res.render('cases/edit/invoicing-final-cost', { ref: req.query.ref, value: c.invoicing?.finalCost });
});

router.post('/cases/edit/invoicing-final-cost', (req, res) => {
  var c = getCase(req);
  var cost = req.body.finalCost;

  // Validate: not empty, and must be a valid number up to 2 decimal places
  var currencyRegex = /^\d+(\.\d{1,2})?$/;

  if (!cost) {
    return res.render('cases/edit/invoicing-final-cost', { 
      ref: req.query.ref, 
      errors: { finalCost: { text: "Enter the final cost" } } 
    });
  } else if (!currencyRegex.test(cost)) {
    return res.render('cases/edit/invoicing-final-cost', { 
      ref: req.query.ref, 
      value: cost, 
      errors: { finalCost: { text: "Final cost must be an amount of money, like 150 or 150.50" } } 
    });
  }

  if (!c.invoicing) c.invoicing = {};
  
  // GOV.UK Formatting: Drop .00 if it's a whole number, keep .xx if there are pence
  let num = parseFloat(cost);
  c.invoicing.finalCost = Number.isInteger(num) ? num.toString() : num.toFixed(2);
  
  // --- SET FLASH MESSAGE ---
  req.session.flashSection = "invoicing"; 

addAuditLog(req, req.query.ref, "Invoicing final cost updated to \u00A3" + c.invoicing.finalCost);
  res.redirect('/cases/case-details?ref=' + req.query.ref);
});

// 3. Invoice Sent
router.get('/cases/edit/invoicing-invoice-sent', (req, res) => {
  var c = getCase(req);
  res.render('cases/edit/invoicing-invoice-sent', { ref: req.query.ref, value: c.invoicing?.invoiceSent });
});

router.post('/cases/edit/invoicing-invoice-sent', (req, res) => {
  var c = getCase(req);
  var val = req.body.invoiceSent;

  if (!val) {
    return res.render('cases/edit/invoicing-invoice-sent', { ref: req.query.ref, errors: { invoiceSent: { text: "Select yes if the invoice has been sent" } } });
  }

  if (!c.invoicing) c.invoicing = {};
  c.invoicing.invoiceSent = val;
  
  // --- SET FLASH MESSAGE ---
  req.session.flashSection = "invoicing"; 

addAuditLog(req, req.query.ref, "Invoicing invoice sent value updated to " + val);
  res.redirect('/cases/case-details?ref=' + req.query.ref);
});

// 4. Fee Received
router.get('/cases/edit/invoicing-fee-received', (req, res) => {
  var c = getCase(req);
  res.render('cases/edit/invoicing-fee-received', { ref: req.query.ref, value: c.invoicing?.feeReceived });
});

router.post('/cases/edit/invoicing-fee-received', (req, res) => {
  var c = getCase(req);
  var val = req.body.feeReceived;

  if (!val) {
    return res.render('cases/edit/invoicing-fee-received', { ref: req.query.ref, errors: { feeReceived: { text: "Select yes if the fee has been received" } } });
  }

  if (!c.invoicing) c.invoicing = {};
  c.invoicing.feeReceived = val;
  
  // --- SET FLASH MESSAGE ---
  req.session.flashSection = "invoicing"; 

addAuditLog(req, req.query.ref, "Invoicing fee received value updated to" + val);
  res.redirect('/cases/case-details?ref=' + req.query.ref);
});



// =========================================================
// CREATE CASE: Applicant or Appellant Flow
// =========================================================

// 1. Applicant Name
router.get('/cases/create-a-case/questions/applicant-name', (req, res) => {
  let id = req.query.id;
  let applicants = req.session.data['applicants'] || [];

  // HYDRATION: If there is an ID, load that applicant from the array into temp storage
  if (id && (!req.session.data['tempApplicant'] || req.session.data['tempApplicant'].id !== id)) {
    let existingApp = applicants.find(a => a.id === id);
    if (existingApp) req.session.data['tempApplicant'] = { ...existingApp };
  } else if (!id && req.session.data['tempApplicant']?.id) {
    // If clicking "Add applicant" (no ID in URL), clear out any previously edited applicant
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
      id: req.query.id // Ensure ID is passed back on validation error
    });
  }

  if (!req.session.data['tempApplicant']) req.session.data['tempApplicant'] = {};
  req.session.data['tempApplicant'].firstName = first;
  req.session.data['tempApplicant'].lastName = last;
  req.session.data['tempApplicant'].companyName = company;

  // Pass the ID along to the next step
  res.redirect(`/cases/create-a-case/questions/applicant-address${req.query.id ? '?id=' + req.query.id : ''}`);
});

// 2. Applicant Address (Using the Address Helper)
router.get('/cases/create-a-case/questions/applicant-address', (req, res) => {
  let temp = req.session.data['tempApplicant'] || {};
  let address = temp.address || {}; // The helper creates this nested object
  
  res.render('cases/create-a-case/questions/applicant-address', { 
    val: temp,
    address: address, // Pass the nested address object for easy access
    id: req.query.id
  });
});

router.post('/cases/create-a-case/questions/applicant-address', (req, res) => {
  if (!req.session.data['tempApplicant']) {
    req.session.data['tempApplicant'] = {};
  }

  // Run the helper
  var result = validateAndSaveAddress(
    req, 
    res, 
    'applicant', 
    'Applicant address', 
    req.session.data['tempApplicant'], 
    'address'
  );

  // If validation fails (e.g., they entered an invalid postcode)
  if (result.status === "ERROR") {
    return res.render('cases/create-a-case/questions/applicant-address', { 
      val: req.session.data['tempApplicant'],
      // Pass back the raw input so they don't lose what they typed
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

  // Success! Move to the next step, carrying the ID forward
  res.redirect(`/cases/create-a-case/questions/applicant-contact${req.query.id ? '?id=' + req.query.id : ''}`);
});

// 3. Applicant Contact Details
router.get('/cases/create-a-case/questions/applicant-contact', (req, res) => {
  let temp = req.session.data['tempApplicant'] || {};
  
  // THE FIX: We must pass 'id: req.query.id' to the template so the form action can use it!
  res.render('cases/create-a-case/questions/applicant-contact', { 
    val: temp, 
    id: req.query.id 
  });
});

router.post('/cases/create-a-case/questions/applicant-contact', (req, res) => {
  let email = req.body.email || "";
  let phone = req.body.phone || "";
  
  let errors = {};
  let errorList = [];

  // Validation
  if (email.length > 250) {
    let err = { text: "Email must be less than 250 characters", href: "#email" };
    errors.email = err;
    errorList.push(err);
  }
  if (phone.length > 15) {
    let err = { text: "Phone number must be less than 15 characters", href: "#phone" };
    errors.phone = err;
    errorList.push(err);
  }

  // If there are errors, stop and show them
  if (errorList.length > 0) {
    return res.render('cases/create-a-case/questions/applicant-contact', { val: { email, phone }, errors, errorList });
  }

  // 1. Save contact details to the temporary applicant object
  if (!req.session.data['tempApplicant']) req.session.data['tempApplicant'] = {};
  req.session.data['tempApplicant'].email = email;
  req.session.data['tempApplicant'].phone = phone;

  // 2. Save the fully built tempApplicant to the main applicants array
  if (!req.session.data['applicants']) req.session.data['applicants'] = [];
  
  let completedApplicant = req.session.data['tempApplicant'];
  
  // If editing an existing one, update it. If new, assign an ID and push it.
  if (req.query.id) {
    let index = req.session.data['applicants'].findIndex(a => a.id === req.query.id);
    if (index > -1) {
      req.session.data['applicants'][index] = { ...completedApplicant };
    }
  } else {
    completedApplicant.id = 'app-' + Date.now();
    req.session.data['applicants'].push(completedApplicant);
  }

  // 3. Clear temp storage so it's clean for the next applicant
  req.session.data['tempApplicant'] = {};

  // 4. Finally, redirect to the check/table page
  res.redirect('/cases/create-a-case/questions/applicant-check');
});

// 4. Check Applicant Details
router.post('/cases/create-a-case/questions/applicant-check', (req, res) => {
  
  // 1. Check if the main applicants array exists in the session yet, if not, create it
  if (!req.session.data['applicants']) {
    req.session.data['applicants'] = [];
  }

  // 2. Grab the completed applicant data from this flow
  let completedApplicant = req.session.data['tempApplicant'];

  if (completedApplicant) {
    // Give them a unique ID just in case you need to edit/delete them later
    completedApplicant.id = 'app-' + Date.now();
    
    // Push them into the array
    req.session.data['applicants'].push(completedApplicant);
  }

  // 3. Clear the temporary holding pen so it's blank for the next person
  req.session.data['tempApplicant'] = {};

  // 4. Move to the next step in your creation flow
  res.redirect('/cases/create-a-case/questions/site-address');
});

// 5. Remove Applicant (Create Flow) - Instant Delete
router.get('/cases/create-a-case/questions/applicant-remove', (req, res) => {
  let id = req.query.id;
  
  if (req.session.data['applicants']) {
    // Filter out the applicant with the matching ID instantly
    req.session.data['applicants'] = req.session.data['applicants'].filter(a => a.id !== id);
  }
  
  // Bounce them right back to the check table
  res.redirect('/cases/create-a-case/questions/applicant-check');
});



// =========================================================
// DOCUMENTS: File Location (Independent Edit)
// =========================================================

// GET: Independent edit for file location
router.get('/cases/edit/file-location', function(req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases');

  res.render('cases/edit/file-location', { 
    ref: c.reference, 
    value: c.fileLocation || "",
    editMode: true 
  });
});

// POST: Save and return directly to case details
router.post('/cases/edit/file-location', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Save directly to the case
  c.fileLocation = req.body.fileLocation;

  req.session.flashSection = "documents"; 

addAuditLog(req, ref, "Document file location updated to: " + (c.fileLocation || "N/A"));
  
  // Redirect back to the main case view with a success flag
  res.redirect('/cases/case-details?ref=' + ref);
});



// ========================================================= ALL CASES ==========================================================
router.get('/cases', function (req, res) {
  let cases = req.session.data['cases'] || [];
  const searchTerm = req.query.search;

  // Simple search logic: filter cases by reference or name
  if (searchTerm) {
    cases = cases.filter(c => 
      c.reference.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  res.render('cases', { // This assumes your file is app/views/cases/index.html
    cases: cases,
    totalCases: cases.length,
    searchTerm: searchTerm
  });
});



// --- LOAD CASE DETAILS PAGE ---
router.get('/cases/case-details', function(req, res) {
  let ref = req.query.ref;
  
  // 1. Keep the ref in the session so other pages remember it
  if (ref) {
    req.session.data['ref'] = ref;
  }

  // 2. Find the case directly in the server memory
  let cases = req.session.data['cases'] || [];
  let foundCase = cases.find(c => c.reference === ref);

  // 3. Grab the flash message (if it exists)
  let sectionToJumpTo = req.session.flashSection;

  // 4. Delete it immediately so it doesn't get stuck!
  req.session.flashSection = null; 

  // 5. Render the page and pass BOTH the case and the flash banner
  res.render('cases/case-details', { 
    currentCase: foundCase,       
    flashSection: sectionToJumpTo 
  });
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

// 6. Return to Case Details (From Related Cases Hub)
router.get('/cases/related-cases/return-to-case', function (req, res) {
  // 1. Attach the success banner to jump to the 'Overview' card
  req.session.flashSection = "overview"; 

addAuditLog(req, req.query.ref, "Related cases updated");
  
  // 2. Send them back to the main Case Details page
  res.redirect('/cases/case-details?ref=' + req.query.ref);
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

// 7. Return to Case Details (From Linked Cases Hub)
router.get('/cases/linked-cases/return-to-case', function (req, res) {
  // 1. Attach the success banner to jump to the 'Overview' card
  req.session.flashSection = "overview"; 

addAuditLog(req, req.query.ref, "Linked cases updated");
  
  // 2. Send them back to the main Case Details page
  res.redirect('/cases/case-details?ref=' + req.query.ref);
});


// =============================================================================
//  OVERVIEW PROCEDURES FLOW (Multi-step)
// =============================================================================

// Helper: Get or create the overviewProcedures array
function getOverviewProcs(req) {
  var c = getCase(req);
  if (!c) return null;
  if (!c.overviewProcedures) c.overviewProcedures = [];
  return c;
}

// Helper: Sync the overview list to the detailed Procedure 1, 2, and 3 cards
function syncOverviewToDetailed(c) {
  if (!c.overviewProcedures) c.overviewProcedures = [];
  
  // Loop through slots 1 to 3
  for (let i = 0; i < 3; i++) {
    let procKey = 'procedure' + (i + 1); // Creates 'procedure1', 'procedure2', 'procedure3'
    let overviewItem = c.overviewProcedures[i];
    
    if (overviewItem) {
      // If an overview procedure exists at this spot, merge its top-level data into the detailed card
      if (!c[procKey]) c[procKey] = {};
      c[procKey].type = overviewItem.type;
      c[procKey].status = overviewItem.status;
      c[procKey].adminType = overviewItem.adminType || c[procKey].adminType;
      c[procKey].siteVisitType = overviewItem.siteVisitType || c[procKey].siteVisitType;
      c[procKey].inspector = overviewItem.inspector || c[procKey].inspector;
      c[procKey].active = true; 
    } else {
      // If there is no procedure for this slot (e.g. they only added 2 procedures), clear the card completely
      c[procKey] = null;
    }
  }
}

// Helper: Sync detailed Procedure 1, 2, 3 cards BACK to the Overview list
function syncDetailedToOverview(c) {
  if (!c) return;
  
  let newOverview = [];

  // Loop through slots 1, 2, and 3
  for (let i = 1; i <= 3; i++) {
    let procKey = 'procedure' + i;
    let detailedProc = c[procKey];

    // If the detailed card has data, push it into the overview list
    if (detailedProc && detailedProc.type) {
      
      // Keep existing ID so "Change/Remove" links don't break, or create a new one
      let existingId = (c.overviewProcedures && c.overviewProcedures[i - 1]) 
                       ? c.overviewProcedures[i - 1].id 
                       : 'proc-' + Date.now() + i;

      newOverview.push({
        id: existingId,
        type: detailedProc.type,
        status: detailedProc.status,
        adminType: detailedProc.adminType,
        siteVisitType: detailedProc.siteVisitType,
        inspector: detailedProc.inspector
      });
    }
  }

  // Replace the old overview array with the newly synced one
  c.overviewProcedures = newOverview;
}

// 0. CHECK PAGE (The Table)
router.get('/cases/overview-procedures/check', (req, res) => {
  res.render('cases/overview-procedures/check-procedures', { ref: req.query.ref });
});

// 1. STEP 1: Select Type
router.get('/cases/overview-procedures/step-1', (req, res) => {
  var c = getOverviewProcs(req);
  var val = "";
  
  if (req.query.id) {
    var item = c.overviewProcedures.find(i => i.id === req.query.id);
    if (item) {
      val = item.type;

      // HYDRATION: Copy existing data into tempProc so steps 2 and 3 are pre-filled
      req.session.data['tempProc'] = {
        type: item.type,
        status: item.status,
        adminType: item.adminType,
        siteVisitType: item.siteVisitType,
        inspector: item.inspector
      };
    }
  } else {
    // Clear temp session for new entries to ensure a blank form
    req.session.data['tempProc'] = {}; 
  }
  
  res.render('cases/overview-procedures/step-1-type', { 
    ref: req.query.ref, 
    id: req.query.id || "", 
    value: val 
  });
});

router.post('/cases/overview-procedures/step-1', (req, res) => {
  var type = req.body.procType;
  var ref = req.query.ref;
  var id = req.query.id;
  
  if (!type) {
    return res.render('cases/overview-procedures/step-1-type', { 
      ref: ref, 
      id: id, 
      error: true 
    });
  }

  // Ensure tempProc exists and update the type
  if (!req.session.data['tempProc']) req.session.data['tempProc'] = {};
  req.session.data['tempProc'].type = type;

  // Branching Logic
  if (type === "Admin (In house)") {
    res.redirect(`/cases/overview-procedures/step-2a?ref=${ref}&id=${id}`);
  } else if (type === "Site visit") {
    res.redirect(`/cases/overview-procedures/step-2b?ref=${ref}&id=${id}`);
  } else {
    // Hearing, Inquiry, Proposal, Written reps
    res.redirect(`/cases/overview-procedures/step-2c?ref=${ref}&id=${id}`);
  }
});

// 2a. STEP 2: Admin Type
router.get('/cases/overview-procedures/step-2a', (req, res) => {
  var val = req.session.data['tempProc']?.adminType || "";
  res.render('cases/overview-procedures/step-2a-admin', { ref: req.query.ref, id: req.query.id, value: val });
});

router.post('/cases/overview-procedures/step-2a', (req, res) => {
  var adminType = req.body.adminType;
  if (!adminType) {
    return res.render('cases/overview-procedures/step-2a-admin', { ref: req.query.ref, id: req.query.id, error: true });
  }
  req.session.data['tempProc'].adminType = adminType;
  // Redirect to Inspector allocation (Step 2c)
  res.redirect(`/cases/overview-procedures/step-2c?ref=${req.query.ref}&id=${req.query.id}`);
});

// 2b. STEP 2: Site Visit Type
router.get('/cases/overview-procedures/step-2b', (req, res) => {
  var val = req.session.data['tempProc']?.siteVisitType || "";
  res.render('cases/overview-procedures/step-2b-site-visit', { ref: req.query.ref, id: req.query.id, value: val });
});

router.post('/cases/overview-procedures/step-2b', (req, res) => {
  var siteVisitType = req.body.siteVisitType;
  if (!siteVisitType) {
    return res.render('cases/overview-procedures/step-2b-site-visit', { ref: req.query.ref, id: req.query.id, error: true });
  }
  req.session.data['tempProc'].siteVisitType = siteVisitType;
  // Redirect to Inspector allocation (Step 2c)
  res.redirect(`/cases/overview-procedures/step-2c?ref=${req.query.ref}&id=${req.query.id}`);
});

// 2c. STEP 2: Inspector Allocation
router.get('/cases/overview-procedures/step-2c', (req, res) => {
  var c = getCase(req);
  var val = req.session.data['tempProc']?.inspector || "";
  res.render('cases/overview-procedures/step-2c-inspector', { 
    ref: req.query.ref, 
    id: req.query.id, 
    value: val, 
    inspectors: c.inspectors || [] 
  });
});

router.post('/cases/overview-procedures/step-2c', (req, res) => {
  var inspector = req.body.inspectorName;

  // Save whatever they selected (or leave it blank if they selected nothing)
  req.session.data['tempProc'].inspector = inspector || "";
  
  // Go straight to Status (Step 3)
  res.redirect(`/cases/overview-procedures/step-3?ref=${req.query.ref}&id=${req.query.id}`);
});

// 3. STEP 3: Status & Save
router.get('/cases/overview-procedures/step-3', (req, res) => {
  var val = req.session.data['tempProc']?.status || "";
  res.render('cases/overview-procedures/step-3-status', { ref: req.query.ref, id: req.query.id, value: val });
});

router.post('/cases/overview-procedures/step-3', (req, res) => {
  var ref = req.query.ref;
  var id = req.query.id;
  var status = req.body.procStatus;

  // Validation Check
  if (!status) {
    return res.render('cases/overview-procedures/step-3-status', { ref: ref, id: id, error: true });
  }

  var c = getOverviewProcs(req);
  var temp = req.session.data['tempProc'];
  temp.status = status;

  if (id) {
    // Update existing
    var index = c.overviewProcedures.findIndex(i => i.id === id);
    if (index > -1) {
      c.overviewProcedures[index] = { ...c.overviewProcedures[index], ...temp };
    }
  } else {
    // Add new
    temp.id = 'proc-' + Date.now();
    c.overviewProcedures.push(temp);
  }

  // --- TRIGGER THE SYNC HERE ---
  syncOverviewToDetailed(c);

  // Clear temp and redirect to table
  req.session.data['tempProc'] = {};
  res.redirect(`/cases/overview-procedures/check?ref=${ref}`);
});

// 4. REMOVE CONFIRMATION
router.get('/cases/overview-procedures/remove-confirm', (req, res) => {
  res.render('cases/overview-procedures/remove-confirm', { ref: req.query.ref, id: req.query.id });
});

router.post('/cases/overview-procedures/remove', (req, res) => {
  var ref = req.query.ref;
  var confirm = req.body.confirmRemove;

  // Validation Check
  if (!confirm) {
    return res.render('cases/overview-procedures/remove-confirm', { ref: ref, id: req.query.id, error: true });
  }

  if (confirm === 'yes') {
    var c = getCase(req);
    if (c && c.overviewProcedures) {
      c.overviewProcedures = c.overviewProcedures.filter(i => i.id !== req.query.id);

      syncOverviewToDetailed(c);
    }
  }
  
  res.redirect(`/cases/overview-procedures/check?ref=${ref}`);
});

// 5. Return to Case Details (From Procedures Hub)
router.get('/cases/overview-procedures/return-to-case', (req, res) => {
  // 1. Attach the success banner to jump to the 'Overview' card
  req.session.flashSection = "overview"; 

addAuditLog(req, req.query.ref, "Procedures updated");
  
  // 2. Send them back to the main Case Details page
  res.redirect('/cases/case-details?ref=' + req.query.ref);
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
  var first = req.body['obj-fname'] || "";
  var last = req.body['obj-lname'] || "";
  var org = req.body['obj-org'] || "";
  
  let errors = {};
  let errorList = [];

  // Validation
  if (!first && !last && !org) {
    let err = { text: "Enter at least one of first name, last name or organisation", href: "#obj-fname" };
    errors.general = err;
    errorList.push(err);
  }
  if (first.length > 250) {
    let err = { text: "First name must be less than 250 characters", href: "#obj-fname" };
    errors.fname = err;
    errorList.push(err);
  }
  if (last.length > 250) {
    let err = { text: "Last name must be less than 250 characters", href: "#obj-lname" };
    errors.lname = err;
    errorList.push(err);
  }
  if (org.length > 250) {
    let err = { text: "Organisation name must be less than 250 characters", href: "#obj-org" };
    errors.org = err;
    errorList.push(err);
  }

  if (errorList.length > 0) {
    return res.render('cases/key-contacts/objectors/step-1', {
      ref: req.query.ref,
      id: req.query.id,
      fname: first,
      lname: last,
      org: org,
      errors: errors,
      errorList: errorList
    });
  }

  req.session.data['temp_obj_fname'] = first;
  req.session.data['temp_obj_lname'] = last;
  req.session.data['temp_obj_org']   = org;
  
  res.redirect(`/cases/key-contacts/objectors/step-2?ref=${req.query.ref}&id=${req.query.id || ''}`);
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
    county:   req.session.data['temp_obj_county']   || objector.county,
    postcode: req.session.data['temp_obj_postcode'] || objector.postcode
  });
});

router.post('/cases/key-contacts/objectors/step-2', function(req, res) {
  var line1 = req.body['obj-address1'];
  var line2 = req.body['obj-address2'];
  var town = req.body['obj-town'];
  var county = req.body['obj-county'];
  var postcode = req.body['obj-postcode'];

  let errors = {};
  let errorList = [];

  // Postcode Validation (Strict UK)
  if (postcode && postcode.trim() !== "") {
    var cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    var postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/;

    if (cleanPostcode.length < 5 || cleanPostcode.length > 7) {
      let err = { text: "Postcode must be between 5 and 7 characters", href: "#obj-postcode" };
      errors.postcode = err;
      errorList.push(err);
    } 
    else if (!postcodeRegex.test(cleanPostcode)) {
      let err = { text: "Enter a real postcode", href: "#obj-postcode" };
      errors.postcode = err;
      errorList.push(err);
    }
  }

  if (errorList.length > 0) {
    return res.render('cases/key-contacts/objectors/step-2', {
      ref: req.query.ref,
      id: req.query.id,
      address1: line1,
      address2: line2,
      town: town,
      county: county,
      postcode: postcode,
      errors: errors,
      errorList: errorList
    });
  }

  req.session.data['temp_obj_address1'] = line1;
  req.session.data['temp_obj_address2'] = line2;
  req.session.data['temp_obj_town']     = town;
  req.session.data['temp_obj_county']   = county;
  req.session.data['temp_obj_postcode'] = postcode;

  res.redirect(`/cases/key-contacts/objectors/step-3?ref=${req.query.ref}&id=${req.query.id || ''}`);
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
  let email = req.body['obj-email'] || "";
  let phone = req.body['obj-phone'] || "";

  let errors = {};
  let errorList = [];

  // Validation
  if (email.length > 250) {
    let err = { text: "Email must be less than 250 characters", href: "#obj-email" };
    errors.email = err;
    errorList.push(err);
  }
  if (phone.length > 15) {
    let err = { text: "Phone number must be less than 15 characters", href: "#obj-phone" };
    errors.phone = err;
    errorList.push(err);
  }

  if (errorList.length > 0) {
    return res.render('cases/key-contacts/objectors/step-3', {
      ref: req.query.ref,
      id: req.query.id,
      email: email,
      phone: phone,
      errors: errors,
      errorList: errorList
    });
  }

  req.session.data['temp_obj_email'] = email;
  req.session.data['temp_obj_phone'] = phone;

  res.redirect(`/cases/key-contacts/objectors/step-4?ref=${req.query.ref}&id=${req.query.id || ''}`);
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

// STEP 5. Return to Case Details
router.get('/cases/objectors/return-to-case', function (req, res) {
  // 1. Attach the success banner to jump to the 'Key Contacts' card
  req.session.flashSection = "key-contacts"; 

  addAuditLog(req, req.query.ref, "Objectors updated");
  
  // 2. Send them back to the main Case Details page
  res.redirect('/cases/case-details?ref=' + req.query.ref);
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

// STEP 1: Contact Type
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
  res.redirect(`/cases/key-contacts/contacts/step-2?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// STEP 2: Who is the contact?
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
  var first = req.body['con-fname'] || "";
  var last = req.body['con-lname'] || "";
  var org = req.body['con-org'] || "";
  
  let errors = {};
  let errorList = [];

  // Validation
  if (!first && !last && !org) {
    let err = { text: "Enter at least one of first name, last name or organisation", href: "#con-fname" };
    errors.general = err;
    errorList.push(err);
  }
  if (first.length > 250) {
    let err = { text: "First name must be less than 250 characters", href: "#con-fname" };
    errors.fname = err;
    errorList.push(err);
  }
  if (last.length > 250) {
    let err = { text: "Last name must be less than 250 characters", href: "#con-lname" };
    errors.lname = err;
    errorList.push(err);
  }
  if (org.length > 250) {
    let err = { text: "Organisation name must be less than 250 characters", href: "#con-org" };
    errors.org = err;
    errorList.push(err);
  }

  if (errorList.length > 0) {
    return res.render('cases/key-contacts/contacts/step-2', {
      ref: req.query.ref,
      id: req.query.id,
      fname: first,
      lname: last,
      org: org,
      errors: errors,
      errorList: errorList
    });
  }

  req.session.data['temp_con_fname'] = first;
  req.session.data['temp_con_lname'] = last;
  req.session.data['temp_con_org']   = org;

  res.redirect(`/cases/key-contacts/contacts/step-3?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// STEP 3: Address
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
  var line1 = req.body['con-address1'];
  var line2 = req.body['con-address2'];
  var town = req.body['con-town'];
  var county = req.body['con-county'];
  var postcode = req.body['con-postcode'];

  let errors = {};
  let errorList = [];

  // Postcode Validation (Strict UK)
  if (postcode && postcode.trim() !== "") {
    var cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    var postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/;

    if (cleanPostcode.length < 5 || cleanPostcode.length > 7) {
      let err = { text: "Postcode must be between 5 and 7 characters", href: "#con-postcode" };
      errors.postcode = err;
      errorList.push(err);
    } 
    else if (!postcodeRegex.test(cleanPostcode)) {
      let err = { text: "Enter a real postcode", href: "#con-postcode" };
      errors.postcode = err;
      errorList.push(err);
    }
  }

  if (errorList.length > 0) {
    return res.render('cases/key-contacts/contacts/step-3', {
      ref: req.query.ref,
      id: req.query.id,
      address1: line1,
      address2: line2,
      town: town,
      county: county,
      postcode: postcode,
      errors: errors,
      errorList: errorList
    });
  }

  req.session.data['temp_con_address1'] = line1;
  req.session.data['temp_con_address2'] = line2;
  req.session.data['temp_con_town']     = town;
  req.session.data['temp_con_county']   = county;
  req.session.data['temp_con_postcode'] = postcode;

  res.redirect(`/cases/key-contacts/contacts/step-4?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// STEP 4: Contact Details + SAVE
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

  var email = req.body['con-email'] || "";
  var phone = req.body['con-phone'] || "";

  let errors = {};
  let errorList = [];

  // Validation
  if (email.length > 250) {
    let err = { text: "Email must be less than 250 characters", href: "#con-email" };
    errors.email = err;
    errorList.push(err);
  }
  if (phone.length > 15) {
    let err = { text: "Phone number must be less than 15 characters", href: "#con-phone" };
    errors.phone = err;
    errorList.push(err);
  }

  if (errorList.length > 0) {
    return res.render('cases/key-contacts/contacts/step-4', {
      ref: req.query.ref,
      id: req.query.id,
      email: email,
      phone: phone,
      errors: errors,
      errorList: errorList
    });
  }

  // Find existing data (if editing)
  var existing = {};
  if (id && c.contacts) {
    existing = c.contacts.find(x => x.id == id) || {};
  }

  // Helper to get New Session Data OR Old DB Data
  function getVal(sess, db) { return (req.session.data[sess] !== undefined) ? req.session.data[sess] : db; }

  // Build Object
  var newContact = {
    id: id || Date.now().toString(),
    
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

  // Save
  c.contacts = c.contacts || [];
  var idx = c.contacts.findIndex(x => x.id == id);
  if (idx >= 0) c.contacts[idx] = newContact;
  else c.contacts.push(newContact);

  // Cleanup
  delete req.session.data['temp_con_type'];
  delete req.session.data['temp_con_fname'];
  delete req.session.data['temp_con_lname'];
  delete req.session.data['temp_con_org'];
  delete req.session.data['temp_con_address1'];
  delete req.session.data['temp_con_address2'];
  delete req.session.data['temp_con_town'];
  delete req.session.data['temp_con_county'];
  delete req.session.data['temp_con_postcode'];
  delete req.session.data['temp_con_email']; 

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

// STEP 5. Return to Case Details
router.get('/cases/contacts/return-to-case', function (req, res) {
  req.session.flashSection = "key-contacts"; 
  addAuditLog(req, req.query.ref, "Contacts updated");
  res.redirect('/cases/case-details?ref=' + req.query.ref);
});


// =============================================================================
//  OUTCOMES FLOW (Multi-step)
// =============================================================================

function getOutcomes(req) {
  var c = getCase(req); // Assuming you have your standard getCase helper
  if (!c) return null;
  if (!c.outcomes) c.outcomes = [];
  return c;
}

// 0. CHECK PAGE (The Table)
router.get('/cases/outcomes/check', (req, res) => {
  res.render('cases/outcomes/check-outcomes', { ref: req.query.ref });
});

// 1. STEP 1: Type of decision
router.get('/cases/outcomes/step-1', (req, res) => {
  var c = getCase(req);
  var id = req.query.id;

  // HYDRATION LOGIC: Load existing data if editing
  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    if (c && c.outcomes) {
      var existingOutcome = c.outcomes.find(o => o.id === id);
      if (existingOutcome) req.session.data['tempOutcome'] = { ...existingOutcome };
    }
  } else if (!id) {
    req.session.data['tempOutcome'] = {}; // Clear temp if creating a brand new one
  }

  var val = req.session.data['tempOutcome']?.type || "";
  res.render('cases/outcomes/step-1-type', { ref: req.query.ref, id: req.query.id, value: val });
});

router.post('/cases/outcomes/step-1', (req, res) => {
  var type = req.body.outcomeType;
  if (!type) return res.render('cases/outcomes/step-1-type', { ref: req.query.ref, id: req.query.id, error: true });
  
  if (!req.session.data['tempOutcome']) req.session.data['tempOutcome'] = {};
  req.session.data['tempOutcome'].type = type;
  res.redirect(`/cases/outcomes/step-2?ref=${req.query.ref}&id=${req.query.id}`);
});

// 2. STEP 2: Originator (Decision Maker)
router.get('/cases/outcomes/step-2', (req, res) => {
  var c = getCase(req);
  var id = req.query.id;

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    if (c && c.outcomes) {
      var existingOutcome = c.outcomes.find(o => o.id === id);
      if (existingOutcome) req.session.data['tempOutcome'] = { ...existingOutcome };
    }
  }

  var val = req.session.data['tempOutcome']?.originator || "";
  res.render('cases/outcomes/step-2-originator', { ref: req.query.ref, id: req.query.id, value: val });
});

router.post('/cases/outcomes/step-2', (req, res) => {
  var originator = req.body.originator;
  if (!originator) return res.render('cases/outcomes/step-2-originator', { ref: req.query.ref, id: req.query.id, error: true });
  
  req.session.data['tempOutcome'].originator = originator;

  // BRANCHING
  if (originator === "Inspector") {
    res.redirect(`/cases/outcomes/step-2a?ref=${req.query.ref}&id=${req.query.id}`);
  } else if (originator === "Officer") {
    res.redirect(`/cases/outcomes/step-2b?ref=${req.query.ref}&id=${req.query.id}`);
  } else {
    // Secretary of State
    req.session.data['tempOutcome'].inspectorName = null; 
    req.session.data['tempOutcome'].officerName = null;
    res.redirect(`/cases/outcomes/step-3?ref=${req.query.ref}&id=${req.query.id}`);
  }
});

// 2a. STEP 2a: Inspector Name
router.get('/cases/outcomes/step-2a', (req, res) => {
  var c = getCase(req); 
  var id = req.query.id;

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    if (c && c.outcomes) {
      var existingOutcome = c.outcomes.find(o => o.id === id);
      if (existingOutcome) req.session.data['tempOutcome'] = { ...existingOutcome };
    }
  }

  res.render('cases/outcomes/step-2a-inspector', { 
    ref: req.query.ref, 
    id: req.query.id,
    inspectors: c.inspectors || [] 
  });
});

router.post('/cases/outcomes/step-2a', (req, res) => {
  var inspector = req.body.inspectorName;
  var c = getCase(req); 
  
  if (!inspector) {
    return res.render('cases/outcomes/step-2a-inspector', { 
      ref: req.query.ref, 
      id: req.query.id, 
      inspectors: c.inspectors || [], 
      errors: {
        inspectorName: {
          text: "Select the inspector maker"
        }
      }
    });
  }

  if (!req.session.data['tempOutcome']) req.session.data['tempOutcome'] = {};
  
  req.session.data['tempOutcome'].inspectorName = inspector;
  req.session.data['tempOutcome'].officerName = null; 
  
  res.redirect(`/cases/outcomes/step-3?ref=${req.query.ref}&id=${req.query.id}`);
});

// 2b. STEP 2b: Officer Name
router.get('/cases/outcomes/step-2b', (req, res) => {
  var c = getCase(req); 
  var id = req.query.id;

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    if (c && c.outcomes) {
      var existingOutcome = c.outcomes.find(o => o.id === id);
      if (existingOutcome) req.session.data['tempOutcome'] = { ...existingOutcome };
    }
  }

  res.render('cases/outcomes/step-2b-officer', { 
    ref: req.query.ref, 
    id: req.query.id 
  }); 
});

router.post('/cases/outcomes/step-2b', (req, res) => {
  var officer = req.body.officerName; 
  
  if (!officer) {
    return res.render('cases/outcomes/step-2b-officer', { 
      ref: req.query.ref, 
      id: req.query.id, 
      errors: {
        officerName: {
          text: "Select the officer"
        }
      } 
    });
  }

  if (!req.session.data['tempOutcome']) req.session.data['tempOutcome'] = {};
  
  req.session.data['tempOutcome'].officerName = officer;
  req.session.data['tempOutcome'].inspectorName = null; 
  
  res.redirect(`/cases/outcomes/step-3?ref=${req.query.ref}&id=${req.query.id}`);
});

// 3. STEP 3: Outcome
router.get('/cases/outcomes/step-3', (req, res) => {
  var c = getCase(req); 
  var id = req.query.id;

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    if (c && c.outcomes) {
      var existingOutcome = c.outcomes.find(o => o.id === id);
      if (existingOutcome) req.session.data['tempOutcome'] = { ...existingOutcome };
    }
  }

  var val = req.session.data['tempOutcome']?.decisionOutcome || "";
  var grantedDetails = req.session.data['tempOutcome']?.decisionGrantedConditions || "";
  var otherDetails = req.session.data['tempOutcome']?.decisionOtherDetails || "";

  res.render('cases/outcomes/step-3-outcome', { 
    ref: req.query.ref, 
    id: req.query.id, 
    value: val,
    grantedDetails: grantedDetails,
    otherDetails: otherDetails
  });
});

router.post('/cases/outcomes/step-3', (req, res) => {
  var decisionOutcome = req.body.decisionOutcome;

  if (!decisionOutcome) {
    return res.render('cases/outcomes/step-3-outcome', { 
      ref: req.query.ref, id: req.query.id, 
      errors: { decisionOutcome: { text: "Select the outcome" } }
    });
  }

  if (!req.session.data['tempOutcome']) req.session.data['tempOutcome'] = {};

  req.session.data['tempOutcome'].decisionOutcome = decisionOutcome;
  
  // Save the conditional text inputs
  req.session.data['tempOutcome'].decisionGrantedConditions = req.body.decisionGrantedConditions;
  req.session.data['tempOutcome'].decisionOtherDetails = req.body.decisionOtherDetails;

  // Move on to the dates
  res.redirect(`/cases/outcomes/step-4?ref=${req.query.ref}&id=${req.query.id}`);
});

// 4. STEP 4: Outcome Date (REQUIRED)
router.get('/cases/outcomes/step-4', (req, res) => {
  var c = getCase(req); 
  var id = req.query.id;

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    if (c && c.outcomes) {
      var existingOutcome = c.outcomes.find(o => o.id === id);
      if (existingOutcome) req.session.data['tempOutcome'] = { ...existingOutcome };
    }
  }

  var tempOutcome = req.session.data['tempOutcome'] || {};
  var outcomeDate = tempOutcome.outcomeDate || {};

  res.render('cases/outcomes/step-4-date', { 
    ref: req.query.ref, 
    id: req.query.id, 
    day: outcomeDate.day,
    month: outcomeDate.month,
    year: outcomeDate.year
  });
});

router.post('/cases/outcomes/step-4', (req, res) => {
  if (!req.session.data['tempOutcome']) {
    req.session.data['tempOutcome'] = {};
  }

  var day = req.body['outcome-day']; 
  var month = req.body['outcome-month']; 
  var year = req.body['outcome-year'];

  var result = validateAndSaveDate(
    req, 
    res, 
    'outcome',                        
    'Outcome date',                   
    req.session.data['tempOutcome'],  
    'outcomeDate'                     
  );

  if (result.status === "SUCCESS" || result.status === "REMOVED") {
    return res.redirect(`/cases/outcomes/step-5?ref=${req.query.ref}&id=${req.query.id}`);
  }

  if (result.status === "ERROR") {
    return res.render('cases/outcomes/step-4-date', { 
      ref: req.query.ref, 
      id: req.query.id, 
      day: day,
      month: month,
      year: year,
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});

// 5. STEP 5: Received Date (OPTIONAL) & SAVE
router.get('/cases/outcomes/step-5', (req, res) => {
  var c = getCase(req); 
  var id = req.query.id;

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    if (c && c.outcomes) {
      var existingOutcome = c.outcomes.find(o => o.id === id);
      if (existingOutcome) req.session.data['tempOutcome'] = { ...existingOutcome };
    }
  }

  var tempOutcome = req.session.data['tempOutcome'] || {};
  var receivedDate = tempOutcome.receivedDate || {}; 

  res.render('cases/outcomes/step-5-received', { 
    ref: req.query.ref, 
    id: req.query.id, 
    day: receivedDate.day,
    month: receivedDate.month,
    year: receivedDate.year
  });
});

router.post('/cases/outcomes/step-5', (req, res) => {
  if (!req.session.data['tempOutcome']) {
    req.session.data['tempOutcome'] = {};
  }

  var day = req.body['received-day']; 
  var month = req.body['received-month']; 
  var year = req.body['received-year'];

  if (!day && !month && !year) {
    req.session.data['tempOutcome'].receivedDate = null; 
  } else {
    var result = validateAndSaveDate(
      req, 
      res, 
      'received',                       
      'Received date',                  
      req.session.data['tempOutcome'],  
      'receivedDate'                    
    );

    if (result.status === "ERROR") {
      return res.render('cases/outcomes/step-5-received', { 
        ref: req.query.ref, 
        id: req.query.id, 
        day: day,
        month: month,
        year: year,
        errorList: result.errorList,
        errorFields: result.errorFields
      });
    }
  }

  // --- 3. SAVE TO ARRAY ---
  var c = getCase(req); 

  if (!c) {
    console.log("Error: Case not found for reference: ", req.query.ref);
    return res.redirect('/'); 
  }

  if (!c.outcomes) {
    c.outcomes = [];
  }

  var temp = req.session.data['tempOutcome'] || {};
  var id = req.query.id;

  if (id) {
    var index = c.outcomes.findIndex(i => i.id === id);
    if (index > -1) {
      c.outcomes[index] = { ...c.outcomes[index], ...temp };
    }
  } else {
    temp.id = 'out-' + Date.now();
    c.outcomes.push(temp);
  }

  req.session.data['tempOutcome'] = {}; 
  res.redirect(`/cases/outcomes/check?ref=${req.query.ref}`);
});

// 6. REMOVE OUTCOME
router.get('/cases/outcomes/remove-confirm', (req, res) => {
  res.render('cases/outcomes/remove-confirm', { ref: req.query.ref, id: req.query.id });
});
router.post('/cases/outcomes/remove', (req, res) => {
  var confirm = req.body.confirmRemove;
  if (!confirm) return res.render('cases/outcomes/remove-confirm', { ref: req.query.ref, id: req.query.id, error: true });

  if (confirm === 'yes') {
    var c = getCase(req);
    if (c && c.outcomes) c.outcomes = c.outcomes.filter(i => i.id !== req.query.id);
  }
  res.redirect(`/cases/outcomes/check?ref=${req.query.ref}`);
});

// 7. Return to Case Details (From Outcomes Hub)
router.get('/cases/outcomes/return-to-case', function (req, res) {
  // 1. Attach the success banner to jump to the 'Outcome overview' card
  req.session.flashSection = "outcomeOverview"; 

addAuditLog(req, req.query.ref, "Outcomes updated");
  
  // 2. Send them back to the main Case Details page
  res.redirect('/cases/case-details?ref=' + req.query.ref);
});


// =========================================================
// OVERVIEW OUTCOME: Parties notified of outcome (Optional)
// =========================================================

router.get('/cases/overview-outcome/parties-notified', (req, res) => {
  var c = getCase(req); 
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
  var c = getCase(req);
  if (!c) return res.redirect('/'); 

  if (!c.outcomeOverview) {
    c.outcomeOverview = {};
  }

  var day = req.body['parties-notified-day']; 
  var month = req.body['parties-notified-month']; 
  var year = req.body['parties-notified-year'];

  // 1. Check if completely blank
  if (!day && !month && !year) {
    c.outcomeOverview.partiesNotifiedDate = null; 
    req.session.flashSection = "outcomeOverview"; 

addAuditLog(req, req.query.ref, "Parties notified date removed");
    return res.redirect('/cases/case-details?ref=' + req.query.ref); 
  }

  // 2. Not blank, run helper
  var result = validateAndSaveDate(
    req, 
    res, 
    'parties-notified',           
    'Parties notified of outcome date',
    c.outcomeOverview,            
    'partiesNotifiedDate'         
  );

  // If validation fails
  if (result.status === "ERROR") {
    return res.render('cases/overview-outcome/parties-notified', { 
      ref: req.query.ref, 
      day: day,
      month: month,
      year: year,
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }

  // 3. Success
  req.session.flashSection = "outcomeOverview"; 

  // --- FORMAT THE DATE ---
  // 1. Create a lookup list for the months
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // 2. Turn the numerical month (e.g., "3") into the word (e.g., "March")
  // We subtract 1 because arrays start counting at 0!
  const prettyMonth = monthNames[parseInt(month, 10) - 1]; 
  
  // 3. Stick it all together into a pretty string
  const formattedDate = `${day} ${prettyMonth} ${year}`;
  
  // AUDIT LOG: Stamp the beautiful date!
  addAuditLog(req, req.query.ref, `Parties notified date updated to '${formattedDate}'`);
  
  res.redirect('/cases/case-details?ref=' + req.query.ref);
});

// =========================================================
// OVERVIEW OUTCOME: Order decision dispatch (Optional)
// =========================================================
router.get('/cases/overview-outcome/order-dispatch', (req, res) => {
  var c = getCase(req); 
  var dateObj = (c.outcomeOverview && c.outcomeOverview.orderDispatchDate) || {};
  res.render('cases/overview-outcome/order-dispatch', { 
    ref: req.query.ref, day: dateObj.day, month: dateObj.month, year: dateObj.year 
  });
});

router.post('/cases/overview-outcome/order-dispatch', (req, res) => {
  var c = getCase(req);
  if (!c) return res.redirect('/'); 
  if (!c.outcomeOverview) c.outcomeOverview = {};

  var day = req.body['order-dispatch-day'], month = req.body['order-dispatch-month'], year = req.body['order-dispatch-year'];

  if (!day && !month && !year) {
    c.outcomeOverview.orderDispatchDate = null; 
    req.session.flashSection = "outcomeOverview"; 

    // AUDIT LOG: Stamp removal
    addAuditLog(req, req.query.ref, "Order dispatch date removed");
    return res.redirect('/cases/case-details?ref=' + req.query.ref); 
  }

  var result = validateAndSaveDate(req, res, 'order-dispatch', 'Order decision dispatch date', c.outcomeOverview, 'orderDispatchDate');

  if (result.status === "ERROR") {
    return res.render('cases/overview-outcome/order-dispatch', { 
      ref: req.query.ref, day, month, year, errorList: result.errorList, errorFields: result.errorFields 
    });
  }
  
  // Success!
  req.session.flashSection = "outcomeOverview"; 

  // --- FORMAT THE DATE ---
  // 1. Create a lookup list for the months
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // 2. Turn the numerical month (e.g., "3") into the word (e.g., "March")
  // We subtract 1 because arrays start counting at 0!
  const prettyMonth = monthNames[parseInt(month, 10) - 1]; 
  
  // 3. Stick it all together into a pretty string
  const formattedDate = `${day} ${prettyMonth} ${year}`;
  
  // AUDIT LOG: Stamp the beautiful date!
  addAuditLog(req, req.query.ref, `Order dispatch date updated to '${formattedDate}'`);
  
  res.redirect('/cases/case-details?ref=' + req.query.ref);
});

// =========================================================
// OVERVIEW OUTCOME: Sealed order returned (Optional)
// =========================================================
router.get('/cases/overview-outcome/sealed-order', (req, res) => {
  var c = getCase(req); 
  var dateObj = (c.outcomeOverview && c.outcomeOverview.sealedOrderReturnedDate) || {};
  res.render('cases/overview-outcome/sealed-order', { 
    ref: req.query.ref, day: dateObj.day, month: dateObj.month, year: dateObj.year 
  });
});

router.post('/cases/overview-outcome/sealed-order', (req, res) => {
  var c = getCase(req);
  if (!c) return res.redirect('/'); 
  if (!c.outcomeOverview) c.outcomeOverview = {};

  var day = req.body['sealed-order-day'], month = req.body['sealed-order-month'], year = req.body['sealed-order-year'];

  if (!day && !month && !year) {
    c.outcomeOverview.sealedOrderReturnedDate = null; 
    req.session.flashSection = "outcomeOverview"; 

addAuditLog(req, req.query.ref, "Sealed order returned date removed");
    return res.redirect('/cases/case-details?ref=' + req.query.ref); 
  }

  var result = validateAndSaveDate(req, res, 'sealed-order', 'Sealed order returned date', c.outcomeOverview, 'sealedOrderReturnedDate');

  if (result.status === "ERROR") {
    return res.render('cases/overview-outcome/sealed-order', { 
      ref: req.query.ref, day, month, year, errorList: result.errorList, errorFields: result.errorFields 
    });
  }
  
  req.session.flashSection = "outcomeOverview"; 

  // --- FORMAT THE DATE ---
  // 1. Create a lookup list for the months
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // 2. Turn the numerical month (e.g., "3") into the word (e.g., "March")
  // We subtract 1 because arrays start counting at 0!
  const prettyMonth = monthNames[parseInt(month, 10) - 1]; 
  
  // 3. Stick it all together into a pretty string
  const formattedDate = `${day} ${prettyMonth} ${year}`;
  
  // AUDIT LOG: Stamp the beautiful date!
  addAuditLog(req, req.query.ref, `Sealed order date updated to '${formattedDate}'`);
  
  res.redirect('/cases/case-details?ref=' + req.query.ref);
});

// =========================================================
// OVERVIEW OUTCOME: Decision published (Optional)
// =========================================================
router.get('/cases/overview-outcome/decision-published', (req, res) => {
  var c = getCase(req); 
  var dateObj = (c.outcomeOverview && c.outcomeOverview.decisionPublishedDate) || {};
  res.render('cases/overview-outcome/decision-published', { 
    ref: req.query.ref, day: dateObj.day, month: dateObj.month, year: dateObj.year 
  });
});

router.post('/cases/overview-outcome/decision-published', (req, res) => {
  var c = getCase(req);
  if (!c) return res.redirect('/'); 
  if (!c.outcomeOverview) c.outcomeOverview = {};

  var day = req.body['decision-published-day'], month = req.body['decision-published-month'], year = req.body['decision-published-year'];

  if (!day && !month && !year) {
    c.outcomeOverview.decisionPublishedDate = null; 
    req.session.flashSection = "outcomeOverview"; 

addAuditLog(req, req.query.ref, "Decision published date removed");
    return res.redirect('/cases/case-details?ref=' + req.query.ref); 
  }

  var result = validateAndSaveDate(req, res, 'decision-published', 'Decision published date', c.outcomeOverview, 'decisionPublishedDate');

  if (result.status === "ERROR") {
    return res.render('cases/overview-outcome/decision-published', { 
      ref: req.query.ref, day, month, year, errorList: result.errorList, errorFields: result.errorFields 
    });
  }
  
  req.session.flashSection = "outcomeOverview"; 

  // --- FORMAT THE DATE ---
  // 1. Create a lookup list for the months
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // 2. Turn the numerical month (e.g., "3") into the word (e.g., "March")
  // We subtract 1 because arrays start counting at 0!
  const prettyMonth = monthNames[parseInt(month, 10) - 1]; 
  
  // 3. Stick it all together into a pretty string
  const formattedDate = `${day} ${prettyMonth} ${year}`;
  
  // AUDIT LOG: Stamp the beautiful date!
  addAuditLog(req, req.query.ref, `Decision published date updated to '${formattedDate}'`);
  
  res.redirect('/cases/case-details?ref=' + req.query.ref);
});



// ============================================================================= ALL CASES PAGE ==============================================================================

// Catch BOTH the normal page load and the filter submission
router.get(['/cases-page', '/cases-filter'], function (req, res) {
  let cases = req.session.data['cases'] || [];

  // 1. Did the user submit the filter form?
  const isFormSubmit = req.query.isFilterSubmit === 'true';
  
  if (isFormSubmit) {
    // Overwrite the session with the live URL data
    req.session.data['area'] = req.query.area;
    req.session.data['type'] = req.query.type;
    req.session.data['searchCriteria'] = req.query.searchCriteria;

    // --- EXPRESS ARRAY LIMIT FIX ---
    // If the user checks > 20 boxes, Express turns req.query.subtype into an object.
    // We convert it back to a standard array before saving it to the session.
    let rawSubtypes = req.query.subtype;
    if (rawSubtypes && typeof rawSubtypes === 'object' && !Array.isArray(rawSubtypes)) {
      req.session.data['subtype'] = Object.values(rawSubtypes);
    } else {
      req.session.data['subtype'] = rawSubtypes;
    }
  }

  // 2. Clean the arrays (Destroys the '_unchecked' junk AND double-checks the Express bug)
  const cleanArray = (categoryName) => {
    let val = req.session.data[categoryName];
    
    // Auto-heal the session if it somehow got stuck as an object from an older refresh
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      val = Object.values(val);
      req.session.data[categoryName] = val; 
    }

    return [].concat(val || []).filter(item => item && item !== '_unchecked');
  };

  // Run the data through the upgraded cleaner
  const areas = cleanArray('area');
  const types = cleanArray('type');
  const subtypes = cleanArray('subtype');
  const search = req.session.data['searchCriteria'] || "";

  // 3. The Filter Logic (Using "OR" Logic)
  if (areas.length > 0 || types.length > 0 || subtypes.length > 0) {
    cases = cases.filter(c => {
      // Check if the case matches any explicitly checked boxes
      const matchesArea = areas.includes(c.areaValue);
      const matchesType = types.includes(c.typeValue);
      const matchesSubtype = subtypes.includes(c.subtypeValue);

      // If the case hits ANY of the active filters, keep it in the list!
      return matchesArea || matchesType || matchesSubtype;
    });
  }

  // 4. Search Filter
  if (search) {
    cases = cases.filter(c => {
      // Safely extract names from the applicants array of objects
      let applicantsString = "";
      if (Array.isArray(c.applicants)) {
        applicantsString = c.applicants.map(a => {
          return `${a.firstName || ""} ${a.lastName || ""} ${a.companyName || ""}`;
        }).join(" ");
      }

      // Concatenate all searchable fields into one massive string
      const content = (
        (c.reference || "") + 
        (c.caseName || "") + 
        (c.caseStatus || "") + 
        (c.authorityName || "") + 
        (applicantsString)            // Our newly extracted names!
      ).toLowerCase();
      
      return content.includes(search.toLowerCase());
    });
  }
  

// --- 5. PAGINATION LOGIC ---
  const totalCasesCount = cases.length; 
  
  // 1. Bulletproof Items Per Page
  let rawItems = req.query.itemsPerPage || req.session.data['itemsPerPage'];
  let itemsPerPage = parseInt(rawItems, 10);
  if (isNaN(itemsPerPage) || itemsPerPage <= 0) {
    itemsPerPage = 25; // Fallback to 25 if corrupted
  }
  req.session.data['itemsPerPage'] = itemsPerPage; 

  // 2. Bulletproof Current Page
  let rawPage = req.query.page || 1;
  let currentPage = parseInt(rawPage, 10);
  if (isNaN(currentPage) || currentPage <= 0) {
    currentPage = 1;
  }

  // Calculate pages
  const totalPages = Math.ceil(totalCasesCount / itemsPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  // Slice the array
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCases = cases.slice(startIndex, endIndex);

  // Generate smart pagination links for the GOV.UK Macro
  let paginationItems = [];
  
  // 1. Identify which page numbers we actually want to show
  let pagesToShow = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||                   // Always show first page
      i === totalPages ||          // Always show last page
      i === currentPage ||         // Always show current page
      i === currentPage - 1 ||     // Show page immediately before current
      i === currentPage + 1        // Show page immediately after current
    ) {
      pagesToShow.push(i);
    }
  }

  // 2. Build the array with ellipses in the gaps
  let previousPage = null;
  for (let i of pagesToShow) {
    if (previousPage) {
      // If there is a jump between numbers (e.g., from 3 to 5), insert an ellipsis
      if (i - previousPage > 1) {
        paginationItems.push({ ellipsis: true });
      }
    }
    
    // Add the actual page number
    paginationItems.push({
      number: i,
      current: (i === currentPage),
      href: "/cases-filter?page=" + i
    });
    
    previousPage = i;
  }

  // --- 6. RENDER THE PAGE ---
  res.render('cases-page', { 
    cases: paginatedCases, 
    searchTerm: search,
    
    totalCases: totalCasesCount,
    itemsPerPage: itemsPerPage,
    startItem: totalCasesCount === 0 ? 0 : startIndex + 1,
    endItem: Math.min(endIndex, totalCasesCount),
    
    pageItems: paginationItems,
    prevLink: currentPage > 1 ? "/cases-filter?page=" + (currentPage - 1) : null, 
    nextLink: currentPage < totalPages ? "/cases-filter?page=" + (currentPage + 1) : null 
  });
});

// =========================================================
// REMOVE INDIVIDUAL FILTER TAGS
// =========================================================
router.get('/cases/remove-filter/:filterCategory/:filterValue', function(req, res) {
  let category = req.params.filterCategory; // e.g., 'area', 'type', or 'subtype'
  let valueToRemove = req.params.filterValue; // e.g., 'housing'

  // Look up the current array of filters in the session
  let currentFilters = req.session.data[category];

  if (currentFilters) {
    if (Array.isArray(currentFilters)) {
      // If there are multiple checkboxes selected, filter out the one we clicked
      req.session.data[category] = currentFilters.filter(item => item !== valueToRemove);
    } else {
      // If there was only one checkbox selected, wipe it out completely
      if (currentFilters === valueToRemove) {
        req.session.data[category] = null;
      }
    }
  }

  // Redirect back to the cases page to refresh the view
  res.redirect('/cases-filter'); 
});

// --- CLEAR ALL FILTERS ROUTE ---
router.get('/cases/clear-filters', function (req, res) {
  req.session.data['area'] = "";
  req.session.data['type'] = "";
  req.session.data['subtype'] = "";
  req.session.data['searchCriteria'] = "";
  res.redirect('/cases-filter');
});

// --- SECRET ROUTE: GENERATE 130 MIXED DUMMY CASES ---
router.get('/cases/generate-dummy', function (req, res) {
  if (!req.session.data['cases']) {
    req.session.data['cases'] = [];
  }

  // 1. Generate 65 Planning, Environmental and Applications Cases
  for (let i = 1; i <= 65; i++) {
    req.session.data['cases'].push({
      reference: "PLAN/2026/" + i.toString().padStart(4, '0'),
      caseName: "Planning Dummy Case " + i,
      areaValue: "planning-environmental-and-applications",
      typeValue: "drought",
      subtypeValue: "drought-permits",
      caseStatus: "New case",
      authorityName: "Waterways Authority",
      applicants: [{ firstName: "John", lastName: "Doe " + i, companyName: "Aqua Corp" }]
    });
  }

  // 2. Generate 65 Rights of Way and Common Land Cases
  for (let i = 1; i <= 65; i++) {
    req.session.data['cases'].push({
      reference: "ROW/2026/" + i.toString().padStart(4, '0'),
      caseName: "Rights of Way Dummy Case " + i,
      areaValue: "rights-of-way-and-common-land",
      typeValue: "rights-of-way",
      subtypeValue: "schedule-14-appeal",
      caseStatus: "New case",
      authorityName: "Ramblers Council",
      applicants: [{ firstName: "Jane", lastName: "Smith " + i, companyName: "Pathways Ltd" }]
    });
  }

  console.log("✅ Successfully injected 65 Planning and 65 Rights of Way cases!");
  
  // Bounce back to the cases list
  res.redirect('/cases-page');
});


// ==============================================
// CASE NOTES ROUTE
// ==============================================
router.post('/cases/add-case-note', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);
  if (!c) return res.redirect('/');

  var comment = req.body.comment;

  // Only save if they actually typed something!
  if (comment && comment.trim() !== "") {
    
    // Create the caseNotes array if it doesn't exist yet
    if (!c.caseNotes) c.caseNotes = [];

    // Generate the specific date & time format
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
    const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Add the new note to the TOP of the list
    c.caseNotes.unshift({
      text: comment,
      meta: `${timeStr} on ${dateStr} by User Account`
    });

    // Add a record to Case Audit Log too!
    addAuditLog(req, ref, "Case note added");
  }

  // Redirect back to the case details page
  res.redirect('/cases/case-details?ref=' + ref);
});



// ==============================================
// MANAGE CASE FILES (FOLDERS & SUBFOLDERS)
// ==============================================

// We now ONLY pass in caseType, because it's the only variable we need to know what folders to make!
function getDefaultFolders(caseType) {
  
  const createFolder = (id, name, subfolders = []) => {
    return {
      id: id,
      name: name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      subfolders: subfolders.map((subName, index) => ({
        id: `${id}-sub${index + 1}`,
        name: subName,
        slug: subName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }))
    };
  };

  const type = (caseType || "").toLowerCase();

  // 1. RIGHTS OF WAY AND COMMON LAND
  // If the Case Type is Coastal Access or Rights of Way
  if (type.includes('coastal access') || type.includes('rights of way')) {
    return [
      createFolder('f1', 'Letters'),
      createFolder('f2', 'Internal correspondence'),
      createFolder('f3', 'Submissions'),
      createFolder('f4', 'Notices and order documents'),
      createFolder('f5', 'Decision'),
      createFolder('f6', 'Advertised modifications', [
        'Communications',
        'Representations',
        'New Decision'
      ]),
      createFolder('f7', 'Other')
    ];
  } 
  
  // If the Case Type is Common Land
  else if (type.includes('common land')) {
    return [
      createFolder('f1', 'Application documents'),
      createFolder('f2', 'Public representations'),
      createFolder('f3', 'Applicant response to representations'),
      createFolder('f4', 'Correspondence with applicant, representations parties, other parties, registration authority & internal/inspector'),
      createFolder('f5', 'Hearing documents'),
      createFolder('f6', 'Decision'),
      createFolder('f7', 'Other')
    ];
  }

  // 2. PLANNING AND ENVIRONMENTAL APPLICATIONS (Default Fallback for Drought, CPOs, Wayleaves, etc.)
  return [
    createFolder('f1', 'Initial documentation'),
    createFolder('f2', 'Procedure'),
    createFolder('f3', 'Statements of case / final comments', [
      'Statements of case',
      'Final comments'
    ]),
    createFolder('f4', 'Proofs of evidence, Rebuttals and Statement of Common Ground (if inquiry)'),
    createFolder('f5', 'Start Date Letters'),
    createFolder('f6', 'Events information and notifications', [
      'Pre-inquiry meeting or Case management conference',
      'Site Visit information (if written reps)',
      'Inquiry notice'
    ]),
    createFolder('f7', 'Decision / report'),
    createFolder('f8', 'Invoice'),
    createFolder('f9', 'Costs'),
    createFolder('f10', 'Other')
  ];
}

// ROUTE: View Main Folders List (Updated to catch delete banner)
router.get('/cases/manage-folders', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  // FIX: If the case has no folders, generate the defaults based on its case type!
  if (!currentCase.folders) {
    // Note: Use whatever variable your case uses for its type (e.g., currentCase.type or currentCase.caseType)
    var caseType = currentCase.type || currentCase.caseType || "";
    currentCase.folders = getDefaultFolders(caseType);
  }

  var successBanner = req.session.data['folderCreated'];
  var deleteBanner = req.session.data['folderDeleted']; 
  
  if (successBanner) delete req.session.data['folderCreated'];
  if (deleteBanner) delete req.session.data['folderDeleted'];

  res.render('cases/manage-folders/index', {
    currentCase: currentCase,
    successBanner: successBanner,
    deleteBanner: deleteBanner
  });
});

// ROUTE: View Inside a Specific Folder (Updated to catch delete banner)
router.get('/cases/manage-folders/view/:folderId/:folderSlug', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var activeFolder = null;
  var parentFolder = null; 

  for (let f of currentCase.folders) {
    if (f.id === folderId) { activeFolder = f; break; }
    if (f.subfolders) {
      let sub = f.subfolders.find(s => s.id === folderId);
      if (sub) { activeFolder = sub; parentFolder = f; break; }
    }
  }

  if (!activeFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);

// Catch ALL success banners
  var successBanner = req.session.data['folderCreated'];
  var renameBanner = req.session.data['folderRenamed'];
  var deleteBanner = req.session.data['folderDeleted'];
  var updateBanner = req.session.data['folderUpdated'];
  var moveBanner = req.session.data['filesMovedBanner'];
  var downloadBanner = req.session.data['filesDownloadedBanner'];
  var bulkDeleteBanner = req.session.data['filesBulkDeletedBanner'];
  
  // NEW: Catch the move error
  var moveFileError = req.session.data['moveFileError'];
  
  if (successBanner) delete req.session.data['folderCreated'];
  if (renameBanner) delete req.session.data['folderRenamed'];
  if (deleteBanner) delete req.session.data['folderDeleted'];
  if (updateBanner) delete req.session.data['folderUpdated'];
  if (moveBanner) delete req.session.data['filesMovedBanner'];
  if (downloadBanner) delete req.session.data['filesDownloadedBanner'];
  if (bulkDeleteBanner) delete req.session.data['filesBulkDeletedBanner'];
  
  // NEW: Process the error and clear it
  let errorList = null;
  if (moveFileError) {
    errorList = [{ text: moveFileError, href: "#checkboxes-all" }];
    delete req.session.data['moveFileError'];
  }

// --- PAGINATION LOGIC ---
  var documents = activeFolder.documents || [];
  const totalDocsCount = documents.length; 
  
  // Items Per Page
  let rawItems = req.query.itemsPerPage || req.session.data['folderItemsPerPage'];
  let itemsPerPage = parseInt(rawItems, 10);
  if (isNaN(itemsPerPage) || itemsPerPage <= 0) itemsPerPage = 25;
  req.session.data['folderItemsPerPage'] = itemsPerPage; 

  // Current Page
  let rawPage = req.query.page || 1;
  let currentPage = parseInt(rawPage, 10);
  if (isNaN(currentPage) || currentPage <= 0) currentPage = 1;

  const totalPages = Math.ceil(totalDocsCount / itemsPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  // Slice the array for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = documents.slice(startIndex, endIndex);

  // Generate smart pagination links
  let paginationItems = [];
  let pagesToShow = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || i === currentPage || i === currentPage - 1 || i === currentPage + 1) {
      pagesToShow.push(i);
    }
  }

  let previousPage = null;
  // Base URL for pagination links so we don't lose the folder or case reference!
  let baseUrl = `/cases/manage-folders/view/${activeFolder.id}/${activeFolder.slug}?ref=${ref}`;

  for (let i of pagesToShow) {
    if (previousPage && i - previousPage > 1) {
      paginationItems.push({ ellipsis: true });
    }
    paginationItems.push({
      number: i,
      current: (i === currentPage),
      href: `${baseUrl}&page=${i}`
    });
    previousPage = i;
  }

  res.render('cases/manage-folders/view', {
    currentCase: currentCase,
    folder: activeFolder,
    parentFolder: parentFolder,
    successBanner: successBanner,
    renameBanner: renameBanner,
    deleteBanner: deleteBanner,
    updateBanner: updateBanner,
    moveBanner: moveBanner,
    errorList: errorList,
    downloadBanner: downloadBanner,
    bulkDeleteBanner: bulkDeleteBanner,
    
    // Pagination variables passed to the template
    paginatedDocuments: paginatedDocuments, 
    totalDocs: totalDocsCount,
    itemsPerPage: itemsPerPage,
    startItem: totalDocsCount === 0 ? 0 : startIndex + 1,
    endItem: Math.min(endIndex, totalDocsCount),
    pageItems: paginationItems,
    prevLink: currentPage > 1 ? `${baseUrl}&page=${currentPage - 1}` : null, 
    nextLink: currentPage < totalPages ? `${baseUrl}&page=${currentPage + 1}` : null 
  });
});

// ==============================================
// DELETE A FOLDER
// ==============================================

// 1. View the Delete form
router.get('/cases/manage-folders/view/:folderId/:folderSlug/delete', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var activeFolder = null;
  var parentFolder = null; 

  for (let f of currentCase.folders) {
    if (f.id === folderId) { activeFolder = f; break; }
    if (f.subfolders) {
      let sub = f.subfolders.find(s => s.id === folderId);
      if (sub) { activeFolder = sub; parentFolder = f; break; }
    }
  }

  if (!activeFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);

  res.render('cases/manage-folders/delete-folder', {
    currentCase: currentCase,
    folder: activeFolder,
    parentFolder: parentFolder
  });
});

// 2. Submit the Delete form
router.post('/cases/manage-folders/view/:folderId/:folderSlug/delete', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var activeFolder = null;
  var parentFolder = null; 

  for (let f of currentCase.folders) {
    if (f.id === folderId) { activeFolder = f; break; }
    if (f.subfolders) {
      let sub = f.subfolders.find(s => s.id === folderId);
      if (sub) { activeFolder = sub; parentFolder = f; break; }
    }
  }

  if (!activeFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);

  // VALIDATION: Check for subfolders and documents
  var issues = [];
  if (activeFolder.subfolders && activeFolder.subfolders.length > 0) {
    issues.push("It contains subfolders");
  }
  // Check if documents array exists and has items (ready for when you add files)
  if (activeFolder.documents && activeFolder.documents.length > 0) {
    issues.push("It contains documents");
  }

  if (issues.length > 0) {
    return res.render('cases/manage-folders/delete-folder', {
      currentCase: currentCase,
      folder: activeFolder,
      parentFolder: parentFolder,
      deleteIssues: issues // Pass issues to the template
    });
  }

  // EXECUTE DELETION
  var deletedName = activeFolder.name;
  
  if (parentFolder) {
    // It's a subfolder, remove it from the parent's array
    parentFolder.subfolders = parentFolder.subfolders.filter(f => f.id !== folderId);
  } else {
    // It's a main folder, remove it from the case's array
    currentCase.folders = currentCase.folders.filter(f => f.id !== folderId);
  }

  addAuditLog(req, ref, `Folder deleted: ${deletedName}`);
  req.session.data['folderDeleted'] = deletedName;

  req.session.save(function(err) {
    // Redirect logic: If deleted a main folder, go to root. If subfolder, go to parent.
    if (parentFolder) {
      res.redirect(`/cases/manage-folders/view/${parentFolder.id}/${parentFolder.slug}?ref=${ref}`);
    } else {
      res.redirect(`/cases/manage-folders?ref=${ref}`);
    }
  });
});

// ==============================================
// HIDDEN UTILITY: GENERATE DUMMY FILES
// ==============================================
router.get('/cases/manage-folders/view/:folderId/:folderSlug/generate-dummy', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var activeFolder = null;
  for (let f of currentCase.folders) {
    if (f.id === folderId) { activeFolder = f; break; }
    if (f.subfolders) {
      let sub = f.subfolders.find(s => s.id === folderId);
      if (sub) { activeFolder = sub; break; }
    }
  }
  if (!activeFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  if (!activeFolder.documents) activeFolder.documents = [];

  var fileTypes = ["PDF", "DOCX", "XLSX", "JPG", "PNG"];

  // Generate 65 files to easily test 3 pages (at 25 per page)
  for (let i = 1; i <= 65; i++) {
    var type = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    var randomSizeNum = Math.floor(Math.random() * 5000) + 50; 
    var sizeLabel = randomSizeNum > 1000 ? (randomSizeNum / 1000).toFixed(1) + "MB" : randomSizeNum + "KB";

    activeFolder.documents.push({
      id: 'dummy-doc-' + Date.now() + '-' + i,
      name: `Generated Test File ${i}.${type.toLowerCase()}`,
      type: type,
      sizeNum: randomSizeNum,
      size: sizeLabel,
      dateTimestamp: Date.now() - (i * 100000), 
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    });
  }

  // Redirect instantly back to the folder
  res.redirect(`/cases/manage-folders/view/${activeFolder.id}/${activeFolder.slug}?ref=${ref}`);
});

// ==============================================
// UPLOAD FILES
// ==============================================

// 1. View the Upload form
router.get('/cases/manage-folders/view/:folderId/:folderSlug/upload', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var activeFolder = null;
  for (let f of currentCase.folders) {
    if (f.id === folderId) { activeFolder = f; break; }
    if (f.subfolders) {
      let sub = f.subfolders.find(s => s.id === folderId);
      if (sub) { activeFolder = sub; break; }
    }
  }

  if (!activeFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);

  res.render('cases/manage-folders/upload', {
    currentCase: currentCase,
    folder: activeFolder
  });
});

// 2. AJAX Endpoint: Mock the individual file upload for the MOJ component
router.post('/cases/manage-folders/view/:folderId/:folderSlug/upload/document', function(req, res) {
  // In a real app, you would process the file here. 
  // For the prototype, we just tell the MOJ component "Success!"
  res.json({
    success: { messageText: "File uploaded successfully" },
    file: { originalname: "uploaded-file.pdf", filename: "file-" + Date.now() }
  });
});

// 3. AJAX Endpoint: Mock the individual file deletion for the MOJ component
router.post('/cases/manage-folders/view/:folderId/:folderSlug/upload/delete', function(req, res) {
  res.json({ success: { messageText: "File deleted" } });
});

// 4. Submit the FINAL form (Clicking the main "Upload" button)
router.post('/cases/manage-folders/view/:folderId/:folderSlug/upload', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var activeFolder = null;
  for (let f of currentCase.folders) {
    if (f.id === folderId) { activeFolder = f; break; }
    if (f.subfolders) {
      let sub = f.subfolders.find(s => s.id === folderId);
      if (sub) { activeFolder = sub; break; }
    }
  }
  if (!activeFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);

  // Grab the hidden inputs passed from our mock UI
  var uploadedFiles = req.body.mockFiles;

  // VALIDATION: Did they click upload with nothing selected?
  if (!uploadedFiles || uploadedFiles.length === 0) {
    return res.render('cases/manage-folders/upload', {
      currentCase: currentCase,
      folder: activeFolder,
      errorList: [{ text: "Select a file to upload", href: "#mock-choose-files-btn" }]
    });
  }

  // Ensure it's an array (if they only upload 1 file, it comes through as a string)
  if (!Array.isArray(uploadedFiles)) {
    uploadedFiles = [uploadedFiles];
  }

  if (!activeFolder.documents) activeFolder.documents = [];

  // Create a document object for every valid mock file they selected
  for (let fileName of uploadedFiles) {
    var ext = fileName.split('.').pop().toUpperCase();
    
    activeFolder.documents.unshift({
      id: 'doc-' + Date.now() + Math.floor(Math.random() * 1000),
      name: fileName,
      type: ext,
      sizeNum: 11, // Mock size for sorting
      size: "11KB", // Mock size for display
      dateTimestamp: Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    });
  }

  addAuditLog(req, ref, `${uploadedFiles.length} file(s) uploaded to folder: ${activeFolder.name}`);
  req.session.data['folderUpdated'] = true;

  req.session.save(function(err) {
    res.redirect(`/cases/manage-folders/view/${activeFolder.id}/${activeFolder.slug}?ref=${ref}`);
  });
});

// ==============================================
// MOVE FILES JOURNEY
// ==============================================

// 1. INITIATE MOVE: Catch POST from the main folder view table
router.post('/cases/manage-folders/view/:folderId/:folderSlug/move-files', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;
  
  // FIX: Strip out the GOV.UK '_unchecked' artifact
  var rawSelected = req.body.selectedFiles || req.session.data['selectedFiles'];
  var selectedFiles = [];
  if (rawSelected) {
    var arr = Array.isArray(rawSelected) ? rawSelected : [rawSelected];
    selectedFiles = arr.filter(item => item && item !== '_unchecked');
  }
  
  if (selectedFiles.length === 0) {
    req.session.data['moveFileError'] = "Select file(s) to move";
    return req.session.save(function() {
      res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`); 
    });
  }

  req.session.data['filesToMove'] = selectedFiles;
  res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}/move-files/step-1?ref=${ref}`);
});

// STEP 1: View Selected Files
router.get('/cases/manage-folders/view/:folderId/:folderSlug/move-files/step-1', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var activeFolder = null;
  for (let f of currentCase.folders) {
    if (f.id === folderId) { activeFolder = f; break; }
    if (f.subfolders) {
      let sub = f.subfolders.find(s => s.id === folderId);
      if (sub) { activeFolder = sub; break; }
    }
  }

  var fileIdsToMove = req.session.data['filesToMove'] || [];
  // Filter the actual document objects so we can display their names
  var docsToMove = (activeFolder.documents || []).filter(d => fileIdsToMove.includes(d.id));

  res.render('cases/manage-folders/move-1-files', {
    currentCase: currentCase,
    folder: activeFolder,
    docsToMove: docsToMove
  });
});

// STEP 2: Choose Destination Location
router.get('/cases/manage-folders/view/:folderId/:folderSlug/move-files/location', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);

  var activeFolder = null;
  for (let f of currentCase.folders) {
    if (f.id === folderId) { activeFolder = f; break; }
    if (f.subfolders) {
      let sub = f.subfolders.find(s => s.id === folderId);
      if (sub) { activeFolder = sub; break; }
    }
  }

  res.render('cases/manage-folders/move-2-location', {
    currentCase: currentCase,
    folder: activeFolder,
    allFolders: currentCase.folders // Pass all folders to build the radio tree
  });
});

router.post('/cases/manage-folders/view/:folderId/:folderSlug/move-files/location', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug; // <-- FIX: Capture the actual slug!
  var destinationId = req.body.destinationFolderId;

  if (!destinationId) {
    return res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}/move-files/location?ref=${ref}`);
  }

  req.session.data['moveDestinationId'] = destinationId;
  res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}/move-files/check?ref=${ref}`);
});

// STEP 3: Check Details & Execute
router.get('/cases/manage-folders/view/:folderId/:folderSlug/move-files/check', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);

  var activeFolder = null;
  for (let f of currentCase.folders) {
    if (f.id === folderId) { activeFolder = f; break; }
    if (f.subfolders) {
      let sub = f.subfolders.find(s => s.id === folderId);
      if (sub) { activeFolder = sub; break; }
    }
  }

  // Find the destination folder so we can show its name
  var destId = req.session.data['moveDestinationId'];
  var destFolder = null;
  var destParent = null;

  for (let f of currentCase.folders) {
    if (f.id === destId) { destFolder = f; break; }
    if (f.subfolders) {
      let sub = f.subfolders.find(s => s.id === destId);
      if (sub) { destFolder = sub; destParent = f; break; }
    }
  }

  res.render('cases/manage-folders/move-3-check', {
    currentCase: currentCase,
    folder: activeFolder,
    destFolder: destFolder,
    destParent: destParent
  });
});

router.post('/cases/manage-folders/view/:folderId/:folderSlug/move-files/check', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);

  // 1. Find Source Folder
  var sourceFolder = null;
  for (let f of currentCase.folders) {
    if (f.id === folderId) { sourceFolder = f; break; }
    if (f.subfolders) {
      let sub = f.subfolders.find(s => s.id === folderId);
      if (sub) { sourceFolder = sub; break; }
    }
  }

  // 2. Find Destination Folder
  var destId = req.session.data['moveDestinationId'];
  var destFolder = null;
  for (let f of currentCase.folders) {
    if (f.id === destId) { destFolder = f; break; }
    if (f.subfolders) {
      let sub = f.subfolders.find(s => s.id === destId);
      if (sub) { destFolder = sub; break; }
    }
  }

  // 3. Perform the move
  var fileIdsToMove = req.session.data['filesToMove'] || [];
  var extractedDocs = [];

  // Remove from source
  sourceFolder.documents = sourceFolder.documents.filter(d => {
    if (fileIdsToMove.includes(d.id)) {
      extractedDocs.push(d);
      return false; // exclude from source
    }
    return true; // keep in source
  });

  // Add to destination
  if (!destFolder.documents) destFolder.documents = [];
  destFolder.documents.unshift(...extractedDocs); // Add to top

  // Clean up session
  req.session.data['filesToMove'] = null;
  req.session.data['moveDestinationId'] = null;

  // Set the success banner
  req.session.data['filesMovedBanner'] = { count: extractedDocs.length, destName: destFolder.name };
  
  req.session.save(function(err) {
    res.redirect(`/cases/manage-folders/view/${sourceFolder.id}/${sourceFolder.slug}?ref=${ref}`);
  });
});

// ==============================================
// BULK DOWNLOAD (Dummy Mock)
// ==============================================
router.post('/cases/manage-folders/view/:folderId/:folderSlug/download-selected', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;
  
  // FIX: Strip out the GOV.UK '_unchecked' artifact
  var rawSelected = req.body.selectedFiles || req.session.data['selectedFiles'];
  var selectedFiles = [];
  if (rawSelected) {
    var arr = Array.isArray(rawSelected) ? rawSelected : [rawSelected];
    selectedFiles = arr.filter(item => item && item !== '_unchecked');
  }

  if (selectedFiles.length === 0) {
    req.session.data['moveFileError'] = "Select file(s) to download";
    return req.session.save(() => res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`));
  }

  // Pass the correct length!
  req.session.data['filesDownloadedBanner'] = selectedFiles.length;
  req.session.save(() => res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`));
});

// ==============================================
// BULK DELETE
// ==============================================

// 1. INITIATE BULK DELETE
router.post('/cases/manage-folders/view/:folderId/:folderSlug/delete-selected', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;
  
  // FIX: Strip out the GOV.UK '_unchecked' artifact
  var rawSelected = req.body.selectedFiles || req.session.data['selectedFiles'];
  var selectedFiles = [];
  if (rawSelected) {
    var arr = Array.isArray(rawSelected) ? rawSelected : [rawSelected];
    selectedFiles = arr.filter(item => item && item !== '_unchecked');
  }

  if (selectedFiles.length === 0) {
    req.session.data['moveFileError'] = "Select file(s) to delete";
    return req.session.save(() => res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`));
  }

  req.session.data['filesToDelete'] = selectedFiles;
  res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}/delete-selected/confirm?ref=${ref}`);
});

// 2. VIEW BULK DELETE CONFIRMATION
router.get('/cases/manage-folders/view/:folderId/:folderSlug/delete-selected/confirm', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);

  var activeFolder = null;
  for (let f of currentCase.folders) {
    if (f.id === folderId) { activeFolder = f; break; }
    if (f.subfolders) {
      let sub = f.subfolders.find(s => s.id === folderId);
      if (sub) { activeFolder = sub; break; }
    }
  }

  var fileIdsToDelete = req.session.data['filesToDelete'] || [];
  var docsToDelete = (activeFolder.documents || []).filter(d => fileIdsToDelete.includes(d.id));

  res.render('cases/manage-folders/delete-selected', {
    currentCase: currentCase,
    folder: activeFolder,
    docsToDelete: docsToDelete
  });
});

// 3. EXECUTE BULK DELETE
router.post('/cases/manage-folders/view/:folderId/:folderSlug/delete-selected/confirm', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);

  var activeFolder = null;
  for (let f of currentCase.folders) {
    if (f.id === folderId) { activeFolder = f; break; }
    if (f.subfolders) {
      let sub = f.subfolders.find(s => s.id === folderId);
      if (sub) { activeFolder = sub; break; }
    }
  }

  var fileIdsToDelete = req.session.data['filesToDelete'] || [];
  
  // Identify EXACTLY how many real files we are deleting
  var docsToDelete = (activeFolder.documents || []).filter(d => fileIdsToDelete.includes(d.id));
  var actualDeletedCount = docsToDelete.length;

  // Filter out the deleted documents from the folder
  activeFolder.documents = activeFolder.documents.filter(d => !fileIdsToDelete.includes(d.id));

  req.session.data['filesToDelete'] = null;
  addAuditLog(req, ref, `${actualDeletedCount} file(s) bulk deleted from ${activeFolder.name}`);

  // FIX: Set success banner using the true file count!
  req.session.data['filesBulkDeletedBanner'] = actualDeletedCount;
  
  req.session.save(() => res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`));
});

// ==============================================
// RENAME A FOLDER
// ==============================================

// 1. View the Rename form
router.get('/cases/manage-folders/view/:folderId/:folderSlug/rename', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var activeFolder = null;
  var parentFolder = null; 

  for (let f of currentCase.folders) {
    if (f.id === folderId) { activeFolder = f; break; }
    if (f.subfolders) {
      let sub = f.subfolders.find(s => s.id === folderId);
      if (sub) { activeFolder = sub; parentFolder = f; break; }
    }
  }

  if (!activeFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);

  res.render('cases/manage-folders/rename-folder', {
    currentCase: currentCase,
    folder: activeFolder,
    parentFolder: parentFolder
  });
});

// 2. Submit the Rename form
router.post('/cases/manage-folders/view/:folderId/:folderSlug/rename', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var newFolderName = req.body.folderName;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var activeFolder = null;
  var parentFolder = null; 

  for (let f of currentCase.folders) {
    if (f.id === folderId) { activeFolder = f; break; }
    if (f.subfolders) {
      let sub = f.subfolders.find(s => s.id === folderId);
      if (sub) { activeFolder = sub; parentFolder = f; break; }
    }
  }

  if (!activeFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);

  var renderError = (msg) => {
    return res.render('cases/manage-folders/rename-folder', {
      currentCase: currentCase,
      folder: activeFolder,
      parentFolder: parentFolder,
      folderName: newFolderName, // Keep what they typed
      errorList: [{ text: msg, href: "#folderName" }]
    });
  };

  // Validation
  if (!newFolderName || newFolderName.trim() === '') return renderError("Enter a folder name");
  
  var cleanName = newFolderName.trim();
  if (cleanName.length < 3 || cleanName.length > 255) return renderError("Folder name must be between 3 and 255 characters");
  
  var validCharsRegex = /^[a-zA-Z0-9 _\-']+$/;
  if (!validCharsRegex.test(cleanName)) {
    return renderError("Folder name must only include letters a to z, numbers and special characters such as spaces, underscores, hyphens and apostrophes");
  }

  // Duplicate check (ensure we only check siblings in the exact same level, and exclude THIS folder)
  var siblingsList = parentFolder ? parentFolder.subfolders : currentCase.folders;
  var isDuplicate = siblingsList.some(f => f.name.toLowerCase() === cleanName.toLowerCase() && f.id !== folderId);
  
  if (isDuplicate) return renderError("A folder with this name already exists");

  // Save the old name for the audit log
  var oldName = activeFolder.name;

  // Update the folder
  activeFolder.name = cleanName;
  activeFolder.slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  addAuditLog(req, ref, `Folder renamed: ${oldName} to ${cleanName}`);

  // Save to session to trigger the banner
  req.session.data['folderRenamed'] = activeFolder;

  // Force session save and redirect to the NEW slug URL
  req.session.save(function(err) {
    res.redirect(`/cases/manage-folders/view/${activeFolder.id}/${activeFolder.slug}?ref=${ref}`);
  });
});

// ==============================================
// CREATE A SUBFOLDER
// ==============================================

// 1. View the Create Subfolder form
router.get('/cases/manage-folders/view/:folderId/:folderSlug/create-subfolder', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var parentFolder = currentCase.folders.find(f => f.id === folderId);
  if (!parentFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);

  res.render('cases/manage-folders/create-subfolder', {
    currentCase: currentCase,
    parentFolder: parentFolder
  });
});

// 2. Submit the Create Subfolder form
router.post('/cases/manage-folders/view/:folderId/:folderSlug/create-subfolder', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;
  var folderName = req.body.folderName;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var parentFolder = currentCase.folders.find(f => f.id === folderId);
  if (!parentFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);

  // Helper function to render errors cleanly
  var renderError = (msg) => {
    return res.render('cases/manage-folders/create-subfolder', {
      currentCase: currentCase,
      parentFolder: parentFolder,
      folderName: folderName, // Keep what they typed
      errorList: [{ text: msg, href: "#folderName" }]
    });
  };

  // Validation 1: Empty check
  if (!folderName || folderName.trim() === '') {
    return renderError("Enter a folder name");
  }

  var cleanFolderName = folderName.trim();

  // Validation 2: Length check (3 to 255)
  if (cleanFolderName.length < 3 || cleanFolderName.length > 255) {
    return renderError("Folder name must be between 3 and 255 characters");
  }

  // Validation 3: Allowed characters only
  var validCharsRegex = /^[a-zA-Z0-9 _\-']+$/;
  if (!validCharsRegex.test(cleanFolderName)) {
    return renderError("Folder name must only include letters a to z, numbers and special characters such as spaces, underscores, hyphens and apostrophes");
  }

  // Ensure subfolders array exists
  if (!parentFolder.subfolders) parentFolder.subfolders = [];

  // Validation 4: Duplicate check
  var isDuplicate = parentFolder.subfolders.some(f => f.name.toLowerCase() === cleanFolderName.toLowerCase());
  if (isDuplicate) {
    return renderError("A folder with this name already exists");
  }

  // Create the subfolder
  var newId = parentFolder.id + '-sub-' + Date.now();
  var newSlug = cleanFolderName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  var newSubfolder = {
    id: newId,
    name: cleanFolderName,
    slug: newSlug
  };

  parentFolder.subfolders.push(newSubfolder);

  // Add to Audit Log
  addAuditLog(req, ref, `Subfolder created: ${cleanFolderName} (in ${parentFolder.name})`);

  // Set success banner data
  req.session.data['folderCreated'] = newSubfolder;

  // Redirect back to the parent folder view
  res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`);
});

// ==============================================
// CREATE A MAIN FOLDER
// ==============================================

// 1. View the Create Folder form
router.get('/cases/manage-folders/create', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  res.render('cases/manage-folders/create', {
    currentCase: currentCase
  });
});

// 2. Submit the Create Folder form
router.post('/cases/manage-folders/create', function(req, res) {
  var ref = req.query.ref;
  var folderName = req.body.folderName;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  // Validation 1: Check if it's empty
  if (!folderName || folderName.trim() === '') {
    return res.render('cases/manage-folders/create', {
      currentCase: currentCase,
      errorList: [{ text: "Enter a folder name", href: "#folderName" }]
    });
  }

  var cleanFolderName = folderName.trim();

  // Validation 2: Check if duplicate
  var isDuplicate = currentCase.folders.some(f => f.name.toLowerCase() === cleanFolderName.toLowerCase());
  
  if (isDuplicate) {
    return res.render('cases/manage-folders/create', {
      currentCase: currentCase,
      folderName: cleanFolderName,
      errorList: [{ text: "A folder with this name already exists", href: "#folderName" }]
    });
  }

  // Create the new folder object
  var newId = 'f-' + Date.now();
  var newSlug = cleanFolderName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  var newFolder = {
    id: newId,
    name: cleanFolderName,
    slug: newSlug,
    subfolders: []
  };

  currentCase.folders.push(newFolder);

  // LOG TO AUDIT LOG
  addAuditLog(req, ref, "Folder created: " + cleanFolderName);

  // Save the folder securely in the session data
  req.session.data['folderCreated'] = newFolder;

  // Redirect cleanly without any messy URL parameters
  res.redirect(`/cases/manage-folders?ref=${ref}`);
});

// ==============================================
// DELETE A FILE
// ==============================================

// 1. View Delete File Confirmation
router.get('/cases/manage-folders/view/:folderId/:folderSlug/:docId/delete', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var docId = req.params.docId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  // Find the active folder
  var activeFolder = null;
  for (let f of currentCase.folders) {
    if (f.id === folderId) { activeFolder = f; break; }
    if (f.subfolders) {
      let sub = f.subfolders.find(s => s.id === folderId);
      if (sub) { activeFolder = sub; break; }
    }
  }
  if (!activeFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);

  // Find the specific document
  var activeDoc = (activeFolder.documents || []).find(d => d.id === docId);
  if (!activeDoc) return res.redirect(`/cases/manage-folders/view/${activeFolder.id}/${activeFolder.slug}?ref=${ref}`);

  res.render('cases/manage-folders/delete-file', {
    currentCase: currentCase,
    folder: activeFolder,
    doc: activeDoc
  });
});

// 2. Submit Delete File
router.post('/cases/manage-folders/view/:folderId/:folderSlug/:docId/delete', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var docId = req.params.docId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var activeFolder = null;
  for (let f of currentCase.folders) {
    if (f.id === folderId) { activeFolder = f; break; }
    if (f.subfolders) {
      let sub = f.subfolders.find(s => s.id === folderId);
      if (sub) { activeFolder = sub; break; }
    }
  }
  if (!activeFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);

  var activeDoc = (activeFolder.documents || []).find(d => d.id === docId);
  
  if (activeDoc) {
    // Filter out the deleted document from the array
    activeFolder.documents = activeFolder.documents.filter(d => d.id !== docId);
    
    // Add to audit log
    addAuditLog(req, ref, `File deleted: ${activeDoc.name} from ${activeFolder.name}`);
  }

  // Redirect to the success screen
  res.redirect(`/cases/manage-folders/view/${activeFolder.id}/${activeFolder.slug}/file-deleted?ref=${ref}`);
});

// 3. File Deleted Success Page
router.get('/cases/manage-folders/view/:folderId/:folderSlug/file-deleted', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var activeFolder = null;
  for (let f of currentCase.folders) {
    if (f.id === folderId) { activeFolder = f; break; }
    if (f.subfolders) {
      let sub = f.subfolders.find(s => s.id === folderId);
      if (sub) { activeFolder = sub; break; }
    }
  }
  if (!activeFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);

  res.render('cases/manage-folders/file-deleted', {
    currentCase: currentCase,
    folder: activeFolder
  });
});

module.exports = router;




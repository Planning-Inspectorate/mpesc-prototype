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
    res.redirect('/cases/create-a-case/questions/applicant-check-first')
  }

})



router.post('/case-officer-answer', function (req, res) {

  var selectedOfficer = req.session.data['caseOfficer']

  var allowedOfficers = [
      // Original Officers
      "Kieran De La Cruz",
      "Edward Mitchell",
      "Sarah Tudor",
      "Steve Waterfield",
      "Alex Hudd",
      "Harry Wood",
      "Rob Davis",
      "Deborah Board",
      "(Service Account) Automated Tester",
      "Owen Woodwards",
      
      // Marvel Officers
      "Tony Stark",
      "Steve Rogers",
      "Natasha Romanoff",
      "Bruce Banner",
      "Thor Odinson",
      "Wanda Maximoff",
      "Peter Parker",
      "Carol Danvers",
      "Stephen Strange",
      "T'Challa",
      "Clint Barton",
      "Sam Wilson",
      "Bucky Barnes",
      "Scott Lang",
      "Hope van Dyne"
    ];


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

// --- SHARED DUMMY AUTHORITIES LIST ---
const validAuthorities = [
  "Bristol City Council",
  "Camden London Borough Council",
  "Cornwall Council",
  "Manchester City Council",
  "Nottingham City Council",
  "Sheffield City Council",
  "Southwark Council",
  "Wandsworth Borough Council",
  "Westminster City Council",
  "York City Council"
];


// =========================================================
// CREATE A CASE: AUTHORITY
// =========================================================
router.post('/authority-answer', function(req, res) {
  let val = req.body.authorityName;

  // Validation: Only throw error if they typed something AND it's not in the list
  if (val && val.trim() !== "" && !validAuthorities.includes(val)) {
    return res.render('cases/create-a-case/questions/authority', {
      authorityName: val,
      errorAuthority: "Select an authority from the list"
    });
  }

  // Save to session and move to the next question
  req.session.data['authorityName'] = val;
  res.redirect('/cases/create-a-case/questions/case-officer');
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
      "Compulsory Purchase of Common Land": ["COM", "PCL"], "Referred applications from Commons Registration Authorities": ["COM", "REF"], 
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
  var finalRef = "ERROR/REF/100"; 
  var seq = "100" + Math.floor(1 + Math.random() * 99); 

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

// ==============================================
// APPLICANTS LOGIC (Working Draft Pattern)
// ==============================================

// 0. Empty State Page: Check First
router.get('/cases/applicants/start', function(req, res) {
  var ref = req.query.ref;
  var myCase = req.session.data['cases'].find(c => c.reference === ref);
  if (!myCase) return res.redirect('/cases/all-cases');

  req.session.data['tempApplicantsList'] = [];
  res.render('cases/edit/check-applicants-first', { ref: ref });
});

// 1. SHOW THE LIST PAGE (Hub)
router.get('/cases/applicants/hub', function (req, res) {
  var ref = req.query.ref;
  var myCase = req.session.data['cases'].find(c => c.reference === ref);
  if (!myCase.applicants) { myCase.applicants = []; }

  // Clone real data to draft if no draft exists
  if (!req.session.data['tempApplicantsList']) {
    req.session.data['tempApplicantsList'] = JSON.parse(JSON.stringify(myCase.applicants));
  }

  // Clear single-item temp variable
  delete req.session.data['tempApplicant'];

  res.render('cases/edit/check-applicants', { 
    ref: ref,
    applicants: req.session.data['tempApplicantsList'] 
  });
});

// 2. STEP 1: Applicant Name
router.get('/cases/edit/applicant-name', (req, res) => {
  let ref = req.query.ref;
  let id = req.query.id;
  let draftList = req.session.data['tempApplicantsList'] || [];

  if (id && (!req.session.data['tempApplicant'] || req.session.data['tempApplicant'].id !== id)) {
    let existingApp = draftList.find(a => a.id === id);
    if (existingApp) {
      req.session.data['tempApplicant'] = JSON.parse(JSON.stringify(existingApp));
    }
  } else if (!id && !req.session.data['tempApplicant']) {
    req.session.data['tempApplicant'] = {};
  }

  // Dynamic Back URL
  let backUrl = (draftList.length > 0) ? `/cases/applicants/hub?ref=${ref}` : `/cases/applicants/start?ref=${ref}`;

  res.render('cases/create-a-case/questions/applicant-name', { 
    ref: ref, id: id, val: req.session.data['tempApplicant'] || {}, editMode: true, backUrl: backUrl 
  });
});

router.post('/cases/edit/applicant-name', (req, res) => {
  let ref = req.query.ref;
  let id = req.query.id;
  
  let first = req.body.firstName || "";
  let last = req.body.lastName || "";
  let company = req.body.companyName || "";
  
  let errors = {};
  let errorList = [];

  // --- VALIDATION LOGIC ---
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

  // If validation fails, render the page with errors
  if (errorList.length > 0) {
    let draftList = req.session.data['tempApplicantsList'] || [];
    let backUrl = (draftList.length > 0) ? `/cases/applicants/hub?ref=${ref}` : `/cases/applicants/start?ref=${ref}`;

    return res.render('cases/create-a-case/questions/applicant-name', { 
      ref: ref, 
      id: id, 
      val: { firstName: first, lastName: last, companyName: company }, // Preserve what they typed
      errors: errors, 
      errorList: errorList,
      editMode: true, 
      backUrl: backUrl 
    });
  }

  // Success: Save to temp object and proceed
  if (!req.session.data['tempApplicant']) req.session.data['tempApplicant'] = {};
  req.session.data['tempApplicant'].firstName = first;
  req.session.data['tempApplicant'].lastName = last;
  req.session.data['tempApplicant'].companyName = company;

  res.redirect(`/cases/edit/applicant-address?ref=${ref}&id=${id || ''}`);
});

// 3. STEP 2: Applicant Address
router.get('/cases/edit/applicant-address', (req, res) => {
  let ref = req.query.ref;
  let id = req.query.id || '';
  let temp = req.session.data['tempApplicant'] || {};
  
  res.render('cases/create-a-case/questions/applicant-address', { 
    ref: ref, id: id, val: temp, address: temp.address || {}, editMode: true,
    backUrl: `/cases/edit/applicant-name?ref=${ref}&id=${id}` 
  });
});

router.post('/cases/edit/applicant-address', (req, res) => {
  let ref = req.query.ref;
  let id = req.query.id;

  // Run the validation helper
  var result = validateAndSaveAddress(req, res, 'applicant', 'Applicant address', req.session.data['tempApplicant'], 'address');

  // If validation fails
  if (result.status === "ERROR") {
    return res.render('cases/create-a-case/questions/applicant-address', { 
      ref: ref, 
      id: id, 
      val: req.session.data['tempApplicant'],
      address: {
        line1: req.body['applicant-line1'], 
        line2: req.body['applicant-line2'], 
        town: req.body['applicant-town'], 
        county: req.body['applicant-county'], 
        postcode: req.body['applicant-postcode']
      }, // Preserve raw input
      errorList: result.errorList, 
      errorFields: result.errorFields, 
      editMode: true,
      backUrl: `/cases/edit/applicant-name?ref=${ref}&id=${id || ''}`
    });
  }

  // Success: Proceed to next step
  res.redirect(`/cases/edit/applicant-contact?ref=${ref}&id=${id || ''}`);
});

// 4. STEP 3: Applicant Contact & SAVE TO DRAFT
router.get('/cases/edit/applicant-contact', (req, res) => {
  let ref = req.query.ref;
  let id = req.query.id || '';
  
  res.render('cases/create-a-case/questions/applicant-contact', { 
    ref: ref, id: id, val: req.session.data['tempApplicant'] || {}, editMode: true,
    backUrl: `/cases/edit/applicant-address?ref=${ref}&id=${id}` 
  });
});

router.post('/cases/edit/applicant-contact', (req, res) => {
  let ref = req.query.ref;
  let id = req.query.id;
  
  let email = req.body.email || "";
  let phone = req.body.phone || "";

  let errors = {};
  let errorList = [];

  // --- VALIDATION LOGIC ---
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

  // If validation fails, render the page with errors
  if (errorList.length > 0) {
    return res.render('cases/create-a-case/questions/applicant-contact', { 
      ref: ref, 
      id: id, 
      val: { email: email, phone: phone }, // Preserve what they typed
      errors: errors, 
      errorList: errorList,
      editMode: true,
      backUrl: `/cases/edit/applicant-address?ref=${ref}&id=${id || ''}`
    });
  }
  
  // Success: Save to temp object
  if (!req.session.data['tempApplicant']) req.session.data['tempApplicant'] = {};
  req.session.data['tempApplicant'].email = email;
  req.session.data['tempApplicant'].phone = phone;

  // Save to Draft Array
  let draftList = req.session.data['tempApplicantsList'] || [];
  let completedApplicant = req.session.data['tempApplicant'];

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

// ==============================================
// REMOVE APPLICANT (From Draft)
// ==============================================
router.get('/cases/applicants/remove', (req, res) => {
  let id = req.query.id;
  let ref = req.query.ref;
  
  res.render('cases/create-a-case/questions/applicant-remove', { 
    id: id, ref: ref,
    backUrl: `/cases/applicants/hub?ref=${ref}`,
    actionUrl: `/cases/applicants/remove?id=${id}&ref=${ref}`
  });
});

router.post('/cases/applicants/remove', (req, res) => {
  let id = req.query.id;
  let ref = req.query.ref;
  let confirm = req.body.applicantRemove;

  if (!confirm) {
    return res.render('cases/create-a-case/questions/applicant-remove', { 
      id: id, ref: ref, error: true,
      backUrl: `/cases/applicants/hub?ref=${ref}`,
      actionUrl: `/cases/applicants/remove?id=${id}&ref=${ref}`
    });
  }

  if (confirm === 'yes') {
    if (req.session.data['tempApplicantsList']) {
      req.session.data['tempApplicantsList'] = req.session.data['tempApplicantsList'].filter(a => a.id !== id);
    }
  }
  
  res.redirect(`/cases/applicants/hub?ref=${ref}`);
});

// ==============================================
// FINAL COMMIT / CANCEL ACTIONS
// ==============================================

// COMMIT DRAFT: Final Save to Case Details
router.post('/cases/applicants/commit', function(req, res) {
  var ref = req.query.ref;
  var myCase = req.session.data['cases'].find(c => c.reference === ref);

  if (myCase) {
    myCase.applicants = req.session.data['tempApplicantsList'] || [];
  }
  
  req.session.data['tempApplicantsList'] = null;
  req.session.flashSection = "case-details"; 
  res.redirect('/cases/case-details?ref=' + ref);
});

// CANCEL DRAFT: Smart Check
router.get('/cases/applicants/cancel', function(req, res) {
  var ref = req.query.ref;
  var myCase = req.session.data['cases'].find(c => c.reference === ref);

  var originalApps = myCase.applicants || [];
  var draftApps = req.session.data['tempApplicantsList'] || [];

  if (JSON.stringify(originalApps) === JSON.stringify(draftApps)) {
    req.session.data['tempApplicantsList'] = null;
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  res.render('cases/edit/cancel-applicants', { ref: ref });
});

// CANCEL DRAFT: Process Warning Page
router.post('/cases/applicants/cancel', function(req, res) {
  var ref = req.query.ref;
  var confirm = req.body.cancelApplicants;

  if (!confirm) {
    return res.render('cases/edit/cancel-applicants', { ref: ref, error: true });
  }

  if (confirm === 'yes') {
    req.session.data['tempApplicantsList'] = null;
    res.redirect('/cases/case-details?ref=' + ref);
  } else {
    res.redirect('/cases/applicants/hub?ref=' + ref);
  }
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

// --- 6. AUTHORITY (Migrate to authorityName) ---
router.get('/cases/edit/authority', function(req, res) {
  var c = getCase(req);
  var val = c.authorityName || c['authority'];
  res.render('cases/edit/authority', { ref: c.reference, value: val });
});

router.post('/cases/edit/authority', function(req, res) {
  var ref = req.query.ref;
  var val = req.body.authorityName;
  var c = getCase(req);
  
  // Validation
  if (val && val.trim() !== "" && !validAuthorities.includes(val)) {
    return res.render('cases/edit/authority', {
      ref: ref,
      value: val, // keep what they typed so they can fix it
      errorAuthority: "Select an authority from the list"
    });
  }

  c.authorityName = val;
  delete c['authority'];

  req.session.flashSection = "case-details"; 
  addAuditLog(req, ref, "Authority updated to '" + (val || 'None') + "'");
  
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
router.post('/cases/edit/case-status', function(req, res) {
  var ref = req.query.ref;
  var action = req.body.action; // Check if "Remove" was clicked
  var val = req.body.caseStatus;
  var c = getCase(req);

  // 1. Handle Remove
  if (action === 'remove') {
    delete c.caseStatus;
    delete c['case-status'];
    delete c.caseClosedDate; // Clear the closed date if status is removed

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

  // 3. Save Normal Status
  c.caseStatus = val;
  delete c['case-status'];

  // --- 4. NEW LOGIC: SAVE CASE CLOSED DATE ---
  if (val === 'Closed' || val === 'Closed - opened in error') {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
    
    // Save it looking exactly like your audit log (e.g. "24 March 2026 at 10:30am")
    c.caseClosedDate = `${dateStr} at ${timeStr}`;
  } else {
    // If the case is reopened to "In progress" or anything else, wipe the closed date!
    delete c.caseClosedDate;
  }

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

  req.session.flashSection = "overview"; 

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
    "(Service Account) Automated Tester", "Owen Woodwards", "Tony Stark",
    "Steve Rogers",
    "Natasha Romanoff",
    "Bruce Banner",
    "Thor Odinson",
    "Wanda Maximoff",
    "Peter Parker",
    "Carol Danvers",
    "Stephen Strange",
    "T'Challa",
    "Clint Barton",
    "Sam Wilson",
    "Bucky Barnes",
    "Scott Lang",
    "Hope van Dyne"
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


// ==============================================
// INSPECTOR LOGIC (Working Draft Pattern)
// ==============================================

// 0. Empty State Page: Check Inspectors First
router.get('/cases/edit/check-inspectors-first', function(req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases/all-cases');

  // Start with a blank draft
  req.session.data['tempInspectorsList'] = [];

  res.render('cases/edit/check-inspectors-first', {
    ref: req.query.ref
  });
});

// 1. HUB PAGE: Check Inspectors
router.get('/cases/edit/check-inspectors', function (req, res) {
  var c = getCase(req);
  if (!c.inspectors) { c.inspectors = []; }

  // If there is no draft list in the session yet, clone the real data to start working!
  if (!req.session.data['tempInspectorsList']) {
    req.session.data['tempInspectorsList'] = JSON.parse(JSON.stringify(c.inspectors));
  }

  // Clear temp individual data (So "Add details" starts fresh)
  req.session.data['inspectorTemp'] = null; 

  res.render('cases/edit/check-inspectors', { 
    ref: c.reference,
    // Pass the DRAFT list to the UI, not the real list!
    inspectors: req.session.data['tempInspectorsList']
  });
});

// 2. CHANGE ROUTE: Load existing data into session
router.get('/cases/edit/inspector-change', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var draftList = req.session.data['tempInspectorsList'] || [];

  // Find the item in the draft list
  var item = draftList.find(i => i.id === id);

  if (item) {
    req.session.data['inspectorTemp'] = {
      id: item.id,
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

// 6. STEP 2: Inspector Date (POST - Save to Draft)
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

  // --- SUCCESS: SAVE TO DRAFT ---
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var formattedDate = day + " " + months[month - 1] + " " + year;
  
  var temp = req.session.data['inspectorTemp'] || {};
  var draftList = req.session.data['tempInspectorsList'] || [];
  
  var name = temp.name;
  var editingId = temp.id; // Check if we are editing an existing ID

  if (editingId) {
    // UPDATE EXISTING in DRAFT
    var item = draftList.find(i => i.id === editingId);
    if (item) {
      item.name = name;
      item.date = formattedDate;
      item.rawDay = day;
      item.rawMonth = month;
      item.rawYear = year;
    }
  } else {
    // CREATE NEW in DRAFT
    draftList.push({
      id: 'insp-' + Math.floor(Math.random() * 10000),
      name: name,
      date: formattedDate,
      rawDay: day,
      rawMonth: month,
      rawYear: year
    });
  }

  req.session.data['tempInspectorsList'] = draftList;
  req.session.data['inspectorTemp'] = null; // Clear individual temp data

  res.redirect('/cases/edit/check-inspectors?ref=' + ref);
});

// ==============================================
// REMOVE INSPECTOR CONFIRMATION (From Draft)
// ==============================================

// 1. View Confirmation Page (WITH SMART INTERCEPT)
router.get('/cases/edit/inspector-remove', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var c = getCase(req);
  
  // Find out who they are trying to remove
  var draftList = req.session.data['tempInspectorsList'] || [];
  var targetInspector = draftList.find(i => i.id === id);
  var inspName = targetInspector ? targetInspector.name : "";

  // --- SMART INTERCEPT: Check for dependencies ---
  // (Using the exact keys from your procedure/outcome routing)
  var attachedProcs = (c.overviewProcedures || []).filter(p => p.inspector === inspName);
  var attachedOutcomes = (c.outcomes || []).filter(o => o.inspectorName === inspName);

  // If the inspector is attached to anything, block the removal!
  if (attachedProcs.length > 0 || attachedOutcomes.length > 0) {
    var errorList = [];
    
    var hasProc = attachedProcs.length > 0;
    var hasOut = attachedOutcomes.length > 0;

    // 1. Loop through ALL attached procedures and list them
    if (hasProc) {
      attachedProcs.forEach(proc => {
        // Lowercase the whole string first, then capitalize just the first letter
        let rawType = proc.type ? proc.type.toLowerCase() : "procedure";
        let pType = rawType.charAt(0).toUpperCase() + rawType.slice(1);
        
        let pStat = proc.status ? proc.status.toLowerCase() : "unknown status";
        errorList.push({ text: `Inspector is assigned to ${pType} (${pStat}) so cannot be removed.`, href: "#" });
      });
    }

    // 2. Loop through ALL attached outcomes and list them
    if (hasOut) {
      attachedOutcomes.forEach(out => {
        // Lowercase the whole string first, then capitalize just the first letter
        let rawType = out.type ? out.type.toLowerCase() : "outcome";
        let oType = rawType.charAt(0).toUpperCase() + rawType.slice(1);
        
        errorList.push({ text: `Inspector is assigned to ${oType} so cannot be removed.`, href: "#" });
      });
    }

    // 3. Build the final instruction line (with dynamic grammar!)
    var procText = attachedProcs.length > 1 ? "procedures" : "procedure";
    var outText = attachedOutcomes.length > 1 ? "outcomes" : "outcome";

    if (hasProc && !hasOut) {
      errorList.push({ text: `You must assign a different inspector to the ${procText} before you can remove them from the case.`, href: "#" });
    } else if (!hasProc && hasOut) {
      errorList.push({ text: `You must assign a different inspector to the ${outText} before you can remove them from the case.`, href: "#" });
    } else if (hasProc && hasOut) {
      errorList.push({ text: `You must assign a different inspector to the ${procText} and ${outText} before you can remove them from the case.`, href: "#" });
    }

    // Render the check-inspectors Hub page instantly with the generated error messages
    return res.render('cases/edit/check-inspectors', {
      ref: ref,
      inspectors: draftList,
      errorList: errorList
    });
  }

  // --- IF CLEAN, PROCEED TO CONFIRMATION PAGE NORMALLY ---
  res.render('cases/edit/remove-inspectors', { 
    ref: ref,
    id: id,
    backUrl: `/cases/edit/check-inspectors?ref=${ref}`,
    actionUrl: `/cases/edit/inspector-remove?id=${id}&ref=${ref}`
  });
});

// 2. Submit Confirmation
router.post('/cases/edit/inspector-remove', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var confirm = req.body.inspectorRemove; 

  if (!confirm) {
    return res.render('cases/edit/remove-inspectors', { 
      ref: ref,
      id: id, 
      error: true,
      backUrl: `/cases/edit/check-inspectors?ref=${ref}`,
      actionUrl: `/cases/edit/inspector-remove?id=${id}&ref=${ref}`
    });
  }

  if (confirm === 'yes') {
    // Delete from the DRAFT array
    if (req.session.data['tempInspectorsList']) {
      req.session.data['tempInspectorsList'] = req.session.data['tempInspectorsList'].filter(i => i.id !== id);
    }
  }
  
  res.redirect(`/cases/edit/check-inspectors?ref=${ref}`);
});

// ==============================================
// FINAL COMMIT / CANCEL ACTIONS
// ==============================================

// COMMIT DRAFT: User clicked "Save and return"
router.post('/cases/edit/check-inspectors/save', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Overwrite the real database with our working draft
  c.inspectors = req.session.data['tempInspectorsList'] || [];
  
  // Clear the draft completely
  req.session.data['tempInspectorsList'] = null;

  // Flash banner and redirect
  req.session.flashSection = "team"; 
  addAuditLog(req, ref, "Inspector details updated");
  res.redirect('/cases/case-details?ref=' + ref);
});

// CANCEL DRAFT: View Warning Page (Smart Check - INSPECTORS)
router.get('/cases/edit/check-inspectors/cancel', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  var originalInspectors = c.inspectors || [];
  var draftInspectors = req.session.data['tempInspectorsList'] || [];

  var isUnchanged = JSON.stringify(originalInspectors) === JSON.stringify(draftInspectors);

  if (isUnchanged) {
    // NO CHANGES: Silently clear the draft and go straight to case details
    req.session.data['tempInspectorsList'] = null;
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  // CHANGES DETECTED: Render the warning page
  res.render('cases/edit/cancel-inspectors', { 
    ref: ref 
  });
});

// CANCEL DRAFT: Process Warning Page
router.post('/cases/edit/check-inspectors/cancel', function(req, res) {
  var ref = req.query.ref;
  var confirm = req.body.cancelInspectors;

  if (!confirm) {
    return res.render('cases/edit/cancel-inspectors', { ref: ref, error: true });
  }

  if (confirm === 'yes') {
    // Toss the draft in the trash and go to case details
    req.session.data['tempInspectorsList'] = null;
    res.redirect('/cases/case-details?ref=' + ref);
  } else {
    // Take them back to the working list
    res.redirect('/cases/edit/check-inspectors?ref=' + ref);
  }
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
// UNIFIED DYNAMIC PROCEDURE ROUTES
// Handles Procedure 1, Procedure 2, Procedure 3, etc.
// Uses the URL parameter :index to find the right object
// ==============================================

// Helper: Get the specific procedure from the array
function getTargetProcedure(req) {
  var ref = req.body.ref || req.query.ref;

  // 1. SAFELY EXTRACT NUMBER: If the URL says "procedure-1" or "1", force it to just "1"
  var match = req.params.index.match(/\d+/);
  if (match) {
    req.params.index = match[0]; // This instantly fixes the form actions and flash messages too!
  }
  var arrayIndex = parseInt(req.params.index, 10) - 1; // Convert '1' to array index '0'

  var cases = req.session.data['cases'] || [];
  var c = cases.find(x => x.reference === ref);

  if (!c) return { c: null, proc: null };
  if (!c.overviewProcedures) c.overviewProcedures = [];

  // 2. PREVENT DATA LOSS: If the array slot is empty, create the object INSIDE the array
  // This ensures we never save data to a floating, disconnected object.
  if (!c.overviewProcedures[arrayIndex]) {
    c.overviewProcedures[arrayIndex] = {};
  }

  return { c: c, proc: c.overviewProcedures[arrayIndex] };
}

// Helper: Get Procedure name for Audit Log
function getProcName(proc, index) {
  if (!proc || !proc.type) return `Procedure ${index + 1}`;
  let status = proc.status || 'Not Selected'; 
  return `${proc.type} (${status})`;
}

// --- SITE VISIT DATE ---
router.get('/cases/procedures/:index/site-visit', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 

  var val = proc.siteVisit || {}; 

  res.render('cases/procedures/details/site-visit', { // Reusing your existing template!
    ref: c.reference,
    index: req.params.index,
    day: val.day,
    month: val.month,
    year: val.year
  });
});

router.post('/cases/procedures/:index/site-visit', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/');

  var result = validateAndSaveDate(
    req, res,
    'site-visit',
    'Site visit date',
    proc, // Saving directly into the array item!
    'siteVisit'
  );

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    
    if (result.status === "REMOVED") {
      addAuditLog(req, c.reference, `Site visit date for ${procName} removed`);
    } else {
      addAuditLog(req, c.reference, `Site visit date for ${procName} updated to ${proc.siteVisit.formatted}`);
    }

    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/site-visit', {
      ref: c.reference,
      index: req.params.index,
      day: req.body['site-visit-day'],
      month: req.body['site-visit-month'],
      year: req.body['site-visit-year'],
      errorList: result.errorList,
      errorFields: result.errorFields
    });
  }
});


// --- SITE VISIT TYPE ---
router.get('/cases/procedures/:index/site-visit-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 

  res.render('cases/procedures/details/site-visit-type', {
    ref: c.reference,
    index: req.params.index,
    siteVisitType: proc.siteVisitType
  });
});

router.post('/cases/procedures/:index/site-visit-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 

  var action = req.body.action;
  var val = req.body['site-visit-type'];
  let procName = getProcName(proc, parseInt(req.params.index) - 1);

  if (action === 'remove') {
    delete proc.siteVisitType;
    addAuditLog(req, c.reference, `Site visit type for ${procName} removed`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }

  if (!val) {
    return res.render('cases/procedures/details/site-visit-type', {
      ref: c.reference,
      index: req.params.index,
      errorList: [{ text: "Select the type of site visit", href: "#site-visit-type" }]
    });
  }

  proc.siteVisitType = val;
  addAuditLog(req, c.reference, `Site visit type for ${procName} updated to ${val}`);
  
  req.session.flashSection = `procedure-${req.params.index}`;
  res.redirect('/cases/case-details?ref=' + c.reference);
});


// --- IN HOUSE DATE ---
router.get('/cases/procedures/:index/in-house-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 

  var val = proc.inHouse || {}; 

  res.render('cases/procedures/details/in-house-date', {
    ref: c.reference,
    index: req.params.index,
    day: val.day, month: val.month, year: val.year
  });
});

router.post('/cases/procedures/:index/in-house-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/');

  var result = validateAndSaveDate(req, res, 'in-house', 'In house date', proc, 'inHouse');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `In house date for ${procName} removed`);
    else addAuditLog(req, c.reference, `In house date for ${procName} updated to ${proc.inHouse.formatted}`);

    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }

  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/in-house-date', {
      ref: c.reference, index: req.params.index,
      day: req.body['in-house-day'], month: req.body['in-house-month'], year: req.body['in-house-year'],
      errorList: result.errorList, errorFields: result.errorFields
    });
  }
});


// --- TARGET HEARING DATE ---
router.get('/cases/procedures/:index/target-hearing-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.targetHearing || {}; 
  res.render('cases/procedures/details/target-hearing-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/target-hearing-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'target-hearing', 'Target hearing date', proc, 'targetHearing');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Target hearing date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Target hearing date for ${procName} updated to ${proc.targetHearing.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/target-hearing-date', { ref: c.reference, index: req.params.index, day: req.body['target-hearing-day'], month: req.body['target-hearing-month'], year: req.body['target-hearing-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- HEARING NOTIFIED DATE ---
router.get('/cases/procedures/:index/hearing-notified-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.hearingNotified || {}; 
  res.render('cases/procedures/details/hearing-notified-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/hearing-notified-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'hearing-notified', 'Date parties must be notified of hearing', proc, 'hearingNotified');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date parties must be notified of hearing for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date parties must be notified of hearing for ${procName} updated to ${proc.hearingNotified.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/hearing-notified-date', { ref: c.reference, index: req.params.index, day: req.body['hearing-notified-day'], month: req.body['hearing-notified-month'], year: req.body['hearing-notified-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- PROOFS RECEIVED ---
router.get('/cases/procedures/:index/proofs-received', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.proofsReceived || {}; 
  res.render('cases/procedures/details/proofs-received', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/proofs-received', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'proofs-received', 'Proofs of evidence received date', proc, 'proofsReceived');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Proofs of evidence received date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Proofs of evidence received date for ${procName} updated to ${proc.proofsReceived.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/proofs-received', { ref: c.reference, index: req.params.index, day: req.body['proofs-received-day'], month: req.body['proofs-received-month'], year: req.body['proofs-received-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- STATEMENTS OF CASE RECEIVED ---
router.get('/cases/procedures/:index/statements-received', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.statementsReceived || {}; 
  res.render('cases/procedures/details/statements-received', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/statements-received', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'statements-received', 'Statements of case received date', proc, 'statementsReceived');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Statements of case received date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Statements of case received date for ${procName} updated to ${proc.statementsReceived.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/statements-received', { ref: c.reference, index: req.params.index, day: req.body['statements-received-day'], month: req.body['statements-received-month'], year: req.body['statements-received-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- CASE OFFICER VERIFICATION DATE ---
router.get('/cases/procedures/:index/verification-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.verification || {}; 
  res.render('cases/procedures/details/verification-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/verification-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'verification-date', 'Verification date', proc, 'verification');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Verification date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Verification date for ${procName} updated to ${proc.verification.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/verification-date', { ref: c.reference, index: req.params.index, day: req.body['verification-date-day'], month: req.body['verification-date-month'], year: req.body['verification-date-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- CMC DATE (Date & Time) ---
router.get('/cases/procedures/:index/cmc-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.cmcDate || {}; 
  res.render('cases/procedures/details/cmc-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year, hour: val.hour, minute: val.minute, ampm: val.ampm, errorFields: [] });
});

router.post('/cases/procedures/:index/cmc-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDateTime(req, res, 'cmc', 'Case management conference', proc, 'cmcDate');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Case management conference date for ${procName} removed`);
    else {
      let dtStr = proc.cmcDate.formattedDate + (proc.cmcDate.formattedTime ? ' at ' + proc.cmcDate.formattedTime : '');
      addAuditLog(req, c.reference, `Case management conference date for ${procName} updated to ${dtStr}`);
    }
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/cmc-date', { ref: c.reference, index: req.params.index, day: req.body['cmc-day'], month: req.body['cmc-month'], year: req.body['cmc-year'], hour: req.body['cmc-hour'], minute: req.body['cmc-minute'], ampm: req.body['cmc-ampm'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- CMC TYPE ---
router.get('/cases/procedures/:index/cmc-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/cmc-type', { ref: c.reference, index: req.params.index, cmcType: proc.cmcType });
});

router.post('/cases/procedures/:index/cmc-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var val = req.body['cmc-type'];
  let procName = getProcName(proc, parseInt(req.params.index) - 1);

  if (req.body.action === 'remove') {
    delete proc.cmcType;
    addAuditLog(req, c.reference, `Case management conference type for ${procName} removed`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (!val) return res.render('cases/procedures/details/cmc-type', { ref: c.reference, index: req.params.index, errorList: [{ text: "Select the case management conference type", href: "#cmc-type" }] });

  proc.cmcType = val;
  addAuditLog(req, c.reference, `Case management conference type for ${procName} updated to ${val}`);
  req.session.flashSection = `procedure-${req.params.index}`;
  res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- CMC VENUE (Address) ---
router.get('/cases/procedures/:index/cmc-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.cmcVenue || {}; 
  res.render('cases/procedures/details/cmc-venue', { ref: c.reference, index: req.params.index, line1: val.line1, line2: val.line2, town: val.town, county: val.county, postcode: val.postcode, errorFields: [] });
});

router.post('/cases/procedures/:index/cmc-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveAddress(req, res, 'venue', 'Venue address', proc, 'cmcVenue');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Case management venue address for ${procName} removed`);
    else addAuditLog(req, c.reference, `Case management venue address for ${procName} updated to ${proc.cmcVenue.formatted.replace(/<br>/g, ', ')}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/cmc-venue', { ref: c.reference, index: req.params.index, line1: req.body['venue-line1'], line2: req.body['venue-line2'], town: req.body['venue-town'], county: req.body['venue-county'], postcode: req.body['venue-postcode'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- CMC NOTE SENT ---
router.get('/cases/procedures/:index/cmc-note-sent', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.cmcNoteSent || {}; 
  res.render('cases/procedures/details/cmc-note-sent', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/cmc-note-sent', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'cmc-note', 'Case management conference note sent date', proc, 'cmcNoteSent');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Case management conference note sent date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Case management conference note sent date for ${procName} updated to ${proc.cmcNoteSent.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/cmc-note-sent', { ref: c.reference, index: req.params.index, day: req.body['cmc-note-day'], month: req.body['cmc-note-month'], year: req.body['cmc-note-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- CONFIRMED HEARING DATE (Date & Time) ---
router.get('/cases/procedures/:index/confirmed-hearing-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.confirmedHearing || {}; 
  res.render('cases/procedures/details/confirmed-hearing-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year, hour: val.hour, minute: val.minute, ampm: val.ampm, errorFields: [] });
});

router.post('/cases/procedures/:index/confirmed-hearing-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDateTime(req, res, 'confirmed-hearing', 'Confirmed hearing date', proc, 'confirmedHearing');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Confirmed hearing date for ${procName} removed`);
    else {
      let dtStr = proc.confirmedHearing.formattedDate + (proc.confirmedHearing.formattedTime ? ' at ' + proc.confirmedHearing.formattedTime : '');
      addAuditLog(req, c.reference, `Confirmed hearing date for ${procName} updated to ${dtStr}`);
    }
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/confirmed-hearing-date', { ref: c.reference, index: req.params.index, day: req.body['confirmed-hearing-day'], month: req.body['confirmed-hearing-month'], year: req.body['confirmed-hearing-year'], hour: req.body['confirmed-hearing-hour'], minute: req.body['confirmed-hearing-minute'], ampm: req.body['confirmed-hearing-ampm'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- DEADLINE FOR CONSENT ---
router.get('/cases/procedures/:index/deadline-for-consent', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.deadlineForConsent || {}; 
  res.render('cases/procedures/details/deadline-for-consent', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/deadline-for-consent', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'deadline-for-consent', 'Deadline for consent', proc, 'deadlineForConsent');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Deadline for consent for ${procName} removed`);
    else addAuditLog(req, c.reference, `Deadline for consent for ${procName} updated to ${proc.deadlineForConsent.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/deadline-for-consent', { ref: c.reference, index: req.params.index, day: req.body['deadline-for-consent-day'], month: req.body['deadline-for-consent-month'], year: req.body['deadline-for-consent-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- HEARING TYPE ---
router.get('/cases/procedures/:index/hearing-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/hearing-type', { ref: c.reference, index: req.params.index, hearingType: proc.hearingType });
});

router.post('/cases/procedures/:index/hearing-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var val = req.body['hearing-type'];
  let procName = getProcName(proc, parseInt(req.params.index) - 1);

  if (req.body.action === 'remove') {
    delete proc.hearingType;
    addAuditLog(req, c.reference, `Hearing type for ${procName} removed`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (!val) return res.render('cases/procedures/details/hearing-type', { ref: c.reference, index: req.params.index, errorList: [{ text: "Select type of hearing", href: "#hearing-type" }] });

  proc.hearingType = val;
  addAuditLog(req, c.reference, `Hearing type for ${procName} updated to ${val}`);
  req.session.flashSection = `procedure-${req.params.index}`;
  res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- HEARING VENUE (Address) ---
router.get('/cases/procedures/:index/hearing-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.hearingVenue || {}; 
  res.render('cases/procedures/details/hearing-venue', { ref: c.reference, index: req.params.index, line1: val.line1, line2: val.line2, town: val.town, county: val.county, postcode: val.postcode, errorFields: [] });
});

router.post('/cases/procedures/:index/hearing-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveAddress(req, res, 'venue', 'Hearing venue', proc, 'hearingVenue');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Hearing venue for ${procName} removed`);
    else addAuditLog(req, c.reference, `Hearing venue for ${procName} updated to ${proc.hearingVenue.formatted.replace(/<br>/g, ', ')}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/hearing-venue', { ref: c.reference, index: req.params.index, line1: req.body['venue-line1'], line2: req.body['venue-line2'], town: req.body['venue-town'], county: req.body['venue-county'], postcode: req.body['venue-postcode'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- DATE PARTIES NOTIFIED OF HEARING DATE ---
router.get('/cases/procedures/:index/notified-hearing-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.notifiedHearingDate || {}; 
  res.render('cases/procedures/details/notified-hearing-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/notified-hearing-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'notified-date', 'Date parties notified', proc, 'notifiedHearingDate');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date parties notified of hearing date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date parties notified of hearing date for ${procName} updated to ${proc.notifiedHearingDate.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/notified-hearing-date', { ref: c.reference, index: req.params.index, day: req.body['notified-date-day'], month: req.body['notified-date-month'], year: req.body['notified-date-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- DATE PARTIES NOTIFIED OF HEARING VENUE ---
router.get('/cases/procedures/:index/notified-hearing-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.notifiedHearingVenue || {}; 
  res.render('cases/procedures/details/notified-hearing-venue', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/notified-hearing-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'notified-venue', 'Date parties notified of venue', proc, 'notifiedHearingVenue');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date parties notified of hearing venue for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date parties notified of hearing venue for ${procName} updated to ${proc.notifiedHearingVenue.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/notified-hearing-venue', { ref: c.reference, index: req.params.index, day: req.body['notified-venue-day'], month: req.body['notified-venue-month'], year: req.body['notified-venue-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- EARLIEST POTENTIAL HEARING DATE ---
router.get('/cases/procedures/:index/earliest-hearing-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.earliestHearingDate || {}; 
  res.render('cases/procedures/details/earliest-hearing-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/earliest-hearing-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'earliest-date', 'Earliest potential hearing date', proc, 'earliestHearingDate');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Earliest potential hearing date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Earliest potential hearing date for ${procName} updated to ${proc.earliestHearingDate.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/earliest-hearing-date', { ref: c.reference, index: req.params.index, day: req.body['earliest-date-day'], month: req.body['earliest-date-month'], year: req.body['earliest-date-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- HEARING: LENGTH OF EVENT ---
router.get('/cases/procedures/:index/hearing-length-of-event', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/hearing-length-of-event', { ref: c.reference, index: req.params.index, value: proc.hearingLengthOfEvent });
});

router.post('/cases/procedures/:index/hearing-length-of-event', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'length-event', 'Length of event', proc, 'hearingLengthOfEvent');

  if (result.status === "ERROR") return res.render('cases/procedures/details/hearing-length-of-event', { ref: c.reference, index: req.params.index, value: req.body['length-event'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Length of event for ${procName} removed`);
  else addAuditLog(req, c.reference, `Length of event for ${procName} updated to ${proc.hearingLengthOfEvent} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- HEARING IN TARGET? ---
router.get('/cases/procedures/:index/hearing-in-target', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/hearing-in-target', { ref: c.reference, index: req.params.index, hearingInTarget: proc.hearingInTarget });
});

router.post('/cases/procedures/:index/hearing-in-target', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var val = req.body['hearing-in-target'];
  let procName = getProcName(proc, parseInt(req.params.index) - 1);

  if (req.body.action === 'remove') {
    delete proc.hearingInTarget;
    addAuditLog(req, c.reference, `Hearing in target for ${procName} removed`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (!val) return res.render('cases/procedures/details/hearing-in-target', { ref: c.reference, index: req.params.index, errorList: [{ text: "Select yes if the hearing was completed in the target timeframe", href: "#hearing-in-target" }] });

  proc.hearingInTarget = val;
  addAuditLog(req, c.reference, `Hearing in target for ${procName} updated to ${val}`);
  req.session.flashSection = `procedure-${req.params.index}`;
  res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- HEARING CLOSED DATE ---
router.get('/cases/procedures/:index/hearing-closed-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.hearingClosed || {}; 
  res.render('cases/procedures/details/hearing-closed-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/hearing-closed-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'hearing-closed', 'Date hearing closed', proc, 'hearingClosed');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date hearing closed for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date hearing closed for ${procName} updated to ${proc.hearingClosed.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/hearing-closed-date', { ref: c.reference, index: req.params.index, day: req.body['hearing-closed-day'], month: req.body['hearing-closed-month'], year: req.body['hearing-closed-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- HEARING PREPARATION TIME ---
router.get('/cases/procedures/:index/hearing-preparation-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/hearing-preparation-time', { ref: c.reference, index: req.params.index, value: proc.hearingPrepTime });
});

router.post('/cases/procedures/:index/hearing-preparation-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'prep-time', 'Preparation time', proc, 'hearingPrepTime');

  if (result.status === "ERROR") return res.render('cases/procedures/details/hearing-preparation-time', { ref: c.reference, index: req.params.index, value: req.body['prep-time'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Preparation time for ${procName} removed`);
  else addAuditLog(req, c.reference, `Preparation time for ${procName} updated to ${proc.hearingPrepTime} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- HEARING TRAVEL TIME ---
router.get('/cases/procedures/:index/hearing-travel-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/hearing-travel-time', { ref: c.reference, index: req.params.index, value: proc.hearingTravelTime });
});

router.post('/cases/procedures/:index/hearing-travel-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'travel-time', 'Travel time', proc, 'hearingTravelTime');

  if (result.status === "ERROR") return res.render('cases/procedures/details/hearing-travel-time', { ref: c.reference, index: req.params.index, value: req.body['travel-time'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Travel time for ${procName} removed`);
  else addAuditLog(req, c.reference, `Travel time for ${procName} updated to ${proc.hearingTravelTime} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- HEARING SITTING TIME ---
router.get('/cases/procedures/:index/hearing-sitting-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/hearing-sitting-time', { ref: c.reference, index: req.params.index, value: proc.hearingSittingTime });
});

router.post('/cases/procedures/:index/hearing-sitting-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'sitting-time', 'Sitting time', proc, 'hearingSittingTime');

  if (result.status === "ERROR") return res.render('cases/procedures/details/hearing-sitting-time', { ref: c.reference, index: req.params.index, value: req.body['sitting-time'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Sitting time for ${procName} removed`);
  else addAuditLog(req, c.reference, `Sitting time for ${procName} updated to ${proc.hearingSittingTime} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- HEARING REPORTING TIME---
router.get('/cases/procedures/:index/hearing-reporting-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/hearing-reporting-time', { ref: c.reference, index: req.params.index, value: proc.hearingReportingTime });
});

router.post('/cases/procedures/:index/hearing-reporting-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'reporting-time', 'Reporting time', proc, 'hearingReportingTime');

  if (result.status === "ERROR") return res.render('cases/procedures/details/hearing-reporting-time', { ref: c.reference, index: req.params.index, value: req.body['reporting-time'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Reporting time for ${procName} removed`);
  else addAuditLog(req, c.reference, `Reporting time for ${procName} updated to ${proc.hearingReportingTime} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});


// ==========================================
// INQUIRY ROUTES
// ==========================================

// --- TARGET INQUIRY DATE ---
router.get('/cases/procedures/:index/target-inquiry-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.targetInquiry || {}; 
  res.render('cases/procedures/details/target-inquiry-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/target-inquiry-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'target-inquiry', 'Target inquiry date', proc, 'targetInquiry');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Target inquiry date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Target inquiry date for ${procName} updated to ${proc.targetInquiry.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/target-inquiry-date', { ref: c.reference, index: req.params.index, day: req.body['target-inquiry-day'], month: req.body['target-inquiry-month'], year: req.body['target-inquiry-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- INQUIRY NOTIFIED DATE ---
router.get('/cases/procedures/:index/inquiry-notified-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.inquiryNotified || {}; 
  res.render('cases/procedures/details/inquiry-notified-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/inquiry-notified-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'inquiry-notified', 'Date parties must be notified of inquiry', proc, 'inquiryNotified');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date parties must be notified of inquiry for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date parties must be notified of inquiry for ${procName} updated to ${proc.inquiryNotified.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/inquiry-notified-date', { ref: c.reference, index: req.params.index, day: req.body['inquiry-notified-day'], month: req.body['inquiry-notified-month'], year: req.body['inquiry-notified-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- PRE-INQUIRY MEETING OR CMC ---
router.get('/cases/procedures/:index/pre-inquiry-meeting-cmc', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/pre-inquiry-meeting-cmc', { ref: c.reference, index: req.params.index, meetingType: proc.preInquiryMeetingCmc });
});

router.post('/cases/procedures/:index/pre-inquiry-meeting-cmc', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var val = req.body['meeting-type'];
  let procName = getProcName(proc, parseInt(req.params.index) - 1);

  if (req.body.action === 'remove') {
    delete proc.preInquiryMeetingCmc;
    addAuditLog(req, c.reference, `Pre inquiry meeting or case management conference for ${procName} removed`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (!val) return res.render('cases/procedures/details/pre-inquiry-meeting-cmc', { ref: c.reference, index: req.params.index, errorList: [{ text: "Select whether there will be a pre inquiry meeting or case management conference", href: "#meeting-type" }] });

  proc.preInquiryMeetingCmc = val;
  addAuditLog(req, c.reference, `Pre inquiry meeting or case management conference for ${procName} updated to ${val}`);
  req.session.flashSection = `procedure-${req.params.index}`;
  res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- PIM DATE (Date & Time) ---
router.get('/cases/procedures/:index/pim-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.pimDate || {}; 
  res.render('cases/procedures/details/pim-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year, hour: val.hour, minute: val.minute, ampm: val.ampm, errorFields: [] });
});

router.post('/cases/procedures/:index/pim-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDateTime(req, res, 'pim', 'Pre inquiry meeting date', proc, 'pimDate');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Pre inquiry meeting date for ${procName} removed`);
    else {
      let dtStr = proc.pimDate.formattedDate + (proc.pimDate.formattedTime ? ' at ' + proc.pimDate.formattedTime : '');
      addAuditLog(req, c.reference, `Pre inquiry meeting date for ${procName} updated to ${dtStr}`);
    }
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/pim-date', { ref: c.reference, index: req.params.index, day: req.body['pim-day'], month: req.body['pim-month'], year: req.body['pim-year'], hour: req.body['pim-hour'], minute: req.body['pim-minute'], ampm: req.body['pim-ampm'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- PIM TYPE ---
router.get('/cases/procedures/:index/pim-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/pim-type', { ref: c.reference, index: req.params.index, pimType: proc.pimType });
});

router.post('/cases/procedures/:index/pim-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var val = req.body['pim-type'];
  let procName = getProcName(proc, parseInt(req.params.index) - 1);

  if (req.body.action === 'remove') {
    delete proc.pimType;
    addAuditLog(req, c.reference, `Pre inquiry meeting type for ${procName} removed`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (!val) return res.render('cases/procedures/details/pim-type', { ref: c.reference, index: req.params.index, errorList: [{ text: "Select the format of the pre inquiry meeting", href: "#pim-type" }] });

  proc.pimType = val;
  addAuditLog(req, c.reference, `Pre inquiry meeting type for ${procName} updated to ${val}`);
  req.session.flashSection = `procedure-${req.params.index}`;
  res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- PIM NOTE SENT ---
router.get('/cases/procedures/:index/pim-note-sent', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.pimNoteSent || {}; 
  res.render('cases/procedures/details/pim-note-sent', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/pim-note-sent', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'pim-note', 'Pre inquiry meeting note sent', proc, 'pimNoteSent');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Pre inquiry meeting note sent date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Pre inquiry meeting note sent date for ${procName} updated to ${proc.pimNoteSent.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/pim-note-sent', { ref: c.reference, index: req.params.index, day: req.body['pim-note-day'], month: req.body['pim-note-month'], year: req.body['pim-note-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- CONFIRMED INQUIRY DATE (Date & Time) ---
router.get('/cases/procedures/:index/confirmed-inquiry-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.confirmedInquiry || {}; 
  res.render('cases/procedures/details/confirmed-inquiry-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year, hour: val.hour, minute: val.minute, ampm: val.ampm, errorFields: [] });
});

router.post('/cases/procedures/:index/confirmed-inquiry-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDateTime(req, res, 'confirmed-inquiry', 'Confirmed inquiry date', proc, 'confirmedInquiry');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Confirmed inquiry date for ${procName} removed`);
    else {
      let dtStr = proc.confirmedInquiry.formattedDate + (proc.confirmedInquiry.formattedTime ? ' at ' + proc.confirmedInquiry.formattedTime : '');
      addAuditLog(req, c.reference, `Confirmed inquiry date for ${procName} updated to ${dtStr}`);
    }
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/confirmed-inquiry-date', { ref: c.reference, index: req.params.index, day: req.body['confirmed-inquiry-day'], month: req.body['confirmed-inquiry-month'], year: req.body['confirmed-inquiry-year'], hour: req.body['confirmed-inquiry-hour'], minute: req.body['confirmed-inquiry-minute'], ampm: req.body['confirmed-inquiry-ampm'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- INQUIRY TYPE ---
router.get('/cases/procedures/:index/inquiry-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/inquiry-type', { ref: c.reference, index: req.params.index, inquiryType: proc.inquiryType });
});

router.post('/cases/procedures/:index/inquiry-type', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var val = req.body['inquiry-type'];
  let procName = getProcName(proc, parseInt(req.params.index) - 1);

  if (req.body.action === 'remove') {
    delete proc.inquiryType;
    addAuditLog(req, c.reference, `Inquiry type for ${procName} removed`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (!val) return res.render('cases/procedures/details/inquiry-type', { ref: c.reference, index: req.params.index, errorList: [{ text: "Select the inquiry type", href: "#inquiry-type" }] });

  proc.inquiryType = val;
  addAuditLog(req, c.reference, `Inquiry type for ${procName} updated to ${val}`);
  req.session.flashSection = `procedure-${req.params.index}`;
  res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- INQUIRY VENUE (Address) ---
router.get('/cases/procedures/:index/inquiry-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.inquiryVenue || {}; 
  res.render('cases/procedures/details/inquiry-venue', { ref: c.reference, index: req.params.index, line1: val.line1, line2: val.line2, town: val.town, county: val.county, postcode: val.postcode, errorFields: [] });
});

router.post('/cases/procedures/:index/inquiry-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveAddress(req, res, 'venue', 'Inquiry venue', proc, 'inquiryVenue');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Inquiry venue for ${procName} removed`);
    else addAuditLog(req, c.reference, `Inquiry venue for ${procName} updated to ${proc.inquiryVenue.formatted.replace(/<br>/g, ', ')}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/inquiry-venue', { ref: c.reference, index: req.params.index, line1: req.body['venue-line1'], line2: req.body['venue-line2'], town: req.body['venue-town'], county: req.body['venue-county'], postcode: req.body['venue-postcode'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- DATE PARTIES NOTIFIED OF INQUIRY DATE ---
router.get('/cases/procedures/:index/notified-inquiry-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.notifiedInquiryDate || {}; 
  res.render('cases/procedures/details/notified-inquiry-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/notified-inquiry-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'notified-inquiry-date', 'Date parties notified of inquiry date', proc, 'notifiedInquiryDate');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date parties notified of inquiry date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date parties notified of inquiry date for ${procName} updated to ${proc.notifiedInquiryDate.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/notified-inquiry-date', { ref: c.reference, index: req.params.index, day: req.body['notified-inquiry-date-day'], month: req.body['notified-inquiry-date-month'], year: req.body['notified-inquiry-date-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- DATE PARTIES NOTIFIED OF INQUIRY VENUE ---
router.get('/cases/procedures/:index/notified-inquiry-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.notifiedInquiryVenue || {}; 
  res.render('cases/procedures/details/notified-inquiry-venue', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/notified-inquiry-venue', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'notified-inquiry-venue', 'Date parties notified of inquiry venue', proc, 'notifiedInquiryVenue');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date parties notified of inquiry venue for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date parties notified of inquiry venue for ${procName} updated to ${proc.notifiedInquiryVenue.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/notified-inquiry-venue', { ref: c.reference, index: req.params.index, day: req.body['notified-inquiry-venue-day'], month: req.body['notified-inquiry-venue-month'], year: req.body['notified-inquiry-venue-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- EARLIEST POTENTIAL INQUIRY DATE ---
router.get('/cases/procedures/:index/earliest-inquiry-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.earliestInquiryDate || {}; 
  res.render('cases/procedures/details/earliest-inquiry-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/earliest-inquiry-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'earliest-inquiry-date', 'Earliest potential inquiry date', proc, 'earliestInquiryDate');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Earliest potential inquiry date for ${procName} removed`);
    else addAuditLog(req, c.reference, `Earliest potential inquiry date for ${procName} updated to ${proc.earliestInquiryDate.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/earliest-inquiry-date', { ref: c.reference, index: req.params.index, day: req.body['earliest-inquiry-date-day'], month: req.body['earliest-inquiry-date-month'], year: req.body['earliest-inquiry-date-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- INQUIRY: LENGTH OF EVENT ---
router.get('/cases/procedures/:index/inquiry-length-of-event', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/inquiry-length-of-event', { ref: c.reference, index: req.params.index, value: proc.inquiryLengthOfEvent });
});

router.post('/cases/procedures/:index/inquiry-length-of-event', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'length-event', 'Length of event', proc, 'inquiryLengthOfEvent');

  if (result.status === "ERROR") return res.render('cases/procedures/details/inquiry-length-of-event', { ref: c.reference, index: req.params.index, value: req.body['length-event'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Length of event for ${procName} removed`);
  else addAuditLog(req, c.reference, `Length of event for ${procName} updated to ${proc.inquiryLengthOfEvent} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- DATE INQUIRY FINISHED ---
router.get('/cases/procedures/:index/inquiry-finished-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.inquiryFinished || {}; 
  res.render('cases/procedures/details/inquiry-finished-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/inquiry-finished-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'inquiry-finished', 'Date inquiry finished', proc, 'inquiryFinished');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date inquiry finished for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date inquiry finished for ${procName} updated to ${proc.inquiryFinished.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/inquiry-finished-date', { ref: c.reference, index: req.params.index, day: req.body['inquiry-finished-day'], month: req.body['inquiry-finished-month'], year: req.body['inquiry-finished-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- EVENT IN TARGET? ---
router.get('/cases/procedures/:index/event-in-target', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/event-in-target', { ref: c.reference, index: req.params.index, eventInTarget: proc.eventInTarget });
});

router.post('/cases/procedures/:index/event-in-target', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var val = req.body['event-in-target'];
  let procName = getProcName(proc, parseInt(req.params.index) - 1);

  if (req.body.action === 'remove') {
    delete proc.eventInTarget;
    addAuditLog(req, c.reference, `Event in target for ${procName} removed`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (!val) return res.render('cases/procedures/details/event-in-target', { ref: c.reference, index: req.params.index, errorList: [{ text: "Select if the event is in target", href: "#event-in-target" }] });

  proc.eventInTarget = val;
  addAuditLog(req, c.reference, `Event in target for ${procName} updated to ${val}`);
  req.session.flashSection = `procedure-${req.params.index}`;
  res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- DATE INQUIRY CLOSED ---
router.get('/cases/procedures/:index/inquiry-closed-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.inquiryClosed || {}; 
  res.render('cases/procedures/details/inquiry-closed-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/inquiry-closed-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'inquiry-closed', 'Date inquiry closed', proc, 'inquiryClosed');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date inquiry closed for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date inquiry closed for ${procName} updated to ${proc.inquiryClosed.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/inquiry-closed-date', { ref: c.reference, index: req.params.index, day: req.body['inquiry-closed-day'], month: req.body['inquiry-closed-month'], year: req.body['inquiry-closed-year'], errorList: result.errorList, errorFields: result.errorFields });
  }
});

// --- INQUIRY: PREPARATION TIME ---
router.get('/cases/procedures/:index/inquiry-preparation-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/inquiry-preparation-time', { ref: c.reference, index: req.params.index, value: proc.inquiryPrepTime });
});

router.post('/cases/procedures/:index/inquiry-preparation-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'prep-time', 'Preparation time', proc, 'inquiryPrepTime');

  if (result.status === "ERROR") return res.render('cases/procedures/details/inquiry-preparation-time', { ref: c.reference, index: req.params.index, value: req.body['prep-time'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Preparation time for ${procName} removed`);
  else addAuditLog(req, c.reference, `Preparation time for ${procName} updated to ${proc.inquiryPrepTime} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- INQUIRY: TRAVEL TIME ---
router.get('/cases/procedures/:index/inquiry-travel-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/inquiry-travel-time', { ref: c.reference, index: req.params.index, value: proc.inquiryTravelTime });
});

router.post('/cases/procedures/:index/inquiry-travel-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'travel-time', 'Travel time', proc, 'inquiryTravelTime');

  if (result.status === "ERROR") return res.render('cases/procedures/details/inquiry-travel-time', { ref: c.reference, index: req.params.index, value: req.body['travel-time'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Travel time for ${procName} removed`);
  else addAuditLog(req, c.reference, `Travel time for ${procName} updated to ${proc.inquiryTravelTime} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- INQUIRY: SITTING TIME ---
router.get('/cases/procedures/:index/inquiry-sitting-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/inquiry-sitting-time', { ref: c.reference, index: req.params.index, value: proc.inquirySittingTime });
});

router.post('/cases/procedures/:index/inquiry-sitting-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'sitting-time', 'Sitting time', proc, 'inquirySittingTime');

  if (result.status === "ERROR") return res.render('cases/procedures/details/inquiry-sitting-time', { ref: c.reference, index: req.params.index, value: req.body['sitting-time'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Sitting time for ${procName} removed`);
  else addAuditLog(req, c.reference, `Sitting time for ${procName} updated to ${proc.inquirySittingTime} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});

// --- INQUIRY: REPORTING TIME ---
router.get('/cases/procedures/:index/inquiry-reporting-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  res.render('cases/procedures/details/inquiry-reporting-time', { ref: c.reference, index: req.params.index, value: proc.inquiryReportingTime });
});

router.post('/cases/procedures/:index/inquiry-reporting-time', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveNumber(req, res, 'reporting-time', 'Reporting time', proc, 'inquiryReportingTime');

  if (result.status === "ERROR") return res.render('cases/procedures/details/inquiry-reporting-time', { ref: c.reference, index: req.params.index, value: req.body['reporting-time'], errorList: result.errorList });
  
  let procName = getProcName(proc, parseInt(req.params.index) - 1);
  if (result.status === "REMOVED") addAuditLog(req, c.reference, `Reporting time for ${procName} removed`);
  else addAuditLog(req, c.reference, `Reporting time for ${procName} updated to ${proc.inquiryReportingTime} days`);

  req.session.flashSection = `procedure-${req.params.index}`;
  return res.redirect('/cases/case-details?ref=' + c.reference);
});


// --- WRITTEN REPS: DATE OFFER ---
router.get('/cases/procedures/:index/written-reps-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  if (!c) return res.redirect('/'); 
  var val = proc.writtenRepsDate || {}; 
  res.render('cases/procedures/details/written-reps-date', { ref: c.reference, index: req.params.index, day: val.day, month: val.month, year: val.year });
});

router.post('/cases/procedures/:index/written-reps-date', function(req, res) {
  var { c, proc } = getTargetProcedure(req);
  var result = validateAndSaveDate(req, res, 'written-reps-date', 'Date offer for written representations', proc, 'writtenRepsDate');

  if (result.status === "REMOVED" || result.status === "SUCCESS") {
    let procName = getProcName(proc, parseInt(req.params.index) - 1);
    if (result.status === "REMOVED") addAuditLog(req, c.reference, `Date offer for written representations for ${procName} removed`);
    else addAuditLog(req, c.reference, `Date offer for written representations for ${procName} updated to ${proc.writtenRepsDate.formatted}`);
    req.session.flashSection = `procedure-${req.params.index}`;
    return res.redirect('/cases/case-details?ref=' + c.reference);
  }
  if (result.status === "ERROR") {
    return res.render('cases/procedures/details/written-reps-date', { ref: c.reference, index: req.params.index, day: req.body['written-reps-date-day'], month: req.body['written-reps-date-month'], year: req.body['written-reps-date-year'], errorList: result.errorList, errorFields: result.errorFields });
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

addAuditLog(req, req.query.ref, "Invoicing fee received value updated to " + val);
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

// 5. Remove Applicant Confirmation (Create Flow)
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

  // Validation: If they clicked submit without picking Yes or No
  if (!confirm) {
    return res.render('cases/create-a-case/questions/applicant-remove', { 
      id: id, 
      error: true,
      backUrl: `/cases/create-a-case/questions/applicant-check`,
      actionUrl: `/cases/create-a-case/questions/applicant-remove?id=${id}`
    });
  }

  // If Yes, delete it from the global session creation array
  if (confirm === 'yes') {
    if (req.session.data['applicants']) {
      req.session.data['applicants'] = req.session.data['applicants'].filter(a => a.id !== id);
    }
  }
  
  // Redirect back to the create flow table
  res.redirect('/cases/create-a-case/questions/applicant-check');
});


// =========================================================
// Additional Resource Locations: Offline File Location (Independent Edit)
// =========================================================

// GET: Independent edit for file location
router.get('/cases/edit/offline-document-location', function(req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases');

  res.render('cases/edit/offline-document-location', { 
    ref: c.reference, 
    value: c.offlineDocLocation || "",
    editMode: true 
  });
});

// POST: Save and return directly to case details
router.post('/cases/edit/offline-document-location', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Save directly to the case
  c.offlineDocLocation = req.body.offlineDocLocation;

  req.session.flashSection = "additionalResourceLocations"; 

addAuditLog(req, ref, "Offline file location updated to: " + (c.offlineDocLocation || "N/A"));
  
  // Redirect back to the main case view with a success flag
  res.redirect('/cases/case-details?ref=' + ref);
});


// =========================================================
// Additional Resource Locations: Relevant website links (Independent Edit)
// =========================================================

// GET: Independent edit for website links
router.get('/cases/edit/relevant-website-links', function(req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases');

  res.render('cases/edit/relevant-website-links', { 
    ref: c.reference, 
    value: c.relevantWebsiteLinks || "",
    editMode: true 
  });
});

// POST: Save and return directly to case details
router.post('/cases/edit/relevant-website-links', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Save directly to the case
  c.relevantWebsiteLinks = req.body.relevantWebsiteLinks;

  req.session.flashSection = "additionalResourceLocations"; 

addAuditLog(req, ref, "Relevant website links updated to: " + (c.relevantWebsiteLinks || "N/A"));
  
  // Redirect back to the main case view with a success flag
  res.redirect('/cases/case-details?ref=' + ref);
});

// --- BANNER + LOAD CASE DETAILS PAGE ---
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


// =============================================================================
// ASSIGNED TO ME PAGE
// =============================================================================

// 1. View the Assigned Cases page
router.get('/assigned-to-me', function (req, res) {
  var allCases = req.session.data['cases'] || [];
  
  // --- SIMULATED LOGIN WORKAROUND ---
  // Hardcode the "logged in" user here. 
  var loggedInUser = "Carol Danvers";
  
  // Check if they explicitly searched for someone else
  var searchedUser = req.session.data['viewingUser'];
  
  // If they didn't search for anyone, default to the logged-in user
  var activeUser = searchedUser || loggedInUser;
  
  // Boolean to tell the frontend if we are looking at our own queue
  var isViewingOwnCases = (!searchedUser || searchedUser === loggedInUser);

  // Filter by the active user (Case Officer OR Inspector)
  var userCases = allCases.filter(c => {
    var cOfficer = c.caseOfficer || c['case-officer'];
    if (cOfficer === activeUser) return true;
    
    if (c.inspectors && c.inspectors.length > 0) {
       return c.inspectors.some(i => i.name === activeUser);
    } else if (c.inspector === activeUser) {
       return true;
    }
    return false;
  });

  // Get the Status filter array
  var statusFilter = req.session.data['statusFilter'];
  if (statusFilter && typeof statusFilter === 'string') {
    statusFilter = [statusFilter];
  } else if (!statusFilter) {
    statusFilter = [];
  }

  // Apply the Status filter
  var filteredCases = userCases;
  if (statusFilter.length > 0) {
    filteredCases = userCases.filter(c => {
      var cStat = c.status || c.caseStatus || c['case-status'];
      return statusFilter.includes(cStat);
    });
  }

  res.render('assigned-to-me', {
    filteredCases: filteredCases,
    currentStatusFilter: statusFilter,
    totalCasesCount: userCases.length, 
    activeUserName: activeUser, // Passed to the frontend to inject the name
    isViewingOwnCases: isViewingOwnCases // Used to toggle "Return to my cases" buttons
  });
});

// 2. Apply the Status Filter
router.post('/assigned-to-me/filter', function (req, res) {
  res.redirect('/assigned-to-me');
});

// 3. Clear the Status Filter
router.get('/assigned-to-me/clear-filter', function (req, res) {
  req.session.data['statusFilter'] = null;
  res.redirect('/assigned-to-me');
});

// 4. Remove single pill on Assigned To Me
router.get('/assigned-to-me/remove-filter/status/:value', function (req, res) {
  var valueToRemove = req.params.value;
  if (Array.isArray(req.session.data['statusFilter'])) {
    req.session.data['statusFilter'] = req.session.data['statusFilter'].filter(item => item !== valueToRemove);
  }
  res.redirect('/assigned-to-me');
});

// 5. GET Search User Page
router.get('/assigned-to-me/search-user', function (req, res) {
  res.render('assigned-to-me-search');
});

// 6. POST Search User Page (Validation)
router.post('/assigned-to-me/search-user', function (req, res) {
  var val = req.body.assignedUser;
  
  if (!val || val.trim() === "") {
    return res.render('assigned-to-me-search', {
      error: true,
      errorMessage: { text: "Select a case officer or inspector" }
    });
  }

  var officers = [
    "Kieran De La Cruz", "Edward Mitchell", "Sarah Tudor", "Steve Waterfield",
    "Alex Hudd", "Harry Wood", "Rob Davis", "Deborah Board",
    "(Service Account) Automated Tester", "Owen Woodwards", 
    "Tony Stark", "Steve Rogers", "Natasha Romanoff", "Bruce Banner",
    "Thor Odinson", "Wanda Maximoff", "Peter Parker", "Carol Danvers",
    "Stephen Strange", "T'Challa", "Clint Barton", "Sam Wilson",
    "Bucky Barnes", "Scott Lang", "Hope van Dyne"
  ];
  
  if (!officers.includes(val)) {
     return res.render('assigned-to-me-search', {
      value: val,
      error: true,
      errorMessage: { text: "Select a case officer or inspector" }
    });   
  }

  // Save the selected user and wipe any existing status filters to show a fresh list
  req.session.data['viewingUser'] = val;
  req.session.data['statusFilter'] = [];
  res.redirect('/assigned-to-me');
});

// 7. Reset back to "My Cases"
router.get('/assigned-to-me/my-cases', function (req, res) {
  req.session.data['viewingUser'] = null;
  req.session.data['statusFilter'] = [];
  res.redirect('/assigned-to-me');
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


// ==============================================
// RELATED CASES LOGIC (Working Draft Pattern)
// ==============================================

// 0. Empty State Page: Check First
router.get('/cases/related-cases/start', function(req, res) {
  var ref = req.query.ref;
  var myCase = req.session.data['cases'].find(c => c.reference === ref);
  if (!myCase) return res.redirect('/cases/all-cases');

  // Initialize a blank draft
  req.session.data['tempRelatedCasesList'] = [];

  res.render('cases/edit/check-related-cases-first', { ref: ref });
});

// 1. SHOW THE LIST PAGE (Hub)
router.get('/cases/related-cases/hub', function (req, res) {
  var ref = req.query.ref;
  var myCase = req.session.data['cases'].find(c => c.reference === ref);
  if (!myCase.relatedCases) { myCase.relatedCases = []; }

  // Clone real data to start working if no draft exists
  if (!req.session.data['tempRelatedCasesList']) {
    req.session.data['tempRelatedCasesList'] = JSON.parse(JSON.stringify(myCase.relatedCases));
  }

  res.render('cases/edit/check-related-cases', { 
    ref: ref,
    relatedCases: req.session.data['tempRelatedCasesList'] // Pass the DRAFT
  });
});

// 2. STEP 1: SHOW INPUT (Reference)
router.get('/cases/related-cases/step-1', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var draftList = req.session.data['tempRelatedCasesList'] || [];
  var value = "";

  if (id) {
    var item = draftList.find(i => i.id === id);
    if (item) value = item.reference;
  }

  var backUrl = (draftList.length > 0) 
    ? `/cases/related-cases/hub?ref=${ref}` 
    : `/cases/related-cases/start?ref=${ref}`;

  res.render('cases/edit/related-case-input', { 
    ref: ref, id: id, value: value, error: false, backUrl: backUrl
  });
});

// 3. STEP 1: VALIDATE & SAVE DIRECTLY TO DRAFT
router.post('/cases/related-cases/step-1', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var val = req.body.relatedCaseRef;
  
  var draftList = req.session.data['tempRelatedCasesList'] || [];

  if (!val || val.trim() === "") {
    var backUrl = (draftList.length > 0) ? `/cases/related-cases/hub?ref=${ref}` : `/cases/related-cases/start?ref=${ref}`;
    return res.render('cases/edit/related-case-input', {
      ref: ref, id: id, value: val, error: true, errorMessage: { text: "Enter related case reference" }, backUrl: backUrl
    });
  }

  // Because there is only 1 step, we save straight to the draft array!
  var newItem = {
    id: id || 'rc-' + Math.floor(Math.random() * 10000),
    reference: val 
  };

  var idx = draftList.findIndex(i => i.id === id);
  if (idx >= 0) draftList[idx] = newItem;
  else draftList.push(newItem);

  req.session.data['tempRelatedCasesList'] = draftList;
  
  // Instantly return to hub
  res.redirect(`/cases/related-cases/hub?ref=${ref}`);
});

// ==============================================
// REMOVE RELATED CASE (From Draft)
// ==============================================
router.get('/cases/related-cases/remove', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  res.render('cases/edit/remove-related-cases', { 
    ref: ref, id: id, backUrl: `/cases/related-cases/hub?ref=${ref}`, actionUrl: `/cases/related-cases/remove?id=${id}&ref=${ref}`
  });
});

router.post('/cases/related-cases/remove', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var confirm = req.body.relatedCaseRemove;

  if (!confirm) {
    return res.render('cases/edit/remove-related-cases', { 
      ref: ref, id: id, error: true, backUrl: `/cases/related-cases/hub?ref=${ref}`, actionUrl: `/cases/related-cases/remove?id=${id}&ref=${ref}`
    });
  }

  if (confirm === 'yes') {
    if (req.session.data['tempRelatedCasesList']) {
      req.session.data['tempRelatedCasesList'] = req.session.data['tempRelatedCasesList'].filter(i => i.id !== id);
    }
  }
  res.redirect(`/cases/related-cases/hub?ref=${ref}`);
});

// ==============================================
// FINAL COMMIT / CANCEL ACTIONS
// ==============================================

// COMMIT DRAFT: Final Save to Case Details
router.post('/cases/related-cases/commit', function(req, res) {
  var ref = req.query.ref;
  var myCase = req.session.data['cases'].find(c => c.reference === ref);

  if (myCase) {
    myCase.relatedCases = req.session.data['tempRelatedCasesList'] || [];
  }
  
  req.session.data['tempRelatedCasesList'] = null;
  req.session.flashSection = "overview"; 
  res.redirect('/cases/case-details?ref=' + ref);
});

// CANCEL DRAFT: Smart Check
router.get('/cases/related-cases/cancel', function(req, res) {
  var ref = req.query.ref;
  var myCase = req.session.data['cases'].find(c => c.reference === ref);

  var originalRelated = myCase.relatedCases || [];
  var draftRelated = req.session.data['tempRelatedCasesList'] || [];

  if (JSON.stringify(originalRelated) === JSON.stringify(draftRelated)) {
    req.session.data['tempRelatedCasesList'] = null;
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  res.render('cases/edit/cancel-related-cases', { ref: ref });
});

// CANCEL DRAFT: Process Warning Page
router.post('/cases/related-cases/cancel', function(req, res) {
  var ref = req.query.ref;
  var confirm = req.body.cancelRelatedCases;

  if (!confirm) {
    return res.render('cases/edit/cancel-related-cases', { ref: ref, error: true });
  }

  if (confirm === 'yes') {
    req.session.data['tempRelatedCasesList'] = null;
    res.redirect('/cases/case-details?ref=' + ref);
  } else {
    res.redirect('/cases/related-cases/hub?ref=' + ref);
  }
});




// ==============================================
// LINKED CASES LOGIC (Working Draft Pattern)
// ==============================================

// 0. Empty State Page: Check First
router.get('/cases/linked-cases/start', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var myCase = cases.find(c => c.reference === ref);
  if (!myCase) return res.redirect('/cases/all-cases');

  req.session.data['tempLinkedCasesList'] = [];
  req.session.data['tempLeadCase'] = null; // Initialize empty lead case

  res.render('cases/linked-cases/check-linked-cases-first', { ref: ref });
});

// 1. SHOW THE LIST PAGE (Hub)
router.get('/cases/linked-cases/hub', function (req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var myCase = cases.find(c => c.reference === ref);
  if (!myCase.linkedCases) { myCase.linkedCases = []; }

  // Clone real data to start working if no draft exists
  if (!req.session.data['tempLinkedCasesList']) {
    req.session.data['tempLinkedCasesList'] = JSON.parse(JSON.stringify(myCase.linkedCases));
  }

  // Clone the real lead case if no draft exists
  if (req.session.data['tempLeadCase'] === undefined) {
    req.session.data['tempLeadCase'] = myCase.leadCase || null;
  }

  res.render('cases/linked-cases/check-linked-cases', { 
    ref: ref,
    linkedCases: req.session.data['tempLinkedCasesList'],
    leadCase: req.session.data['tempLeadCase']
  });
});

// 2. ADD / EDIT LINKED CASE (Single Step)
router.get('/cases/linked-cases/step-1', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var draftList = req.session.data['tempLinkedCasesList'] || [];
  var value = "";

  if (id) {
    var item = draftList.find(i => i.id === id);
    if (item) value = item.reference;
  }

  var backUrl = (draftList.length > 0 || req.session.data['tempLeadCase']) 
    ? `/cases/linked-cases/hub?ref=${ref}` 
    : `/cases/linked-cases/start?ref=${ref}`;

  res.render('cases/linked-cases/linked-case-input', { 
    ref: ref, id: id, value: value, error: false, backUrl: backUrl
  });
});

router.post('/cases/linked-cases/step-1', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var val = req.body.linkedCaseRef;
  
  var draftList = req.session.data['tempLinkedCasesList'] || [];
  var backUrl = (draftList.length > 0 || req.session.data['tempLeadCase']) 
    ? `/cases/linked-cases/hub?ref=${ref}` 
    : `/cases/linked-cases/start?ref=${ref}`;

  if (!val || val.trim() === "") {
    return res.render('cases/linked-cases/linked-case-input', {
      ref: ref, id: id, value: val, error: true, errorMessage: { text: "Enter linked case reference" }, backUrl: backUrl
    });
  }

  // Save directly to the array
  if (id) {
    let idx = draftList.findIndex(i => i.id === id);
    if (idx >= 0) {
      // --- THE FIX: Update lead case if we just renamed it ---
      if (req.session.data['tempLeadCase'] === draftList[idx].reference) {
        req.session.data['tempLeadCase'] = val;
      }
      draftList[idx].reference = val;
    }
  } else {
    draftList.push({
      id: 'lc-' + Math.floor(Math.random() * 10000),
      reference: val
    });
  }
  
  req.session.data['tempLinkedCasesList'] = draftList;
  res.redirect(`/cases/linked-cases/hub?ref=${ref}`);
});

// 3. SELECT LEAD CASE
router.get('/cases/linked-cases/lead-case', function(req, res) {
  var ref = req.query.ref;
  res.render('cases/linked-cases/lead-case-select', {
    ref: ref,
    linkedCases: req.session.data['tempLinkedCasesList'] || [],
    leadCase: req.session.data['tempLeadCase']
  });
});

router.post('/cases/linked-cases/lead-case', function(req, res) {
  var ref = req.query.ref;
  var leadCaseSelection = req.body.leadCaseSelection;

  if (!leadCaseSelection) {
     return res.render('cases/linked-cases/lead-case-select', {
        ref: ref, linkedCases: req.session.data['tempLinkedCasesList'] || [],
        error: true, errorMessage: { text: "Select the lead case" }
     });
  }

  req.session.data['tempLeadCase'] = leadCaseSelection;
  res.redirect(`/cases/linked-cases/hub?ref=${ref}`);
});

router.get('/cases/linked-cases/remove-lead', function(req, res) {
  // Instantly wipe the lead case and return to hub
  req.session.data['tempLeadCase'] = null;
  res.redirect(`/cases/linked-cases/hub?ref=${req.query.ref}`);
});

// ==============================================
// REMOVE LINKED CASE (From Draft)
// ==============================================
router.get('/cases/linked-cases/remove', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  res.render('cases/linked-cases/remove-linked-cases', { 
    ref: ref, id: id, backUrl: `/cases/linked-cases/hub?ref=${ref}`, actionUrl: `/cases/linked-cases/remove?id=${id}&ref=${ref}`
  });
});

router.post('/cases/linked-cases/remove', function (req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var confirm = req.body.linkedCaseRemove;

  if (!confirm) {
    return res.render('cases/linked-cases/remove-linked-cases', { 
      ref: ref, id: id, error: true, backUrl: `/cases/linked-cases/hub?ref=${ref}`, actionUrl: `/cases/linked-cases/remove?id=${id}&ref=${ref}`
    });
  }

  if (confirm === 'yes' && req.session.data['tempLinkedCasesList']) {
    // If they delete a linked case that happens to be the lead case, wipe the lead case too
    let itemToRemove = req.session.data['tempLinkedCasesList'].find(i => i.id === id);
    if (itemToRemove && req.session.data['tempLeadCase'] === itemToRemove.reference) {
        req.session.data['tempLeadCase'] = null; 
    }
    
    req.session.data['tempLinkedCasesList'] = req.session.data['tempLinkedCasesList'].filter(i => i.id !== id);
  }
  res.redirect(`/cases/linked-cases/hub?ref=${ref}`);
});

// ==============================================
// FINAL COMMIT / CANCEL ACTIONS
// ==============================================
router.post('/cases/linked-cases/commit', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var myCase = cases.find(c => c.reference === ref);

  if (myCase) {
    let draftLinked = req.session.data['tempLinkedCasesList'] || [];
    let draftLead = req.session.data['tempLeadCase'] || null;

    // 1. Identify all case references in this new "group" (Current case + Draft cases)
    let groupReferences = [ref, ...draftLinked.map(lc => lc.reference)];

    // 2. Identify cases that were just REMOVED from the link group (Orphans)
    let originalLinkedRefs = (myCase.linkedCases || []).map(lc => lc.reference);
    let removedRefs = originalLinkedRefs.filter(oldRef => !draftLinked.find(newRef => newRef.reference === oldRef));

    // 3. Loop through the master case database and apply the reciprocal updates!
    cases.forEach(c => {
      
      // A. Update the active group members
      if (groupReferences.includes(c.reference)) {
        // Set the designated lead case for everyone in the group
        c.leadCase = draftLead;

        // Populate their linked cases array with everyone in the group EXCEPT themselves
        c.linkedCases = groupReferences
          .filter(groupRef => groupRef !== c.reference)
          .map(groupRef => ({
            id: 'lc-' + Math.floor(Math.random() * 10000),
            reference: groupRef
          }));
      }

      // B. Wipe the data for any cases that were just removed from the group
      if (removedRefs.includes(c.reference)) {
        c.leadCase = null;
        c.linkedCases = [];
      }
      
    });
  }
  
  // Clear the draft environment
  req.session.data['tempLinkedCasesList'] = null;
  req.session.data['tempLeadCase'] = undefined;
  
  // Trigger success banner and redirect
  req.session.flashSection = "overview"; 
  res.redirect('/cases/case-details?ref=' + ref);
});

router.get('/cases/linked-cases/cancel', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var myCase = cases.find(c => c.reference === ref);

  var originalLinked = myCase.linkedCases || [];
  var draftLinked = req.session.data['tempLinkedCasesList'] || [];
  var originalLead = myCase.leadCase || null;
  var draftLead = req.session.data['tempLeadCase'] || null;

  if (JSON.stringify(originalLinked) === JSON.stringify(draftLinked) && originalLead === draftLead) {
    req.session.data['tempLinkedCasesList'] = null;
    req.session.data['tempLeadCase'] = undefined;
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  res.render('cases/linked-cases/cancel-linked-cases', { ref: ref });
});

router.post('/cases/linked-cases/cancel', function(req, res) {
  var ref = req.query.ref;
  if (!req.body.cancelLinkedCases) return res.render('cases/linked-cases/cancel-linked-cases', { ref: ref, error: true });

  if (req.body.cancelLinkedCases === 'yes') {
    req.session.data['tempLinkedCasesList'] = null;
    req.session.data['tempLeadCase'] = undefined;
    res.redirect('/cases/case-details?ref=' + ref);
  } else {
    res.redirect('/cases/linked-cases/hub?ref=' + ref);
  }
});


// =============================================================================
//  OVERVIEW PROCEDURES FLOW (Working Draft Pattern)
// =============================================================================

// ==============================================
// LEAVE TO INSPECTORS (Escape Hatch from Step 2c)
// ==============================================
router.get('/cases/overview-procedures/leave-to-inspectors', function(req, res) {
  res.render('cases/overview-procedures/leave-to-inspectors', { 
    ref: req.query.ref, 
    id: req.query.id 
  });
});

router.post('/cases/overview-procedures/leave-to-inspectors', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var confirm = req.body.leaveToInspectors;

  // Validation
  if (!confirm) {
    return res.render('cases/overview-procedures/leave-to-inspectors', { 
      ref: ref, id: id, error: true 
    });
  }

  if (confirm === 'yes') {
    // 1. Trash the unsaved procedure drafts!
    req.session.data['tempOverviewProcsList'] = null;
    req.session.data['tempProc'] = null;

    // 2. Check if inspectors exist in the case data
    var myCase = req.session.data['cases'].find(c => c.reference === ref);
    var hasInspectors = myCase && myCase.inspectors && myCase.inspectors.length > 0;
    
    // 3. Dynamically route to the right inspectors hub/start page
    // (Note: adjust these URLs if your inspector routes are named differently!)
    var targetUrl = hasInspectors 
      ? `/cases/edit/check-inspectors?ref=${ref}` 
      : `/cases/edit/check-inspectors-first?ref=${ref}`;

    res.redirect(targetUrl);
  } else {
    // If they clicked No, bounce them right back to where they were in Step 2c
    res.redirect(`/cases/overview-procedures/step-2c?ref=${ref}&id=${id}`);
  }
});

// 00. CATCH OLD LINKS / AUTO-ROUTER
router.get('/cases/overview-procedures/check', (req, res) => {
  res.redirect('/cases/overview-procedures/hub?ref=' + req.query.ref);
});

// 0. Empty State Page: Start
router.get('/cases/overview-procedures/start', (req, res) => {
  var ref = req.query.ref;
  var myCase = req.session.data['cases'].find(c => c.reference === ref);
  if (!myCase) return res.redirect('/cases/all-cases');

  req.session.data['tempOverviewProcsList'] = [];
  res.render('cases/overview-procedures/check-procedures-first', { ref: ref });
});

// 1. SHOW THE LIST PAGE (Hub)
router.get('/cases/overview-procedures/hub', (req, res) => {
  var ref = req.query.ref;
  var myCase = req.session.data['cases'].find(c => c.reference === ref);
  if (!myCase.overviewProcedures) { myCase.overviewProcedures = []; }

  // Clone real data to start working if no draft exists
  if (!req.session.data['tempOverviewProcsList']) {
    req.session.data['tempOverviewProcsList'] = JSON.parse(JSON.stringify(myCase.overviewProcedures));
  }

  delete req.session.data['tempProc']; // clear temp item

  res.render('cases/overview-procedures/check-procedures', { 
    ref: ref,
    procList: req.session.data['tempOverviewProcsList']
  });
});

// 2. STEP 1: Select Type
router.get('/cases/overview-procedures/step-1', (req, res) => {
  var ref = req.query.ref;
  var id = req.query.id;
  var draftList = req.session.data['tempOverviewProcsList'] || [];
  
  if (id && (!req.session.data['tempProc'] || req.session.data['tempProc'].id !== id)) {
    var item = draftList.find(i => i.id === id);
    if (item) {
      req.session.data['tempProc'] = JSON.parse(JSON.stringify(item));
    }
  } else if (!id && !req.session.data['tempProc']) {
    req.session.data['tempProc'] = {}; 
  }
  
  // DYNAMIC BACK LINK LOGIC
  var backUrl = (draftList.length > 0) ? `/cases/overview-procedures/hub?ref=${ref}` : `/cases/overview-procedures/start?ref=${ref}`;

  res.render('cases/overview-procedures/step-1-type', { 
    ref: ref, id: id || "", value: req.session.data['tempProc'].type || "", backUrl: backUrl
  });
});

router.post('/cases/overview-procedures/step-1', (req, res) => {
  var type = req.body.procType;
  var ref = req.query.ref;
  var id = req.query.id;
  
  var draftList = req.session.data['tempOverviewProcsList'] || [];
  var backUrl = (draftList.length > 0) ? `/cases/overview-procedures/hub?ref=${ref}` : `/cases/overview-procedures/start?ref=${ref}`;
  
  if (!type) {
    return res.render('cases/overview-procedures/step-1-type', { ref: ref, id: id, error: true, backUrl: backUrl });
  }

  if (!req.session.data['tempProc']) req.session.data['tempProc'] = {};
  
  // DATA WIPE ON TYPE CHANGE
  var oldType = req.session.data['tempProc'].type;
  if (oldType && oldType !== type) {
    req.session.data['tempProc'] = { id: req.session.data['tempProc'].id };
  }

  req.session.data['tempProc'].type = type;

  // Branching Logic
  if (type === "Admin" || type === "Admin (In house)") {
    res.redirect(`/cases/overview-procedures/step-2a?ref=${ref}&id=${id || ''}`);
  } else if (type === "Site visit") {
    res.redirect(`/cases/overview-procedures/step-2b?ref=${ref}&id=${id || ''}`);
  } else {
    res.redirect(`/cases/overview-procedures/step-2c?ref=${ref}&id=${id || ''}`);
  }
});

// 3a. STEP 2: Admin Type
router.get('/cases/overview-procedures/step-2a', (req, res) => {
  var val = req.session.data['tempProc']?.adminType || "";
  res.render('cases/overview-procedures/step-2a-admin', { ref: req.query.ref, id: req.query.id, value: val });
});

router.post('/cases/overview-procedures/step-2a', (req, res) => {
  if (!req.body.adminType) return res.render('cases/overview-procedures/step-2a-admin', { ref: req.query.ref, id: req.query.id, error: true });
  req.session.data['tempProc'].adminType = req.body.adminType;
  res.redirect(`/cases/overview-procedures/step-2c?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// 3b. STEP 2: Site Visit Type
router.get('/cases/overview-procedures/step-2b', (req, res) => {
  var val = req.session.data['tempProc']?.siteVisitType || "";
  res.render('cases/overview-procedures/step-2b-site-visit', { ref: req.query.ref, id: req.query.id, value: val });
});

router.post('/cases/overview-procedures/step-2b', (req, res) => {
  if (!req.body.siteVisitType) return res.render('cases/overview-procedures/step-2b-site-visit', { ref: req.query.ref, id: req.query.id, error: true });
  req.session.data['tempProc'].siteVisitType = req.body.siteVisitType;
  res.redirect(`/cases/overview-procedures/step-2c?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// 3c. STEP 2: Inspector Allocation
router.get('/cases/overview-procedures/step-2c', (req, res) => {
  var c = getCase(req);
  var val = req.session.data['tempProc']?.inspector || "";
  res.render('cases/overview-procedures/step-2c-inspector', { ref: req.query.ref, id: req.query.id, value: val, inspectors: c.inspectors || [] });
});

router.post('/cases/overview-procedures/step-2c', (req, res) => {
  req.session.data['tempProc'].inspector = req.body.inspectorName || "";
  res.redirect(`/cases/overview-procedures/step-3?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// 4. STEP 3: Status & Save to Draft
router.get('/cases/overview-procedures/step-3', (req, res) => {
  var val = req.session.data['tempProc']?.status || "";
  res.render('cases/overview-procedures/step-3-status', { ref: req.query.ref, id: req.query.id, value: val });
});

router.post('/cases/overview-procedures/step-3', (req, res) => {
  var ref = req.query.ref;
  var id = req.query.id;
  var status = req.body.procStatus;

  if (!status) return res.render('cases/overview-procedures/step-3-status', { ref: ref, id: id, error: true });

  var draftList = req.session.data['tempOverviewProcsList'] || [];
  var temp = req.session.data['tempProc'];
  temp.status = status;

  if (id) {
    var index = draftList.findIndex(i => i.id === id);
    if (index > -1) draftList[index] = { ...temp };
  } else {
    temp.id = id || 'proc-' + Date.now();
    draftList.push(temp);
  }

  req.session.data['tempOverviewProcsList'] = draftList;
  req.session.data['tempProc'] = null; // Clean up
  res.redirect(`/cases/overview-procedures/hub?ref=${ref}`);
});

// ==============================================
// REMOVE (From Draft)
// ==============================================
router.get('/cases/overview-procedures/remove-confirm', (req, res) => {
  res.render('cases/overview-procedures/remove-confirm', { 
    ref: req.query.ref, id: req.query.id,
    backUrl: `/cases/overview-procedures/hub?ref=${req.query.ref}`,
    actionUrl: `/cases/overview-procedures/remove?id=${req.query.id}&ref=${req.query.ref}`
  });
});

router.post('/cases/overview-procedures/remove', (req, res) => {
  var ref = req.query.ref;
  var id = req.query.id;
  if (!req.body.confirmRemove) return res.render('cases/overview-procedures/remove-confirm', { ref: ref, id: id, error: true, backUrl: `/cases/overview-procedures/hub?ref=${ref}`, actionUrl: `/cases/overview-procedures/remove?id=${id}&ref=${ref}` });

  if (req.body.confirmRemove === 'yes' && req.session.data['tempOverviewProcsList']) {
    req.session.data['tempOverviewProcsList'] = req.session.data['tempOverviewProcsList'].filter(i => i.id !== id);
  }
  res.redirect(`/cases/overview-procedures/hub?ref=${ref}`);
});

// ==============================================
// FINAL COMMIT / CANCEL ACTIONS
// ==============================================

router.post('/cases/overview-procedures/commit', function(req, res) {
  var ref = req.query.ref;
  var myCase = req.session.data['cases'].find(c => c.reference === ref);

  if (myCase) {
    var oldProcs = myCase.overviewProcedures || [];
    var newProcs = req.session.data['tempOverviewProcsList'] || [];

    // 1. SMART AUDIT LOG: Check for REMOVALS
    oldProcs.forEach(oldItem => {
      let stillExists = newProcs.find(newItem => newItem.id === oldItem.id);
      if (!stillExists) {
        let procType = oldItem.type || "Procedure";
        addAuditLog(req, ref, `${procType} removed from overview`);
      }
    });

    // 2. SMART AUDIT LOG: Check for ADDITIONS
    newProcs.forEach(newItem => {
      let alreadyExisted = oldProcs.find(oldItem => oldItem.id === newItem.id);
      if (!alreadyExisted) {
        let procType = newItem.type || "Procedure";
        addAuditLog(req, ref, `${procType} added to overview`);
      }
    });

    // Safely overwrite the database with the draft
    myCase.overviewProcedures = newProcs;
  }
  
  req.session.data['tempOverviewProcsList'] = null;
  req.session.flashSection = "overview"; 
  res.redirect('/cases/case-details?ref=' + ref);
});

// CANCEL DRAFT
router.get('/cases/overview-procedures/cancel', function(req, res) {
  var ref = req.query.ref;
  var myCase = req.session.data['cases'].find(c => c.reference === ref);

  var originalProcs = myCase.overviewProcedures || [];
  var draftProcs = req.session.data['tempOverviewProcsList'] || [];

  if (JSON.stringify(originalProcs) === JSON.stringify(draftProcs)) {
    req.session.data['tempOverviewProcsList'] = null;
    return res.redirect('/cases/case-details?ref=' + ref);
  }
  res.render('cases/overview-procedures/cancel-procedures', { ref: ref });
});

router.post('/cases/overview-procedures/cancel', function(req, res) {
  var ref = req.query.ref;
  if (!req.body.cancelProcedures) return res.render('cases/overview-procedures/cancel-procedures', { ref: ref, error: true });

  if (req.body.cancelProcedures === 'yes') {
    req.session.data['tempOverviewProcsList'] = null;
    res.redirect('/cases/case-details?ref=' + ref);
  } else {
    res.redirect('/cases/overview-procedures/hub?ref=' + ref);
  }
});


// ==============================================
// KEY CONTACTS: OBJECTORS (Working Draft Pattern)
// ==============================================

// 0. Empty State Page: Objectors First
router.get('/cases/key-contacts/objectors/first', function(req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases/case-details?ref=' + req.query.ref);

  // Initialize a blank draft if starting from empty
  req.session.data['tempObjectorsList'] = [];

  res.render('cases/key-contacts/objectors/objector-first', {
    ref: c.reference
  });
});

// 1. HUB PAGE: Check Objectors
router.get('/cases/key-contacts/objectors', function(req, res) {
  var c = getCase(req);
  if (!c.objectors) { c.objectors = []; }

  // Clone real data to start working if no draft exists
  if (!req.session.data['tempObjectorsList']) {
    req.session.data['tempObjectorsList'] = JSON.parse(JSON.stringify(c.objectors));
  }

  // Clear single-objector multi-step temp variables
  var keysToClear = ['temp_obj_fname', 'temp_obj_lname', 'temp_obj_org', 'temp_obj_address1', 'temp_obj_address2', 'temp_obj_town', 'temp_obj_county', 'temp_obj_postcode', 'temp_obj_email', 'temp_obj_phone', 'temp_obj_status'];
  keysToClear.forEach(key => delete req.session.data[key]);

  res.render('cases/key-contacts/objectors/check', {
    ref: c.reference,
    objectors: req.session.data['tempObjectorsList'] // Pass the DRAFT
  });
});

// --- ADD / EDIT FLOW ---

// STEP 1: Who is the objector?
router.get('/cases/key-contacts/objectors/step-1', function(req, res) {
  var id = req.query.id;
  var draftList = req.session.data['tempObjectorsList'] || [];
  var objector = {};

  if (id) {
    objector = draftList.find(x => x.id == id) || {};
  }

  res.render('cases/key-contacts/objectors/step-1', {
    ref: req.query.ref,
    id: id,
    fname: req.session.data['temp_obj_fname'] || objector.fname,
    lname: req.session.data['temp_obj_lname'] || objector.lname,
    org:   req.session.data['temp_obj_org']   || objector.org
  });
});

router.post('/cases/key-contacts/objectors/step-1', function(req, res) {
  var first = req.body['obj-fname'] || "";
  var last = req.body['obj-lname'] || "";
  var org = req.body['obj-org'] || "";
  
  let errors = {};
  let errorList = [];

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
      ref: req.query.ref, id: req.query.id, fname: first, lname: last, org: org, errors: errors, errorList: errorList
    });
  }

  req.session.data['temp_obj_fname'] = first;
  req.session.data['temp_obj_lname'] = last;
  req.session.data['temp_obj_org']   = org;
  
  res.redirect(`/cases/key-contacts/objectors/step-2?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// STEP 2: Address
router.get('/cases/key-contacts/objectors/step-2', function(req, res) {
  var id = req.query.id;
  var draftList = req.session.data['tempObjectorsList'] || [];
  var objector = {};

  if (id) {
    objector = draftList.find(x => x.id == id) || {};
  }

  res.render('cases/key-contacts/objectors/step-2', {
    ref: req.query.ref,
    id: id,
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
      ref: req.query.ref, id: req.query.id, address1: line1, address2: line2, town: town, county: county, postcode: postcode, errors: errors, errorList: errorList
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
  var id = req.query.id;
  var draftList = req.session.data['tempObjectorsList'] || [];
  var objector = {};

  if (id) {
    objector = draftList.find(x => x.id == id) || {};
  }

  res.render('cases/key-contacts/objectors/step-3', {
    ref: req.query.ref,
    id: id,
    email: req.session.data['temp_obj_email'] || objector.email,
    phone: req.session.data['temp_obj_phone'] || objector.phone
  });
});

router.post('/cases/key-contacts/objectors/step-3', function(req, res) {
  let email = req.body['obj-email'] || "";
  let phone = req.body['obj-phone'] || "";

  let errors = {};
  let errorList = [];

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
      ref: req.query.ref, id: req.query.id, email: email, phone: phone, errors: errors, errorList: errorList
    });
  }

  req.session.data['temp_obj_email'] = email;
  req.session.data['temp_obj_phone'] = phone;

  res.redirect(`/cases/key-contacts/objectors/step-4?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// STEP 4: Status + SAVE TO DRAFT
router.get('/cases/key-contacts/objectors/step-4', function(req, res) {
  var id = req.query.id;
  var draftList = req.session.data['tempObjectorsList'] || [];
  var objector = {};

  if (id) {
    objector = draftList.find(x => x.id == id) || {};
  }

  res.render('cases/key-contacts/objectors/step-4', {
    ref: req.query.ref,
    id: id,
    status: req.session.data['temp_obj_status'] || objector.status
  });
});

router.post('/cases/key-contacts/objectors/step-4', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var status = req.body['obj-status'];

  if (!status) {
    return res.render('cases/key-contacts/objectors/step-4', {
      ref: ref, id: id, errorList: [{ text: "Select the status of the objector", href: "#obj-status" }]
    });
  }

  // Find existing data in DRAFT
  var draftList = req.session.data['tempObjectorsList'] || [];
  var existing = {};
  if (id) {
    existing = draftList.find(x => x.id == id) || {};
  }

  function getVal(sess, db) { return (req.session.data[sess] !== undefined) ? req.session.data[sess] : db; }

  // Build Object
  var newObjector = {
    id: id || Date.now().toString(),
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

  res.redirect('/cases/key-contacts/objectors?ref=' + ref);
});

// ==============================================
// REMOVE OBJECTOR (From Draft)
// ==============================================

router.get('/cases/key-contacts/objectors/remove', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  res.render('cases/key-contacts/objectors/objector-remove', { 
    ref: ref, id: id, backUrl: `/cases/key-contacts/objectors?ref=${ref}`, actionUrl: `/cases/key-contacts/objectors/remove?id=${id}&ref=${ref}`
  });
});

router.post('/cases/key-contacts/objectors/remove', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var confirm = req.body.objectorRemove;

  if (!confirm) {
    return res.render('cases/key-contacts/objectors/objector-remove', { 
      ref: ref, id: id, error: true, backUrl: `/cases/key-contacts/objectors?ref=${ref}`, actionUrl: `/cases/key-contacts/objectors/remove?id=${id}&ref=${ref}`
    });
  }

  if (confirm === 'yes') {
    if (req.session.data['tempObjectorsList']) {
      req.session.data['tempObjectorsList'] = req.session.data['tempObjectorsList'].filter(x => x.id !== id);
    }
  }
  
  res.redirect(`/cases/key-contacts/objectors?ref=${ref}`);
});

// ==============================================
// FINAL COMMIT / CANCEL ACTIONS
// ==============================================

// COMMIT DRAFT: User clicked "Save and continue" / Empty "Return"
router.post('/cases/key-contacts/objectors/save', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Overwrite database with working draft
  c.objectors = req.session.data['tempObjectorsList'] || [];
  req.session.data['tempObjectorsList'] = null;

  req.session.flashSection = "key-contacts"; 
  addAuditLog(req, ref, "Objectors updated");
  res.redirect('/cases/case-details?ref=' + ref);
});

// CANCEL DRAFT: Smart Check
router.get('/cases/key-contacts/objectors/cancel', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  var originalObjectors = c.objectors || [];
  var draftObjectors = req.session.data['tempObjectorsList'] || [];

  var isUnchanged = JSON.stringify(originalObjectors) === JSON.stringify(draftObjectors);

  if (isUnchanged) {
    // NO CHANGES: Silently clear draft and exit
    req.session.data['tempObjectorsList'] = null;
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  // CHANGES DETECTED: Render warning page
  res.render('cases/key-contacts/objectors/cancel-objectors', { 
    ref: ref 
  });
});

// CANCEL DRAFT: Process Warning Page
router.post('/cases/key-contacts/objectors/cancel', function(req, res) {
  var ref = req.query.ref;
  var confirm = req.body.cancelObjectors;

  if (!confirm) {
    return res.render('cases/key-contacts/objectors/cancel-objectors', { ref: ref, error: true });
  }

  if (confirm === 'yes') {
    // Toss draft in trash
    req.session.data['tempObjectorsList'] = null;
    res.redirect('/cases/case-details?ref=' + ref);
  } else {
    // Return to working list
    res.redirect('/cases/key-contacts/objectors?ref=' + ref);
  }
});




// ==============================================
// KEY CONTACTS: CONTACTS (Working Draft Pattern)
// ==============================================

// 0. Empty State Page: Key Contacts First
router.get('/cases/key-contacts/contacts/first', function(req, res) {
  var c = getCase(req);
  if (!c) return res.redirect('/cases/case-details?ref=' + req.query.ref);

  // Initialize a blank draft if starting from empty
  req.session.data['tempContactsList'] = [];

  res.render('cases/key-contacts/contacts/contact-first', {
    ref: c.reference
  });
});

// 1. HUB PAGE: Check Contacts
router.get('/cases/key-contacts/contacts', function(req, res) {
  var c = getCase(req);
  if (!c.contacts) { c.contacts = []; }

  // If there is no draft list yet, clone the real data to start working
  if (!req.session.data['tempContactsList']) {
    req.session.data['tempContactsList'] = JSON.parse(JSON.stringify(c.contacts));
  }

  // Clear single-contact multi-step temp variables so "Add details" starts fresh
  var keysToClear = ['temp_con_type', 'temp_con_fname', 'temp_con_lname', 'temp_con_org', 'temp_con_address1', 'temp_con_address2', 'temp_con_town', 'temp_con_county', 'temp_con_postcode', 'temp_con_email', 'temp_con_phone'];
  keysToClear.forEach(key => delete req.session.data[key]);

  res.render('cases/key-contacts/contacts/check', {
    ref: c.reference,
    contacts: req.session.data['tempContactsList'] // Pass the DRAFT
  });
});

// --- ADD / EDIT FLOW ---

// STEP 1: Contact Type
router.get('/cases/key-contacts/contacts/step-1', function(req, res) {
  var id = req.query.id;
  var draftList = req.session.data['tempContactsList'] || [];
  var contact = {};

  if (id) {
    contact = draftList.find(x => x.id == id) || {};
  }

  res.render('cases/key-contacts/contacts/step-1', {
    ref: req.query.ref,
    id: id,
    type: req.session.data['temp_con_type'] || contact.type
  });
});

router.post('/cases/key-contacts/contacts/step-1', function(req, res) {
  var type = req.body['con-type'];
  
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
  var id = req.query.id;
  var draftList = req.session.data['tempContactsList'] || [];
  var contact = {};
  if (id) contact = draftList.find(x => x.id == id) || {};

  res.render('cases/key-contacts/contacts/step-2', {
    ref: req.query.ref,
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
      ref: req.query.ref, id: req.query.id, fname: first, lname: last, org: org, errors: errors, errorList: errorList
    });
  }

  req.session.data['temp_con_fname'] = first;
  req.session.data['temp_con_lname'] = last;
  req.session.data['temp_con_org']   = org;

  res.redirect(`/cases/key-contacts/contacts/step-3?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// STEP 3: Address
router.get('/cases/key-contacts/contacts/step-3', function(req, res) {
  var id = req.query.id;
  var draftList = req.session.data['tempContactsList'] || [];
  var contact = {};
  if (id) contact = draftList.find(x => x.id == id) || {};

  res.render('cases/key-contacts/contacts/step-3', {
    ref: req.query.ref,
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
      ref: req.query.ref, id: req.query.id, address1: line1, address2: line2, town: town, county: county, postcode: postcode, errors: errors, errorList: errorList
    });
  }

  req.session.data['temp_con_address1'] = line1;
  req.session.data['temp_con_address2'] = line2;
  req.session.data['temp_con_town']     = town;
  req.session.data['temp_con_county']   = county;
  req.session.data['temp_con_postcode'] = postcode;

  res.redirect(`/cases/key-contacts/contacts/step-4?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// STEP 4: Contact Details + SAVE TO DRAFT
router.get('/cases/key-contacts/contacts/step-4', function(req, res) {
  var id = req.query.id;
  var draftList = req.session.data['tempContactsList'] || [];
  var contact = {};
  if (id) contact = draftList.find(x => x.id == id) || {};

  res.render('cases/key-contacts/contacts/step-4', {
    ref: req.query.ref,
    id: id,
    email: req.session.data['temp_con_email'] || contact.email,
    phone: req.session.data['temp_con_phone'] || contact.phone
  });
});

router.post('/cases/key-contacts/contacts/step-4', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;

  var email = req.body['con-email'] || "";
  var phone = req.body['con-phone'] || "";

  let errors = {};
  let errorList = [];

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
      ref: ref, id: id, email: email, phone: phone, errors: errors, errorList: errorList
    });
  }

  // Find existing data in DRAFT
  var draftList = req.session.data['tempContactsList'] || [];
  var existing = {};
  if (id) {
    existing = draftList.find(x => x.id == id) || {};
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

  // Save to DRAFT List
  var idx = draftList.findIndex(x => x.id == id);
  if (idx >= 0) draftList[idx] = newContact;
  else draftList.push(newContact);
  
  req.session.data['tempContactsList'] = draftList;

  // Cleanup
  var keysToClear = ['temp_con_type', 'temp_con_fname', 'temp_con_lname', 'temp_con_org', 'temp_con_address1', 'temp_con_address2', 'temp_con_town', 'temp_con_county', 'temp_con_postcode', 'temp_con_email', 'temp_con_phone'];
  keysToClear.forEach(key => delete req.session.data[key]);

  res.redirect('/cases/key-contacts/contacts?ref=' + ref);
});

// ==============================================
// REMOVE KEY CONTACT (From Draft)
// ==============================================

router.get('/cases/key-contacts/contacts/remove', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  res.render('cases/key-contacts/contacts/contact-remove', { 
    ref: ref, id: id, backUrl: `/cases/key-contacts/contacts?ref=${ref}`, actionUrl: `/cases/key-contacts/contacts/remove?id=${id}&ref=${ref}`
  });
});

router.post('/cases/key-contacts/contacts/remove', function(req, res) {
  var ref = req.query.ref;
  var id = req.query.id;
  var confirm = req.body.contactRemove;

  if (!confirm) {
    return res.render('cases/key-contacts/contacts/contact-remove', { 
      ref: ref, id: id, error: true, backUrl: `/cases/key-contacts/contacts?ref=${ref}`, actionUrl: `/cases/key-contacts/contacts/remove?id=${id}&ref=${ref}`
    });
  }

  if (confirm === 'yes') {
    if (req.session.data['tempContactsList']) {
      req.session.data['tempContactsList'] = req.session.data['tempContactsList'].filter(x => x.id !== id);
    }
  }
  res.redirect(`/cases/key-contacts/contacts?ref=${ref}`);
});

// ==============================================
// FINAL COMMIT / CANCEL ACTIONS
// ==============================================

// COMMIT DRAFT: User clicked "Save and continue" / Empty "Return"
router.post('/cases/key-contacts/contacts/save', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // Overwrite the real database with our working draft
  c.contacts = req.session.data['tempContactsList'] || [];
  
  // Clear the draft completely
  req.session.data['tempContactsList'] = null;

  // Flash banner and redirect
  req.session.flashSection = "key-contacts"; 
  addAuditLog(req, ref, "Contacts updated");
  res.redirect('/cases/case-details?ref=' + ref);
});

// CANCEL DRAFT: View Warning Page (Smart Check)
router.get('/cases/key-contacts/contacts/cancel', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);

  // 1. Grab both arrays (fallback to empty arrays if they don't exist yet)
  var originalContacts = c.contacts || [];
  var draftContacts = req.session.data['tempContactsList'] || [];

  // 2. Compare them! (Turning them into strings makes it a perfect 1-to-1 check)
  var isUnchanged = JSON.stringify(originalContacts) === JSON.stringify(draftContacts);

  if (isUnchanged) {
    // NO CHANGES: Silently clear the draft and go straight to case details
    req.session.data['tempContactsList'] = null;
    return res.redirect('/cases/case-details?ref=' + ref);
  }

  // CHANGES DETECTED: Render the warning page
  res.render('cases/key-contacts/contacts/cancel-contacts', { 
    ref: ref 
  });
});

// CANCEL DRAFT: Process Warning Page
router.post('/cases/key-contacts/contacts/cancel', function(req, res) {
  var ref = req.query.ref;
  var confirm = req.body.cancelContacts;

  if (!confirm) {
    return res.render('cases/key-contacts/contacts/cancel-contacts', { ref: ref, error: true });
  }

  if (confirm === 'yes') {
    // Toss the draft in the trash
    req.session.data['tempContactsList'] = null;
    res.redirect('/cases/case-details?ref=' + ref);
  } else {
    // Take them back to the working list
    res.redirect('/cases/key-contacts/contacts?ref=' + ref);
  }
});


// =============================================================================
//  OUTCOMES FLOW (Working Draft Pattern)
// =============================================================================

// 00. CATCH OLD LINKS / AUTO-ROUTER
router.get('/cases/outcomes/check', (req, res) => {
  res.redirect('/cases/outcomes/hub?ref=' + req.query.ref);
});

// 0. Empty State Page: Start
router.get('/cases/outcomes/start', (req, res) => {
  var ref = req.query.ref;
  var myCase = req.session.data['cases'].find(c => c.reference === ref);
  if (!myCase) return res.redirect('/cases/all-cases');

  req.session.data['tempOutcomesList'] = [];
  res.render('cases/outcomes/check-outcomes-first', { ref: ref });
});

// 1. SHOW THE LIST PAGE (Hub)
router.get('/cases/outcomes/hub', (req, res) => {
  var ref = req.query.ref;
  var myCase = req.session.data['cases'].find(c => c.reference === ref);
  if (!myCase.outcomes) { myCase.outcomes = []; }

  if (!req.session.data['tempOutcomesList']) {
    req.session.data['tempOutcomesList'] = JSON.parse(JSON.stringify(myCase.outcomes));
  }

  delete req.session.data['tempOutcome']; // clear temp item

  // EXPLICITLY PASS THE LIST TO THE TEMPLATE
  res.render('cases/outcomes/check-outcomes', { 
    ref: ref,
    outcomeList: req.session.data['tempOutcomesList']
  });
});

// 1. STEP 1: Type of decision
router.get('/cases/outcomes/step-1', (req, res) => {
  var id = req.query.id;
  var draftList = req.session.data['tempOutcomesList'] || [];

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    var existingOutcome = draftList.find(o => o.id === id);
    if (existingOutcome) req.session.data['tempOutcome'] = JSON.parse(JSON.stringify(existingOutcome));
  } else if (!id && !req.session.data['tempOutcome']) {
    req.session.data['tempOutcome'] = {}; 
  }

  var val = req.session.data['tempOutcome']?.type || "";
  
  // DYNAMIC BACK LINK LOGIC
  var backUrl = (draftList.length > 0) ? `/cases/outcomes/hub?ref=${req.query.ref}` : `/cases/outcomes/start?ref=${req.query.ref}`;

  res.render('cases/outcomes/step-1-type', { 
    ref: req.query.ref, id: id, value: val, backUrl: backUrl 
  });
});

router.post('/cases/outcomes/step-1', (req, res) => {
  var type = req.body.outcomeType;
  var draftList = req.session.data['tempOutcomesList'] || [];
  var backUrl = (draftList.length > 0) ? `/cases/outcomes/hub?ref=${req.query.ref}` : `/cases/outcomes/start?ref=${req.query.ref}`;

  if (!type) {
    return res.render('cases/outcomes/step-1-type', { 
      ref: req.query.ref, id: req.query.id, error: true, backUrl: backUrl 
    });
  }
  
  if (!req.session.data['tempOutcome']) req.session.data['tempOutcome'] = {};
  req.session.data['tempOutcome'].type = type;
  res.redirect(`/cases/outcomes/step-2?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// 2. STEP 2: Originator (Decision Maker)
router.get('/cases/outcomes/step-2', (req, res) => {
  var id = req.query.id;
  var draftList = req.session.data['tempOutcomesList'] || [];

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    var existingOutcome = draftList.find(o => o.id === id);
    if (existingOutcome) req.session.data['tempOutcome'] = JSON.parse(JSON.stringify(existingOutcome));
  }

  var val = req.session.data['tempOutcome']?.originator || "";
  res.render('cases/outcomes/step-2-originator', { ref: req.query.ref, id: id, value: val });
});

router.post('/cases/outcomes/step-2', (req, res) => {
  var originator = req.body.originator;
  if (!originator) return res.render('cases/outcomes/step-2-originator', { ref: req.query.ref, id: req.query.id, error: true });
  
  req.session.data['tempOutcome'].originator = originator;

  if (originator === "Inspector") {
    res.redirect(`/cases/outcomes/step-2a?ref=${req.query.ref}&id=${req.query.id || ''}`);
  } else if (originator === "Officer") {
    res.redirect(`/cases/outcomes/step-2b?ref=${req.query.ref}&id=${req.query.id || ''}`);
  } else {
    req.session.data['tempOutcome'].inspectorName = null; 
    req.session.data['tempOutcome'].officerName = null;
    res.redirect(`/cases/outcomes/step-3?ref=${req.query.ref}&id=${req.query.id || ''}`);
  }
});

// 2a. STEP 2a: Inspector Name
router.get('/cases/outcomes/step-2a', (req, res) => {
  var c = req.session.data['cases'].find(x => x.reference === req.query.ref);
  var id = req.query.id;
  var draftList = req.session.data['tempOutcomesList'] || [];

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    var existingOutcome = draftList.find(o => o.id === id);
    if (existingOutcome) req.session.data['tempOutcome'] = JSON.parse(JSON.stringify(existingOutcome));
  }

  res.render('cases/outcomes/step-2a-inspector', { 
    ref: req.query.ref, id: id, inspectors: c?.inspectors || [] 
  });
});

// 2a. STEP 2a: Inspector Name
router.post('/cases/outcomes/step-2a', (req, res) => {
  var inspector = req.body.inspectorName;
  var c = req.session.data['cases'].find(x => x.reference === req.query.ref);
  
  if (!inspector) {
    return res.render('cases/outcomes/step-2a-inspector', { 
      ref: req.query.ref, id: req.query.id, inspectors: c?.inspectors || [], 
      errors: { inspectorName: { text: "Select the inspector" } }
    });
  }

  if (!req.session.data['tempOutcome']) req.session.data['tempOutcome'] = {};
  req.session.data['tempOutcome'].inspectorName = inspector;
  req.session.data['tempOutcome'].officerName = null; 
  
  // Safety: Wipe Step 3 data if they changed their mind from Secretary of State
  req.session.data['tempOutcome'].decisionOutcome = null;
  req.session.data['tempOutcome'].decisionGrantedConditions = null;
  req.session.data['tempOutcome'].decisionOtherDetails = null;

  // SKIP STEP 3, REDIRECT STRAIGHT TO STEP 4
  res.redirect(`/cases/outcomes/step-4?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// 2b. STEP 2b: Officer Name
router.get('/cases/outcomes/step-2b', (req, res) => {
  var id = req.query.id;
  var draftList = req.session.data['tempOutcomesList'] || [];

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    var existingOutcome = draftList.find(o => o.id === id);
    if (existingOutcome) req.session.data['tempOutcome'] = JSON.parse(JSON.stringify(existingOutcome));
  }

  res.render('cases/outcomes/step-2b-officer', { ref: req.query.ref, id: id }); 
});

// 2b. STEP 2b: Officer Name
router.post('/cases/outcomes/step-2b', (req, res) => {
  var officer = req.body.officerName; 
  if (!officer) {
    return res.render('cases/outcomes/step-2b-officer', { 
      ref: req.query.ref, id: req.query.id, errors: { officerName: { text: "Select the officer" } } 
    });
  }

  if (!req.session.data['tempOutcome']) req.session.data['tempOutcome'] = {};
  req.session.data['tempOutcome'].officerName = officer;
  req.session.data['tempOutcome'].inspectorName = null; 

  // Safety: Wipe Step 3 data if they changed their mind from Secretary of State
  req.session.data['tempOutcome'].decisionOutcome = null;
  req.session.data['tempOutcome'].decisionGrantedConditions = null;
  req.session.data['tempOutcome'].decisionOtherDetails = null;

  // SKIP STEP 3, REDIRECT STRAIGHT TO STEP 4
  res.redirect(`/cases/outcomes/step-4?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// 3. STEP 3: Outcome
router.get('/cases/outcomes/step-3', (req, res) => {
  var id = req.query.id;
  var draftList = req.session.data['tempOutcomesList'] || [];

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    var existingOutcome = draftList.find(o => o.id === id);
    if (existingOutcome) req.session.data['tempOutcome'] = JSON.parse(JSON.stringify(existingOutcome));
  }

  var val = req.session.data['tempOutcome']?.decisionOutcome || "";
  var grantedDetails = req.session.data['tempOutcome']?.decisionGrantedConditions || "";
  var otherDetails = req.session.data['tempOutcome']?.decisionOtherDetails || "";

  res.render('cases/outcomes/step-3-outcome', { 
    ref: req.query.ref, id: id, value: val, grantedDetails: grantedDetails, otherDetails: otherDetails
  });
});

router.post('/cases/outcomes/step-3', (req, res) => {
  var decisionOutcome = req.body.decisionOutcome;
  if (!decisionOutcome) {
    return res.render('cases/outcomes/step-3-outcome', { 
      ref: req.query.ref, id: req.query.id, errors: { decisionOutcome: { text: "Select the outcome" } }
    });
  }

  if (!req.session.data['tempOutcome']) req.session.data['tempOutcome'] = {};
  req.session.data['tempOutcome'].decisionOutcome = decisionOutcome;
  req.session.data['tempOutcome'].decisionGrantedConditions = req.body.decisionGrantedConditions;
  req.session.data['tempOutcome'].decisionOtherDetails = req.body.decisionOtherDetails;
  res.redirect(`/cases/outcomes/step-4?ref=${req.query.ref}&id=${req.query.id || ''}`);
});

// 4. STEP 4: Outcome Date (REQUIRED)
router.get('/cases/outcomes/step-4', (req, res) => {
  var id = req.query.id;
  var draftList = req.session.data['tempOutcomesList'] || [];

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    var existingOutcome = draftList.find(o => o.id === id);
    if (existingOutcome) req.session.data['tempOutcome'] = JSON.parse(JSON.stringify(existingOutcome));
  }

  var tempOutcome = req.session.data['tempOutcome'] || {};
  var outcomeDate = tempOutcome.outcomeDate || {};

  res.render('cases/outcomes/step-4-date', { 
    ref: req.query.ref, id: id, day: outcomeDate.day, month: outcomeDate.month, year: outcomeDate.year
  });
});

router.post('/cases/outcomes/step-4', (req, res) => {
  if (!req.session.data['tempOutcome']) req.session.data['tempOutcome'] = {};

  var result = validateAndSaveDate(req, res, 'outcome', 'Outcome date', req.session.data['tempOutcome'], 'outcomeDate');

  if (result.status === "SUCCESS" || result.status === "REMOVED") {
    return res.redirect(`/cases/outcomes/step-5?ref=${req.query.ref}&id=${req.query.id || ''}`);
  }

  if (result.status === "ERROR") {
    return res.render('cases/outcomes/step-4-date', { 
      ref: req.query.ref, id: req.query.id, 
      day: req.body['outcome-day'], month: req.body['outcome-month'], year: req.body['outcome-year'],
      errorList: result.errorList, errorFields: result.errorFields
    });
  }
});

// 5. STEP 5: Received Date (OPTIONAL) & SAVE TO DRAFT
router.get('/cases/outcomes/step-5', (req, res) => {
  var id = req.query.id;
  var draftList = req.session.data['tempOutcomesList'] || [];

  if (id && (!req.session.data['tempOutcome'] || req.session.data['tempOutcome'].id !== id)) {
    var existingOutcome = draftList.find(o => o.id === id);
    if (existingOutcome) req.session.data['tempOutcome'] = JSON.parse(JSON.stringify(existingOutcome));
  }

  var tempOutcome = req.session.data['tempOutcome'] || {};
  var receivedDate = tempOutcome.receivedDate || {}; 

  res.render('cases/outcomes/step-5-received', { 
    ref: req.query.ref, id: id, day: receivedDate.day, month: receivedDate.month, year: receivedDate.year
  });
});

router.post('/cases/outcomes/step-5', (req, res) => {
  if (!req.session.data['tempOutcome']) req.session.data['tempOutcome'] = {};
  var id = req.query.id;

  var day = req.body['received-day'], month = req.body['received-month'], year = req.body['received-year'];

  if (!day && !month && !year) {
    req.session.data['tempOutcome'].receivedDate = null; 
  } else {
    var result = validateAndSaveDate(req, res, 'received', 'Received date', req.session.data['tempOutcome'], 'receivedDate');
    if (result.status === "ERROR") {
      return res.render('cases/outcomes/step-5-received', { 
        ref: req.query.ref, id: id, day: day, month: month, year: year, errorList: result.errorList, errorFields: result.errorFields
      });
    }
  }

  // --- SAVE TO DRAFT ARRAY ---
  var draftList = req.session.data['tempOutcomesList'] || [];
  var temp = req.session.data['tempOutcome'];

  if (id) {
    var index = draftList.findIndex(i => i.id === id);
    if (index > -1) draftList[index] = { ...temp };
  } else {
    temp.id = id || 'out-' + Date.now();
    draftList.push(temp);
  }

  req.session.data['tempOutcomesList'] = draftList;
  req.session.data['tempOutcome'] = null; 
  res.redirect(`/cases/outcomes/hub?ref=${req.query.ref}`);
});

// ==============================================
// REMOVE (From Draft)
// ==============================================
router.get('/cases/outcomes/remove-confirm', (req, res) => {
  res.render('cases/outcomes/remove-confirm', { 
    ref: req.query.ref, id: req.query.id, 
    backUrl: `/cases/outcomes/hub?ref=${req.query.ref}`, actionUrl: `/cases/outcomes/remove?id=${req.query.id}&ref=${req.query.ref}` 
  });
});

router.post('/cases/outcomes/remove', (req, res) => {
  var ref = req.query.ref, id = req.query.id;
  if (!req.body.confirmRemove) return res.render('cases/outcomes/remove-confirm', { ref: ref, id: id, error: true, backUrl: `/cases/outcomes/hub?ref=${ref}`, actionUrl: `/cases/outcomes/remove?id=${id}&ref=${ref}` });

  if (req.body.confirmRemove === 'yes' && req.session.data['tempOutcomesList']) {
    req.session.data['tempOutcomesList'] = req.session.data['tempOutcomesList'].filter(i => i.id !== id);
  }
  res.redirect(`/cases/outcomes/hub?ref=${ref}`);
});

// ==============================================
// FINAL COMMIT / CANCEL ACTIONS
// ==============================================

// COMMIT DRAFT
router.post('/cases/outcomes/commit', function(req, res) {
  var ref = req.query.ref;
  var myCase = req.session.data['cases'].find(c => c.reference === ref);

  if (myCase) {
    var oldOutcomes = myCase.outcomes || [];
    var newOutcomes = req.session.data['tempOutcomesList'] || [];

    // 1. SMART AUDIT LOG: Check for REMOVALS
    oldOutcomes.forEach(oldItem => {
      let stillExists = newOutcomes.find(newItem => newItem.id === oldItem.id);
      if (!stillExists) {
        let outType = oldItem.type || "Outcome";
        addAuditLog(req, ref, `${outType} removed from overview`);
      }
    });

    // 2. SMART AUDIT LOG: Check for ADDITIONS
    newOutcomes.forEach(newItem => {
      let alreadyExisted = oldOutcomes.find(oldItem => oldItem.id === newItem.id);
      if (!alreadyExisted) {
        let outType = newItem.type || "Outcome";
        addAuditLog(req, ref, `${outType} added to overview`);
      }
    });

    // Safely overwrite the database with the draft
    myCase.outcomes = newOutcomes;
  }
  
  req.session.data['tempOutcomesList'] = null;
  req.session.flashSection = "outcomeOverview"; 
  res.redirect('/cases/case-details?ref=' + ref);
});

// CANCEL DRAFT
router.get('/cases/outcomes/cancel', function(req, res) {
  var ref = req.query.ref;
  var myCase = req.session.data['cases'].find(c => c.reference === ref);

  var originalOutcomes = myCase.outcomes || [];
  var draftOutcomes = req.session.data['tempOutcomesList'] || [];

  if (JSON.stringify(originalOutcomes) === JSON.stringify(draftOutcomes)) {
    req.session.data['tempOutcomesList'] = null;
    return res.redirect('/cases/case-details?ref=' + ref);
  }
  res.render('cases/outcomes/cancel-outcomes', { ref: ref });
});

router.post('/cases/outcomes/cancel', function(req, res) {
  var ref = req.query.ref;
  if (!req.body.cancelOutcomes) return res.render('cases/outcomes/cancel-outcomes', { ref: ref, error: true });

  if (req.body.cancelOutcomes === 'yes') {
    req.session.data['tempOutcomesList'] = null;
    res.redirect('/cases/case-details?ref=' + ref);
  } else {
    res.redirect('/cases/outcomes/hub?ref=' + ref);
  }
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
    req.session.data['status'] = req.query.status; 
    req.session.data['searchCriteria'] = req.query.searchCriteria;

    // --- EXPRESS ARRAY LIMIT FIX ---
    let rawSubtypes = req.query.subtype;
    if (rawSubtypes && typeof rawSubtypes === 'object' && !Array.isArray(rawSubtypes)) {
      req.session.data['subtype'] = Object.values(rawSubtypes);
    } else {
      req.session.data['subtype'] = rawSubtypes;
    }

    let rawStatuses = req.query.status;
    if (rawStatuses && typeof rawStatuses === 'object' && !Array.isArray(rawStatuses)) {
      req.session.data['status'] = Object.values(rawStatuses);
    } else {
      req.session.data['status'] = rawStatuses;
    }
  }

  // 2. Clean the arrays (Destroys the '_unchecked' junk AND double-checks the Express bug)
  const cleanArray = (categoryName) => {
    let val = req.session.data[categoryName];
    
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
  const statuses = cleanArray('status'); 
  const search = req.session.data['searchCriteria'] || "";

  // ====================================================================
  // 3. THE FILTER LOGIC: Strict "AND" logic across categories
  // ====================================================================
  const hasAreaFilters = areas.length > 0;
  const hasTypeFilters = types.length > 0;
  const hasSubtypeFilters = subtypes.length > 0;
  const hasStatusFilters = statuses.length > 0;

  if (hasAreaFilters || hasTypeFilters || hasSubtypeFilters || hasStatusFilters) {
    cases = cases.filter(c => {
      
      // Check Area: Passes if NO areas are checked, OR if the case matches a checked area
      const passesArea = !hasAreaFilters || areas.includes(c.areaValue);
      
      // Check Type: Passes if NO types are checked, OR if the case matches a checked type
      const passesType = !hasTypeFilters || types.includes(c.typeValue);
      
      // Check Subtype: Passes if NO subtypes are checked, OR if the case matches a checked subtype
      const passesSubtype = !hasSubtypeFilters || subtypes.includes(c.subtypeValue);
      
      // Check Status: Passes if NO statuses are checked, OR if the case matches a checked status
      const cStat = c.caseStatus || c.status || c['case-status'];
      const passesStatus = !hasStatusFilters || statuses.includes(cStat);

      // FINAL RESULT: The case MUST pass ALL active category checks (AND logic)
      return passesArea && passesType && passesSubtype && passesStatus;
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
        (applicantsString)
      ).toLowerCase();
      
      return content.includes(search.toLowerCase());
    });
  }
  

  // --- 5. PAGINATION LOGIC ---
  const totalCasesCount = cases.length; 
  
  let rawItems = req.query.itemsPerPage || req.session.data['itemsPerPage'];
  let itemsPerPage = parseInt(rawItems, 10);
  if (isNaN(itemsPerPage) || itemsPerPage <= 0) {
    itemsPerPage = 25; 
  }
  req.session.data['itemsPerPage'] = itemsPerPage; 

  let rawPage = req.query.page || 1;
  let currentPage = parseInt(rawPage, 10);
  if (isNaN(currentPage) || currentPage <= 0) {
    currentPage = 1;
  }

  const totalPages = Math.ceil(totalCasesCount / itemsPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCases = cases.slice(startIndex, endIndex);

  let paginationItems = [];
  let pagesToShow = [];
  
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||                   
      i === totalPages ||          
      i === currentPage ||         
      i === currentPage - 1 ||     
      i === currentPage + 1        
    ) {
      pagesToShow.push(i);
    }
  }

  let previousPage = null;
  for (let i of pagesToShow) {
    if (previousPage) {
      if (i - previousPage > 1) {
        paginationItems.push({ ellipsis: true });
      }
    }
    
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
  let category = req.params.filterCategory; // e.g., 'area', 'type', 'subtype' or 'status'
  let valueToRemove = req.params.filterValue; // e.g., 'housing' or 'Ready to start'

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
  req.session.data['status'] = ""; // <-- Added Status clear
  req.session.data['searchCriteria'] = "";
  res.redirect('/cases-filter');
});

// --- CLEAR ONLY THE SEARCH BAR ---
router.get('/cases/clear-search', function (req, res) {
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
      reference: "DRO/PER/" + i.toString().padStart(4, '0'),
      caseName: "Planning Dummy Case " + i,
      areaValue: "planning-environmental-and-applications",
      typeValue: "drought",
      subtypeValue: "drought-permits",
      type: "Drought",
      subtype: "Drought Permits",
      caseStatus: "New case",
      authorityName: "Waterways Authority",
      caseOfficer: "Kieran De La Cruz",
      applicants: [{ firstName: "John", lastName: "Doe " + i, companyName: "Aqua Corp" }]
    });
  }

  // 2. Generate 65 Rights of Way and Common Land Cases
  for (let i = 1; i <= 65; i++) {
    req.session.data['cases'].push({
      reference: "ROW/S14A/" + i.toString().padStart(4, '0'),
      caseName: "Rights of Way Dummy Case " + i,
      areaValue: "rights-of-way-and-common-land",
      typeValue: "rights-of-way",
      subtypeValue: "schedule-14-appeal",
      caseStatus: "New case",
      type: "Rights of Way",
      subtype: "Schedule 14 Appeal",
      authorityName: "Ramblers Council",
      caseOfficer: "Edward Mitchell",
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
    
    if (!c.caseNotes) c.caseNotes = [];

    // Generate the specific date & time format
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
    
    // The Summary Card uses the weekday (e.g. Monday 23 March)
    const metaDateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
    // The Table does NOT use the weekday (e.g. 23 March)
    const tableDateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const userStr = "Kieran De La Kruz"; // Matches your design mock!

    // Add the new note to the TOP of the list with structured table data
    c.caseNotes.unshift({
      text: comment,
      meta: `${timeStr} on ${metaDateStr} by ${userStr}`,
      tableDate: tableDateStr,
      tableTime: timeStr,
      tableUser: userStr
    });

    addAuditLog(req, ref, "Case note added");
  }

  res.redirect('/cases/case-details?ref=' + ref);
});

// ==============================================
// VIEW ALL CASE NOTES (GET)
// ==============================================
router.get('/cases/all-case-notes', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  res.render('cases/all-case-notes', {
    currentCase: currentCase
  });
});



// ==============================================
// HELPER: DEEP FOLDER SEARCH
// ==============================================
function findFolderDeep(folders, targetId, parent = null) {
  for (let f of folders) {
    if (f.id === targetId) return { target: f, parent: parent };
    if (f.subfolders && f.subfolders.length > 0) {
      let found = findFolderDeep(f.subfolders, targetId, f);
      if (found) return found;
    }
  }
  return null;
}

// ==============================================
// MANAGE CASE FILES (FOLDERS & SUBFOLDERS)
// ==============================================

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

  if (type.includes('coastal access') || type.includes('rights of way')) {
    return [
      createFolder('f1', 'Letters'),
      createFolder('f2', 'Internal correspondence'),
      createFolder('f3', 'Submissions'),
      createFolder('f4', 'Notices and order documents'),
      createFolder('f5', 'Decision'),
      createFolder('f6', 'Advertised modifications', ['Communications', 'Representations', 'New Decision']),
      createFolder('f7', 'Other')
    ];
  } else if (type.includes('common land')) {
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

  return [
    createFolder('f1', 'Initial documentation'),
    createFolder('f2', 'Procedure'),
    createFolder('f3', 'Statements of case / final comments', ['Statements of case', 'Final comments']),
    createFolder('f4', 'Proofs of evidence, Rebuttals and Statement of Common Ground (if inquiry)'),
    createFolder('f5', 'Start Date Letters'),
    createFolder('f6', 'Events information and notifications', ['Pre-inquiry meeting or Case management conference', 'Site Visit information (if written reps)', 'Inquiry notice']),
    createFolder('f7', 'Decision / report'),
    createFolder('f8', 'Invoice'),
    createFolder('f9', 'Costs'),
    createFolder('f10', 'Other')
  ];
}

// ROUTE: View Main Folders List
router.get('/cases/manage-folders', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  if (!currentCase.folders) {
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

// ==============================================
// SEARCH CASE FILES
// ==============================================
router.get('/cases/manage-folders/search-results', function(req, res) {
  var ref = req.query.ref;
  // Grab the search query and make it lowercase for easy matching
  var fileSearchCriteria = (req.query.fileSearchCriteria || "").toLowerCase().trim();

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  // 1. Gather ALL documents from ALL folders using a recursive function
  var allDocuments = [];

  function extractDocs(folderList) {
    for (let f of folderList) {
      // If the folder has documents, add them to our master list
      if (f.documents && f.documents.length > 0) {
        for (let doc of f.documents) {
          // We attach the folder ID and Slug to each document so the 
          // "View folder" button on the UI knows exactly where to go!
          allDocuments.push({
            ...doc,
            folderId: f.id,
            folderSlug: f.slug,
            folderName: f.name
          });
        }
      }
      // If it has subfolders, dig into them too
      if (f.subfolders && f.subfolders.length > 0) {
        extractDocs(f.subfolders);
      }
    }
  }

  // Kick off the extraction
  if (currentCase.folders) extractDocs(currentCase.folders);

  // 2. Filter the documents based on the user's search query
  var filteredDocs = [];
  if (fileSearchCriteria) {
    filteredDocs = allDocuments.filter(d => 
      d.name.toLowerCase().includes(fileSearchCriteria) || 
      d.type.toLowerCase().includes(fileSearchCriteria)
    );
  }

  // 3. Pagination Logic (Identical to the folder view)
  const totalDocsCount = filteredDocs.length; 
  
  let rawItems = req.query.itemsPerPage || req.session.data['searchItemsPerPage'];
  let itemsPerPage = parseInt(rawItems, 10);
  if (isNaN(itemsPerPage) || itemsPerPage <= 0) itemsPerPage = 25;
  req.session.data['searchItemsPerPage'] = itemsPerPage; 

  let rawPage = req.query.page || 1;
  let currentPage = parseInt(rawPage, 10);
  if (isNaN(currentPage) || currentPage <= 0) currentPage = 1;

  const totalPages = Math.ceil(totalDocsCount / itemsPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = filteredDocs.slice(startIndex, endIndex);

  let paginationItems = [];
  let pagesToShow = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || i === currentPage || i === currentPage - 1 || i === currentPage + 1) {
      pagesToShow.push(i);
    }
  }

  let previousPage = null;
  // Keep the search criteria in the URL so pagination doesn't forget the search
  let baseUrl = `/cases/manage-folders/search-results?ref=${ref}&fileSearchCriteria=${encodeURIComponent(fileSearchCriteria)}`;

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

  res.render('cases/manage-folders/search-results', {
    currentCase: currentCase,
    fileSearchCriteria: req.query.fileSearchCriteria || "", // Original casing for the text box
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

// ROUTE: View Inside a Specific Folder (With Filtering)
router.get('/cases/manage-folders/view/:folderId/:folderSlug', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  
  var activeFolder = foundFolder.target;
  var parentFolder = foundFolder.parent;

  // Banner handling
  var successBanner = req.session.data['folderCreated'];
  var renameBanner = req.session.data['folderRenamed'];
  var deleteBanner = req.session.data['folderDeleted'];
  var updateBanner = req.session.data['updateBanner']; 
  var moveBanner = req.session.data['filesMovedBanner'];
  var downloadBanner = req.session.data['filesDownloadedBanner'];
  var bulkDeleteBanner = req.session.data['filesBulkDeletedBanner'];
  var moveFileError = req.session.data['moveFileError'];
  
  if (successBanner) delete req.session.data['folderCreated'];
  if (renameBanner) delete req.session.data['folderRenamed'];
  if (deleteBanner) delete req.session.data['folderDeleted'];
  if (updateBanner) delete req.session.data['updateBanner']; 
  if (moveBanner) delete req.session.data['filesMovedBanner'];
  if (downloadBanner) delete req.session.data['filesDownloadedBanner'];
  if (bulkDeleteBanner) delete req.session.data['filesBulkDeletedBanner'];
  
  let errorList = null;
  if (moveFileError) {
    errorList = [{ text: moveFileError, href: "#checkboxes-all" }];
    delete req.session.data['moveFileError'];
  }

  // --- FILTERING LOGIC ---
  const isFormSubmit = req.query.isFilterSubmit === 'true';
  if (isFormSubmit) {
    req.session.data['fileReadStatus'] = req.query.fileReadStatus;
    req.session.data['fileFlaggedStatus'] = req.query.fileFlaggedStatus;
  }

  const cleanArray = (categoryName) => {
    let val = req.session.data[categoryName];
    if (val && typeof val === 'object' && !Array.isArray(val)) val = Object.values(val);
    return [].concat(val || []).filter(item => item && item !== '_unchecked');
  };

  const readFilters = cleanArray('fileReadStatus');
  const flagFilters = cleanArray('fileFlaggedStatus');

  var documents = activeFolder.documents || [];

  if (readFilters.length > 0 || flagFilters.length > 0) {
    documents = documents.filter(doc => {
      let docReadStatus = doc.readStatus || "Unread";
      let docFlagStatus = doc.isFlagged ? "Flagged" : "Unflagged";
      
      let matchesRead = readFilters.length === 0 || readFilters.includes(docReadStatus);
      let matchesFlag = flagFilters.length === 0 || flagFilters.includes(docFlagStatus);

      // Must match BOTH categories if BOTH have selections
      return matchesRead && matchesFlag; 
    });
  }

  // --- PAGINATION LOGIC ---
  const totalDocsCount = documents.length; 
  let rawItems = req.query.itemsPerPage || req.session.data['folderItemsPerPage'];
  let itemsPerPage = parseInt(rawItems, 10);
  if (isNaN(itemsPerPage) || itemsPerPage <= 0) itemsPerPage = 25;
  req.session.data['folderItemsPerPage'] = itemsPerPage; 

  let rawPage = req.query.page || 1;
  let currentPage = parseInt(rawPage, 10);
  if (isNaN(currentPage) || currentPage <= 0) currentPage = 1;

  const totalPages = Math.ceil(totalDocsCount / itemsPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = documents.slice(startIndex, endIndex);

  let paginationItems = [];
  let pagesToShow = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || i === currentPage || i === currentPage - 1 || i === currentPage + 1) {
      pagesToShow.push(i);
    }
  }

  let previousPage = null;
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
    paginatedDocuments: paginatedDocuments, 
    totalDocs: totalDocsCount,
    folderTotalDocs: (activeFolder.documents || []).length, // Absolute total for the text above table
    itemsPerPage: itemsPerPage,
    startItem: totalDocsCount === 0 ? 0 : startIndex + 1,
    endItem: Math.min(endIndex, totalDocsCount),
    pageItems: paginationItems,
    prevLink: currentPage > 1 ? `${baseUrl}&page=${currentPage - 1}` : null, 
    nextLink: currentPage < totalPages ? `${baseUrl}&page=${currentPage + 1}` : null 
  });
});

// ROUTE: Remove individual file filters
router.get('/cases/manage-folders/view/:folderId/:folderSlug/remove-filter/:filterCategory/:filterValue', function(req, res) {
  let ref = req.query.ref;
  let folderId = req.params.folderId;
  let folderSlug = req.params.folderSlug;
  let category = req.params.filterCategory;
  let valueToRemove = req.params.filterValue; 

  let currentFilters = req.session.data[category];
  if (currentFilters) {
    if (Array.isArray(currentFilters)) {
      req.session.data[category] = currentFilters.filter(item => item !== valueToRemove);
    } else if (currentFilters === valueToRemove) {
      req.session.data[category] = null;
    }
  }
  res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`); 
});

// ROUTE: Clear all file filters
router.get('/cases/manage-folders/view/:folderId/:folderSlug/clear-filters', function (req, res) {
  let ref = req.query.ref;
  let folderId = req.params.folderId;
  let folderSlug = req.params.folderSlug;
  
  req.session.data['fileReadStatus'] = "";
  req.session.data['fileFlaggedStatus'] = "";
  
  res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`);
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

  var foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  
  var activeFolder = foundFolder.target;
  var parentFolder = foundFolder.parent;

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

  var foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  
  var activeFolder = foundFolder.target;
  var parentFolder = foundFolder.parent;

  var issues = [];
  if (activeFolder.subfolders && activeFolder.subfolders.length > 0) {
    issues.push("It contains subfolders");
  }
  if (activeFolder.documents && activeFolder.documents.length > 0) {
    issues.push("It contains documents");
  }

  if (issues.length > 0) {
    return res.render('cases/manage-folders/delete-folder', {
      currentCase: currentCase,
      folder: activeFolder,
      parentFolder: parentFolder,
      deleteIssues: issues
    });
  }

  var deletedName = activeFolder.name;
  
  if (parentFolder) {
    parentFolder.subfolders = parentFolder.subfolders.filter(f => f.id !== folderId);
  } else {
    currentCase.folders = currentCase.folders.filter(f => f.id !== folderId);
  }

  addAuditLog(req, ref, `Folder deleted: ${deletedName}`);
  req.session.data['folderDeleted'] = deletedName;

  req.session.save(function(err) {
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

  var foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  if (!activeFolder.documents) activeFolder.documents = [];

  var fileTypes = ["PDF", "DOCX", "XLSX", "JPG", "PNG"];
  
  // Use the EXACT same array of names from your upload logic!
  var randomNames = [
    "Site-inspection-report",
    "Appellant-costs-application",
    "LPA-questionnaire-response",
    "Interested-party-comments",
    "Hearing-attendance-sheet",
    "Decision-draft-v2",
    "Ecological-survey-results",
    "Transport-assessment-summary",
    "Planning-obligation-draft",
    "Officer-delegated-report"
  ];

  for (let i = 1; i <= 65; i++) {
    var type = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    
    // Grab a random name and append a random 4 digit suffix, joined by HYPHENS
    var randomBaseName = randomNames[Math.floor(Math.random() * randomNames.length)];
    var randomSuffix = Math.floor(1000 + Math.random() * 9000);
    var generatedName = `${randomBaseName}-${randomSuffix}.${type.toLowerCase()}`;
    
    var randomSizeNum = Math.floor(Math.random() * 5000) + 50; 
    var sizeLabel = randomSizeNum > 1000 ? (randomSizeNum / 1000).toFixed(1) + "MB" : randomSizeNum + "KB";

    activeFolder.documents.push({
      id: 'dummy-doc-' + Date.now() + '-' + i,
      name: generatedName, // Use our newly generated hyphenated name
      type: type,
      sizeNum: randomSizeNum,
      size: sizeLabel,
      dateTimestamp: Date.now() - (i * 100000), 
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    });
  }

  res.redirect(`/cases/manage-folders/view/${activeFolder.id}/${activeFolder.slug}?ref=${ref}`);
});

// ==============================================
// UPLOAD FILES
// ==============================================

router.get('/cases/manage-folders/view/:folderId/:folderSlug/upload', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  res.render('cases/manage-folders/upload', {
    currentCase: currentCase,
    folder: activeFolder
  });
});

router.post('/cases/manage-folders/view/:folderId/:folderSlug/upload/document', function(req, res) {
  res.json({
    success: { messageText: "File uploaded successfully" },
    file: { originalname: "uploaded-file.pdf", filename: "file-" + Date.now() }
  });
});

router.post('/cases/manage-folders/view/:folderId/:folderSlug/upload/delete', function(req, res) {
  res.json({ success: { messageText: "File deleted" } });
});

router.post('/cases/manage-folders/view/:folderId/:folderSlug/upload', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  var uploadedFiles = req.body.mockFiles;

  if (!uploadedFiles || uploadedFiles.length === 0) {
    return res.render('cases/manage-folders/upload', {
      currentCase: currentCase,
      folder: activeFolder,
      errorList: [{ text: "Select a file to upload", href: "#mock-choose-files-btn" }]
    });
  }

  if (!Array.isArray(uploadedFiles)) {
    uploadedFiles = [uploadedFiles];
  }

  if (!activeFolder.documents) activeFolder.documents = [];

  for (let mockData of uploadedFiles) {
    var parts = mockData.split('|');
    var exactName = parts[0];
    var exactSizeStr = parts[1] || "11KB";
    var exactSizeNum = parseInt(parts[2]) || 11;
    var ext = exactName.split('.').pop().toUpperCase();
    
    activeFolder.documents.unshift({
      id: 'doc-' + Date.now() + Math.floor(Math.random() * 1000),
      name: exactName, 
      type: ext,
      sizeNum: exactSizeNum, 
      size: exactSizeStr, 
      dateTimestamp: Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    });
  }
  
  addAuditLog(req, ref, `${uploadedFiles.length} file(s) uploaded to folder: ${activeFolder.name}`);
  
  req.session.data['updateBanner'] = { 
    count: uploadedFiles.length, 
    folderName: activeFolder.name 
  };

  req.session.save(function(err) {
    res.redirect(`/cases/manage-folders/view/${activeFolder.id}/${activeFolder.slug}?ref=${ref}`);
  });
});

// ==============================================
// MOVE FILES JOURNEY
// ==============================================

router.post('/cases/manage-folders/view/:folderId/:folderSlug/move-files', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;
  
  var rawSelected = req.body.selectedFiles || req.session.data['selectedFiles'];
  var selectedFiles = [];
  if (rawSelected) {
    var arr = Array.isArray(rawSelected) ? rawSelected : [rawSelected];
    selectedFiles = arr.filter(item => item && item !== '_unchecked');
  }
  
  if (selectedFiles.length === 0) {
    req.session.data['moveFileError'] = "Select a file or files to move";
    return req.session.save(function() {
      res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`); 
    });
  }

  req.session.data['filesToMove'] = selectedFiles;
  res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}/move-files/step-1?ref=${ref}`);
});

router.get('/cases/manage-folders/view/:folderId/:folderSlug/move-files/step-1', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  var fileIdsToMove = req.session.data['filesToMove'] || [];
  var docsToMove = (activeFolder.documents || []).filter(d => fileIdsToMove.includes(d.id));

  res.render('cases/manage-folders/move-1-files', {
    currentCase: currentCase,
    folder: activeFolder,
    docsToMove: docsToMove
  });
});

router.get('/cases/manage-folders/view/:folderId/:folderSlug/move-files/location', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);

  var foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  
  var activeFolder = foundFolder.target;
  var parentFolder = foundFolder.parent; // <-- Extract the parent folder

  res.render('cases/manage-folders/move-2-location', {
    currentCase: currentCase,
    folder: activeFolder,
    parentFolder: parentFolder, // <-- Pass it to the HTML
    allFolders: currentCase.folders 
  });
});

router.post('/cases/manage-folders/view/:folderId/:folderSlug/move-files/location', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;
  var destinationId = req.body.destinationFolderId;

  if (!destinationId) {
    return res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}/move-files/location?ref=${ref}`);
  }

  req.session.data['moveDestinationId'] = destinationId;
  res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}/move-files/check?ref=${ref}`);
});

router.get('/cases/manage-folders/view/:folderId/:folderSlug/move-files/check', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);

  var foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  var destId = req.session.data['moveDestinationId'];
  var foundDest = findFolderDeep(currentCase.folders, destId);
  var destFolder = foundDest ? foundDest.target : null;
  var destParent = foundDest ? foundDest.parent : null;

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

  var foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var sourceFolder = foundFolder.target;

  var destId = req.session.data['moveDestinationId'];
  var foundDest = findFolderDeep(currentCase.folders, destId);
  var destFolder = foundDest ? foundDest.target : null;

  var fileIdsToMove = req.session.data['filesToMove'] || [];
  var extractedDocs = [];

  sourceFolder.documents = sourceFolder.documents.filter(d => {
    if (fileIdsToMove.includes(d.id)) {
      extractedDocs.push(d);
      return false; 
    }
    return true; 
  });

  if (!destFolder.documents) destFolder.documents = [];
  destFolder.documents.unshift(...extractedDocs); 

  req.session.data['filesToMove'] = null;
  req.session.data['moveDestinationId'] = null;

  req.session.data['filesMovedBanner'] = { count: extractedDocs.length, destName: destFolder.name };
  
  req.session.save(function(err) {
    // THE FIX: Redirect to the destination folder instead of the source folder
    res.redirect(`/cases/manage-folders/view/${destFolder.id}/${destFolder.slug}?ref=${ref}`);
  });
});

// ==============================================
// REMOVE A FILE FROM THE MOVE LIST
// ==============================================
router.get('/cases/manage-folders/view/:folderId/:folderSlug/move-files/remove', function(req, res) {
  var ref = req.query.ref;
  var docId = req.query.docId;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;

  // Grab the array of files scheduled to be moved
  if (req.session.data['filesToMove']) {
    
    let selected = req.session.data['filesToMove'];
    if (!Array.isArray(selected)) {
      selected = [selected];
    }

    // Filter out the file the user just clicked "Remove" on
    req.session.data['filesToMove'] = selected.filter(id => id !== docId);
  }

  // Redirect back to step 1 so the table updates
  res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}/move-files/step-1?ref=${ref}`);
});

// ==============================================
// BULK DOWNLOAD (Dummy Mock)
// ==============================================
router.post('/cases/manage-folders/view/:folderId/:folderSlug/download-selected', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;
  
  var rawSelected = req.body.selectedFiles || req.session.data['selectedFiles'];
  var selectedFiles = [];
  if (rawSelected) {
    var arr = Array.isArray(rawSelected) ? rawSelected : [rawSelected];
    selectedFiles = arr.filter(item => item && item !== '_unchecked');
  }

  if (selectedFiles.length === 0) {
    req.session.data['moveFileError'] = "Select a file or files to download";
    return req.session.save(() => res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`));
  }

  req.session.data['filesDownloadedBanner'] = selectedFiles.length;
  req.session.save(() => res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`));
});

// ==============================================
// BULK DELETE
// ==============================================

router.post('/cases/manage-folders/view/:folderId/:folderSlug/delete-selected', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;
  
  var rawSelected = req.body.selectedFiles || req.session.data['selectedFiles'];
  var selectedFiles = [];
  if (rawSelected) {
    var arr = Array.isArray(rawSelected) ? rawSelected : [rawSelected];
    selectedFiles = arr.filter(item => item && item !== '_unchecked');
  }

  if (selectedFiles.length === 0) {
    req.session.data['moveFileError'] = "Select a file or files to delete";
    return req.session.save(() => res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`));
  }

  req.session.data['filesToDelete'] = selectedFiles;
  res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}/delete-selected/confirm?ref=${ref}`);
});

router.get('/cases/manage-folders/view/:folderId/:folderSlug/delete-selected/confirm', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);

  var foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  var fileIdsToDelete = req.session.data['filesToDelete'] || [];
  var docsToDelete = (activeFolder.documents || []).filter(d => fileIdsToDelete.includes(d.id));

  res.render('cases/manage-folders/delete-selected', {
    currentCase: currentCase,
    folder: activeFolder,
    docsToDelete: docsToDelete
  });
});

router.post('/cases/manage-folders/view/:folderId/:folderSlug/delete-selected/confirm', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);

  var foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  var fileIdsToDelete = req.session.data['filesToDelete'] || [];
  
  var docsToDelete = (activeFolder.documents || []).filter(d => fileIdsToDelete.includes(d.id));
  var actualDeletedCount = docsToDelete.length;

  activeFolder.documents = activeFolder.documents.filter(d => !fileIdsToDelete.includes(d.id));

  req.session.data['filesToDelete'] = null;
  addAuditLog(req, ref, `${actualDeletedCount} file(s) bulk deleted from ${activeFolder.name}`);

  req.session.data['filesBulkDeletedBanner'] = actualDeletedCount;
  
  req.session.save(() => res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`));
});

// ==============================================
// REMOVE A FILE FROM THE BULK DELETE LIST
// ==============================================
router.get('/cases/manage-folders/view/:folderId/:folderSlug/delete-selected/remove', function(req, res) {
  var ref = req.query.ref;
  var docId = req.query.docId;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;

  // 1. Grab the array from filesToDelete (which is what your confirm page uses)
  if (req.session.data['filesToDelete']) {
    
    let selected = req.session.data['filesToDelete'];
    if (!Array.isArray(selected)) {
      selected = [selected];
    }

    // 2. Filter out the specific file the user just clicked "Remove" on
    req.session.data['filesToDelete'] = selected.filter(id => id !== docId);
  }

  // 3. THE FIX: Redirect back to the correct /confirm page!
  res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}/delete-selected/confirm?ref=${ref}`);
});

// ==============================================
// RENAME A FOLDER
// ==============================================

router.get('/cases/manage-folders/view/:folderId/:folderSlug/rename', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  
  var activeFolder = foundFolder.target;
  var parentFolder = foundFolder.parent;

  res.render('cases/manage-folders/rename-folder', {
    currentCase: currentCase,
    folder: activeFolder,
    parentFolder: parentFolder
  });
});

router.post('/cases/manage-folders/view/:folderId/:folderSlug/rename', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var newFolderName = req.body.folderName;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  
  var activeFolder = foundFolder.target;
  var parentFolder = foundFolder.parent;

  var renderError = (msg) => {
    return res.render('cases/manage-folders/rename-folder', {
      currentCase: currentCase,
      folder: activeFolder,
      parentFolder: parentFolder,
      folderName: newFolderName, 
      errorList: [{ text: msg, href: "#folderName" }]
    });
  };

  // 1. Check for empty
  if (!newFolderName || newFolderName.trim() === '') return renderError("Enter a folder name");
  
  var cleanName = newFolderName.trim();
  
  // 2. Check length
  if (cleanName.length < 3 || cleanName.length > 255) return renderError("Folder name must be between 3 and 255 characters");
  
  // 3. Check invalid characters
  var validCharsRegex = /^[a-zA-Z0-9 _\-']+$/;
  if (!validCharsRegex.test(cleanName)) {
    return renderError("Folder name must only include letters a to z, numbers and special characters such as spaces, underscores, hyphens and apostrophes");
  }

  // 4. NEW: Check if the user actually changed the name
  if (cleanName === activeFolder.name) {
    return renderError("Choose a new folder name");
  }

  // 5. Check if another folder already has this name
  var siblingsList = parentFolder ? parentFolder.subfolders : currentCase.folders;
  var isDuplicate = siblingsList.some(f => f.name.toLowerCase() === cleanName.toLowerCase() && f.id !== folderId);
  
  if (isDuplicate) return renderError("A folder with this name already exists");

  // Save the folder
  var oldName = activeFolder.name;
  activeFolder.name = cleanName;
  activeFolder.slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  addAuditLog(req, ref, `Folder renamed: ${oldName} to ${cleanName}`);
  req.session.data['folderRenamed'] = activeFolder;

  req.session.save(function(err) {
    res.redirect(`/cases/manage-folders/view/${activeFolder.id}/${activeFolder.slug}?ref=${ref}`);
  });
});

// ==============================================
// CREATE A SUBFOLDER
// ==============================================

router.get('/cases/manage-folders/view/:folderId/:folderSlug/create-subfolder', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  res.render('cases/manage-folders/create-subfolder', {
    currentCase: currentCase,
    parentFolder: activeFolder // We use the folder we are INSIDE as the parent
  });
});

router.post('/cases/manage-folders/view/:folderId/:folderSlug/create-subfolder', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;
  var folderName = req.body.folderName;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var parentFolder = foundFolder.target; // The folder we are in becomes the parent

  var renderError = (msg) => {
    return res.render('cases/manage-folders/create-subfolder', {
      currentCase: currentCase,
      parentFolder: parentFolder,
      folderName: folderName, 
      errorList: [{ text: msg, href: "#folderName" }]
    });
  };

  if (!folderName || folderName.trim() === '') return renderError("Enter a folder name");
  var cleanFolderName = folderName.trim();
  if (cleanFolderName.length < 3 || cleanFolderName.length > 255) return renderError("Folder name must be between 3 and 255 characters");
  
  var validCharsRegex = /^[a-zA-Z0-9 _\-']+$/;
  if (!validCharsRegex.test(cleanFolderName)) return renderError("Folder name must only include letters a to z, numbers and special characters such as spaces, underscores, hyphens and apostrophes");

  if (!parentFolder.subfolders) parentFolder.subfolders = [];

  var isDuplicate = parentFolder.subfolders.some(f => f.name.toLowerCase() === cleanFolderName.toLowerCase());
  if (isDuplicate) return renderError("A folder with this name already exists");

  var newId = parentFolder.id + '-sub-' + Date.now();
  var newSlug = cleanFolderName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  var newSubfolder = {
    id: newId,
    name: cleanFolderName,
    slug: newSlug,
    subfolders: [] 
  };

  parentFolder.subfolders.push(newSubfolder);
  addAuditLog(req, ref, `Subfolder created: ${cleanFolderName} (in ${parentFolder.name})`);
  req.session.data['folderCreated'] = newSubfolder;

  req.session.save(function(err) {
    res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`);
  });
});

// ==============================================
// CREATE A MAIN FOLDER
// ==============================================

router.get('/cases/manage-folders/create', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  res.render('cases/manage-folders/create', {
    currentCase: currentCase
  });
});

router.post('/cases/manage-folders/create', function(req, res) {
  var ref = req.query.ref;
  var folderName = req.body.folderName;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  if (!folderName || folderName.trim() === '') {
    return res.render('cases/manage-folders/create', {
      currentCase: currentCase,
      errorList: [{ text: "Enter a folder name", href: "#folderName" }]
    });
  }

  var cleanFolderName = folderName.trim();

  var isDuplicate = currentCase.folders.some(f => f.name.toLowerCase() === cleanFolderName.toLowerCase());
  
  if (isDuplicate) {
    return res.render('cases/manage-folders/create', {
      currentCase: currentCase,
      folderName: cleanFolderName,
      errorList: [{ text: "A folder with this name already exists", href: "#folderName" }]
    });
  }

  var newId = 'f-' + Date.now();
  var newSlug = cleanFolderName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  var newFolder = {
    id: newId,
    name: cleanFolderName,
    slug: newSlug,
    subfolders: []
  };

  currentCase.folders.push(newFolder);

  addAuditLog(req, ref, "Folder created: " + cleanFolderName);
  req.session.data['folderCreated'] = newFolder;

  res.redirect(`/cases/manage-folders?ref=${ref}`);
});

// ==============================================
// DELETE A FILE
// ==============================================

router.get('/cases/manage-folders/view/:folderId/:folderSlug/:docId/delete', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var docId = req.params.docId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  var activeDoc = (activeFolder.documents || []).find(d => d.id === docId);
  if (!activeDoc) return res.redirect(`/cases/manage-folders/view/${activeFolder.id}/${activeFolder.slug}?ref=${ref}`);

  res.render('cases/manage-folders/delete-file', {
    currentCase: currentCase,
    folder: activeFolder,
    doc: activeDoc
  });
});

router.post('/cases/manage-folders/view/:folderId/:folderSlug/:docId/delete', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var docId = req.params.docId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  var activeDoc = (activeFolder.documents || []).find(d => d.id === docId);
  
  if (activeDoc) {
    activeFolder.documents = activeFolder.documents.filter(d => d.id !== docId);
    addAuditLog(req, ref, `File deleted: ${activeDoc.name} from ${activeFolder.name}`);
  }

  res.redirect(`/cases/manage-folders/view/${activeFolder.id}/${activeFolder.slug}/file-deleted?ref=${ref}`);
});

router.get('/cases/manage-folders/view/:folderId/:folderSlug/file-deleted', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  res.render('cases/manage-folders/file-deleted', {
    currentCase: currentCase,
    folder: activeFolder
  });
});

// ==============================================
// TOGGLE READ/FLAG STATUS (SILENT POST)
// ==============================================
router.post('/cases/manage-folders/view/:folderId/:folderSlug/:docId/toggle-status', function(req, res) {
  var ref = req.body.ref;
  var actionType = req.body.actionType; // 'readStatus' or 'isFlagged'
  var newValue = req.body.newValue;
  
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  
  if (currentCase) {
    var foundFolder = findFolderDeep(currentCase.folders, req.params.folderId);
    if (foundFolder) {
      var activeDoc = (foundFolder.target.documents || []).find(d => d.id === req.params.docId);
      if (activeDoc) {
         if (actionType === 'readStatus') activeDoc.readStatus = newValue;
         if (actionType === 'isFlagged') activeDoc.isFlagged = newValue;
      }
    }
  }
  res.json({ success: true });
});


// ==============================================
// DOWNLOAD ALL CONTACTS AS CSV
// ==============================================
router.get('/cases/download-contacts', function (req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(c => c.reference === ref);

  if (!currentCase) {
    return res.redirect('/cases-page');
  }

  // 1. Set up the CSV Headers (Includes the Type/Status column!)
  let csvContent = "Role,Type / Status,First Name,Last Name,Company / Organisation,Email,Phone\n";

  // 2. Helper function to safely escape commas in CSV data
  const escapeCSV = (str) => {
    if (!str) return "";
    let safeStr = str.toString().replace(/"/g, '""'); // Escape double quotes
    return `"${safeStr}"`; // Wrap in quotes to protect inner commas
  };

  // 3. Process Applicants (Maps to: firstName, lastName, companyName)
  if (currentCase.applicants && currentCase.applicants.length > 0) {
    currentCase.applicants.forEach(app => {
      csvContent += `Applicant,,${escapeCSV(app.firstName)},${escapeCSV(app.lastName)},${escapeCSV(app.companyName)},${escapeCSV(app.email)},${escapeCSV(app.phone)}\n`;
    });
  }

  // 4. Process Objectors (Maps to: status, fname, lname, org)
  if (currentCase.objectors && currentCase.objectors.length > 0) {
    currentCase.objectors.forEach(obj => {
      csvContent += `Objector,${escapeCSV(obj.status)},${escapeCSV(obj.fname)},${escapeCSV(obj.lname)},${escapeCSV(obj.org)},${escapeCSV(obj.email)},${escapeCSV(obj.phone)}\n`;
    });
  }

  // 5. Process Contacts (Maps to: type, fname, lname, org)
  if (currentCase.contacts && currentCase.contacts.length > 0) {
    currentCase.contacts.forEach(con => {
      csvContent += `Contact,${escapeCSV(con.type)},${escapeCSV(con.fname)},${escapeCSV(con.lname)},${escapeCSV(con.org)},${escapeCSV(con.email)},${escapeCSV(con.phone)}\n`;
    });
  }

  // 6. Tell the browser to download this as a CSV file natively
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="contacts-${ref.replace(/\//g, '-')}.csv"`);
  res.send(csvContent);
});


module.exports = router;




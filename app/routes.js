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
  var newCase = {
    "reference": finalRef,
    "status": "Received",
    "type": caseType,
    "subtype": subtype,
    "receivedDay": req.session.data['case-received-date-day'],
    "receivedMonth": req.session.data['case-received-date-month'],
    "receivedYear": req.session.data['case-received-date-year'],
    "caseOfficer": req.session.data['caseOfficer'],
    "siteAddress": "",
    "appellantName": "",
    "lpa": ""
  };

  if (!req.session.data['cases']) { req.session.data['cases'] = []; }
  req.session.data['cases'].push(newCase);


  // --- 7. REDIRECT WITH URL PARAM (Crucial for Success Page) ---
  console.log("SUCCESS: Case Saved with Ref:", finalRef);
  
  // Pass the ref in the URL so the Success Page sees it immediately
  res.redirect('/cases/create-a-case/success?caseRef=' + encodeURIComponent(finalRef));

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
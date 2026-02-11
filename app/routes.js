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

router.post('/cases/create-a-case/success', function (req, res) {

  // --- DEBUGGING ---
  console.log("--- Creating Case Reference ---");
  console.log("PEAS Type:", req.session.data['peas-type-of-case']);
  console.log("ROW Type:", req.session.data['row-type-of-case']);
  console.log("Subtype Answer:", req.session.data['peas-subtype'] || req.session.data['row-subtype']);

  // 1. Get the Case Type
  // We check 'row-type-of-case' first (for Coastal/Common/ROW), then 'peas-type-of-case'
  var caseType = req.session.data['row-type-of-case'] || 
                 req.session.data['peas-type-of-case'] || 
                 req.session.data['casework-area'];

  // 2. Get the Subtype
  // We check all possible variables where the subtype might be stored
  var subtype = req.session.data['row-subtype'] || 
                req.session.data['common-land-subtype'] || 
                req.session.data['coastal-subtype'] ||
                req.session.data['wayleaves-subtype'] ||
                req.session.data['peas-subtype'] ||
                req.session.data['other-sos-casework-subtype'] ||
                req.session.data['housing-subtype'] ||
                req.session.data['drought-subtype'];

  // 3. Define the Data Map (Based strictly on your Sheet)
  // Structure: { CaseType: { Subtype: [Prefix, Code] } }
  const refData = {
    // --- Planning and Environmental Applications ---
    "Drought": {
      "Drought orders": ["DRO", "ORD"],
      "Drought permits": ["DRO", "PER"]
    },
    "Housing and Planning CPOs": {
      "Housing": ["CPO", "HOU"],
      "Planning": ["CPO", "PLA"],
      "Ad hoc CPO": ["CPO", "ADH"] 
    },
    "Other Secretary of State casework": {
      "DEFRA CPO": ["SOS", "ENV"],
      "DESNZ CPO": ["SOS", "ENG"],
      "DfT CPO": ["SOS", "TRN"],
      "Ad hoc CPO": ["SOS", "CPO"], // Note: Different code from Housing CPO
      "Advert": ["SOS", "ADV"],
      "Completion notice": ["SOS", "COM"],
      "Discontinuance notice": ["SOS", "DIS"],
      "Modification to planning permission": ["SOS", "MOD"],
      "Review of mineral permission": ["SOS", "MIN"],
      "Revocation": ["SOS", "REV"],
      "Other": ["SOS", "OTH"]
    },
    "Purchase Notices": {
      // Purchase Notices has no subtype code in the sheet, handled separately
    },
    "Wayleaves": {
      "New lines": ["WAY", "LIN"],
      "Tree Loping": ["WAY", "TRE"], // Note: Sheet said 'Tree lopping', code TRE
      "Wayleaves": ["WAY", "WAY"]
    },

    // --- Rights of Way and Common Land ---
    "Coastal Access": {
      "Coastal access appeal": ["MCA", "CAA"],
      "Notice appeal": ["MCA", "NOT"],
      "Objection": ["MCA", "OBJ"],
      "Restriction appeal (access land)": ["MCA", "RES"]
    },
    "Common Land": {
      "Commons for Ecclesiastical Purposes": ["COM", "ECC"],
      "Commons in Greater London": ["COM", "LDN"],
      "Compulsory Purchase of Common Land": ["COM", "PCL"],
      "Correction of the Common Land or Village Green Registers": ["COM", "COR"],
      "Deregistration & Exchange": ["COM", "DRE"],
      "Inclosure": ["COM", "INC"],
      "Inclosure : obsolescent functions": ["COM", "OBS"],
      "Land Exchange": ["COM", "LEX"],
      "Local Acts and Provisional Order Confirmation Acts": ["COM", "LCA"],
      "Public Access to Commons - limitations and restrictions": ["COM", "PAC"],
      "Scheme of Management": ["COM", "SOM"],
      "Stint Rates": ["COM", "STI"],
      "Works on Common Land": ["COM", "WCL"],
      "Works on Common Land (National Trust)": ["COM", "WNT"]
    },
    "Rights of Way": {
      "Dispensation for Serving Notice HA80": ["ROW", "SNH"],
      "Dispensation for Serving Notice TCPA90": ["ROW", "SNT"],
      "Dispensation for Serving Notice WCA81": ["ROW", "SNW"],
      "Opposed Definitive Map Modification Order (DMMO)": ["ROW", "DMM"],
      "Opposed Public Path Order (PPO) HA80": ["ROW", "PPH"],
      "Opposed Public Path Order (PPO) TCPA90": ["ROW", "PPT"],
      "Schedule 14 Appeal": ["ROW", "S14A"],
      "Schedule 14 Direction": ["ROW", "S14D"],
      "Schedule 13A Appeal": ["ROW", "S13A"]
    }
  };

  // 4. Generate the Reference Number
  var finalRef = "";
  
  // Random 5-digit sequence (e.g., 00042)
  var seq = "000" + Math.floor(1 + Math.random() * 99); 

  // LOGIC: Check Purchase Notices first, then look up the map
  if (caseType == "Purchase Notices") {
    // Format: PUR/00001
    finalRef = `PUR/${seq}`;
  } 
  else {
    // Try to find the codes in our map
    // We safely check if the caseType exists, then if the subtype exists
    var typeGroup = refData[caseType];
    
    if (typeGroup && typeGroup[subtype]) {
      var codes = typeGroup[subtype]; // e.g. ["SOS", "ENV"]
      var prefix = codes[0];
      var subCode = codes[1];
      
      // Format: PREFIX/CODE/NUMBER (e.g., SOS/ENV/00001)
      finalRef = `${prefix}/${subCode}/${seq}`;
    } 
    else {
      // Fallback if data is missing or doesn't match
      console.log("ERROR: Could not find mapping for", caseType, "->", subtype);
      finalRef = `UNKNOWN/${seq}`;
    }
  }

  // 5. Save and Redirect
  req.session.data['caseRef'] = finalRef;
  console.log("Generated Ref:", finalRef);
  
  res.render('cases/create-a-case/success');

});
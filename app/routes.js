//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here


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

  var errorList = []   // Stores every error found
  var errorFields = [] // Stores which boxes to highlight

  // --- 1. CHECK FOR MISSING DATA ---

  // CRITICAL: If EVERYTHING is empty, just stop here.
  if (!day && !month && !year) {
    errorList.push({ text: "Enter received date of submission", href: "#case-received-date-day" })
    errorFields = ['day', 'month', 'year']
  } 
  else {
    // If specific parts are missing, identify which ones
    var missing = []
    if (!day) missing.push('day')
    if (!month) missing.push('month')
    if (!year) missing.push('year')

    // If we found missing parts, create the specific error message
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

  // --- 2. CHECK FOR INVALID DATA ---
  // We run these checks INDEPENDENTLY of the missing checks above.
  // This allows us to catch "Day is 213" (Invalid) AND "Month is empty" (Missing) at the same time.

  // Check Day (only if user typed something)
  if (day) {
    var dayNum = Number(day)
    if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) {
      errorList.push({ text: "Received date of submission day must be a real day", href: "#case-received-date-day" })
      if (!errorFields.includes('day')) errorFields.push('day')
    }
  }

  // Check Month (only if user typed something)
  if (month) {
    var monthNum = Number(month)
    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      errorList.push({ text: "Received date of submission month must be between 1 and 12", href: "#case-received-date-month" })
      if (!errorFields.includes('month')) errorFields.push('month')
    }
  }

  // Check Year (only if user typed something)
  if (year) {
    var yearNum = Number(year)
    if (year.length != 4 || isNaN(yearNum)) {
      errorList.push({ text: "Received date of submission year must include four numbers", href: "#case-received-date-year" })
      if (!errorFields.includes('year')) errorFields.push('year')
    }
  }

  // --- 3. RENDER OR REDIRECT ---

  if (errorList.length > 0) {
    // combine the error messages for the field label (separated by <br>)
    var fieldErrorMessage = errorList.map(e => e.text).join('<br>')

    res.render('/cases/create-a-case/questions/case-received-date', {
      errorList: errorList,
      errorFields: errorFields,
      fieldErrorMessage: fieldErrorMessage, // Send the combined string
      // Send back input values
      day: day,
      month: month,
      year: year
    })
  } else {
    res.redirect('/cases/create-a-case/questions/applicant')
  }

})
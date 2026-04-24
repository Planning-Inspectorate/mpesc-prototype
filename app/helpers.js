// ==============================================================================
// SHARED GLOBALS
// ==============================================================================

// List of allowed LPA's for accessible autocomplete
const validAuthorities = [
  "Bristol City Council", "Camden London Borough Council", "Cornwall Council",
  "Manchester City Council", "Nottingham City Council", "Sheffield City Council",
  "Southwark Council", "Wandsworth Borough Council", "Westminster City Council", "York City Council"
];

// ================================================================================
// 1. GET CASE HELPER --- helper to find the correct case data
// ================================================================================ 
function getCase(req) {
  var ref = req.query.ref || req.body.ref || req.params.ref;
  var cases = req.session.data['cases'] || [];
  return cases.find(c => c.reference === ref);
}

// ================================================================================
// 2. AUDIT LOG HELPER --- helper to create audit logs when user data is changed
// ================================================================================ 
function addAuditLog(req, caseRef, details) {
  let cases = req.session.data['cases'] || [];
  let targetCase = cases.find(c => c.reference === caseRef);

  if (targetCase) {
    if (!targetCase.auditLog) targetCase.auditLog = [];

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();

    targetCase.auditLog.unshift({
      date: `${dateStr}<br>${timeStr}`,
      details: details,
      user: req.session.data['currentUser'] || "User Account"
    });

    targetCase.lastModified = `${dateStr} at ${timeStr}`;
    targetCase.lastModifiedBy = req.session.data['currentUser'] || "User Account";
  }
}

// ================================================================================
// 3. ADDRESS VALIDATION -- checking address fields contain a real postcode
// ================================================================================
function validateAndSaveAddress(req, res, fieldName, displayName, storageObj, storageKey) {
  var line1 = req.body[fieldName + '-line1'];
  var line2 = req.body[fieldName + '-line2'];
  var town = req.body[fieldName + '-town'];
  var county = req.body[fieldName + '-county'];
  var postcode = req.body[fieldName + '-postcode'];
  var action = req.body.action;

  if (action === 'remove') {
    delete storageObj[storageKey];
    return { status: "REMOVED" };
  }

  var errorList = [];
  var errorFields = [];

  if (postcode && postcode.trim() !== "") {
    var cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    var postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/;

    if (cleanPostcode.length < 5 || cleanPostcode.length > 7) {
      errorList.push({ text: "Postcode must be between 5 and 7 characters", href: "#" + fieldName + "-postcode" });
      errorFields.push('postcode');
    } else if (!postcodeRegex.test(cleanPostcode)) {
      errorList.push({ text: "Enter a real postcode", href: "#" + fieldName + "-postcode" });
      errorFields.push('postcode');
    }
  }

  if (errorList.length > 0) return { status: "ERROR", errorList: errorList, errorFields: errorFields };

  var fullAddress = [line1, line2, town, county, postcode].filter(Boolean).join('<br>');
  storageObj[storageKey] = { line1: line1, line2: line2, town: town, county: county, postcode: postcode, formatted: fullAddress };

  return { status: "SUCCESS" };
}

// ================================================================================
// 4. DATE VALIDATION -- checking fields only contain the correct date
// ================================================================================
function validateAndSaveDate(req, res, fieldName, displayName, storageObj, storageKey) {
  var day = req.body[fieldName + '-day'];
  var month = req.body[fieldName + '-month'];
  var year = req.body[fieldName + '-year'];
  var action = req.body.action;

  if (action === 'remove') {
    delete storageObj[storageKey];
    return { status: "REMOVED" };
  }

  var errorList = [];
  var errorFields = [];

  if (!day && !month && !year) {
    errorList.push({ text: "Enter the " + displayName.toLowerCase(), href: "#" + fieldName + "-day" });
    errorFields = ['day', 'month', 'year'];
  } else {
    var missing = [];
    if (!day) missing.push('day');
    if (!month) missing.push('month');
    if (!year) missing.push('year');
  
    if (missing.length > 0) {
      var missingText = missing.length === 2 ? displayName + " must include a " + missing[0] + " and " + missing[1] : displayName + " must include a " + missing[0];
      errorList.push({ text: missingText, href: "#" + fieldName + "-" + missing[0] });
      errorFields = errorFields.concat(missing);
    }
  }

  if (day && (Number(day) < 1 || Number(day) > 31 || isNaN(Number(day)))) { errorList.push({ text: displayName + " day must be a real day", href: "#" + fieldName + "-day" }); if (!errorFields.includes('day')) errorFields.push('day'); }
  if (month && (Number(month) < 1 || Number(month) > 12 || isNaN(Number(month)))) { errorList.push({ text: displayName + " month must be a real month", href: "#" + fieldName + "-month" }); if (!errorFields.includes('month')) errorFields.push('month'); }
  if (year && (year.length != 4 || isNaN(Number(year)))) { errorList.push({ text: displayName + " year must include 4 numbers", href: "#" + fieldName + "-year" }); if (!errorFields.includes('year')) errorFields.push('year'); }

  if (day && month && year && errorList.length === 0) {
     var dateObj = new Date(year, month - 1, day);
     if ((dateObj.getMonth() + 1 != month) || (dateObj.getDate() != day)) {
        errorList.push({ text: "Enter a real date", href: "#" + fieldName + "-day" });
        errorFields = ['day', 'month', 'year'];
     }
  }

  if (errorList.length > 0) return { status: "ERROR", errorList: errorList, errorFields: errorFields };

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var formatted = day + " " + (month ? months[month - 1] : "") + " " + year;

  storageObj[storageKey] = { day: day, month: month, year: year, formatted: formatted };
  return { status: "SUCCESS" };
}

// =================================================================================
// 5. DATE + TIME VALIDATION -- checking fields contain the correct time and date
// =================================================================================
function validateAndSaveDateTime(req, res, fieldName, displayName, storageObj, storageKey) {
  var day = req.body[fieldName + '-day']; var month = req.body[fieldName + '-month']; var year = req.body[fieldName + '-year'];
  var hour = req.body[fieldName + '-hour']; var minute = req.body[fieldName + '-minute']; var ampm = req.body[fieldName + '-ampm'];
  var action = req.body.action;

  if (action === 'remove') {
    delete storageObj[storageKey];
    return { status: "REMOVED" };
  }

  var errorList = []; var errorFields = [];

  // Date
  if (!day && !month && !year) {
    errorList.push({ text: "Enter the date for the " + displayName.toLowerCase(), href: "#" + fieldName + "-day" });
    errorFields = ['day', 'month', 'year'];
  } else {
    var missing = [];
    if (!day) missing.push('day'); if (!month) missing.push('month'); if (!year) missing.push('year');
    if (missing.length > 0) {
      errorList.push({ text: displayName + " must include a " + missing.join(' and '), href: "#" + fieldName + "-" + missing[0] });
      errorFields = errorFields.concat(missing);
    } else {
        var dayNum = Number(day); var monthNum = Number(month); var yearNum = Number(year);
        if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) { errorList.push({ text: displayName + " day must be a real day", href: "#" + fieldName + "-day" }); if (!errorFields.includes('day')) errorFields.push('day'); }
        if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) { errorList.push({ text: displayName + " month must be a real month", href: "#" + fieldName + "-month" }); if (!errorFields.includes('month')) errorFields.push('month'); }
        if (year.length != 4 || isNaN(yearNum)) { errorList.push({ text: displayName + " year must include 4 numbers", href: "#" + fieldName + "-year" }); if (!errorFields.includes('year')) errorFields.push('year'); }
        
        if (errorList.length === 0) {
            var dateObj = new Date(yearNum, monthNum - 1, dayNum);
            if ((dateObj.getMonth() + 1 != monthNum) || (dateObj.getDate() != dayNum)) {
                errorList.push({ text: "Enter a real date", href: "#" + fieldName + "-day" });
                errorFields = ['day', 'month', 'year'];
            }
        }
    }
  }

  // Time
  if (errorList.length === 0) {
      if (!hour) {
         errorList.push({ text: "Enter the hour", href: "#" + fieldName + "-hour" }); errorFields.push('hour');
      } else {
         var h = Number(hour);
         if (isNaN(h) || h < 1 || h > 12) { errorList.push({ text: "Hour must be between 1 and 12", href: "#" + fieldName + "-hour" }); errorFields.push('hour'); }
      }
      if (!minute) {
          minute = "00"; 
      } else {
          var m = Number(minute);
          if (isNaN(m) || m < 0 || m > 59) { errorList.push({ text: "Minute must be between 0 and 59", href: "#" + fieldName + "-minute" }); errorFields.push('minute'); }
          if (minute.length === 1) minute = "0" + minute;
      }
      if (!ampm || (ampm !== "am" && ampm !== "pm")) {
          errorList.push({ text: "Select am or pm", href: "#" + fieldName + "-ampm" }); errorFields.push('ampm');
      }
  }

  if (errorList.length > 0) return { status: "ERROR", errorList: errorList, errorFields: errorFields };
  if (!day && !month && !year) { delete storageObj[storageKey]; return { status: "SUCCESS" }; }

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var formattedDate = day + " " + months[Number(month) - 1] + " " + year;
  var formattedTime = (hour && minute && ampm) ? hour + ":" + minute + ampm : "";

  storageObj[storageKey] = { day: day, month: month, year: year, hour: hour, minute: minute, ampm: ampm, formattedDate: formattedDate, formattedTime: formattedTime };
  return { status: "SUCCESS" };
}

// ================================================================================
// 6. NUMBER VALIDATION -- checking fields only contain number inputs
// ================================================================================
function validateAndSaveNumber(req, res, fieldName, displayName, storageObj, storageKey) {
  var value = req.body[fieldName];
  var action = req.body.action;

  if (action === 'remove') {
    delete storageObj[storageKey];
    return { status: "REMOVED" };
  }

  var errorList = [];
  if (!value || value.trim() === "") {
    errorList.push({ text: "Enter the " + displayName.toLowerCase(), href: "#" + fieldName });
  } else {
    if (isNaN(value) || !/^\d+(\.\d+)?$/.test(value)) {
      errorList.push({ text: displayName + " must only contain numbers", href: "#" + fieldName });
    }
  }

  if (errorList.length > 0) return { status: "ERROR", errorList: errorList };
  
  storageObj[storageKey] = value;
  return { status: "SUCCESS" };
}

// =====================================================================================
// 7. DEEP FOLDER SEARCH HELPER -- used to find folders created inside the default folders
// =====================================================================================
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

// ========================================================================================================
// 8. GET DEFAULT FOLDERS HELPER -- used to create the specific folders upon case creation for that case type
// ========================================================================================================
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


// ================================================================================================
// EXPORT ALL HELPERS (Export all helpers and functions to be accessed by other route files")
// ================================================================================================
module.exports = {
  validAuthorities,
  getCase,
  addAuditLog,
  validateAndSaveAddress,
  validateAndSaveDate,
  validateAndSaveDateTime,
  validateAndSaveNumber,
  findFolderDeep,
  getDefaultFolders
};
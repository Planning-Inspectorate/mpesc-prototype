const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// Use ../ to go up one folder (from /sub-routes/ to /app/)
const { getCase } = require('../helpers');

// ==============================================================================
// 1. MAIN CASE DETAILS HUB (Page Render & Banner Logic)
// ==============================================================================

router.get('/cases/case-details', function(req, res) {
  let ref = req.query.ref;
  
  // Keep the ref in the global session so other sub-pages remember what case we are on
  if (ref) {
    req.session.data['ref'] = ref;
  }

  // Use the helper to find the case directly in the server memory
  let foundCase = getCase(req);

  // Safety bounce: If the case dropped out of memory, kick them back to the list
  if (!foundCase) return res.redirect('/cases-page');

  // Grab the flash message target (e.g., "timetable", "overview") if an edit was just made
  let sectionToJumpTo = req.session.flashSection;

  // Delete the flash state immediately so the banner doesn't get stuck on refresh
  req.session.flashSection = null; 

  // Render the case details hub, passing the case data and the target section for the banner
  res.render('cases/case-details', { 
    currentCase: foundCase,       
    flashSection: sectionToJumpTo 
  });
});

// ==============================================================================
// 3. DOWNLOAD ALL CONTACTS AS CSV
// ==============================================================================

router.get('/cases/download-contacts', function (req, res) {
  var ref = req.query.ref;
  var currentCase = getCase(req);

  if (!currentCase) return res.redirect('/cases-page'); // Safety bounce

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
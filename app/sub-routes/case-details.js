const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// Use ../ to go up one folder (from /sub-routes/ to /app/)
const { getCase, addAuditLog } = require('../helpers');

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
// 2. CASE NOTES ROUTE
// ==============================================================================

router.post('/cases/add-case-note', function(req, res) {
  var ref = req.query.ref;
  var c = getCase(req);
  if (!c) return res.redirect('/cases-page'); // Safety bounce

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
    
    // Hardcoded user to match the prototype design
    const userStr = "Kieran De La Kruz"; 

    // Add the new note to the TOP of the array so it shows up first
    c.caseNotes.unshift({
      text: comment,
      meta: `${timeStr} on ${metaDateStr} by ${userStr}`,
      tableDate: tableDateStr,
      tableTime: timeStr,
      tableUser: userStr
    });

    if (typeof addAuditLog === "function") {
      addAuditLog(req, ref, "Case note added");
    }
  }

  res.redirect('/cases/case-details?ref=' + ref);
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
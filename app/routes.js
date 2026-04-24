const govukPrototypeKit = require('govuk-prototype-kit')

const {applyAzureHostingFix} = require('./azure-hosting-fix');
applyAzureHostingFix();

const router = govukPrototypeKit.requests.setupRouter()

/* Notes and information:

The routes.js files in this prototype are organised so that they are mostly self-contained by feature or section of the service, rather than having all routes in one file.

This means that if you are working on a specific feature (e.g., related cases, overview procedures, managing folders, etc.), 
you can find all the relevant routes and logic in one place without scrolling through one massive routes.js file.

A general rule is any html files located in the /cases folder will have its own .js file in sub-routes. 

Any html's not in /cases, the routes for those will be in this file.
 - assigned-to-me.html
 - assigned-to-me-search.html
 - cases-page.html
 

The sub route files in the folder app/sub-routes/ are:

  - create-a-case.js 
        (contains all the create a case journey routes, including the only add to list flow in the journey - applicant/appellant)

  - procedures.js 
        (contains the dynamically generated procedure cards routes that are added to the case overview)

  - overview-outcomes.js 
        (contains the dynamically generated outcome cards routes that are added to the case overview)
        
  - edit-case.js 
        (contains the general edit routes after you have created the case. This does not include the add to list flows which are in their own files)

The other sub route files are all add to list patterns and are separated from the edit-case.js to keep things cleaner. These add to list patterns have a 'Working Draft Pattern/Logic'
that ensures that a user must save their changes for their edits to be committed to the "database" (session data in this case). This is done by creating a temporary draft 
in the session data that the user edits, and only copying it over to the real case data when they click "Save".

This logic was added as a way to mirror the coding behaviour of development to closely see what real production would look like.

This pattern is used for:

  - related-cases.js
  - linked-lead-cases.js
  - overview-procedures.js
  - objectors.js (key contacts - objectors)
  - contacts.js (key contacts - contacts)
  - applicants.js (applicant and appellant for edit, and not the create a case flow which is found in create-a-case.js)
  - outcomes.js
  - inspectors.js
  - site-address.js

The helpers.js file contains shared helper functions that are used across all the routes files, such as getCase, addAuditLog, and various validation and save functions. 

*/

// --- IMPORT SUB ROUTERS ---
require('./sub-routes/create-a-case');
require('./sub-routes/edit');
require('./sub-routes/manage-folders')
require('./sub-routes/overview-outcome');
require('./sub-routes/procedures');


// --- IMPORT ADD TO LIST ROUTERS ---
require('./sub-routes/add-to-list/related-cases');
require('./sub-routes/add-to-list/linked-lead-cases');
require('./sub-routes/add-to-list/inspectors');
require('./sub-routes/add-to-list/applicants');
require('./sub-routes/add-to-list/site-address');
require('./sub-routes/add-to-list/overview-procedures'); 
require('./sub-routes/add-to-list/objectors');
require('./sub-routes/add-to-list/contacts');
require('./sub-routes/add-to-list/outcomes');

// --- IMPORT SHARED HELPERS ---
const { 
  getCase, 
  addAuditLog, 
  validateAndSaveAddress, 
  validateAndSaveDate, 
  validateAndSaveDateTime, 
  validateAndSaveNumber,
  findFolderDeep,
  getDefaultFolders 
} = require('./helpers');


// ==============================================================================
// MAIN CASE DETAILS HUB (Page Render & Banner Logic)
// ==============================================================================

router.get('/cases/case-details', function(req, res) {
  let ref = req.query.ref;
  
  // 1. Keep the ref in the global session so other sub-pages remember what case we are on
  if (ref) {
    req.session.data['ref'] = ref;
  }

  // 2. Find the case directly in the server memory
  let cases = req.session.data['cases'] || [];
  let foundCase = cases.find(c => c.reference === ref);

  // 3. Grab the flash message target (e.g., "timetable", "overview") if an edit was just made
  let sectionToJumpTo = req.session.flashSection;

  // 4. Delete the flash state immediately so the banner doesn't get stuck on refresh
  req.session.flashSection = null; 

  // 5. Render the case details hub, passing the case data and the target section for the banner
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
    "Charlotte Morphet",
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




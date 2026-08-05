const govukPrototypeKit = require('govuk-prototype-kit')
const { applyAzureHostingFix } = require('./azure-hosting-fix');
applyAzureHostingFix();
const router = govukPrototypeKit.requests.setupRouter()

/* Notes and information:

The routes.js files in this prototype are organised so that they are mostly self-contained by feature or section of the service, rather than having all routes in one file.

This means that if you are working on a specific feature (e.g., related cases, overview procedures, managing folders, etc.), 
you can find all the relevant routes and logic in a dedicated place without scrolling through one massive routes.js file.

A general rule is any html files located in the /cases folder will have its own .js file in sub-routes. 

Any html's not in /cases, the routes for those will be in this file.
 - assigned-to-me.html
 - assigned-to-me-search.html
 - cases-page.html
 

The sub route files in the folder app/sub-routes/ are:

  - all-case-notes.js
      (contains the route for the dedicated case notes page that shows all case notes in one place)

  - case-details.js 
      (contains the main route for the case details page which includes the banner logic, and also contains the route for adding a case note to a case)

  - create-a-case.js 
      (contains all the create a case journey routes, including the only add to list flow in the journey - applicant/appellant)

  - edit.js 
      (contains the general edit routes after you have created the case. This does not include the add to list flows which are in their own files)

  - manage-folders.js
      (contains all the routes for managing folders, including creating a folder, editing a folder, deleting a folder, and moving cases between folders)

  - overview-outcomes.js 
      (contains the dynamically generated outcome cards routes that are added to the case overview)

  - procedures.js 
      (contains the dynamically generated procedure cards routes that are added to the case overview)


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
require('./sub-routes/case-details');
require('./sub-routes/all-case-notes');
require('./sub-routes/features/case-notes');


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

// Feature demo route: ensure folders exist when viewing the demo manage-folders page
router.get('/features-and-components/filter-redesign/v1/manage-folders', function (req, res) {
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

  res.render('features-and-components/filter-redesign/v1/manage-folders', {
    currentCase: currentCase,
    successBanner: successBanner,
    deleteBanner: deleteBanner
  });
});

// Feature demo route: folder view (loads seeded folders & documents)
router.get('/features-and-components/filter-redesign/v1/view', function (req, res) {
  var ref = req.query.ref;
  var folderId = req.query.folderId;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  if (!currentCase.folders) {
    var caseType = currentCase.type || currentCase.caseType || "";
    currentCase.folders = getDefaultFolders(caseType);
  }

  // Pick the requested folder or default to the first
  var found = folderId ? findFolderDeep(currentCase.folders, folderId) : null;
  var folder = found ? found.target : (currentCase.folders.length > 0 ? currentCase.folders[0] : null);
  var parentFolder = found ? found.parent : null;

  if (!folder) return res.redirect(`/features-and-components/filter-redesign/v1/manage-folders?ref=${ref}`);

  // Banners and transient messages
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

  var errorList = null;
  if (moveFileError) { errorList = [{ text: moveFileError, href: "#checkboxes-all" }]; delete req.session.data['moveFileError']; }

  // Pagination
  var documents = folder.documents || [];
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
  let baseUrl = `/features-and-components/filter-redesign/v1/view?ref=${ref}` + (folderId ? `&folderId=${folder.id}` : '');
  for (let i of pagesToShow) {
    if (previousPage && i - previousPage > 1) paginationItems.push({ ellipsis: true });
    paginationItems.push({ number: i, current: (i === currentPage), href: `${baseUrl}&page=${i}` });
    previousPage = i;
  }

  res.render('features-and-components/filter-redesign/v1/view', {
    currentCase: currentCase,
    folder: folder,
    parentFolder: parentFolder,
    successBanner: successBanner,
    renameBanner: renameBanner,
    deleteBanner: deleteBanner,
    updateBanner: updateBanner,
    moveBanner: moveBanner,
    downloadBanner: downloadBanner,
    bulkDeleteBanner: bulkDeleteBanner,
    errorList: errorList,
    paginatedDocuments: paginatedDocuments,
    totalDocs: totalDocsCount,
    folderTotalDocs: (folder.documents || []).length,
    itemsPerPage: itemsPerPage,
    startItem: totalDocsCount === 0 ? 0 : startIndex + 1,
    endItem: Math.min(endIndex, totalDocsCount),
    pageItems: paginationItems,
    prevLink: currentPage > 1 ? `${baseUrl}&page=${currentPage - 1}` : null,
    nextLink: currentPage < totalPages ? `${baseUrl}&page=${currentPage + 1}` : null
  });
});



// ==============================================================================
// NAV ITEM 1: ASSIGNED TO ME
// ==============================================================================

// --- 1. VIEW ASSIGNED CASES ---
router.get('/assigned-to-me', function (req, res) {
  var allCases = req.session.data['cases'] || [];

  // SIMULATED LOGIN: Hardcode the active user here
  var loggedInUser = "Carol Danvers";

  // Did they use the "Search for a user" feature?
  var searchedUser = req.session.data['viewingUser'];

  // Active user is the searched user, otherwise default to logged-in user
  var activeUser = searchedUser || loggedInUser;

  // Boolean to tell the UI if we are looking at our own queue
  var isViewingOwnCases = (!searchedUser || searchedUser === loggedInUser);

  // FILTER 1: Only show cases assigned to the active user (Officer or Inspector)
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

  // FILTER 2: Apply Status Filter
  var statusFilter = req.session.data['statusFilter'];
  if (statusFilter && typeof statusFilter === 'string') statusFilter = [statusFilter];
  else if (!statusFilter) statusFilter = [];

  var filteredCases = userCases;
  if (statusFilter.length > 0) {
    filteredCases = userCases.filter(c => {
      var cStat = c.status || c.caseStatus || c['case-status'];
      return statusFilter.includes(cStat);
    });
  }

  // --- PAGINATION MATH ---
  const totalCasesCount = filteredCases.length;

  let itemsPerPage = parseInt(req.query.itemsPerPage || req.session.data['assignedItemsPerPage'], 10);
  if (isNaN(itemsPerPage) || itemsPerPage <= 0) itemsPerPage = 25;
  req.session.data['assignedItemsPerPage'] = itemsPerPage;

  let currentPage = parseInt(req.query.page || 1, 10);
  if (isNaN(currentPage) || currentPage <= 0) currentPage = 1;

  const totalPages = Math.ceil(totalCasesCount / itemsPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Cut the massive list down to just the 25 items for this specific page
  const paginatedCases = filteredCases.slice(startIndex, endIndex);

  // Build the visual pagination UI array
  let paginationItems = [];
  let pagesToShow = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || i === currentPage || i === currentPage - 1 || i === currentPage + 1) {
      pagesToShow.push(i);
    }
  }

  let previousPage = null;
  for (let i of pagesToShow) {
    if (previousPage && i - previousPage > 1) paginationItems.push({ ellipsis: true });
    paginationItems.push({ number: i, current: (i === currentPage), href: "/assigned-to-me?page=" + i });
    previousPage = i;
  }

  res.render('assigned-to-me', {
    filteredCases: paginatedCases, // <-- Pass the sliced array instead of the full array
    currentStatusFilter: statusFilter,
    totalCasesCount: totalCasesCount,
    activeUserName: activeUser,
    isViewingOwnCases: isViewingOwnCases,

    // Pass pagination variables to the HTML
    itemsPerPage: itemsPerPage,
    startItem: totalCasesCount === 0 ? 0 : startIndex + 1,
    endItem: Math.min(endIndex, totalCasesCount),
    pageItems: paginationItems,
    prevLink: currentPage > 1 ? "/assigned-to-me?page=" + (currentPage - 1) : null,
    nextLink: currentPage < totalPages ? "/assigned-to-me?page=" + (currentPage + 1) : null
  });
});

// --- 2. STATUS FILTER ACTIONS ---
router.post('/assigned-to-me/filter', (req, res) => res.redirect('/assigned-to-me'));

router.get('/assigned-to-me/clear-filter', function (req, res) {
  req.session.data['statusFilter'] = null;
  res.redirect('/assigned-to-me');
});

router.get('/assigned-to-me/remove-filter/status/:value', function (req, res) {
  var valueToRemove = req.params.value;
  if (Array.isArray(req.session.data['statusFilter'])) {
    req.session.data['statusFilter'] = req.session.data['statusFilter'].filter(item => item !== valueToRemove);
  }
  res.redirect('/assigned-to-me');
});

// --- 3. SEARCH FOR A USER'S QUEUE (assigned-to-me-search) ---
router.get('/assigned-to-me/search-user', (req, res) => res.render('assigned-to-me-search'));

router.post('/assigned-to-me/search-user', function (req, res) {
  var val = req.body.assignedUser;

  if (!val || val.trim() === "") {
    return res.render('assigned-to-me-search', { error: true, errorMessage: { text: "Select a case officer or inspector" } });
  }

  // Valid user list
  var officers = [
    "Charlotte Morphet", "Kieran De La Cruz", "Edward Mitchell", "Sarah Tudor", "Steve Waterfield",
    "Alex Hudd", "Harry Wood", "Rob Davis", "Deborah Board", "(Service Account) Automated Tester",
    "Owen Woodwards", "Tony Stark", "Steve Rogers", "Natasha Romanoff", "Bruce Banner",
    "Thor Odinson", "Wanda Maximoff", "Peter Parker", "Carol Danvers", "Stephen Strange",
    "T'Challa", "Clint Barton", "Sam Wilson", "Bucky Barnes", "Scott Lang", "Hope van Dyne"
  ];

  if (!officers.includes(val)) {
    return res.render('assigned-to-me-search', { value: val, error: true, errorMessage: { text: "Select a case officer or inspector" } });
  }

  // Save the selected user and wipe any existing status filters to show a fresh list
  req.session.data['viewingUser'] = val;
  req.session.data['statusFilter'] = [];
  res.redirect('/assigned-to-me');
});

// --- 4. RETURN TO MY CASES ---
router.get('/assigned-to-me/my-cases', function (req, res) {
  req.session.data['viewingUser'] = null;
  req.session.data['statusFilter'] = [];
  res.redirect('/assigned-to-me');
});



// ==============================================================================
// NAV ITEM 2: ALL CASES PAGE (With Filtering & Pagination)
// ==============================================================================

function renderCasesPage(req, res, viewName, routeBase) {
  let cases = req.session.data['cases'] || [];

  // --- 1. SYNC URL TO SESSION (If form was submitted) ---
  const isFormSubmit = req.query.isFilterSubmit === 'true';

  if (isFormSubmit) {
    req.session.data['area'] = req.query.area;
    req.session.data['type'] = req.query.type;
    req.session.data['status'] = req.query.status;
    req.session.data['searchCriteria'] = req.query.searchCriteria;

    // Express array limit fix (forces single items into arrays)
    let rawSubtypes = req.query.subtype;
    req.session.data['subtype'] = (rawSubtypes && typeof rawSubtypes === 'object' && !Array.isArray(rawSubtypes))
      ? Object.values(rawSubtypes) : rawSubtypes;

    let rawStatuses = req.query.status;
    req.session.data['status'] = (rawStatuses && typeof rawStatuses === 'object' && !Array.isArray(rawStatuses))
      ? Object.values(rawStatuses) : rawStatuses;
  }

  // --- 2. CLEANUP FILTER ARRAYS ---
  // Destroys the '_unchecked' junk generated by GOV.UK checkboxes
  const cleanArray = (categoryName) => {
    let val = req.session.data[categoryName];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      val = Object.values(val);
      req.session.data[categoryName] = val;
    }
    return [].concat(val || []).filter(item => item && item !== '_unchecked');
  };

  const areas = cleanArray('area');
  const types = cleanArray('type');
  const subtypes = cleanArray('subtype');
  const statuses = cleanArray('status');
  const search = req.session.data['searchCriteria'] || "";

  // --- 3. APPLY CATEGORY FILTERS (AND Logic) ---
  const hasAreaFilters = areas.length > 0;
  const hasTypeFilters = types.length > 0;
  const hasSubtypeFilters = subtypes.length > 0;
  const hasStatusFilters = statuses.length > 0;

  if (hasAreaFilters || hasTypeFilters || hasSubtypeFilters || hasStatusFilters) {
    cases = cases.filter(c => {
      const passesArea = !hasAreaFilters || areas.includes(c.areaValue);
      const passesType = !hasTypeFilters || types.includes(c.typeValue);
      const passesSubtype = !hasSubtypeFilters || subtypes.includes(c.subtypeValue);
      const passesStatus = !hasStatusFilters || statuses.includes(c.caseStatus || c.status || c['case-status']);

      // The case MUST pass ALL active category checks to show up
      return passesArea && passesType && passesSubtype && passesStatus;
    });
  }

  // --- 4. APPLY SEARCH FILTER ---
  if (search) {
    cases = cases.filter(c => {
      // Safely extract applicant names to make them searchable
      let applicantsString = Array.isArray(c.applicants)
        ? c.applicants.map(a => `${a.firstName || ""} ${a.lastName || ""} ${a.companyName || ""}`).join(" ")
        : "";

      // Concatenate all searchable fields into one massive string
      const content = ((c.reference || "") + (c.caseName || "") + (c.caseStatus || "") + (c.authorityName || "") + applicantsString).toLowerCase();
      return content.includes(search.toLowerCase());
    });
  }

  // --- 5. PAGINATION MATH ---
  const totalCasesCount = cases.length;

  let itemsPerPage = parseInt(req.query.itemsPerPage || req.session.data['itemsPerPage'], 10);
  if (isNaN(itemsPerPage) || itemsPerPage <= 0) itemsPerPage = 25;
  req.session.data['itemsPerPage'] = itemsPerPage;

  let currentPage = parseInt(req.query.page || 1, 10);
  if (isNaN(currentPage) || currentPage <= 0) currentPage = 1;

  const totalPages = Math.ceil(totalCasesCount / itemsPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCases = cases.slice(startIndex, endIndex);

  // Build the visual pagination UI array
  let paginationItems = [];
  let pagesToShow = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || i === currentPage || i === currentPage - 1 || i === currentPage + 1) {
      pagesToShow.push(i);
    }
  }

  let previousPage = null;
  for (let i of pagesToShow) {
    if (previousPage && i - previousPage > 1) paginationItems.push({ ellipsis: true });
    paginationItems.push({ number: i, current: (i === currentPage), href: `${routeBase}/cases-filter?page=${i}` });
    previousPage = i;
  }

  // --- 6. RENDER ---
  res.render(viewName, {
    cases: paginatedCases,
    searchTerm: search,
    totalCases: totalCasesCount,
    itemsPerPage: itemsPerPage,
    startItem: totalCasesCount === 0 ? 0 : startIndex + 1,
    endItem: Math.min(endIndex, totalCasesCount),
    pageItems: paginationItems,
    prevLink: currentPage > 1 ? `${routeBase}/cases-filter?page=${currentPage - 1}` : null,
    nextLink: currentPage < totalPages ? `${routeBase}/cases-filter?page=${currentPage + 1}` : null,
    casesFilterPath: `${routeBase}/cases-filter`,
    casesRemoveFilterPathPrefix: `${routeBase}/cases/remove-filter`,
    casesClearFiltersPath: `${routeBase}/cases/clear-filters`,
    casesClearSearchPath: `${routeBase}/cases/clear-search`
  });
}

// Catch BOTH the normal page load (/cases-page) and the filter submission (/cases-filter)
router.get(['/cases-page', '/cases-filter'], function (req, res) {
  renderCasesPage(req, res, 'cases-page', '');
});

router.get(['/features-and-components/filter-redesign/v2/cases-page', '/features-and-components/filter-redesign/v2/cases-filter'], function (req, res) {
  renderCasesPage(req, res, 'features-and-components/filter-redesign/v2/cases-page', '/features-and-components/filter-redesign/v2');
});

// --- 7. FILTER REMOVAL ACTIONS ---
router.get(['/cases/remove-filter/:filterCategory/:filterValue', '/features-and-components/filter-redesign/v2/cases/remove-filter/:filterCategory/:filterValue'], function (req, res) {
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

  const redirectPath = req.path.includes('/features-and-components/filter-redesign/v2/')
    ? '/features-and-components/filter-redesign/v2/cases-filter'
    : '/cases-filter';
  res.redirect(redirectPath);
});

router.get(['/cases/clear-filters', '/features-and-components/filter-redesign/v2/cases/clear-filters'], function (req, res) {
  req.session.data['area'] = "";
  req.session.data['type'] = "";
  req.session.data['subtype'] = "";
  req.session.data['status'] = "";
  req.session.data['searchCriteria'] = "";

  const redirectPath = req.path.includes('/features-and-components/filter-redesign/v2/')
    ? '/features-and-components/filter-redesign/v2/cases-filter'
    : '/cases-filter';
  res.redirect(redirectPath);
});

router.get(['/cases/clear-search', '/features-and-components/filter-redesign/v2/cases/clear-search'], function (req, res) {
  req.session.data['searchCriteria'] = "";

  const redirectPath = req.path.includes('/features-and-components/filter-redesign/v2/')
    ? '/features-and-components/filter-redesign/v2/cases-filter'
    : '/cases-filter';
  res.redirect(redirectPath);
});

// ==============================================================================
// UTILITY: GENERATE DUMMY CASES
// ==============================================================================
router.get('/cases/generate-dummy', function (req, res) {
  if (!req.session.data['cases']) req.session.data['cases'] = [];

  // Generate 65 Planning Cases
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

  // Generate 65 Rights of Way Cases
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

  console.log("Successfully injected 130 Dummy Cases!");
  res.redirect('/cases-page');
});


module.exports = router;


const govukPrototypeKit = require('govuk-prototype-kit');
const fs = require('fs');
const path = require('path');
const sessionDefaults = require('../../data/session-data-defaults');
const { findFolderDeep, getDefaultFolders } = require('../../helpers');

const router = govukPrototypeKit.requests.setupRouter();

// Feature demo route: ensure folders exist when viewing the demo manage-folders page.
router.get('/features-and-components/filter-redesign/v1/manage-folders', function (req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  if (!currentCase.folders) {
    var caseType = currentCase.type || currentCase.caseType || '';
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

// Feature demo route: folder view (loads seeded folders and documents).
router.get('/features-and-components/filter-redesign/v1/view', function (req, res) {
  var ref = req.query.ref;
  var folderId = req.query.folderId;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  if (!currentCase.folders) {
    var caseType = currentCase.type || currentCase.caseType || '';
    currentCase.folders = getDefaultFolders(caseType);
  }

  var found = folderId ? findFolderDeep(currentCase.folders, folderId) : null;
  var folder = found ? found.target : (currentCase.folders.length > 0 ? currentCase.folders[0] : null);
  var parentFolder = found ? found.parent : null;

  if (!folder) return res.redirect(`/features-and-components/filter-redesign/v1/manage-folders?ref=${ref}`);

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
  if (moveFileError) { errorList = [{ text: moveFileError, href: '#checkboxes-all' }]; delete req.session.data['moveFileError']; }

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

function renderFilterRedesignCasesPage(req, res, viewName, routeBase) {
  let cases = req.session.data['cases'] || [];

  // Feature-only safety net so demo filter pages always have data to work with.
  if (!Array.isArray(cases) || cases.length === 0) {
    const seededCases = JSON.parse(JSON.stringify(sessionDefaults.cases || []));
    req.session.data['cases'] = seededCases;
    cases = seededCases;
  }

  const isFormSubmit = req.query.isFilterSubmit === 'true';

  if (isFormSubmit) {
    req.session.data['area'] = req.query.area;
    req.session.data['type'] = req.query.type;
    req.session.data['status'] = req.query.status;
    req.session.data['searchCriteria'] = req.query.searchCriteria;

    let rawSubtypes = req.query.subtype;
    req.session.data['subtype'] = (rawSubtypes && typeof rawSubtypes === 'object' && !Array.isArray(rawSubtypes))
      ? Object.values(rawSubtypes) : rawSubtypes;

    let rawStatuses = req.query.status;
    req.session.data['status'] = (rawStatuses && typeof rawStatuses === 'object' && !Array.isArray(rawStatuses))
      ? Object.values(rawStatuses) : rawStatuses;
  }

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
  const search = req.session.data['searchCriteria'] || '';

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
      return passesArea && passesType && passesSubtype && passesStatus;
    });
  }

  if (search) {
    cases = cases.filter(c => {
      let applicantsString = Array.isArray(c.applicants)
        ? c.applicants.map(a => `${a.firstName || ''} ${a.lastName || ''} ${a.companyName || ''}`).join(' ')
        : '';
      const content = ((c.reference || '') + (c.caseName || '') + (c.caseStatus || '') + (c.authorityName || '') + applicantsString).toLowerCase();
      return content.includes(search.toLowerCase());
    });
  }

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

function resolveFilterRedesignV2View(viewFileName) {
  const baseDir = path.join(__dirname, '..', '..', 'views', 'features-and-components', 'filter-redesign', 'v2');

  if (viewFileName && /^[a-zA-Z0-9_-]+$/.test(viewFileName)) {
    const directPath = path.join(baseDir, `${viewFileName}.html`);
    if (fs.existsSync(directPath)) {
      return `features-and-components/filter-redesign/v2/${viewFileName}`;
    }
  }

  const candidates = ['top-dropdown', 'LH-dropdown', 'cases-page'];
  for (const candidate of candidates) {
    const absolutePath = path.join(baseDir, `${candidate}.html`);
    if (fs.existsSync(absolutePath)) {
      return `features-and-components/filter-redesign/v2/${candidate}`;
    }
  }

  return 'features-and-components/filter-redesign/v2/cases-page';
}

router.get(['/features-and-components/filter-redesign/v2/cases-page', '/features-and-components/filter-redesign/v2/cases-filter'], function (req, res) {
  renderFilterRedesignCasesPage(req, res, resolveFilterRedesignV2View(), '/features-and-components/filter-redesign/v2');
});

router.get('/features-and-components/filter-redesign/v2/:viewName', function (req, res, next) {
  const viewName = req.params.viewName;
  const resolvedView = resolveFilterRedesignV2View(viewName);

  if (!resolvedView.endsWith(`/${viewName}`)) {
    return next();
  }

  renderFilterRedesignCasesPage(
    req,
    res,
    resolvedView,
    `/features-and-components/filter-redesign/v2/${viewName}`
  );
});

router.get('/features-and-components/filter-redesign/v2/:viewName/cases-filter', function (req, res, next) {
  const viewName = req.params.viewName;
  const resolvedView = resolveFilterRedesignV2View(viewName);

  if (!resolvedView.endsWith(`/${viewName}`)) {
    return next();
  }

  renderFilterRedesignCasesPage(
    req,
    res,
    resolvedView,
    `/features-and-components/filter-redesign/v2/${viewName}`
  );
});

router.get(['/features-and-components/filter-redesign/v2/cases/remove-filter/:filterCategory/:filterValue'], function (req, res) {
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

  res.redirect('/features-and-components/filter-redesign/v2/cases-filter');
});

router.get('/features-and-components/filter-redesign/v2/:viewName/cases/remove-filter/:filterCategory/:filterValue', function (req, res) {
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

  res.redirect(`/features-and-components/filter-redesign/v2/${req.params.viewName}/cases-filter`);
});

router.get(['/features-and-components/filter-redesign/v2/cases/clear-filters'], function (req, res) {
  req.session.data['area'] = '';
  req.session.data['type'] = '';
  req.session.data['subtype'] = '';
  req.session.data['status'] = '';
  req.session.data['searchCriteria'] = '';

  res.redirect('/features-and-components/filter-redesign/v2/cases-filter');
});

router.get('/features-and-components/filter-redesign/v2/:viewName/cases/clear-filters', function (req, res) {
  req.session.data['area'] = '';
  req.session.data['type'] = '';
  req.session.data['subtype'] = '';
  req.session.data['status'] = '';
  req.session.data['searchCriteria'] = '';

  res.redirect(`/features-and-components/filter-redesign/v2/${req.params.viewName}/cases-filter`);
});

router.get(['/features-and-components/filter-redesign/v2/cases/clear-search'], function (req, res) {
  req.session.data['searchCriteria'] = '';
  res.redirect('/features-and-components/filter-redesign/v2/cases-filter');
});

router.get('/features-and-components/filter-redesign/v2/:viewName/cases/clear-search', function (req, res) {
  req.session.data['searchCriteria'] = '';
  res.redirect(`/features-and-components/filter-redesign/v2/${req.params.viewName}/cases-filter`);
});

module.exports = router;

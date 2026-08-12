const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();
const { getCase, addAuditLog, findFolderDeep, getDefaultFolders } = require('../../helpers');

function preserveRef(req) {
  const ref = req.query.ref || req.body.ref;
  if (ref) {
    req.session.data['ref'] = ref;
  }
  return ref || req.session.data['ref'];
}

function createSampleFileRenameCase(ref) {
  return {
    reference: ref || 'COM/WCL/10088',
    caseName: 'File rename demo case',
    caseStatus: 'Open',
    type: 'Common Land',
    folders: [
      {
        id: 'f1',
        name: 'Application documents',
        slug: 'application-documents',
        subfolders: [],
        documents: [
          { id: 'doc-1', name: 'Site-Plan.pdf', type: 'PDF', size: '1.2 MB', date: '01 Oct 2025', dateTimestamp: 1727740800, readStatus: 'Read', isFlagged: false },
          { id: 'doc-2', name: 'Proposed-Works-Diagram.jpg', type: 'JPG', size: '3.4 MB', date: '01 Oct 2025', dateTimestamp: 1727741800, readStatus: 'Unread', isFlagged: true },
          { id: 'doc-3', name: 'Consultation-Statement.docx', type: 'DOCX', size: '185 KB', date: '02 Oct 2025', dateTimestamp: 1727827200, readStatus: 'Unread', isFlagged: false }
        ]
      },
      {
        id: 'f2',
        name: 'Public representations',
        slug: 'public-representations',
        subfolders: [],
        documents: [
          { id: 'doc-4', name: 'Representation-Summary.pdf', type: 'PDF', size: '420 KB', date: '03 Oct 2025', dateTimestamp: 1727913600, readStatus: 'Read', isFlagged: false }
        ]
      }
    ]
  };
}

function ensureCaseWithFolders(req, ref) {
  if (!req.session.data['cases']) req.session.data['cases'] = [];
  let cases = req.session.data['cases'];
  let currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) {
    currentCase = createSampleFileRenameCase(ref || 'COM/WCL/10088');
    cases.push(currentCase);
  }
  if (!currentCase.folders) {
    const caseType = currentCase.type || currentCase.caseType || '';
    currentCase.folders = getDefaultFolders(caseType);
  }
  const needsSampleDocs = currentCase.folders.every(folder => !folder.documents || folder.documents.length === 0);
  if (needsSampleDocs && currentCase.folders.length > 0) {
    currentCase.folders[0].documents = [
      { id: 'doc-sample-1', name: 'Draft-Planning-Report.pdf', type: 'PDF', size: '2.1 MB', date: '10 Dec 2025', dateTimestamp: 1733788800, readStatus: 'Read', isFlagged: false },
      { id: 'doc-sample-2', name: 'Site-Survey.jpg', type: 'JPG', size: '1.6 MB', date: '12 Dec 2025', dateTimestamp: 1733961600, readStatus: 'Unread', isFlagged: true },
      { id: 'doc-sample-3', name: 'Applicant-Statement.docx', type: 'DOCX', size: '75 KB', date: '14 Dec 2025', dateTimestamp: 1734134400, readStatus: 'Unread', isFlagged: false }
    ];
  }
  return currentCase;
}

function cleanArray(sessionValue) {
  if (!sessionValue) return [];
  if (Array.isArray(sessionValue)) return sessionValue.filter(item => item && item !== '_unchecked');
  return [sessionValue].filter(item => item && item !== '_unchecked');
}

router.get('/features-and-components/file-rename/v1/view', function (req, res) {
  const ref = preserveRef(req) || 'COM/WCL/10088';
  const currentCase = ensureCaseWithFolders(req, ref);

  const folderId = req.query.folderId;
  const foundFolder = folderId ? findFolderDeep(currentCase.folders, folderId) : null;
  const folder = foundFolder ? foundFolder.target : (currentCase.folders.length > 0 ? currentCase.folders[0] : null);
  const parentFolder = foundFolder ? foundFolder.parent : null;

  if (!folder) return res.redirect(`/features-and-components/file-rename/v1/view?ref=${encodeURIComponent(currentCase.reference)}`);

  if (req.query.clearFilters === 'true') {
    delete req.session.data['fileRenameReadStatus'];
    delete req.session.data['fileRenameFlaggedStatus'];
  }

  if (req.query.isFilterSubmit === 'true') {
    req.session.data['fileRenameReadStatus'] = req.query.fileReadStatus;
    req.session.data['fileRenameFlaggedStatus'] = req.query.fileFlaggedStatus;
  }

  const readFilters = cleanArray(req.session.data['fileRenameReadStatus']);
  const flagFilters = cleanArray(req.session.data['fileRenameFlaggedStatus']);

  let documents = (folder.documents || []).slice();
  const folderTotalDocs = folder.documents ? folder.documents.length : 0;

  if (readFilters.length || flagFilters.length) {
    documents = documents.filter(doc => {
      const docReadStatus = doc.readStatus || 'Unread';
      const docFlagStatus = doc.isFlagged ? 'Flagged' : 'Unflagged';

      const matchesRead = readFilters.length === 0 || readFilters.includes(docReadStatus);
      const matchesFlag = flagFilters.length === 0 || flagFilters.includes(docFlagStatus);
      return matchesRead && matchesFlag;
    });
  }

  const totalDocsCount = documents.length;
  let itemsPerPage = parseInt(req.query.itemsPerPage || req.session.data['fileRenameItemsPerPage'], 10);
  if (isNaN(itemsPerPage) || itemsPerPage <= 0) itemsPerPage = 25;
  req.session.data['fileRenameItemsPerPage'] = itemsPerPage;

  let currentPage = parseInt(req.query.page || 1, 10);
  if (isNaN(currentPage) || currentPage <= 0) currentPage = 1;

  const totalPages = Math.max(1, Math.ceil(totalDocsCount / itemsPerPage));
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = documents.slice(startIndex, endIndex);

  let pageItems = [];
  let pagesToShow = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || i === currentPage || i === currentPage - 1 || i === currentPage + 1) {
      pagesToShow.push(i);
    }
  }

  let previousPage = null;
  const baseUrl = `/features-and-components/file-rename/v1/view?ref=${encodeURIComponent(ref)}` + (folderId ? `&folderId=${folder.id}` : '');
  pagesToShow.forEach(i => {
    if (previousPage && i - previousPage > 1) pageItems.push({ ellipsis: true });
    pageItems.push({ number: i, current: i === currentPage, href: `${baseUrl}&page=${i}` });
    previousPage = i;
  });

  const renameBanner = req.session.data['fileRenameSuccess'];
  if (renameBanner) delete req.session.data['fileRenameSuccess'];

  res.render('features-and-components/file-rename/v1/view', {
    currentCase: currentCase,
    folder: folder,
    parentFolder: parentFolder,
    data: {
      fileReadStatus: req.session.data['fileRenameReadStatus'],
      fileFlaggedStatus: req.session.data['fileRenameFlaggedStatus']
    },
    paginatedDocuments: paginatedDocuments,
    totalDocs: totalDocsCount,
    folderTotalDocs: folderTotalDocs,
    itemsPerPage: itemsPerPage,
    startItem: totalDocsCount === 0 ? 0 : startIndex + 1,
    endItem: Math.min(endIndex, totalDocsCount),
    pageItems: pageItems,
    prevLink: currentPage > 1 ? `${baseUrl}&page=${currentPage - 1}` : null,
    nextLink: currentPage < totalPages ? `${baseUrl}&page=${currentPage + 1}` : null,
    renameBanner: renameBanner
  });
});

router.get('/features-and-components/file-rename/v1/view/clear-filters', function (req, res) {
  const ref = preserveRef(req);
  const folderId = req.query.folderId || req.body.folderId;
  delete req.session.data['fileRenameReadStatus'];
  delete req.session.data['fileRenameFlaggedStatus'];
  res.redirect(`/features-and-components/file-rename/v1/view?ref=${encodeURIComponent(ref)}${folderId ? `&folderId=${encodeURIComponent(folderId)}` : ''}`);
});

router.get('/features-and-components/file-rename/v1/view/remove-filter/:filterCategory/:filterValue', function (req, res) {
  const ref = preserveRef(req);
  const folderId = req.query.folderId || req.body.folderId;
  const category = req.params.filterCategory;
  const value = req.params.filterValue;

  const sessionKey = category === 'fileReadStatus' ? 'fileRenameReadStatus' :
    category === 'fileFlaggedStatus' ? 'fileRenameFlaggedStatus' : null;

  if (sessionKey && req.session.data[sessionKey]) {
    let values = Array.isArray(req.session.data[sessionKey]) ? req.session.data[sessionKey] : [req.session.data[sessionKey]];
    values = values.filter(item => item !== value && item !== '_unchecked');
    req.session.data[sessionKey] = values.length ? values : undefined;
  }

  res.redirect(`/features-and-components/file-rename/v1/view?ref=${encodeURIComponent(ref)}${folderId ? `&folderId=${encodeURIComponent(folderId)}` : ''}`);
});

router.post('/features-and-components/file-rename/v1/view/move-files', function (req, res) {
  const ref = preserveRef(req);
  const folderId = req.query.folderId || req.body.folderId;
  res.redirect(`/features-and-components/file-rename/v1/view?ref=${encodeURIComponent(ref)}${folderId ? `&folderId=${encodeURIComponent(folderId)}` : ''}`);
});

router.post('/features-and-components/file-rename/v1/view/download-selected', function (req, res) {
  const ref = preserveRef(req);
  const folderId = req.query.folderId || req.body.folderId;
  res.redirect(`/features-and-components/file-rename/v1/view?ref=${encodeURIComponent(ref)}${folderId ? `&folderId=${encodeURIComponent(folderId)}` : ''}`);
});

router.post('/features-and-components/file-rename/v1/view/delete-selected', function (req, res) {
  const ref = preserveRef(req);
  const folderId = req.query.folderId || req.body.folderId;
  res.redirect(`/features-and-components/file-rename/v1/view?ref=${encodeURIComponent(ref)}${folderId ? `&folderId=${encodeURIComponent(folderId)}` : ''}`);
});

router.post('/features-and-components/file-rename/v1/view/:docId/toggle-status', function (req, res) {
  const ref = req.body.ref;
  const actionType = req.body.actionType;
  const newValue = req.body.newValue;
  const folderId = req.query.folderId || req.body.folderId;

  const cases = req.session.data['cases'] || [];
  const currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.json({ success: false });

  const foundFolder = findFolderDeep(currentCase.folders, folderId);
  if (!foundFolder) return res.json({ success: false });

  const activeDoc = (foundFolder.target.documents || []).find(d => d.id === req.params.docId);
  if (!activeDoc) return res.json({ success: false });

  if (actionType === 'readStatus') activeDoc.readStatus = newValue;
  if (actionType === 'isFlagged') activeDoc.isFlagged = newValue;

  res.json({ success: true });
});

router.get('/features-and-components/file-rename/v1/rename', function (req, res) {
  const ref = preserveRef(req) || 'COM/WCL/10088';
  const folderId = req.query.folderId;
  const docId = req.query.docId;
  const currentCase = ensureCaseWithFolders(req, ref);
  const foundFolder = folderId ? findFolderDeep(currentCase.folders, folderId) : null;
  const folder = foundFolder ? foundFolder.target : (currentCase.folders.length > 0 ? currentCase.folders[0] : null);
  const doc = folder ? (folder.documents || []).find(d => d.id === docId) : null;

  if (!folder || !doc) {
    return res.redirect(`/features-and-components/file-rename/v1/view?ref=${encodeURIComponent(ref)}${folderId ? `&folderId=${encodeURIComponent(folderId)}` : ''}`);
  }

  const extension = doc.name.includes('.') ? doc.name.slice(doc.name.lastIndexOf('.')) : '';
  const baseName = extension ? doc.name.slice(0, -extension.length) : doc.name;

  res.render('features-and-components/file-rename/v1/rename', {
    currentCase: currentCase,
    folder: folder,
    doc: doc,
    newName: baseName,
    extension: extension
  });
});

router.post('/features-and-components/file-rename/v1/rename', function (req, res) {
  const ref = preserveRef(req) || 'COM/WCL/10088';
  const folderId = req.body.folderId;
  const docId = req.body.docId;
  const submittedName = (req.body.newName || '').trim();
  const currentCase = ensureCaseWithFolders(req, ref);
  const foundFolder = folderId ? findFolderDeep(currentCase.folders, folderId) : null;
  const folder = foundFolder ? foundFolder.target : null;
  const doc = folder ? (folder.documents || []).find(d => d.id === docId) : null;

  if (!folder || !doc) {
    return res.redirect(`/features-and-components/file-rename/v1/view?ref=${encodeURIComponent(ref)}${folderId ? `&folderId=${encodeURIComponent(folderId)}` : ''}`);
  }

  const extension = doc.name.includes('.') ? doc.name.slice(doc.name.lastIndexOf('.')) : '';
  let baseName = submittedName;
  if (extension && baseName.endsWith(extension)) {
    baseName = baseName.slice(0, -extension.length).trim();
  }

  const errors = [];
  let errorMessage = null;
  const allowedFileNamePattern = /^(?!.*'')[A-Za-z0-9._()&' -]+$/;

  if (!baseName) {
    errorMessage = 'Enter a file name';
    errors.push({ text: errorMessage, href: '#newName' });
  } else if (baseName.length > 100) {
    errorMessage = 'File name must be 100 characters or fewer';
    errors.push({ text: errorMessage, href: '#newName' });
  } else if (!allowedFileNamePattern.test(baseName)) {
    errorMessage = 'File name can only include letters, numbers, spaces, dots, hyphens, underscores, brackets, ampersands and single apostrophes';
    errors.push({ text: errorMessage, href: '#newName' });
  }

  if (errors.length) {
    return res.render('features-and-components/file-rename/v1/rename', {
      currentCase: currentCase,
      folder: folder,
      doc: doc,
      newName: baseName,
      extension: extension,
      errorList: errors,
      errorMessage: errorMessage
    });
  }

  const oldName = doc.name;
  doc.name = baseName + extension;
  addAuditLog(req, ref, `File renamed from "${oldName}" to "${doc.name}" in ${folder.name}`);
  req.session.data['fileRenameSuccess'] = { name: doc.name };

  res.redirect(`/features-and-components/file-rename/v1/view?ref=${encodeURIComponent(ref)}&folderId=${encodeURIComponent(folderId)}`);
});

module.exports = router;

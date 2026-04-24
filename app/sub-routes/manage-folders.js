const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// Use ../ to go up one folder (from /sub-routes/ to /app/)
const { getCase, addAuditLog, findFolderDeep, getDefaultFolders } = require('../helpers');

// ==============================================
// MANAGE CASE FILES (FOLDERS & SUBFOLDERS)
// ==============================================

// ROUTE: View Main Folders List
router.get('/cases/manage-folders', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  if (!currentCase.folders) {
    var caseType = currentCase.type || currentCase.caseType || "";
    currentCase.folders = getDefaultFolders(caseType); // Uses the imported helper!
  }

  var successBanner = req.session.data['folderCreated'];
  var deleteBanner = req.session.data['folderDeleted']; 
  
  if (successBanner) delete req.session.data['folderCreated'];
  if (deleteBanner) delete req.session.data['folderDeleted'];

  res.render('cases/manage-folders/index', {
    currentCase: currentCase,
    successBanner: successBanner,
    deleteBanner: deleteBanner
  });
});

// ==============================================
// SEARCH CASE FILES
// ==============================================
router.get('/cases/manage-folders/search-results', function(req, res) {
  var ref = req.query.ref;
  // Grab the search query and make it lowercase for easy matching
  var fileSearchCriteria = (req.query.fileSearchCriteria || "").toLowerCase().trim();

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  // 1. Gather ALL documents from ALL folders using a recursive function
  var allDocuments = [];

  function extractDocs(folderList) {
    for (let f of folderList) {
      // If the folder has documents, add them to our master list
      if (f.documents && f.documents.length > 0) {
        for (let doc of f.documents) {
          // We attach the folder ID and Slug to each document so the 
          // "View folder" button on the UI knows exactly where to go!
          allDocuments.push({
            ...doc,
            folderId: f.id,
            folderSlug: f.slug,
            folderName: f.name
          });
        }
      }
      // If it has subfolders, dig into them too
      if (f.subfolders && f.subfolders.length > 0) {
        extractDocs(f.subfolders);
      }
    }
  }

  // Kick off the extraction
  if (currentCase.folders) extractDocs(currentCase.folders);

  // 2. Filter the documents based on the user's search query
  var filteredDocs = [];
  if (fileSearchCriteria) {
    filteredDocs = allDocuments.filter(d => 
      d.name.toLowerCase().includes(fileSearchCriteria) || 
      d.type.toLowerCase().includes(fileSearchCriteria)
    );
  }

  // 3. Pagination Logic (Identical to the folder view)
  const totalDocsCount = filteredDocs.length; 
  
  let rawItems = req.query.itemsPerPage || req.session.data['searchItemsPerPage'];
  let itemsPerPage = parseInt(rawItems, 10);
  if (isNaN(itemsPerPage) || itemsPerPage <= 0) itemsPerPage = 25;
  req.session.data['searchItemsPerPage'] = itemsPerPage; 

  let rawPage = req.query.page || 1;
  let currentPage = parseInt(rawPage, 10);
  if (isNaN(currentPage) || currentPage <= 0) currentPage = 1;

  const totalPages = Math.ceil(totalDocsCount / itemsPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = filteredDocs.slice(startIndex, endIndex);

  let paginationItems = [];
  let pagesToShow = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || i === currentPage || i === currentPage - 1 || i === currentPage + 1) {
      pagesToShow.push(i);
    }
  }

  let previousPage = null;
  // Keep the search criteria in the URL so pagination doesn't forget the search
  let baseUrl = `/cases/manage-folders/search-results?ref=${ref}&fileSearchCriteria=${encodeURIComponent(fileSearchCriteria)}`;

  for (let i of pagesToShow) {
    if (previousPage && i - previousPage > 1) {
      paginationItems.push({ ellipsis: true });
    }
    paginationItems.push({
      number: i,
      current: (i === currentPage),
      href: `${baseUrl}&page=${i}`
    });
    previousPage = i;
  }

  res.render('cases/manage-folders/search-results', {
    currentCase: currentCase,
    fileSearchCriteria: req.query.fileSearchCriteria || "", // Original casing for the text box
    paginatedDocuments: paginatedDocuments, 
    totalDocs: totalDocsCount,
    itemsPerPage: itemsPerPage,
    startItem: totalDocsCount === 0 ? 0 : startIndex + 1,
    endItem: Math.min(endIndex, totalDocsCount),
    pageItems: paginationItems,
    prevLink: currentPage > 1 ? `${baseUrl}&page=${currentPage - 1}` : null, 
    nextLink: currentPage < totalPages ? `${baseUrl}&page=${currentPage + 1}` : null 
  });
});

// ROUTE: View Inside a Specific Folder (With Filtering)
router.get('/cases/manage-folders/view/:folderId/:folderSlug', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId); // Uses the imported helper!
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  
  var activeFolder = foundFolder.target;
  var parentFolder = foundFolder.parent;

  // Banner handling
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
  
  let errorList = null;
  if (moveFileError) {
    errorList = [{ text: moveFileError, href: "#checkboxes-all" }];
    delete req.session.data['moveFileError'];
  }

  // --- FILTERING LOGIC ---
  const isFormSubmit = req.query.isFilterSubmit === 'true';
  if (isFormSubmit) {
    req.session.data['fileReadStatus'] = req.query.fileReadStatus;
    req.session.data['fileFlaggedStatus'] = req.query.fileFlaggedStatus;
  }

  const cleanArray = (categoryName) => {
    let val = req.session.data[categoryName];
    if (val && typeof val === 'object' && !Array.isArray(val)) val = Object.values(val);
    return [].concat(val || []).filter(item => item && item !== '_unchecked');
  };

  const readFilters = cleanArray('fileReadStatus');
  const flagFilters = cleanArray('fileFlaggedStatus');

  var documents = activeFolder.documents || [];

  if (readFilters.length > 0 || flagFilters.length > 0) {
    documents = documents.filter(doc => {
      let docReadStatus = doc.readStatus || "Unread";
      let docFlagStatus = doc.isFlagged ? "Flagged" : "Unflagged";
      
      let matchesRead = readFilters.length === 0 || readFilters.includes(docReadStatus);
      let matchesFlag = flagFilters.length === 0 || flagFilters.includes(docFlagStatus);

      // Must match BOTH categories if BOTH have selections
      return matchesRead && matchesFlag; 
    });
  }

  // --- PAGINATION LOGIC ---
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
  let baseUrl = `/cases/manage-folders/view/${activeFolder.id}/${activeFolder.slug}?ref=${ref}`;

  for (let i of pagesToShow) {
    if (previousPage && i - previousPage > 1) {
      paginationItems.push({ ellipsis: true });
    }
    paginationItems.push({
      number: i,
      current: (i === currentPage),
      href: `${baseUrl}&page=${i}`
    });
    previousPage = i;
  }

  res.render('cases/manage-folders/view', {
    currentCase: currentCase,
    folder: activeFolder,
    parentFolder: parentFolder,
    successBanner: successBanner,
    renameBanner: renameBanner,
    deleteBanner: deleteBanner,
    updateBanner: updateBanner,
    moveBanner: moveBanner,
    errorList: errorList,
    downloadBanner: downloadBanner,
    bulkDeleteBanner: bulkDeleteBanner,
    paginatedDocuments: paginatedDocuments, 
    totalDocs: totalDocsCount,
    folderTotalDocs: (activeFolder.documents || []).length, // Absolute total for the text above table
    itemsPerPage: itemsPerPage,
    startItem: totalDocsCount === 0 ? 0 : startIndex + 1,
    endItem: Math.min(endIndex, totalDocsCount),
    pageItems: paginationItems,
    prevLink: currentPage > 1 ? `${baseUrl}&page=${currentPage - 1}` : null, 
    nextLink: currentPage < totalPages ? `${baseUrl}&page=${currentPage + 1}` : null 
  });
});

// ROUTE: Remove individual file filters
router.get('/cases/manage-folders/view/:folderId/:folderSlug/remove-filter/:filterCategory/:filterValue', function(req, res) {
  let ref = req.query.ref;
  let folderId = req.params.folderId;
  let folderSlug = req.params.folderSlug;
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
  res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`); 
});

// ROUTE: Clear all file filters
router.get('/cases/manage-folders/view/:folderId/:folderSlug/clear-filters', function (req, res) {
  let ref = req.query.ref;
  let folderId = req.params.folderId;
  let folderSlug = req.params.folderSlug;
  
  req.session.data['fileReadStatus'] = "";
  req.session.data['fileFlaggedStatus'] = "";
  
  res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`);
});

// ==============================================
// DELETE A FOLDER
// ==============================================

// 1. View the Delete form
router.get('/cases/manage-folders/view/:folderId/:folderSlug/delete', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId); // Uses the imported helper!
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  
  var activeFolder = foundFolder.target;
  var parentFolder = foundFolder.parent;

  res.render('cases/manage-folders/delete-folder', {
    currentCase: currentCase,
    folder: activeFolder,
    parentFolder: parentFolder
  });
});

// 2. Submit the Delete form
router.post('/cases/manage-folders/view/:folderId/:folderSlug/delete', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId); // Uses the imported helper!
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  
  var activeFolder = foundFolder.target;
  var parentFolder = foundFolder.parent;

  var issues = [];
  if (activeFolder.subfolders && activeFolder.subfolders.length > 0) {
    issues.push("It contains subfolders");
  }
  if (activeFolder.documents && activeFolder.documents.length > 0) {
    issues.push("It contains documents");
  }

  if (issues.length > 0) {
    return res.render('cases/manage-folders/delete-folder', {
      currentCase: currentCase,
      folder: activeFolder,
      parentFolder: parentFolder,
      deleteIssues: issues
    });
  }

  var deletedName = activeFolder.name;
  
  if (parentFolder) {
    parentFolder.subfolders = parentFolder.subfolders.filter(f => f.id !== folderId);
  } else {
    currentCase.folders = currentCase.folders.filter(f => f.id !== folderId);
  }

  addAuditLog(req, ref, `Folder deleted: ${deletedName}`);
  req.session.data['folderDeleted'] = deletedName;

  req.session.save(function(err) {
    if (parentFolder) {
      res.redirect(`/cases/manage-folders/view/${parentFolder.id}/${parentFolder.slug}?ref=${ref}`);
    } else {
      res.redirect(`/cases/manage-folders?ref=${ref}`);
    }
  });
});

// ==============================================
// HIDDEN UTILITY: GENERATE DUMMY FILES
// ==============================================
router.get('/cases/manage-folders/view/:folderId/:folderSlug/generate-dummy', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId); // Uses the imported helper!
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  if (!activeFolder.documents) activeFolder.documents = [];

  var fileTypes = ["PDF", "DOCX", "XLSX", "JPG", "PNG"];
  
  // Use the EXACT same array of names from your upload logic!
  var randomNames = [
    "Site-inspection-report",
    "Appellant-costs-application",
    "LPA-questionnaire-response",
    "Interested-party-comments",
    "Hearing-attendance-sheet",
    "Decision-draft-v2",
    "Ecological-survey-results",
    "Transport-assessment-summary",
    "Planning-obligation-draft",
    "Officer-delegated-report"
  ];

  for (let i = 1; i <= 65; i++) {
    var type = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    
    // Grab a random name and append a random 4 digit suffix, joined by HYPHENS
    var randomBaseName = randomNames[Math.floor(Math.random() * randomNames.length)];
    var randomSuffix = Math.floor(1000 + Math.random() * 9000);
    var generatedName = `${randomBaseName}-${randomSuffix}.${type.toLowerCase()}`;
    
    var randomSizeNum = Math.floor(Math.random() * 5000) + 50; 
    var sizeLabel = randomSizeNum > 1000 ? (randomSizeNum / 1000).toFixed(1) + "MB" : randomSizeNum + "KB";

    activeFolder.documents.push({
      id: 'dummy-doc-' + Date.now() + '-' + i,
      name: generatedName, 
      type: type,
      sizeNum: randomSizeNum,
      size: sizeLabel,
      dateTimestamp: Date.now() - (i * 100000), 
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    });
  }

  res.redirect(`/cases/manage-folders/view/${activeFolder.id}/${activeFolder.slug}?ref=${ref}`);
});

// ==============================================
// UPLOAD FILES
// ==============================================

router.get('/cases/manage-folders/view/:folderId/:folderSlug/upload', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId); // Uses the imported helper!
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  res.render('cases/manage-folders/upload', {
    currentCase: currentCase,
    folder: activeFolder
  });
});

router.post('/cases/manage-folders/view/:folderId/:folderSlug/upload/document', function(req, res) {
  res.json({
    success: { messageText: "File uploaded successfully" },
    file: { originalname: "uploaded-file.pdf", filename: "file-" + Date.now() }
  });
});

router.post('/cases/manage-folders/view/:folderId/:folderSlug/upload/delete', function(req, res) {
  res.json({ success: { messageText: "File deleted" } });
});

router.post('/cases/manage-folders/view/:folderId/:folderSlug/upload', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId); // Uses the imported helper!
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  var uploadedFiles = req.body.mockFiles;

  if (!uploadedFiles || uploadedFiles.length === 0) {
    return res.render('cases/manage-folders/upload', {
      currentCase: currentCase,
      folder: activeFolder,
      errorList: [{ text: "Select a file to upload", href: "#mock-choose-files-btn" }]
    });
  }

  if (!Array.isArray(uploadedFiles)) {
    uploadedFiles = [uploadedFiles];
  }

  if (!activeFolder.documents) activeFolder.documents = [];

  for (let mockData of uploadedFiles) {
    var parts = mockData.split('|');
    var exactName = parts[0];
    var exactSizeStr = parts[1] || "11KB";
    var exactSizeNum = parseInt(parts[2]) || 11;
    var ext = exactName.split('.').pop().toUpperCase();
    
    activeFolder.documents.unshift({
      id: 'doc-' + Date.now() + Math.floor(Math.random() * 1000),
      name: exactName, 
      type: ext,
      sizeNum: exactSizeNum, 
      size: exactSizeStr, 
      dateTimestamp: Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    });
  }
  
  addAuditLog(req, ref, `${uploadedFiles.length} file(s) uploaded to folder: ${activeFolder.name}`);
  
  req.session.data['updateBanner'] = { 
    count: uploadedFiles.length, 
    folderName: activeFolder.name 
  };

  req.session.save(function(err) {
    res.redirect(`/cases/manage-folders/view/${activeFolder.id}/${activeFolder.slug}?ref=${ref}`);
  });
});

// ==============================================
// MOVE FILES JOURNEY
// ==============================================

router.post('/cases/manage-folders/view/:folderId/:folderSlug/move-files', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;
  
  var rawSelected = req.body.selectedFiles || req.session.data['selectedFiles'];
  var selectedFiles = [];
  if (rawSelected) {
    var arr = Array.isArray(rawSelected) ? rawSelected : [rawSelected];
    selectedFiles = arr.filter(item => item && item !== '_unchecked');
  }
  
  if (selectedFiles.length === 0) {
    req.session.data['moveFileError'] = "Select a file or files to move";
    return req.session.save(function() {
      res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`); 
    });
  }

  req.session.data['filesToMove'] = selectedFiles;
  res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}/move-files/step-1?ref=${ref}`);
});

router.get('/cases/manage-folders/view/:folderId/:folderSlug/move-files/step-1', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId); // Uses the imported helper!
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  var fileIdsToMove = req.session.data['filesToMove'] || [];
  var docsToMove = (activeFolder.documents || []).filter(d => fileIdsToMove.includes(d.id));

  res.render('cases/manage-folders/move-1-files', {
    currentCase: currentCase,
    folder: activeFolder,
    docsToMove: docsToMove
  });
});

router.get('/cases/manage-folders/view/:folderId/:folderSlug/move-files/location', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);

  var foundFolder = findFolderDeep(currentCase.folders, folderId); // Uses the imported helper!
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  
  var activeFolder = foundFolder.target;
  var parentFolder = foundFolder.parent;

  res.render('cases/manage-folders/move-2-location', {
    currentCase: currentCase,
    folder: activeFolder,
    parentFolder: parentFolder,
    allFolders: currentCase.folders 
  });
});

router.post('/cases/manage-folders/view/:folderId/:folderSlug/move-files/location', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;
  var destinationId = req.body.destinationFolderId;

  if (!destinationId) {
    return res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}/move-files/location?ref=${ref}`);
  }

  req.session.data['moveDestinationId'] = destinationId;
  res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}/move-files/check?ref=${ref}`);
});

router.get('/cases/manage-folders/view/:folderId/:folderSlug/move-files/check', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);

  var foundFolder = findFolderDeep(currentCase.folders, folderId); // Uses the imported helper!
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  var destId = req.session.data['moveDestinationId'];
  var foundDest = findFolderDeep(currentCase.folders, destId); // Uses the imported helper!
  var destFolder = foundDest ? foundDest.target : null;
  var destParent = foundDest ? foundDest.parent : null;

  res.render('cases/manage-folders/move-3-check', {
    currentCase: currentCase,
    folder: activeFolder,
    destFolder: destFolder,
    destParent: destParent
  });
});

router.post('/cases/manage-folders/view/:folderId/:folderSlug/move-files/check', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);

  var foundFolder = findFolderDeep(currentCase.folders, folderId); // Uses the imported helper!
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var sourceFolder = foundFolder.target;

  var destId = req.session.data['moveDestinationId'];
  var foundDest = findFolderDeep(currentCase.folders, destId); // Uses the imported helper!
  var destFolder = foundDest ? foundDest.target : null;

  var fileIdsToMove = req.session.data['filesToMove'] || [];
  var extractedDocs = [];

  sourceFolder.documents = sourceFolder.documents.filter(d => {
    if (fileIdsToMove.includes(d.id)) {
      extractedDocs.push(d);
      return false; 
    }
    return true; 
  });

  if (!destFolder.documents) destFolder.documents = [];
  destFolder.documents.unshift(...extractedDocs); 

  req.session.data['filesToMove'] = null;
  req.session.data['moveDestinationId'] = null;

  req.session.data['filesMovedBanner'] = { count: extractedDocs.length, destName: destFolder.name };
  
  req.session.save(function(err) {
    res.redirect(`/cases/manage-folders/view/${destFolder.id}/${destFolder.slug}?ref=${ref}`);
  });
});

// ==============================================
// REMOVE A FILE FROM THE MOVE LIST
// ==============================================
router.get('/cases/manage-folders/view/:folderId/:folderSlug/move-files/remove', function(req, res) {
  var ref = req.query.ref;
  var docId = req.query.docId;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;

  if (req.session.data['filesToMove']) {
    let selected = req.session.data['filesToMove'];
    if (!Array.isArray(selected)) {
      selected = [selected];
    }
    req.session.data['filesToMove'] = selected.filter(id => id !== docId);
  }

  res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}/move-files/step-1?ref=${ref}`);
});

// ==============================================
// BULK DOWNLOAD (Dummy Mock)
// ==============================================
router.post('/cases/manage-folders/view/:folderId/:folderSlug/download-selected', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;
  
  var rawSelected = req.body.selectedFiles || req.session.data['selectedFiles'];
  var selectedFiles = [];
  if (rawSelected) {
    var arr = Array.isArray(rawSelected) ? rawSelected : [rawSelected];
    selectedFiles = arr.filter(item => item && item !== '_unchecked');
  }

  if (selectedFiles.length === 0) {
    req.session.data['moveFileError'] = "Select a file or files to download";
    return req.session.save(() => res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`));
  }

  req.session.data['filesDownloadedBanner'] = selectedFiles.length;
  req.session.save(() => res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`));
});

// ==============================================
// BULK DELETE
// ==============================================

router.post('/cases/manage-folders/view/:folderId/:folderSlug/delete-selected', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;
  
  var rawSelected = req.body.selectedFiles || req.session.data['selectedFiles'];
  var selectedFiles = [];
  if (rawSelected) {
    var arr = Array.isArray(rawSelected) ? rawSelected : [rawSelected];
    selectedFiles = arr.filter(item => item && item !== '_unchecked');
  }

  if (selectedFiles.length === 0) {
    req.session.data['moveFileError'] = "Select a file or files to delete";
    return req.session.save(() => res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`));
  }

  req.session.data['filesToDelete'] = selectedFiles;
  res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}/delete-selected/confirm?ref=${ref}`);
});

router.get('/cases/manage-folders/view/:folderId/:folderSlug/delete-selected/confirm', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);

  var foundFolder = findFolderDeep(currentCase.folders, folderId); // Uses the imported helper!
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  var fileIdsToDelete = req.session.data['filesToDelete'] || [];
  var docsToDelete = (activeFolder.documents || []).filter(d => fileIdsToDelete.includes(d.id));

  res.render('cases/manage-folders/delete-selected', {
    currentCase: currentCase,
    folder: activeFolder,
    docsToDelete: docsToDelete
  });
});

router.post('/cases/manage-folders/view/:folderId/:folderSlug/delete-selected/confirm', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);

  var foundFolder = findFolderDeep(currentCase.folders, folderId); // Uses the imported helper!
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  var fileIdsToDelete = req.session.data['filesToDelete'] || [];
  
  var docsToDelete = (activeFolder.documents || []).filter(d => fileIdsToDelete.includes(d.id));
  var actualDeletedCount = docsToDelete.length;

  activeFolder.documents = activeFolder.documents.filter(d => !fileIdsToDelete.includes(d.id));

  req.session.data['filesToDelete'] = null;
  addAuditLog(req, ref, `${actualDeletedCount} file(s) bulk deleted from ${activeFolder.name}`);

  req.session.data['filesBulkDeletedBanner'] = actualDeletedCount;
  
  req.session.save(() => res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`));
});

// ==============================================
// REMOVE A FILE FROM THE BULK DELETE LIST
// ==============================================
router.get('/cases/manage-folders/view/:folderId/:folderSlug/delete-selected/remove', function(req, res) {
  var ref = req.query.ref;
  var docId = req.query.docId;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;

  if (req.session.data['filesToDelete']) {
    let selected = req.session.data['filesToDelete'];
    if (!Array.isArray(selected)) {
      selected = [selected];
    }
    req.session.data['filesToDelete'] = selected.filter(id => id !== docId);
  }

  res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}/delete-selected/confirm?ref=${ref}`);
});

// ==============================================
// RENAME A FOLDER
// ==============================================

router.get('/cases/manage-folders/view/:folderId/:folderSlug/rename', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId); // Uses the imported helper!
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  
  var activeFolder = foundFolder.target;
  var parentFolder = foundFolder.parent;

  res.render('cases/manage-folders/rename-folder', {
    currentCase: currentCase,
    folder: activeFolder,
    parentFolder: parentFolder
  });
});

router.post('/cases/manage-folders/view/:folderId/:folderSlug/rename', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var newFolderName = req.body.folderName;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId); // Uses the imported helper!
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  
  var activeFolder = foundFolder.target;
  var parentFolder = foundFolder.parent;

  var renderError = (msg) => {
    return res.render('cases/manage-folders/rename-folder', {
      currentCase: currentCase,
      folder: activeFolder,
      parentFolder: parentFolder,
      folderName: newFolderName, 
      errorList: [{ text: msg, href: "#folderName" }]
    });
  };

  if (!newFolderName || newFolderName.trim() === '') return renderError("Enter a folder name");
  
  var cleanName = newFolderName.trim();
  
  if (cleanName.length < 3 || cleanName.length > 255) return renderError("Folder name must be between 3 and 255 characters");
  
  var validCharsRegex = /^[a-zA-Z0-9 _\-']+$/;
  if (!validCharsRegex.test(cleanName)) {
    return renderError("Folder name must only include letters a to z, numbers and special characters such as spaces, underscores, hyphens and apostrophes");
  }

  if (cleanName === activeFolder.name) {
    return renderError("Choose a new folder name");
  }

  var siblingsList = parentFolder ? parentFolder.subfolders : currentCase.folders;
  var isDuplicate = siblingsList.some(f => f.name.toLowerCase() === cleanName.toLowerCase() && f.id !== folderId);
  
  if (isDuplicate) return renderError("A folder with this name already exists");

  var oldName = activeFolder.name;
  activeFolder.name = cleanName;
  activeFolder.slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  addAuditLog(req, ref, `Folder renamed: ${oldName} to ${cleanName}`);
  req.session.data['folderRenamed'] = activeFolder;

  req.session.save(function(err) {
    res.redirect(`/cases/manage-folders/view/${activeFolder.id}/${activeFolder.slug}?ref=${ref}`);
  });
});

// ==============================================
// CREATE A SUBFOLDER
// ==============================================

router.get('/cases/manage-folders/view/:folderId/:folderSlug/create-subfolder', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId); // Uses the imported helper!
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  res.render('cases/manage-folders/create-subfolder', {
    currentCase: currentCase,
    parentFolder: activeFolder
  });
});

router.post('/cases/manage-folders/view/:folderId/:folderSlug/create-subfolder', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var folderSlug = req.params.folderSlug;
  var folderName = req.body.folderName;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId); // Uses the imported helper!
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var parentFolder = foundFolder.target; 

  var renderError = (msg) => {
    return res.render('cases/manage-folders/create-subfolder', {
      currentCase: currentCase,
      parentFolder: parentFolder,
      folderName: folderName, 
      errorList: [{ text: msg, href: "#folderName" }]
    });
  };

  if (!folderName || folderName.trim() === '') return renderError("Enter a folder name");
  var cleanFolderName = folderName.trim();
  if (cleanFolderName.length < 3 || cleanFolderName.length > 255) return renderError("Folder name must be between 3 and 255 characters");
  
  var validCharsRegex = /^[a-zA-Z0-9 _\-']+$/;
  if (!validCharsRegex.test(cleanFolderName)) return renderError("Folder name must only include letters a to z, numbers and special characters such as spaces, underscores, hyphens and apostrophes");

  if (!parentFolder.subfolders) parentFolder.subfolders = [];

  var isDuplicate = parentFolder.subfolders.some(f => f.name.toLowerCase() === cleanFolderName.toLowerCase());
  if (isDuplicate) return renderError("A folder with this name already exists");

  var newId = parentFolder.id + '-sub-' + Date.now();
  var newSlug = cleanFolderName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  var newSubfolder = {
    id: newId,
    name: cleanFolderName,
    slug: newSlug,
    subfolders: [] 
  };

  parentFolder.subfolders.push(newSubfolder);
  addAuditLog(req, ref, `Subfolder created: ${cleanFolderName} (in ${parentFolder.name})`);
  req.session.data['folderCreated'] = newSubfolder;

  req.session.save(function(err) {
    res.redirect(`/cases/manage-folders/view/${folderId}/${folderSlug}?ref=${ref}`);
  });
});

// ==============================================
// CREATE A MAIN FOLDER
// ==============================================

router.get('/cases/manage-folders/create', function(req, res) {
  var ref = req.query.ref;
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  res.render('cases/manage-folders/create', {
    currentCase: currentCase
  });
});

router.post('/cases/manage-folders/create', function(req, res) {
  var ref = req.query.ref;
  var folderName = req.body.folderName;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  if (!folderName || folderName.trim() === '') {
    return res.render('cases/manage-folders/create', {
      currentCase: currentCase,
      errorList: [{ text: "Enter a folder name", href: "#folderName" }]
    });
  }

  var cleanFolderName = folderName.trim();

  var isDuplicate = currentCase.folders.some(f => f.name.toLowerCase() === cleanFolderName.toLowerCase());
  
  if (isDuplicate) {
    return res.render('cases/manage-folders/create', {
      currentCase: currentCase,
      folderName: cleanFolderName,
      errorList: [{ text: "A folder with this name already exists", href: "#folderName" }]
    });
  }

  var newId = 'f-' + Date.now();
  var newSlug = cleanFolderName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  var newFolder = {
    id: newId,
    name: cleanFolderName,
    slug: newSlug,
    subfolders: []
  };

  currentCase.folders.push(newFolder);

  addAuditLog(req, ref, "Folder created: " + cleanFolderName);
  req.session.data['folderCreated'] = newFolder;

  res.redirect(`/cases/manage-folders?ref=${ref}`);
});

// ==============================================
// DELETE A FILE
// ==============================================

router.get('/cases/manage-folders/view/:folderId/:folderSlug/:docId/delete', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var docId = req.params.docId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId); // Uses the imported helper!
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  var activeDoc = (activeFolder.documents || []).find(d => d.id === docId);
  if (!activeDoc) return res.redirect(`/cases/manage-folders/view/${activeFolder.id}/${activeFolder.slug}?ref=${ref}`);

  res.render('cases/manage-folders/delete-file', {
    currentCase: currentCase,
    folder: activeFolder,
    doc: activeDoc
  });
});

router.post('/cases/manage-folders/view/:folderId/:folderSlug/:docId/delete', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;
  var docId = req.params.docId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId); // Uses the imported helper!
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  var activeDoc = (activeFolder.documents || []).find(d => d.id === docId);
  
  if (activeDoc) {
    activeFolder.documents = activeFolder.documents.filter(d => d.id !== docId);
    addAuditLog(req, ref, `File deleted: ${activeDoc.name} from ${activeFolder.name}`);
  }

  res.redirect(`/cases/manage-folders/view/${activeFolder.id}/${activeFolder.slug}/file-deleted?ref=${ref}`);
});

router.get('/cases/manage-folders/view/:folderId/:folderSlug/file-deleted', function(req, res) {
  var ref = req.query.ref;
  var folderId = req.params.folderId;

  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  if (!currentCase) return res.redirect('/');

  var foundFolder = findFolderDeep(currentCase.folders, folderId); // Uses the imported helper!
  if (!foundFolder) return res.redirect(`/cases/manage-folders?ref=${ref}`);
  var activeFolder = foundFolder.target;

  res.render('cases/manage-folders/file-deleted', {
    currentCase: currentCase,
    folder: activeFolder
  });
});

// ==============================================
// TOGGLE READ/FLAG STATUS (SILENT POST)
// ==============================================
router.post('/cases/manage-folders/view/:folderId/:folderSlug/:docId/toggle-status', function(req, res) {
  var ref = req.body.ref;
  var actionType = req.body.actionType; // 'readStatus' or 'isFlagged'
  var newValue = req.body.newValue;
  
  var cases = req.session.data['cases'] || [];
  var currentCase = cases.find(x => x.reference === ref);
  
  if (currentCase) {
    var foundFolder = findFolderDeep(currentCase.folders, req.params.folderId); // Uses the imported helper!
    if (foundFolder) {
      var activeDoc = (foundFolder.target.documents || []).find(d => d.id === req.params.docId);
      if (activeDoc) {
         if (actionType === 'readStatus') activeDoc.readStatus = newValue;
         if (actionType === 'isFlagged') activeDoc.isFlagged = newValue;
      }
    }
  }
  res.json({ success: true });
});

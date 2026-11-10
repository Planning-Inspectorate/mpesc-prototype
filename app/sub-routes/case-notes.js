const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();
const { addAuditLog } = require('../helpers');

function preserveRef(req) {
  const ref = req.query.ref || req.body.ref;
  if (ref) {
    req.session.data['ref'] = ref;
  }
  return ref || req.session.data['ref'];
}

// Only an explicitly supplied, non-negative integer can identify a case note.
function noteIndex(value) {
  if (typeof value !== 'string' || !/^(0|[1-9]\d*)$/.test(value)) return -1;
  const index = Number(value);
  return Number.isSafeInteger(index) ? index : -1;
}

// The archived prototype uses the same case data and operations as the main journey.
router.get(['/features-and-components/added/case-notes', '/features-and-components/added/case-notes/index', '/features-and-components/added/case-notes/index.njk'], function (req, res) {
  const ref = preserveRef(req);
  const currentCase = (req.session.data['cases'] || []).find(c => c.reference === ref);
  if (!currentCase) return res.redirect('/cases-page');

  const sectionToJumpTo = req.session.flashSection;
  req.session.flashSection = null;

  res.render('features-and-components/added/case-notes/index', {
    flashSection: sectionToJumpTo
  });
});

// Register both journeys against the same note handlers, with separate return URLs.
function registerCaseNoteRoutes({ addPath, basePath, homePath, templatePath }) {
  function findCase(req, ref) {
    return (req.session.data['cases'] || []).find(c => c.reference === ref);
  }

  function homeUrl(ref) {
    return `${homePath}?ref=${encodeURIComponent(ref)}`;
  }

  router.post(addPath, function (req, res) {
    const ref = preserveRef(req);
    const currentCase = findCase(req, ref);
    if (!currentCase) return res.redirect('/cases-page');

    const comment = req.body.comment;
    if (comment && comment.trim() !== '') {
      if (!currentCase.caseNotes) currentCase.caseNotes = [];

      // Store both summary and table date formats and record the original text in history.
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
      const metaDateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const tableDateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      const userStr = req.session.data['currentUser'] || 'Kieran De La Kruz';

      currentCase.caseNotes.unshift({
        text: comment,
        meta: `${timeStr} on ${metaDateStr} by ${userStr}`,
        tableDate: tableDateStr,
        tableTime: timeStr,
        tableUser: userStr,
        editedDate: null
      });

      addAuditLog(req, ref, 'Case note added: ' + comment);
    }

    req.session.flashSection = 'case-notes';
    res.redirect(homeUrl(ref));
  });

  router.get(basePath + '/change', function (req, res) {
    const ref = preserveRef(req);
    const currentCase = findCase(req, ref);
    if (!currentCase) return res.redirect('/cases-page');

    const index = noteIndex(req.query.index);
    const note = currentCase.caseNotes && currentCase.caseNotes[index];
    if (!note) return res.redirect(homeUrl(ref) + '#case-notes');

    res.render(templatePath + '/change-note', {
      ref,
      index,
      noteText: note.text,
      backUrl: homeUrl(ref) + '#case-notes',
      actionUrl: basePath + '/change?ref=' + encodeURIComponent(ref)
    });
  });

  router.post(basePath + '/change', function (req, res) {
    const ref = preserveRef(req);
    const currentCase = findCase(req, ref);
    if (!currentCase) return res.redirect('/cases-page');

    const index = noteIndex(req.body.index);
    const updatedNote = req.body.updatedNote;
    const note = currentCase.caseNotes && currentCase.caseNotes[index];

    if (!note) return res.redirect(homeUrl(ref) + '#case-notes');

    if (!updatedNote || updatedNote.trim() === '') {
      return res.render(templatePath + '/change-note', {
        ref,
        index,
        noteText: updatedNote,
        error: true,
        backUrl: homeUrl(ref) + '#case-notes',
        actionUrl: basePath + '/change?ref=' + encodeURIComponent(ref)
      });
    }

    // Keep the original text in the audit history when a note is edited.
    const now = new Date();
    const tableDateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const oldNote = note.text;

    currentCase.caseNotes[index].text = updatedNote.trim();
    currentCase.caseNotes[index].editedDate = tableDateStr;
    addAuditLog(req, ref, 'Case note updated from "' + oldNote + '" to "' + updatedNote.trim() + '" ');
    req.session.flashSection = 'case-notes';

    res.redirect(homeUrl(ref));
  });

  // The archived demo also supports its original inline-edit route.
  if (templatePath === 'features-and-components/added/case-notes') {
    router.post(basePath + '/update', function (req, res) {
      const ref = preserveRef(req);
      const currentCase = findCase(req, ref);
      if (!currentCase) return res.redirect('/cases-page');

      const index = noteIndex(req.query.index);
      const updatedNote = req.body.updatedNote;
      const note = currentCase.caseNotes && currentCase.caseNotes[index];

      if (note && updatedNote && updatedNote.trim() !== '') {
        const now = new Date();
        const tableDateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const oldNote = note.text;

        currentCase.caseNotes[index].text = updatedNote.trim();
        currentCase.caseNotes[index].editedDate = tableDateStr;
        addAuditLog(req, ref, 'Case note updated from "' + oldNote + '" to "' + updatedNote.trim() + '" ');
        req.session.flashSection = 'case-notes';
        return res.redirect(homeUrl(ref));
      }

      res.redirect(homeUrl(ref) + '&editIndex=' + index + '#case-notes');
    });
  }

  router.get(basePath + '/remove', function (req, res) {
    const ref = preserveRef(req);
    const currentCase = findCase(req, ref);
    if (!currentCase) return res.redirect('/cases-page');

    const index = noteIndex(req.query.index);
    const note = currentCase.caseNotes && currentCase.caseNotes[index];
    if (!note) return res.redirect(homeUrl(ref) + '#case-notes');

    res.render(templatePath + '/remove-note', {
      ref,
      index,
      actionUrl: `${basePath}/remove?ref=${encodeURIComponent(ref)}&index=${index}`,
      backUrl: homeUrl(ref) + '#case-notes',
      noteText: note.text
    });
  });

  router.post(basePath + '/remove', function (req, res) {
    const ref = preserveRef(req);
    const currentCase = findCase(req, ref);
    if (!currentCase) return res.redirect('/cases-page');

    const index = noteIndex(req.query.index);
    const note = currentCase.caseNotes && currentCase.caseNotes[index];
    if (!note) return res.redirect(homeUrl(ref) + '#case-notes');

    // Remove the visible note but retain its text in the case history.
    currentCase.caseNotes.splice(index, 1);
    addAuditLog(req, ref, 'Case note removed: ' + note.text);
    req.session.flashSection = 'case-notes';

    res.redirect(homeUrl(ref));
  });
}

registerCaseNoteRoutes({
  addPath: '/cases/add-case-note',
  basePath: '/cases/case-notes',
  homePath: '/cases/case-details',
  templatePath: 'cases/case-notes'
});
registerCaseNoteRoutes({
  addPath: '/features-and-components/added/case-notes/add',
  basePath: '/features-and-components/added/case-notes',
  homePath: '/features-and-components/added/case-notes',
  templatePath: 'features-and-components/added/case-notes'
});

module.exports = router;
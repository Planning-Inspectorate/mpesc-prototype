const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();
const { getCase, addAuditLog } = require('../../helpers');

function preserveRef(req) {
  const ref = req.query.ref || req.body.ref;
  if (ref) {
    req.session.data['ref'] = ref;
  }
  return ref || req.session.data['ref'];
}

router.get('/features-and-components/case-notes', function (req, res) {
  const ref = preserveRef(req);
  const currentCase = getCase(req);
  if (!currentCase) return res.redirect('/cases-page');

  const sectionToJumpTo = req.session.flashSection;
  req.session.flashSection = null;

  res.render('features-and-components/case-notes/index', {
    flashSection: sectionToJumpTo
  });
});

router.post('/features-and-components/case-notes/add', function (req, res) {
  const ref = preserveRef(req);
  const currentCase = getCase(req);
  if (!currentCase) return res.redirect('/cases-page');

  const comment = req.body.comment;
  if (comment && comment.trim() !== '') {
    if (!currentCase.caseNotes) currentCase.caseNotes = [];

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

    addAuditLog(req, ref, 'Case note added');
  }

  req.session.flashSection = 'case-notes';
  res.redirect('/features-and-components/case-notes?ref=' + encodeURIComponent(ref));
});

router.get('/features-and-components/case-notes/change', function (req, res) {
  const ref = preserveRef(req);
  const currentCase = getCase(req);
  if (!currentCase) return res.redirect('/cases-page');

  const index = Number(req.query.index);
  const note = currentCase.caseNotes && currentCase.caseNotes[index];
  if (!note) return res.redirect('/features-and-components/case-notes?ref=' + encodeURIComponent(ref) + '#case-notes');

  res.render('features-and-components/case-notes/change-note', {
    ref,
    index,
    noteText: note.text
  });
});

router.post('/features-and-components/case-notes/change', function (req, res) {
  const ref = preserveRef(req);
  const currentCase = getCase(req);
  if (!currentCase) return res.redirect('/cases-page');

  const index = Number(req.body.index);
  const updatedNote = req.body.updatedNote;
  const note = currentCase.caseNotes && currentCase.caseNotes[index];

  if (!note) return res.redirect('/features-and-components/case-notes?ref=' + encodeURIComponent(ref) + '#case-notes');

  if (!updatedNote || updatedNote.trim() === '') {
    return res.render('features-and-components/case-notes/change-note', {
      ref,
      index,
      noteText: updatedNote,
      error: true
    });
  }

  const now = new Date();
  const tableDateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  currentCase.caseNotes[index].text = updatedNote.trim();
  currentCase.caseNotes[index].editedDate = tableDateStr;
  addAuditLog(req, ref, 'Case note updated');
  req.session.flashSection = 'case-notes';

  res.redirect('/features-and-components/case-notes?ref=' + encodeURIComponent(ref));
});

router.post('/features-and-components/case-notes/update', function (req, res) {
  const ref = preserveRef(req);
  const currentCase = getCase(req);
  if (!currentCase) return res.redirect('/cases-page');

  const index = Number(req.query.index);
  const updatedNote = req.body.updatedNote;
  const note = currentCase.caseNotes && currentCase.caseNotes[index];

  if (note && updatedNote && updatedNote.trim() !== '') {
    const now = new Date();
    const tableDateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    currentCase.caseNotes[index].text = updatedNote.trim();
    currentCase.caseNotes[index].editedDate = tableDateStr;
    addAuditLog(req, ref, 'Case note updated');
    req.session.flashSection = 'case-notes';
    return res.redirect('/features-and-components/case-notes?ref=' + encodeURIComponent(ref));
  }

  res.redirect('/features-and-components/case-notes?ref=' + encodeURIComponent(ref) + '&editIndex=' + index + '#case-notes');
});

router.get('/features-and-components/case-notes/remove', function (req, res) {
  const ref = preserveRef(req);
  const currentCase = getCase(req);
  if (!currentCase) return res.redirect('/cases-page');

  const index = Number(req.query.index);
  const note = currentCase.caseNotes && currentCase.caseNotes[index];
  if (!note) return res.redirect('/features-and-components/case-notes?ref=' + encodeURIComponent(ref) + '#case-notes');

  res.render('features-and-components/case-notes/remove-note', {
    ref,
    index,
    actionUrl: `/features-and-components/case-notes/remove?ref=${encodeURIComponent(ref)}&index=${index}`,
    backUrl: `/features-and-components/case-notes?ref=${encodeURIComponent(ref)}#case-notes`,
    noteText: note.text
  });
});

router.post('/features-and-components/case-notes/remove', function (req, res) {
  const ref = preserveRef(req);
  const currentCase = getCase(req);
  if (!currentCase) return res.redirect('/cases-page');

  const index = Number(req.query.index);
  const note = currentCase.caseNotes && currentCase.caseNotes[index];
  if (!note) return res.redirect('/features-and-components/case-notes?ref=' + encodeURIComponent(ref) + '#case-notes');

  currentCase.caseNotes.splice(index, 1);
  addAuditLog(req, ref, 'Case note removed');
  req.session.flashSection = 'case-notes';

  res.redirect('/features-and-components/case-notes?ref=' + encodeURIComponent(ref));
});

module.exports = router;
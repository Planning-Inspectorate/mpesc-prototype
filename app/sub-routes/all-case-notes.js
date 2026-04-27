const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// Use ../ to go up one folder (from /sub-routes/ to /app/)
const { getCase } = require('../helpers');

// ==============================================================================
// VIEW ALL CASE NOTES (Dedicated case notes page)
// ==============================================================================

router.get('/cases/all-case-notes', function(req, res) {
  // 1. Use the helper to find the case directly in the server memory
  let currentCase = getCase(req);

  // 2. Safety bounce: If the case dropped out of memory, kick them back to the list
  if (!currentCase) return res.redirect('/cases-page'); 

  // 3. Render the dedicated case notes page, passing the case data
  res.render('cases/all-case-notes', {
    currentCase: currentCase
  });
});
module.exports = function (router) {

// entry point (case page)

router.get('/features-and-components/case-notes', function (req, res) {

res.render('features/case-notes/index')

})

// change note

router.get('/features-and-components/case-notes/change', function (req, res) {

res.render('features/case-notes/change-note')

})

router.post('/features-and-components/case-notes/change', function (req, res) {

req.session.data['note'] = req.body.note

res.redirect('/features-and-components/case-notes?success=changed')

})

// remove note

router.get('/features-and-components/case-notes/remove', function (req, res) {

res.render('features/case-notes/remove-note')

})

router.post('/features-and-components/case-notes/remove', function (req, res) {

req.session.data['note'] = null

res.redirect('/features-and-components/case-notes?success=removed')

})

}
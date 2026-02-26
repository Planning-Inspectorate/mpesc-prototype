//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter

// This is the standard way to add the is_array filter in the latest kit
addFilter('is_array', function (obj) {
  return Array.isArray(obj)
})
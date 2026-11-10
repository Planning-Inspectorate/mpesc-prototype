# MPESC Prototype

To get started:

`npm install`

`npm run dev`

## Feature navigation

Put each feature's index at `app/views/features-and-components/<feature>/index.html`
or `index.njk`, with its prototypes in version folders such as `v1` and `v2`.
Previously added features can be kept under `features-and-components/added/<feature>`
using the same index and version structure.
Pages using the shared main layout link from MPESC to that index. If there is
no feature index, the link goes to the main prototype home instead. Pages that
replace the shared header need to provide their own navigation.
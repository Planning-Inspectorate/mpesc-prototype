(function () {

document.addEventListener('DOMContentLoaded', function () {

// Example: confirm removal fallback (if you later inline delete)

const removeLinks = document.querySelectorAll('[data-module="confirm-remove"]')

removeLinks.forEach(link => {

link.addEventListener('click', function (e) {

const confirmed = window.confirm('Are you sure you want to remove this note?')

if (!confirmed) {

e.preventDefault()

}

})

})

})

})()
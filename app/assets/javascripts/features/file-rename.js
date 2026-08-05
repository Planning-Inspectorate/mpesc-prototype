(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const renameButtons = document.querySelectorAll('.js-file-rename');
    if (!renameButtons.length) return;

    const getQueryParam = (key) => {
      return new URLSearchParams(window.location.search).get(key) || '';
    };

    const promptForNewName = (currentName) => {
      return window.prompt('Enter a new file name', currentName);
    };

    const updateDocumentName = (docId, newName) => {
      const docNameEls = document.querySelectorAll(`.js-file-name[data-doc-id="${docId}"]`);
      docNameEls.forEach(el => el.textContent = newName);

      const renameEls = document.querySelectorAll(`.js-file-rename[data-doc-id="${docId}"]`);
      renameEls.forEach(el => el.setAttribute('data-doc-name', newName));
    };

    const renameFile = async (folderId, docId, currentName) => {
      const newName = promptForNewName(currentName);
      if (!newName || newName.trim() === '' || newName.trim() === currentName) {
        return;
      }

      try {
        const response = await fetch('/features-and-components/file-rename/v1/rename', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ref: getQueryParam('ref'),
            folderId: folderId,
            docId: docId,
            newName: newName.trim()
          })
        });

        const result = await response.json();
        if (result.success) {
          updateDocumentName(docId, result.newName);
        } else {
          throw new Error('Rename failed');
        }
      } catch (error) {
        console.error('File rename request failed', error);
        window.alert('Unable to rename the file. Please try again.');
      }
    };

    renameButtons.forEach(button => {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        const docId = this.dataset.docId;
        const folderId = this.dataset.folderId;
        const currentName = this.dataset.docName || '';
        renameFile(folderId, docId, currentName);
      });
    });
  });
})();

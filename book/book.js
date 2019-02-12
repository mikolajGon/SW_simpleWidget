const Book = (function () {
  let state = {};

  const handleInteraction = {
    choose: e => {
      if (state.editorMode) {
        const editorMode = state.editorMode ? false : true;
        state = { ...state, editorMode };
      }
      const lastCharacterChosenId = parseInt(e.target.dataset.id);
      state = { ...state, lastCharacterChosenId };
      getActiveCharacterDetails(lastCharacterChosenId);
    },
    edit: toggleEditor,
    cancel: toggleEditor,
    save: () => {
      modifyActiveCharacter();
      toggleEditor();
    },
    delete: () => {
      deleteActiveCharacter(state.activeCharacter.id);
    }
  };

  function eventListenerCallback(e) {
    const actionName = e.target.dataset.action;
    if (actionName) handleInteraction[actionName](e);
  }

  function getCharactersList() {
    state.store.getCharacters().then(updateCharacterList);
  }

  function getActiveCharacterDetails(id) {
    state.store.getCharacterDetails(id).then( character => {
      if (character.id === state.lastCharacterChosenId) updateActiveCharacter(character);
    });
  }

  function updateCharacterList(characters) {
    const charactersList = characters.sort( (a,b) =>{
      return a.name > b.name ? 1 : -1;
    });
    state = { ...state, charactersList};
    render();
  }

  function updateActiveCharacter(activeCharacter) {
    state = { ...state, activeCharacter };
    render();
  }

  function toggleEditor() {
    const editorMode = state.editorMode ? false : true;
    state = { ...state, editorMode };
    render();
  }

  function modifyActiveCharacter() {
    const name = document.querySelector('[name ="name"]').value;
    const species = document.querySelector('[name ="species"]').value;
    const description = document.querySelector('[name ="description"]').value;
    state.activeCharacter = { ...state.activeCharacter, name, species, description };

    const charactersList = state.charactersList.map(character => {
      if (state.activeCharacter.id === character.id) {
        return character = { ...character, name, species }
      }
      return character;
    });
    state = { ...state, charactersList }
    updateCharacterList(state.charactersList);

    state.store.updateCharacter(state.activeCharacter).then(() => {
      getCharactersList();
      getActiveCharacterDetails(state.activeCharacter.id)
    });
  }

  function deleteActiveCharacter(id) {
    state.store.deleteCharacter(id).then( () => {
      const activeCharacter = null;
      state = { ...state, activeCharacter };
      getCharactersList();
    });
  }

  function createDiv(cssClass) {
    const div = document.createElement('div');
    div.classList.add(cssClass);
    return div;
  }

  function createParagraph(cssClass, text) {
    const paragraph = document.createElement('p');
    paragraph.classList.add(cssClass);
    paragraph.innerText = text;
    return paragraph;
  }

  function createSpan(cssClass, text) {
    const span = document.createElement('span');
    span.classList.add(cssClass);
    span.innerText = text;
    return span;
  }

  function createInput(cssClass, text) {
    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('name', cssClass);
    input.classList.add(cssClass);
    input.value = text;
    return input;
  }

  function createTextarea(cssClass, text) {
    const textarea = document.createElement('textarea');
    textarea.setAttribute('name', cssClass);
    textarea.classList.add(cssClass);
    textarea.value = text;
    return textarea;
  }

  function createButton(text) {
    const button = document.createElement('button');
    button.classList.add(text);
    button.innerText = text;
    button.dataset.action = text;
    return button;
  }

  function createIcon(cssClass) {
    const icon = document.createElement('i');
    icon.classList.add(cssClass);
    icon.classList.add('fa');
    icon.classList.add('fa-fw');
    return icon
  }

  function createContainers() {
    const listContainer = createDiv('list');
    const detailsContainer = createDiv('details');
    state = { ...state, listContainer, detailsContainer }
  }

  function createEventListeners() {
    state.container.addEventListener('click', eventListenerCallback);
  }

  function renderCharacterList() {
    const ul = document.createElement('ul');

    state.charactersList.forEach(({ name, species, id }) => {
      const li = document.createElement('li');
      li.classList.add('item');
      li.dataset.action = 'choose';
      li.dataset.id = id;

      const paragraph = createParagraph('name', name);
      paragraph.dataset.action = 'choose';
      paragraph.dataset.id = id;

      const span = createSpan('species', species);

      li.appendChild(paragraph);
      li.appendChild(span);
      ul.appendChild(li);
    });

    state.listContainer.appendChild(ul);
  }

  function renderCharacterDetails() {
    if (!state.activeCharacter) {
      const paragraph = createParagraph('no-details', 'Choose a character from the menu' );
      state.detailsContainer.appendChild(paragraph)
    } else {
      const frag = document.createDocumentFragment();
      const { name, species, picture, description } = state.activeCharacter;
      if (picture) {
        const image = document.createElement('img');
        image.setAttribute('src', picture);
        image.setAttribute('alt', 'character picture');
        state.detailsContainer.appendChild(image);
      }

      let nameField, speciesField, descriptionField, button1, button2;
      if (state.editorMode) {
        state.detailsContainer.classList.remove('details');
        state.detailsContainer.classList.add('editor');
        nameField = createInput('name', name);
        speciesField = createInput('species', species);
        descriptionField = createTextarea('description', description);

        button1 = createButton('save');
        const saveIcon = createIcon('fa-floppy-o');
        button1.insertBefore(saveIcon, button1.firstChild);

        button2 = createButton('cancel');
        const cancelIcon = createIcon('fa-ban');
        button2.insertBefore(cancelIcon, button2.firstChild);
      } else {
        state.detailsContainer.classList.remove('editor');
        state.detailsContainer.classList.add('details');
        nameField = createParagraph('name', name);
        speciesField = createSpan('species', species);
        descriptionField = createParagraph('description', description);

        button1 = createButton('edit');
        const editIcon = createIcon('fa-pencil');
        button1.insertBefore(editIcon, button1.firstChild);

        button2 = createButton('delete');
        const deleteIcon = createIcon('fa-trash');
        button2.insertBefore(deleteIcon, button2.firstChild);
      }

      frag.appendChild(nameField);
      frag.appendChild(speciesField);
      frag.appendChild(descriptionField);
      frag.appendChild(button1);
      frag.appendChild(button2);

      state.detailsContainer.appendChild(frag);

    }
  }

  function renderContainers() {
    state.container.appendChild(state.listContainer);
    state.container.appendChild(state.detailsContainer);
  }

  function clear() {
    state.container.innerHTML = '';
    state.listContainer.innerHTML = '';
    state.detailsContainer.innerHTML = '';
  }

  function render() {
    clear();
    renderContainers();
    renderCharacterList();
    renderCharacterDetails();
  }

  return {
    init: function (frame, store) {
      console.log('New Book Initiated');
      const container = frame[0];
      state = {
        store,
        container,
        charactersList: [],
        listContainer: {},
        detailsContainer: {},
        activeCharacter: null,
        editorMode: false,
        lastCharacterChosenId: null
      };
      createContainers();
      getCharactersList();
      createEventListeners();
    }
  }
})()
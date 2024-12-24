const {shell}= require('electron');

const parser = new DOMParser();

const linkSection = document.querySelector('.links');
const errorMessage = document.querySelector('.error-message');
const newLinkForm = document.querySelector('.new-link-form');
const newLinkURL = document.querySelector('.new-link-url');
const newLinkSubmit = document.querySelector('.new-link-submit');
const clearStorageButton = document.querySelector('.clear-storage');


newLinkURL.addEventListener('keyup', () => {
    newLinkSubmit.disabled = !newLinkURL.validity.valid;
});

newLinkForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const url = newLinkURL.value;

    fetch(url)
        .then(validateResponse)
        .then(response => response.text())
        .then(parseResponse)
        .then(findTitle)
        .then(title => storeLink(title, url))
        .then(clearForm)
        .then(renderLinks)
        .catch(error => handleError(error, url));
});

clearStorageButton.addEventListener('click', () => {
    localStorage.clear();
    linkSection.innerHTML = '';
})

linkSection.addEventListener('click', (event) => {
    if (event.target.href) {
        event.preventDefault();
        shell.openExternal(event.target.href);
    }
})

const clearForm = () => {
    newLinkURL.value = null;
}

const parseResponse = (text) => {
    return parser.parseFromString(text, 'text/html');
}

const findTitle = (nodes) => {
    return nodes.querySelector('title').innerText;
}

const storeLink = (title, url) => {
    localStorage.setItem(url, JSON.stringify({title: title, url: url}));
}

const getLinks = () => {
    return Object.keys(localStorage).map(key => JSON.parse(localStorage.getItem(key)));
}

const convertToElement = (link) => {
    return `<div class="link"><h3>${link.title}</h3><p><a href="${link.url}">${link.url}</a></p></div>`
};

const renderLinks = () => {
    const linkElements = getLinks().map(convertToElement).join('');
    linkSection.innerHTML = linkElements;
}

const handleError = (error, url) => {
    errorMessage.innerHTML = `
    There was an issue adding ${url}: ${error.message}`.trim();
    setTimeout(() => errorMessage.innerHTML = null, 5000);
}

const validateResponse = (response) => {
    if (response.ok) {return response;}
    throw new Error(`Status code of ${response.status} ${response.statusText}`);
}

renderLinks();

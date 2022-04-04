/**
 * Sends a request to add a new site to a webring.
 */
function addNewSite()
{
	/** The form's error message text element. */
	const formErrorMessageElement = document.getElementById('add-new-site-error-message');
	const formElement = document.getElementById('add-new-site-form');
	const formData = new FormData(formElement);

	/** The form data converted to a native Javascript object. */
	const formFields = Object.fromEntries(formData.entries());

	// Retrieve this hidden field from the form, and then remove it from the formData.
	const { webringUrl } = formFields;
	delete formFields.webringUrl;

	fetch('/webring/' + webringUrl + '/add', {
		body: JSON.stringify(formFields),
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
	}).then((response) => {
		if (!response.ok) {
			return response.json().then((errorResponse) => {
				formErrorMessageElement.textContent = errorResponse.error;
			});
		}

		// Due to the poor redirect implementation, the server simply returns the URL
		// in a JSON response body, which is then redirected to.
		return response.json().then((response) => {
			window.location.href = response.url;
		});
	}).catch((err) => {
		console.error(err);
		formErrorMessageElement.textContent = 'An unhandled exception has occurred';
	});
}


/**
 * Sends a request to create a new webring.
 */
function createWebring()
{
	const formElement = document.getElementById('create-webring-form');
	/** The form's error message text element. */
	const formErrorMessageElement = document.getElementById('create-webring-error-message');
	const formData = new FormData(formElement);

	// const descriptionTextbox = document.getElementById('description');
	// formData.append('description', descriptionTextbox.value);

	/** The form data converted to a native Javascript object. */
	const formFields = Object.fromEntries(formData.entries());

	// Set the `privateRing` field of the request body according to whether this checkbox
	// has been checked.
	const privateRingCheckbox = document.getElementById('private-ring');
	formFields.privateRing = privateRingCheckbox.checked;

	const tags = [];
	formFields.tags = [];

	fetch('/webring', {
		body: JSON.stringify(formFields),
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
	}).then((response) => {
		if (!response.ok) {
			return response.json().then((errorResponse) => {
				formErrorMessageElement.textContent = errorResponse.error;
			});
		}

		// Due to the poor redirect implementation, the server simply returns the URL
		// in a JSON response body, which is then redirected to.
		return response.json().then((response) => {
			window.location.href = response.url;
		});
	}).catch((err) => {
		console.error(err);
		formErrorMessageElement.textContent = 'An unhandled exception has occurred';
	});
}


/**
 * Sends a request to delete a webring.
 * @param {string} webringUrl The url of the webring to delete.
 */
function deleteWebring(webringUrl)
{
	/** The form's error message text element. */
	const formErrorMessageElement = document.getElementById('delete-webring-error-message');

	fetch('/webring/' + webringUrl, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
	}).then((response) => {
		if (!response.ok) {
			return response.json().then((errorResponse) => {
				formErrorMessageElement.textContent = errorResponse.error;
			});
		}

		window.location.href = '/user';
	}).catch((err) => {
		console.error(err);
		formErrorMessageElement.textContent = 'An unhandled exception has occurred';
	});
}


/**
 * Send a request to login.
 */
function login()
{
	/** The form's error message text element. */
	const formErrorMessageElement = document.getElementById('login-error-message');
	const formElement = document.getElementById('login-form');
	const formData = new FormData(formElement);

	fetch('/user/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		body: JSON.stringify(Object.fromEntries(formData.entries())),
	}).then((response) => {
		if (!response.ok) {
			return response.json().then((errorResponse) => {
				formErrorMessageElement.textContent = errorResponse.error;
			});
		}

		// Redirect to the user profile.
		window.location.replace('/user');
	}).catch((err) => {
		console.error(err);
		formErrorMessageElement.textContent = 'An unhandled exception has occurred';
	});
}


/**
 * Sends a request to register a new user.
 */
function register()
{
	/** The form's error message text element. */
	const formErrorMessageElement = document.getElementById('register-error-message');
	const formElement = document.getElementById('register-form');
	const formData = new FormData(formElement);

	/** The form data converted to a native Javascript object. */
	const formFields = Object.fromEntries(formData.entries());
	// Remove this dummy field.
	delete formFields['confirmpassword'];

	fetch('/user/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		body: JSON.stringify(formFields),
	}).then((response) => {
		if (!response.ok) {
			return response.json().then((errorResponse) => {
				formErrorMessageElement.textContent = errorResponse.error;
			});
		}

		// Redirect to the user profile.
		window.location.replace('/user');
	}).catch((err) => {
		console.error(err);
		formErrorMessageElement.textContent = 'An unhandled exception has occurred';
	});
}


/**
 * Sends a request to remove a site from a webring.
 * @param {string} webringUrl The URL of the webring this site belongs to.
 * @param {string} siteUrl The URL of the site to remove.
 */
function removeSite(webringUrl, siteUrl)
{
	/** The form's error message text element. */
	const formErrorMessageElement = document.getElementById('sites-error-message');

	fetch('/webring/' + webringUrl + '/remove', {
		body: JSON.stringify({
			url: siteUrl
		}),
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
	}).then((response) => {
		if (!response.ok) {
			return response.json().then((errorResponse) => {
				formErrorMessageElement.textContent = errorResponse.error;
			});
		}

		// Remove the list element associated with this site.
		const listElement = document.getElementById('site_' + siteUrl);
		listElement.remove();

		// Check whether any further sites exist in this webring.
		const siteListElement = document.getElementById('webring-detail-site-list');
		if (!siteListElement.childNodes.length) {
			// If no further sites exist, remove the webring list, and add text.
			siteListElement.remove();
			const newTextNode = document.createTextNode('This webring contains no sites.');
			document.getElementById('webring-detail-sites').appendChild(newTextNode)
		}
	}).catch((err) => {
		console.error(err);
		formErrorMessageElement.textContent = 'An unhandled exception has occurred';
	});
}


/**
 * Sends a request to update a webring.
 */
function updateWebring()
{
	const formElement = document.getElementById('update-webring-form');
	/** The form's error message text element. */
	const formErrorMessageElement = document.getElementById('update-webring-error-message');
	const formData = new FormData(formElement);

	const descriptionTextbox = document.getElementById('description');
	formData.append('description', descriptionTextbox.value);

	/** The form data converted to a native Javascript object. */
	const formFields = Object.fromEntries(formData.entries());

	// Retrieve this hidden field from the form, and then remove it from the formData.
	const { webringUrl } = formFields;
	delete formFields.webringUrl;

	// Set the `privateRing` field of the request body according to whether this checkbox
	// has been checked.
	const privateRingCheckbox = document.getElementById('private-ring');
	formFields.privateRing = privateRingCheckbox.checked;

	const tags = [];
	formFields.tags = [];

	fetch('/webring/' + webringUrl, {
		body: JSON.stringify(formFields),
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
	}).then((response) => {
		if (!response.ok) {
			return response.json().then((errorResponse) => {
				formErrorMessageElement.textContent = errorResponse.error;
			});
		}

		// Due to the poor redirect implementation, the server simply returns the URL
		// in a JSON response body, which is then redirected to.
		return response.json().then((response) => {
			window.location.href = response.url;
		});
	}).catch((err) => {
		console.error(err);
		formErrorMessageElement.textContent = 'An unhandled exception has occurred';
	});
}

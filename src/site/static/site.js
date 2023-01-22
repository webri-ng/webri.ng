/**
 * The message to display to the user in the case that an unhandled exception has occurred.
 */
const unhandledExceptionMessage = 'An unhandled exception has occurred';

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
		formErrorMessageElement.textContent = unhandledExceptionMessage;
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
		formErrorMessageElement.textContent = unhandledExceptionMessage;
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
		formErrorMessageElement.textContent = unhandledExceptionMessage;
	});
}

/**
 * Cancels the prompt to delete a webring.
 * @param {string} webringUrl The url of the webring the delete prompt is for.
 */
function cancelDelete(webringUrl)
{
	window.location.href = '/webring/' + webringUrl;
}


/**
 * Send a request to reset a user's password.
 */
 function forgotPassword()
 {
	 /** The form's error message text element. */
	 const formErrorMessageElement = document.getElementById('reset-password-error-message');
	 const formElement = document.getElementById('reset-password-form');
	 const formData = new FormData(formElement);

	 fetch('/user/reset-password', {
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
		 } else {
			// Display the confirmation message, and hide the form.
			const resetPasswordMessage = document.getElementById('reset-password-message');
			resetPasswordMessage.style.display = 'block';
			formElement.style.display = 'none';
		 }
	 }).catch((err) => {
		 console.error(err);
		 formErrorMessageElement.textContent = unhandledExceptionMessage;
	 });
 }


/**
 * Gets the example markup for a particular site.
 * This sets the 'Add this webring to your site' example markup to correspond to a
 * particular site index.
 */
function getExampleMarkup(webringName, webringUrl, index)
{
	const exampleCodeElement = document.getElementById('example-code');
	exampleCodeElement.value = `<table>
	<tr>
		<td colspan="3">This site is a member of ${webringName}.</td>
	</tr>
	<tr>
		<td><a href="https://webri.ng/webring/${webringUrl}/previous?index=${index}">Previous Site</a></td>
		<td><a href="https://webri.ng/webring/${webringUrl}/random">Random Site</a></td>
		<td><a href="https://webri.ng/webring/${webringUrl}/next?index=${index}">Next Site</a></td>
	</tr>
</table>`;
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
		formErrorMessageElement.textContent = unhandledExceptionMessage;
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

	if(formFields.confirmPassword != formFields.password) {
		formErrorMessageElement.textContent = "The passwords provided don't match";
		return;
	}

	// Remove this dummy field.
	delete formFields['confirmPassword'];

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
		formErrorMessageElement.textContent = unhandledExceptionMessage;
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
		formErrorMessageElement.textContent = unhandledExceptionMessage;
	});
}


/**
 * Sends a request to update the currently authenticated user.
 */
function updatePassword()
{
	/** The form's error message text element. */
	const formErrorMessageElement = document.getElementById('update-password-error-message');
	const formElement = document.getElementById('update-password-form');
	const formData = new FormData(formElement);

	/** The form data converted to a native Javascript object. */
	const formFields = Object.fromEntries(formData.entries());

	if(formFields.confirmPassword != formFields.newPassword) {
		formErrorMessageElement.textContent = "The passwords provided don't match";
		return;
	}

	// Remove this dummy field.
	delete formFields['confirmPassword'];

	fetch('/user/update-password', {
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
		formErrorMessageElement.textContent = unhandledExceptionMessage;
	});
}


/**
 * Sends a request to update the currently authenticated user.
 */
function updateUser()
{
	/** The form's error message text element. */
	const formErrorMessageElement = document.getElementById('update-user-error-message');
	const formElement = document.getElementById('update-user-form');
	const formData = new FormData(formElement);

	/** The form data converted to a native Javascript object. */
	const formFields = Object.fromEntries(formData.entries());

	fetch('/user', {
		method: 'PATCH',
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
		formErrorMessageElement.textContent = unhandledExceptionMessage;
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
		formErrorMessageElement.textContent = unhandledExceptionMessage;
	});
}

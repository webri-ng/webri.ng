/**
 * The message to display to the user in the case that an unhandled exception has occurred.
 */
const unhandledExceptionMessage = 'An unhandled exception has occurred';

/** Error message to display if required form fields have been left empty. */
const emptyFormFieldsErrorMessage = 'Form fields cannot be empty';

const standardRequestHeaders = {
	'Content-Type': 'application/json',
	Accept: 'application/json',
};

/**
 * Sends a request to add a new site to a webring.
 */
function addNewSite() {
	/** The form's error message text element. */
	const formErrorMessageElement = document.getElementById(
		'add-new-site-error-message',
	);
	const formElement = document.getElementById('add-new-site-form');
	const formData = new FormData(formElement);

	const { name, url, webringUrl } = Object.fromEntries(formData.entries());

	if (!name || !url) {
		formErrorMessageElement.textContent = emptyFormFieldsErrorMessage;
		return;
	}

	fetch('/webring/' + webringUrl + '/add', {
		body: JSON.stringify({
			name,
			url,
		}),
		headers: standardRequestHeaders,
		method: 'POST',
	})
		.then((response) => {
			if (!response.ok) {
				return response.json().then((errorResponse) => {
					formErrorMessageElement.textContent = errorResponse.error;
				});
			}

			// Due to the poor redirect implementation, the server simply returns the
			// URL in a JSON response body, which is then redirected to.
			return response.json().then((response) => {
				window.location.href = response.url;
			});
		})
		.catch((err) => {
			console.error(err);
			formErrorMessageElement.textContent = unhandledExceptionMessage;
		});
}

/**
 * Sends a request to create a new webring.
 */
function createWebring() {
	const formElement = document.getElementById('create-webring-form');
	/** The form's error message text element. */
	const formErrorMessageElement = document.getElementById(
		'create-webring-error-message',
	);
	const formData = new FormData(formElement);

	const { name, description, privateRing, url } = Object.fromEntries(
		formData.entries(),
	);

	if (!name || !url) {
		formErrorMessageElement.textContent = emptyFormFieldsErrorMessage;
		return;
	}

	fetch('/webring', {
		body: JSON.stringify({
			description,
			name,
			// This checkbox field will contain the value 'on' if checked, and will
			// be undefined if not.
			privateRing: privateRing === 'on',
			tags: [],
			url,
		}),
		headers: standardRequestHeaders,
		method: 'POST',
	})
		.then((response) => {
			if (!response.ok) {
				return response.json().then((errorResponse) => {
					formErrorMessageElement.textContent = errorResponse.error;
				});
			}

			// Due to the poor redirect implementation, the server simply returns the
			// URL in a JSON response body, which is then redirected to.
			return response.json().then((response) => {
				window.location.href = response.url;
			});
		})
		.catch((err) => {
			console.error(err);
			formErrorMessageElement.textContent = unhandledExceptionMessage;
		});
}

/**
 * Sends a request to delete a webring.
 * @param {string} webringUrl The url of the webring to delete.
 */
function deleteWebring(webringUrl) {
	/** The form's error message text element. */
	const formErrorMessageElement = document.getElementById(
		'delete-webring-error-message',
	);

	fetch('/webring/' + webringUrl, {
		headers: standardRequestHeaders,
		method: 'DELETE',
	})
		.then((response) => {
			if (!response.ok) {
				return response.json().then((errorResponse) => {
					formErrorMessageElement.textContent = errorResponse.error;
				});
			}

			window.location.href = '/user';
		})
		.catch((err) => {
			console.error(err);
			formErrorMessageElement.textContent = unhandledExceptionMessage;
		});
}

/**
 * Cancels the prompt to delete a webring.
 * @param {string} webringUrl The url of the webring the delete prompt is for.
 */
function cancelDelete(webringUrl) {
	window.location.href = '/webring/' + webringUrl;
}

/**
 * Send a request to reset a user's password.
 */
function forgotPassword() {
	/** The form's error message text element. */
	const formErrorMessageElement = document.getElementById(
		'reset-password-error-message',
	);
	const formElement = document.getElementById('reset-password-form');
	const formData = new FormData(formElement);

	const { email } = Object.fromEntries(formData.entries());

	if (!email) {
		formErrorMessageElement.textContent = emptyFormFieldsErrorMessage;
		return;
	}

	fetch('/user/reset-password', {
		body: JSON.stringify({
			email,
		}),
		headers: standardRequestHeaders,
		method: 'POST',
	})
		.then((response) => {
			if (!response.ok) {
				return response.json().then((errorResponse) => {
					formErrorMessageElement.textContent = errorResponse.error;
				});
			} else {
				// Display the confirmation message, and hide the form.
				const resetPasswordMessage = document.getElementById(
					'reset-password-message',
				);
				resetPasswordMessage.style.display = 'block';
				formElement.style.display = 'none';
			}
		})
		.catch((err) => {
			console.error(err);
			formErrorMessageElement.textContent = unhandledExceptionMessage;
		});
}

/**
 * Gets the example markup for a particular site.
 * This sets the 'Add this webring to your site' example markup to correspond to a
 * particular site index.
 */
function getExampleMarkup(webringName, webringUrl, referringSiteUrl) {
	// The URL is encoded so that URL components like query strings, and anchors
	// are correctly parsed by the back-end.
	const encodedReferringSiteUrl = encodeURIComponent(referringSiteUrl);

	const exampleCodeElement = document.getElementById('example-code');
	const linkStyling = 'flex: 1; margin: 0; padding: 0.1em; border: 2px inset';
	const baseWebringUrl = `https://webri.ng/webring/${webringUrl}`;

	exampleCodeElement.value = `<div style="width: fit-content; border: 2px outset; text-align:center">
	<p style="margin: 0; padding: 0.1em; border: 2px inset">This site is a member of ${webringName}.</p>
	<div style="display: flex">
		<a style="${linkStyling}" href="${baseWebringUrl}/previous?via=${encodedReferringSiteUrl}">Previous Site</a>
		<a style="${linkStyling}" href="${baseWebringUrl}/random?via=${encodedReferringSiteUrl}">Random Site</a>
		<a style="${linkStyling}" href="${baseWebringUrl}/next?via=${encodedReferringSiteUrl}">Next Site</a>
	</div>
</div>`;
}

/**
 * Send a request to login.
 */
function login() {
	/** The form's error message text element. */
	const formErrorMessageElement = document.getElementById(
		'login-error-message',
	);
	const formElement = document.getElementById('login-form');
	const formData = new FormData(formElement);

	const { email, password } = Object.fromEntries(formData.entries());

	if (!email || !password) {
		formErrorMessageElement.textContent = emptyFormFieldsErrorMessage;
		return;
	}

	fetch('/user/login', {
		body: JSON.stringify({
			email,
			password,
		}),
		headers: standardRequestHeaders,
		method: 'POST',
	})
		.then((response) => {
			if (!response.ok) {
				return response.json().then((errorResponse) => {
					formErrorMessageElement.textContent = errorResponse.error;
				});
			}

			// Redirect to the user profile.
			window.location.replace('/user');
		})
		.catch((err) => {
			console.error(err);
			formErrorMessageElement.textContent = unhandledExceptionMessage;
		});
}

/**
 * Sends a request to register a new user.
 */
function register() {
	/** The form's error message text element. */
	const formErrorMessageElement = document.getElementById(
		'register-error-message',
	);
	const formElement = document.getElementById('register-form');
	const formData = new FormData(formElement);

	const { username, email, password, confirmPassword } = Object.fromEntries(
		formData.entries(),
	);

	if (!username || !email || !password) {
		formErrorMessageElement.textContent = emptyFormFieldsErrorMessage;
		return;
	}

	if (confirmPassword != password) {
		formErrorMessageElement.textContent = "The passwords provided don't match";
		return;
	}

	fetch('/user/register', {
		body: JSON.stringify({
			email,
			password,
			username,
		}),
		headers: standardRequestHeaders,
		method: 'POST',
	})
		.then((response) => {
			if (!response.ok) {
				return response.json().then((errorResponse) => {
					formErrorMessageElement.textContent = errorResponse.error;
				});
			}

			// Redirect to the user profile.
			window.location.replace('/user');
		})
		.catch((err) => {
			console.error(err);
			formErrorMessageElement.textContent = unhandledExceptionMessage;
		});
}

/**
 * Sends a request to remove a site from a webring.
 * @param {string} webringUrl The URL of the webring this site belongs to.
 * @param {string} siteUrl The URL of the site to remove.
 */
function removeSite(webringUrl, siteUrl) {
	/** The form's error message text element. */
	const formErrorMessageElement = document.getElementById(
		'sites-error-message',
	);

	fetch('/webring/' + webringUrl + '/remove', {
		body: JSON.stringify({
			url: siteUrl,
		}),
		headers: standardRequestHeaders,
		method: 'POST',
	})
		.then((response) => {
			if (!response.ok) {
				return response.json().then((errorResponse) => {
					formErrorMessageElement.textContent = errorResponse.error;
				});
			}

			// Remove the list element associated with this site.
			const listElement = document.getElementById('site_' + siteUrl);
			listElement.remove();

			// Check whether any further sites exist in this webring.
			const siteListElement = document.getElementById(
				'webring-detail-site-list',
			);
			if (!siteListElement.childNodes.length) {
				// If no further sites exist, remove the webring list, and add text.
				siteListElement.remove();
				const newTextNode = document.createTextNode(
					'This webring contains no sites.',
				);
				document
					.getElementById('webring-detail-sites')
					.appendChild(newTextNode);
			}
		})
		.catch((err) => {
			console.error(err);
			formErrorMessageElement.textContent = unhandledExceptionMessage;
		});
}

/**
 * Sends a request to update the currently authenticated user.
 */
function updatePassword() {
	/** The form's error message text element. */
	const formErrorMessageElement = document.getElementById(
		'update-password-error-message',
	);
	const formElement = document.getElementById('update-password-form');
	const formData = new FormData(formElement);

	const { currentPassword, newPassword, confirmPassword } = Object.fromEntries(
		formData.entries(),
	);

	if (!currentPassword || !newPassword) {
		formErrorMessageElement.textContent = emptyFormFieldsErrorMessage;
		return;
	}

	if (confirmPassword != newPassword) {
		formErrorMessageElement.textContent = "The passwords provided don't match";
		return;
	}

	fetch('/user/update-password', {
		body: JSON.stringify({
			currentPassword,
			newPassword,
		}),
		headers: standardRequestHeaders,
		method: 'POST',
	})
		.then((response) => {
			if (!response.ok) {
				return response.json().then((errorResponse) => {
					formErrorMessageElement.textContent = errorResponse.error;
				});
			}

			// Redirect to the user profile.
			window.location.replace('/user');
		})
		.catch((err) => {
			console.error(err);
			formErrorMessageElement.textContent = unhandledExceptionMessage;
		});
}

/**
 * Sends a request to update the currently authenticated user.
 */
function updateUser() {
	/** The form's error message text element. */
	const formErrorMessageElement = document.getElementById(
		'update-user-error-message',
	);
	const formElement = document.getElementById('update-user-form');
	const formData = new FormData(formElement);

	const { username, email } = Object.fromEntries(formData.entries());

	if (!username || !email) {
		formErrorMessageElement.textContent = emptyFormFieldsErrorMessage;
		return;
	}

	fetch('/user', {
		body: JSON.stringify({
			email,
			username,
		}),
		headers: standardRequestHeaders,
		method: 'PATCH',
	})
		.then((response) => {
			if (!response.ok) {
				return response.json().then((errorResponse) => {
					formErrorMessageElement.textContent = errorResponse.error;
				});
			}

			// Redirect to the user profile.
			window.location.replace('/user');
		})
		.catch((err) => {
			console.error(err);
			formErrorMessageElement.textContent = unhandledExceptionMessage;
		});
}

/**
 * Sends a request to update a webring.
 */
function updateWebring() {
	const formElement = document.getElementById('update-webring-form');
	/** The form's error message text element. */
	const formErrorMessageElement = document.getElementById(
		'update-webring-error-message',
	);
	const formData = new FormData(formElement);

	const { name, description, privateRing, url, webringUrl } =
		Object.fromEntries(formData.entries());

	if (!name || !url) {
		formErrorMessageElement.textContent = emptyFormFieldsErrorMessage;
		return;
	}

	fetch('/webring/' + webringUrl, {
		body: JSON.stringify({
			description,
			name,
			privateRing: privateRing === 'on',
			tags: [],
			url,
		}),
		headers: standardRequestHeaders,
		method: 'PATCH',
	})
		.then((response) => {
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
		})
		.catch((err) => {
			console.error(err);
			formErrorMessageElement.textContent = unhandledExceptionMessage;
		});
}

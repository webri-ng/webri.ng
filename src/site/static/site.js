function login()
{
	const form = document.getElementById('login-form');
	const formErrorMessage = document.getElementById('login-error-message');
	const formData = new FormData(form);

	fetch("/user/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify(Object.fromEntries(formData.entries())),
	}).then((response) => {
		if (!response.ok) {
			return response.json().then((errorResponse) => {
				formErrorMessage.textContent = errorResponse.error;
			});
		}

		// Redirect to the user profile.
		window.location.replace("/user");
	}).catch((err) => {
		console.error(err);
		formErrorMessage.textContent = "An unhandled exception has occurred";
	});
}


function register()
{
	const form = document.getElementById('register-form');
	const formErrorMessage = document.getElementById('register-error-message');
	const formData = new FormData(form);

	fetch("/user/register", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify(Object.fromEntries(formData.entries())),
	}).then((response) => {
		if (!response.ok) {
			return response.json().then((errorResponse) => {
				formErrorMessage.textContent = errorResponse.error;
			});
		}

		// Redirect to the user profile.
		window.location.replace("/user");
	}).catch((err) => {
		console.error(err);
		formErrorMessage.textContent = "An unhandled exception has occurred";
	});
}


function createWebring()
{
	const form = document.getElementById('create-webring-form');
	const formErrorMessage = document.getElementById('create-webring-error-message');
	const formData = new FormData(form);

	const body = Object.fromEntries(formData.entries());
	// Set the `privateRing` field of the request body according to whether this checkbox
	// has been checked.
	const privateRingCheckbox = document.getElementById('private-ring');
	body.privateRing = privateRingCheckbox.value === "on";

	const tags = [];
	body.tags = [];

	fetch("/webring", {
		body: JSON.stringify(body),
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
	}).then((response) => {
		if (!response.ok) {
			return response.json().then((errorResponse) => {
				formErrorMessage.textContent = errorResponse.error;
			});
		}

		// Due to the poor redirect implementation, the server simply returns the URL
		// in a JSON response body, which is then redirected to.
		return response.json().then((response) => {
			window.location.href = response.url;
		});
	}).catch((err) => {
		console.error(err);
		formErrorMessage.textContent = "An unhandled exception has occurred";
	});
}

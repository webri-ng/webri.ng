function sendTestRequest() {
	const base_url = "https://sgupciqitc.execute-api.ap-southeast-2.amazonaws.com/"
	const url = `${base_url}/user/register`

	data = {
		username: "test123",
		email: "again123@test.com",
		password: "fff31123"
	}


	fetch(url, {
    method: 'POST',
		mode: 'no-cors', // no-cors, *cors, same-origin
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
	}).then((response) => {
		console.log(response);
	}).catch(err => {
		console.error(err);
	});
}

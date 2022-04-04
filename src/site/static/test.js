/**
 * Creates a random string of a specified length.
 * @param {CreateRandomStringOptions} [options] - Additional options for the process.
 * @returns The created random string.
 */
 function createRandomString()
 {
	 /**
		* The ASCII 'Source Characters' array.
		* These characters are used to construct the randomised string. The method is
		* implemented in this manner since the numbers and letters are not adjacent in the
		* ASCII table.
		*/
	 const sourceCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' +
		 '0123456789_';

	 return Array(12).fill(0).map(() => {
		 return sourceCharacters[Math.floor(Math.random() * sourceCharacters.length)];
	 }).join('');
 }


function insertRandomWebrings()
{
	let testDescription = 'Nihil repudiandae eum et velit ipsum adipisci harum. ' +
		'Consequatur a et quam. Blanditiis iusto consequatur id quia dolorum. ' +
		'Repellat autem quae nisi earum explicabo corporis dignissimos magnam';

	for(let i = 0; i < 80; i++) {
		fetch('/webring', {
			body: JSON.stringify({
				name: `Test Webring ${createRandomString()}`,
				url: createRandomString(),
				description: testDescription,
				privateRing: false,
				tags: []
			}),
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
		}).then((response) => {
			if (!response.ok) {
				return response.json().then((errorResponse) => {
					console.error(errorResponse)
				});
			}

			console.log('OK');
		}).catch((err) => {
			console.error(err);
		});
	}
}

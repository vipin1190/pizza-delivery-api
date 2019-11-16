# API Overview
The API is about a Pizza Delilvery Service company, for managing it's business with following features,

* New users can be created, their information can be edited, and they can be deleted. API Stores their name, email address, and street address.
* Users can log in and log out by creating or destroying a token.
* When a user is logged in, they should be able to GET all the possible menu items (these items are hardcoded into the system).
* A logged-in user will be able to fill a shopping cart with menu items.
* A logged-in user will be able to create an order by passing a valid [Stripe token](https://stripe.com/docs/testing#cards) for order payment.
* When an order is placed, User will get an email containing the order receipt.

The API is developed under NodeJS v8.x LTS application environment.

> **Note:** This api having some set of configuration settings also includes third party api configurations.<br />
Please configure API before running for basic configuration, [mailgun api](https://www.mailgun.com/) and [Stripe API](https://stripe.com).<br />


# Resource components

* ping
* users
* tokens
* menu
* items
* cart
* orders

<!--HTTP Requests: PING-->
# Ping
Send ping request to check if API is alive or not!

*  **URL**
	/ping
* **Headers**
	`Content-Type: application/json`
*  **Method**
	`GET`
*  **URL Params**
	None
*  **Data Params**
	None

*  **Success Response**
	**Code:** 200 OK<br  />**Content:**  `{}`

<!--HTTP Requests: USERS-->
# Create User

Creates new user profile.

*  **URL**
	/users
* **Headers**
	`Content-Type: application/json`
*  **Method**
	`POST`
*  **URL Params**
	None
*  **Data Params**
	```
		firstName=[string]
		lastName=[string]
		email=[string]
		password=[string]
		phone=[string]
		address=[string]
	```

*  **Success Response**
	**Code:** 200 OK<br  />**Content:**  `{ 'Success': 'User created.' }`
*  **Error Response**
	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Missing required field.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'User profile may already exists.' }`

	OR

	**Code:** 500 Internal Server Error<br  />**Content:**  `{ 'Error': 'Could not create user profile.' }`

# Get User

Returns JSON data about a logged-in user.

*  **URL**
	/users
* **Headers**
	`key: [UNIQUE API KEY]`
*  **Method**
	`GET`
*  **URL Params**
	None
*  **Data Params**
	None
*  **Success Response**
	**Code:** 200 OK<br  />**Content:**
	```
	{
    "firstName": "Charles M.",
    "lastName": "Sanchez",
    "phone": "8704500612",
    "email": "charlesmsanchez@rhyta.com",
    "address": "2421 Rosebud Avenue, Little Rock, AR 72212",
    "key": "DXtNfWJHkK8opMYdEV7g"
	}
	```

*  **Error Response**
	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Missing required field.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Invalid key.' }`

> **Note:** Header params **key** is Required. If not generated yet! Generate an API key token first.


# Update User

Update user details i.e. First Name, Last Name, Address, Password.

*  **URL**
	/users
* **Headers**
	`Content-Type: application/json`
	`key: [UNIQUE API KEY]`
*  **Method**
	`PUT`
*  **URL Params**
	None
*  **Data Params**
		**Optional fields**
    ```
      firstName=[string]
      lastName=[string]
      address=[string]
      password=[string]
    ```

*  **Success Response**
	**Code:** 200 OK<br  />**Content:**  `{}`

*  **Error Response**
	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Invalid input(s) to update.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Invalid key.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Missing required field.' }`

	OR

	**Code:** 500 Internal Server Error<br  />**Content:**  `{ 'Error': 'User update failed.' }`

> **Note:** Header params **key** is Required. If not generated yet! Generate an API key token first.


# Delete User

Delete a user.

*  **URL**
	/users
* **Headers**
	`Content-Type: application/json`
	`key: [UNIQUE API KEY]`
*  **Method**
	`DELETE`
*  **URL Params**
	None
*  **Data Params**
		**Required fields**
		`password=[string]`

*  **Success Response**
	**Code:** 200 OK<br  />**Content:**  `{}`

*  **Error Response**
	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Invalid key.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Missing required field.' }`

	OR

	**Code:** 500 Internal Server Error<br  />**Content:**  `{ 'Error': 'Failed to delete user.' }`

> **Note:** Header params **key** is Required. If not generated yet! Generate an API key token first.

<!--HTTP Requests: TOKEN-->
# Create Token

Returns a JSON response with new user login API token key, valid for 1 hour.

*  **URL**
	/tokens
* **Headers**
	`Content-Type: application/json`
*  **Method**
	`POST`
*  **URL Params**
	None
*  **Data Params**
	```
		password=[string]
		phone=[string]
	```

*  **Success Response**
	**Code:** 200 OK<br  />**Content:**
	```
	{
    "phone": "8704500612",
    "expires": 1571294231968,
    "key": "DXtNfWJHkK8opMYdEV7g"
	}
	```
*  **Error Response**
	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Missing required field.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'User does not exist.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Invalid password.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Already having an active token.' }`

	OR

	**Code:** 500 Internal Server Error<br  />**Content:**  `{ 'Error': 'Failed to create new token.' }`

	OR

	**Code:** 500 Internal Server Error<br  />**Content:**  `{ 'Error': 'Failed to update user.' }`


# Get Token

Returns JSON data about a valid API token key.

*  **URL**
	/tokens
* **Headers**
	`Content-Type: application/json`
*  **Method**
	`GET`
*  **URL Params**
	None
*  **Data Params**
	**Required field**
	`key=[string]`
*  **Success Response**
	**Code:** 200 OK<br  />**Content:**
	```
	{
    "phone": "8704500612",
    "expires": 1571294231968,
    "key": "DXtNfWJHkK8opMYdEV7g"
	}
	```

*  **Error Response**
	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Missing required field.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Invalid key.' }`


# Update Token

Update API token key expiry time by extending to one more hour.

*  **URL**
	/tokens
* **Headers**
	`Content-Type: application/json`
*  **Method**
	`PUT`
*  **URL Params**
	None
*  **Data Params**
	**Required field**
	`key=[string]`
*  **Success Response**
	**Code:** 200 OK<br  />**Content:**  `{}`

*  **Error Response**
	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Missing required field.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Either key is invalid or already expired.' }`

	OR

	**Code:** 500 Internal Server Error<br  />**Content:**  `{ 'Error': 'Failed to update key.' }`


# Delete Token

Logout user by deleting the token.

*  **URL**
	/tokens
* **Headers**
	`Content-Type: application/json`
*  **Method**
	`DELETE`
*  **URL Params**
	None
*  **Data Params**
	**Required fields**
	`key=[string]`

*  **Success Response**
	**Code:** 200 OK<br  />**Content:**  `{}`

*  **Error Response**
	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Invalid key.' }`

	OR

	**Code:** 404 Not Found<br  />**Content:**  `{ 'Error': 'Failed to find user profile for update.' }`

	OR

	**Code:** 500 Internal Server Error<br  />**Content:**  `{ 'Error': 'Failed to update user.' }`


<!--HTTP Requests: MENU-->
# Get Menu Categories

Returns a JSON response with list of item categories.

*  **URL**
	/menu
* **Headers**
	`Content-Type: application/json`
*  **Method**
	`GET`
*  **URL Params**
	None
*  **Data Params**
	None

*  **Success Response**
	**Code:** 200 OK<br  />**Content:**
	```
	{
		"category": [
      "_pizzas",
      "_drinks",
      "_desserts"
    ]
	}
	```
*  **Error Response**
	**Code:** 405  Method Not Allowed<br  />**Content:**  `{}`

	> **Note:** The category response is a hardcoded object.

<!--HTTP Requests: ITEMS-->
# Get Item List
Returns JSON response of item list on provided menu category.

*  **URL**
	/items
* **Headers**
	`Content-Type: application/json`
	`key: [UNIQUE API KEY]`
*  **Method**
	`GET`
*  **URL Params**
	None
*  **Data Params**
	`category=[string]`

*  **Success Response**
	**Code:** 200 OK<br  />**Content:**
	```
	{
    "VE01": {
      "type": "veg",
      "name": "Veg Exotica",
      "description": "Baby Corn, Black Olives, Green Capsicum, Jalapeno, Red Capsicum",
      "size": "Medium",
      "serves": "2",
      "curst": "Pan",
      "price": "569"
    },
    "VE02": {
      "type": "veg",
      "name": "Veg Exotica",
      "description": "Baby Corn, Black Olives, Green Capsicum, Jalapeno, Red Capsicum",
      "size": "Medium",
      "serves": "2",
      "curst": "Stuffed Crust-Cheese Max",
      "price": "665"
    }
	}
	```

*  **Error Response**
	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Invalid item category.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Invalid key.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Missing required field.' }`

<!--HTTP Requests: CART-->
# Add Shopping Cart

Add a new shopping cart to logged-in user, If not already having a cart!

*  **URL**
	/cart
* **Headers**
	`Content-Type: application/json`
	`key: [UNIQUE API KEY]`
*  **Method**
	`POST`
*  **URL Params**
	None
*  **Data Params**
	None

*  **Success Response**
	**Code:** 200 OK<br  />**Content:**  `{ "cartId": "45QvMV1iSzIzShH7ZrMN", "cartItems": [] }`

*  **Error Response**
	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Missing required field.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Invalid key.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'User already having an active cart.' }`

	OR

	**Code:** 500 Internal Server Error<br  />**Content:**  `{ 'Error': 'Failed to attach cart with user.' }`

	OR

	**Code:** 500 Internal Server Error<br  />**Content:**  `{ 'Error': 'Failed to create cart.' }`

> **Note:** Header params **key** is Required. If not generated yet! Generate an API key token first.


# Get Shopping Cart

Returns JSON data about a valid shopping cart for the logged-in user.

*  **URL**
	/cart
* **Headers**
	`Content-Type: application/json`
	`key: [UNIQUE API KEY]`
*  **Method**
	`GET`
*  **URL Params**
	None
*  **Data Params**
	None
*  **Success Response**
	**Code:** 200 OK<br  />**Content:**  `{ "cartId": "45QvMV1iSzIzShH7ZrMN", "cartItems": [] }`

*  **Error Response**
	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Cart not found.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Invalid key.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Missing required fields.' }`

> **Note:** Header params **key** is Required. If not generated yet! Generate an API key token first.


# Update Shopping Cart

Update shopping cart, by adding or removing item.

*  **URL**
	/cart
* **Headers**
	`Content-Type: application/json`
	`key: [UNIQUE API KEY]`
*  **Method**
	`PUT`
*  **URL Params**
	None
*  **Data Params**
		**Required fields**
	```
		itemAction=[string]
		itemCategory=[string]
		itemId=[string]
		quantity=[number]
	```

*  **Success Response**
	**Code:** 200 OK<br  />**Content:**  `{}`

*  **Error Response**
	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Missing required fields.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Invalid key.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Item not exists in provided category.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Invalid item or action to process with cart.' }`

	OR

	**Code:** 500 Internal Server Error<br  />**Content:**  `{ 'Error': 'Invalid cartId.' }`

	OR

	**Code:** 500 Internal Server Error<br  />**Content:**  `{ 'Error': 'Failed to update cart.' }`

> **Note:** Header params **key** is Required. If not generated yet! Generate an API key token first.


# Delete Shopping Cart

Delete the shopping cart for logged-in user, if exist!

*  **URL**
	/cart
* **Headers**
	`Content-Type: application/json`
	`key: [UNIQUE API KEY]`
*  **Method**
	`DELETE`
*  **URL Params**
	None
*  **Data Params**
	None

*  **Success Response**
	**Code:** 200 OK<br  />**Content:**  `{}`

*  **Error Response**
	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Missing required fields.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Invalid key.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'No active cart found.' }`

	OR

	**Code:** 500 Internal Server Error<br  />**Content:**  `{ 'Error': 'Failed to remove cart from user profile.' }`

> **Note:** Header params **key** is Required. If not generated yet! Generate an API key token first.

<!--HTTP Requests: ORDER-->
# Create Order

Place order once shopping cart is ready with items.

*  **URL**
	/orders
* **Headers**
	`Content-Type: application/json`
	`key: [UNIQUE API KEY]`
*  **Method**
	`POST`
*  **URL Params**
	None
*  **Data Params**
	**Required params**
	`tokenId=[string]: A valid stripe token key for creating a charge.`

*  **Success Response**
	**Code:** 200 OK<br  />**Content:**  `{}`

*  **Error Response**
	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Missing required field.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Invalid key.' }`

	OR

	**Code:** 404 No Found<br  />**Content:**  `{ 'Error': 'Shopping cart not found.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Failed to process item list.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'No items found to order.' }`

	OR

	**Code:** 402 Payment Required<br  />**Content:**  `{ 'Error': 'Invalid payment tokenId.' }`

	OR

	**Code:** 500 Internal Server Error<br  />**Content:**  `{ 'Error': 'Failed to generate invoice.' }`

	OR

	**Code:** 500 Internal Server Error<br  />**Content:**  `{ 'Error': 'Failed to create order.' }`

	OR

	**Code:** 500 Internal Server Error<br  />**Content:**  `{ 'Error': 'Failed to get invoice receipt' }`

	OR

	**Code:** 500 Internal Server Error<br  />**Content:**  `{ 'Error': 'Failed to send order receipt.' }`

	OR

	**Code:** 500 Internal Server Error<br  />**Content:**  `{ 'Error': 'Failed to update order details with user.' }`

> **Note:** Header params **key** is Required. If not generated yet! Generate an API key token first.


# Get Order Details

Returns JSON data about a valid order id for logged-in user.

*  **URL**
	/orders
* **Headers**
	`Content-Type: application/json`
	`key: [UNIQUE API KEY]`
*  **Method**
	`GET`
*  **URL Params**
	None
*  **Data Params**
	`orderId=[string]`

*  **Success Response**
	**Code:** 200 OK<br  />**Content:**
	```
	{
		"orderId": "PDAOID1570912717790",
		"cartId": "0Ovq8sTLUqetkcreow9L",
		"order": {
			"time": 1570912717790,
			"particulars": [{
				"itemCategory": "_pizzas",
				"itemId": "VE03",
				"particular": "Veg Exotica",
				"qty": 3,
				"rate": "329",
				"value": 987
			},
			{
				"itemCategory": "_pizzas",
				"itemId": "VE01",
				"particular": "Veg Exotica",
				"qty": 2,
				"rate": "569",
				"value": 1138
			}],
			"total": 2125,
			"deliveryTo": "2421 Rosebud Avenue, Little Rock, AR 72212"
		},
		"user": {
			"firstName": "Charles M.",
			"userEmail": "charlesmsanchez@rhyta.com"
		},
		"payment": {
			"status": 1,
			"sourceId": "tok_1FSrMIG8nlpukxjySkUAGo0e",
			"chargeId": "ch_1FSrMIG8nlpukxjyuowsGyZk",
			"created": 1570912718
		}
	}
	```

*  **Error Response**
	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Missing required field.	' }`

	OR

	**Code:** 404 Bad Request<br  />**Content:**  `{ 'Error': 'Invalid order.' }`

	OR

	**Code:** 400 Bad Request<br  />**Content:**  `{ 'Error': 'Invalid key.' }`

	OR

	**Code:** 500 Internal Server Error<br  />**Content:**  `{ 'Error': 'Failed to get order details.' }`

> **Note:** Header params **key** is Required. If not generated yet! Generate an API key token first.
# Get Authenticated User's Profile

Returns the KingsChat profile of the user associated with the provided access token. Use this endpoint to retrieve the user's identity after a successful login.

**Endpoint:**  
`GET /developer/api/user/profile`

---

## Prerequisites
Before calling this endpoint you must complete the OAuth2 login flow and obtain an `access_token`. If you haven't done this yet, see the Auth Flow Tutorial.

Two conditions must both be true for this endpoint to succeed: 
1. Your project must have profile access enabled.
2. The user must have explicitly authorized your project during the OAuth2 flow. 

If either condition is not met, the request will be rejected with a `403`.

---

## Making the Request
The request requires two headers: your project's API key and the user's access token as a Bearer token:

**curl:**
```bash
curl -X GET https://connect.kingsch.at/developer/api/user/profile \
  -H 'api-key: YOUR_API_KEY' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

---

## Response
A successful request returns `200 OK` with a JSON body containing a `profile` object:

**200 OK:**
```json
{
  "profile": {
    "id":                           "user_abc123",
    "name":                         "Jane Doe",
    "username":                     "janedoe",
    "email":                        "jane@example.com",
    "phone_number":                 "+1234567890",
    "gender":                       "female",
    "birth_date_millis":            631152000000,
    "account_creation_date_millis": 1700000000000,
    "avatar":                       "https://cdn.example.com/avatar.jpg",
    "is_email_verified":            true
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier for the KingsChat user |
| `name` | `string` | The user's display name |
| `username` | `string` | The user's unique KingsChat username (without the @ prefix) |
| `email` | `string` \| `null` | The user's verified email address, or null if not set |
| `phone_number` | `string` \| `null` | The user's phone number in E.164 format, or null if not set |
| `gender` | `string` \| `null` | The user's gender as entered on their profile, or null if not set |
| `birth_date_millis` | `integer` \| `null` | The user's date of birth as a Unix timestamp in milliseconds, or null if not set |
| `account_creation_date_millis` | `integer` | Timestamp when the KingsChat account was created, in milliseconds since Unix epoch |
| `avatar` | `string` \| `null` | URL of the user's profile picture, or null if no avatar is set |
| `is_email_verified` | `boolean` | `true` if the user has a verified email address on file |

---

## Errors

| Status | Cause | What to do |
|--------|-------|------------|
| `401` | `invalid_api_key` — missing or invalid api-key header | Ensure the `api-key` header is present and matches your project's API key from the developer portal |
| `401` | Missing or malformed Authorization header | Ensure the header is present and uses the `Bearer <token>` format |
| `401` | Access token has expired | Refresh the token using `grant_type=refresh_token` and retry |
| `403` | `project_cannot_access_profile` — profile access is not enabled for this project | Enable profile access for your project in the developer portal and redeploy |
| `403` | `user_not_authorized` — the user has not authorized your project | The user must complete the OAuth2 authorization flow before this endpoint can return their profile |
| `404` | `user_not_found` — no KingsChat account exists for the token's subject | The access token may belong to a deleted account; prompt the user to re-authenticate |

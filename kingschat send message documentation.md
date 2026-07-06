# Send a Message

Sends a direct message to a KingsChat user. Two scopes are available depending on who the sender should be.

**Endpoint:**  
`POST /developer/api/messages`

---

## Scopes & Prerequisites
This endpoint authenticates your project via an API key — no user access token is required in the request itself. The behaviour depends on which scope your project has been approved for:

- **Messages on behalf of project (`messages_on_behalf_of_project`)** — your project sends a message to a user. The sender is the KingsChat account you used to log in to the developer portal when the project was created (the project owner). Only the recipient must have authorized your project. **Omit `sender_id` from the request body.**
- **Messages on behalf of users (`messages_on_behalf_of_users`)** — one user sends a message to another user via your project. Both the sender and the recipient must have authorized your project. **Provide `sender_id` in the request body.**

> [!WARNING]
> If a required user has not authorized your project, the request will be rejected with a `403`. They must complete the OAuth2 authorization flow first.

---

## Making the Request
Pass your project's API key in the `api-key` header and the message payload as JSON.

### 1. Messages on behalf of project
**Use case:** Reminders, confirmation of redemptions, system notifications.
Omit `sender_id`.

**curl:**
```bash
curl -X POST https://connect.kingsch.at/developer/api/messages \
  -H 'api-key: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "recipient_id": "RECIPIENT_USER_ID",
    "message": {
      "body": {
        "text": {
          "body": "Hello from my app!"
        }
      }
    }
  }'
```

### 2. Messages on behalf of users
Include `sender_id`.

**curl:**
```bash
curl -X POST https://connect.kingsch.at/developer/api/messages \
  -H 'api-key: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "sender_id": "SENDER_USER_ID",
    "recipient_id": "RECIPIENT_USER_ID",
    "message": {
      "body": {
        "text": {
          "body": "Hello from a user!"
        }
      }
    }
  }'
```

---

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recipient_id` | `string` | Yes | KingsChat user ID of the message recipient. Obtain this from the `profile.id` field returned by the Get User Profile endpoint after the user has authorized your project. |
| `sender_id` | `string` | Required for `messages_on_behalf_of_users` | KingsChat user ID of the sender. Obtain this from the `profile.id` field returned by the Get User Profile endpoint. The sender must have authorized your project. Omit when using `messages_on_behalf_of_project`. |
| `message.body.text.body` | `string` | Yes | Text content of the message. Must be non-empty. |

---

## Response
A successful request returns `200 OK` with the following body:

**200 OK:**
```json
{
  "status": "ok"
}
```

---

## Errors

| Status | Cause | What to do |
|--------|-------|------------|
| `401` | Missing or invalid `api-key` header | Ensure the `api-key` header is present and matches your project's API key from the developer portal |
| `403` | `project_cannot_send_messages` — the required messages scope is not enabled or the project is not yet approved | Enable the appropriate messages scope (`messages_on_behalf_of_project` or `messages_on_behalf_of_users`) for your project and ensure it has been approved |
| `403` | `sender_not_authorized` — the sender has not authorized your project (`messages_on_behalf_of_users` only) | The sender must complete the OAuth2 authorization flow for your project |
| `403` | `recipient_not_authorized` — the recipient has not authorized your project | The recipient must complete the OAuth2 authorization flow for your project |
| `404` | `sender_not_found` — no KingsChat account exists for the given `sender_id` (`messages_on_behalf_of_users` only) | Verify the sender's user ID is correct |
| `404` | `recipient_not_found` — no KingsChat account exists for the given `recipient_id` | Verify the recipient's user ID is correct |
| `422` | `recipient_id_required` — `recipient_id` is missing from the request body | Add `recipient_id` to the JSON body |
| `422` | `message_required` — `message.body.text.body` is missing or empty | Add a non-empty string to `message.body.text.body` |

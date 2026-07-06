# Add KingsChat Login to Your App

This tutorial walks you through integrating KingsChat's OAuth2 authorization code flow into your web application. By the end, your users will be able to log in with their KingsChat account and your server will hold a valid access token for API calls on their behalf.

## Before you begin
- A registered KingsChat developer account
- A web application with a publicly reachable HTTPS endpoint
- `curl` installed (for the token exchange examples)

---

## 1. Create a Project & Application
Start by creating a project in the developer portal. A project is a container for one or more applications. Once your project is set up, add a Web application and register your callback endpoint.

1. Navigate to **Projects → New Project** and enter your project name.
2. Open the new project and click **Add Application**.
3. Select the **Web** platform type.
4. Enter your `redirect_url` — the HTTPS endpoint on your server where KingsChat will POST the authorization code after a successful login.

### About `redirect_url`
The `redirect_url` is the server-side endpoint that receives the authorization code once a user approves your application. KingsChat will send a POST request to this URL with a JSON body — see Step 5 for the exact payload.

KingsChat uses the registered URL as a whitelist: only the exact URL you enter here will ever receive a callback. This prevents authorization codes from being sent to attacker-controlled servers. Because of this, the value must match character-for-character — trailing slashes, query strings, and path casing all matter.

> [!IMPORTANT]
> The endpoint must be a publicly reachable HTTPS URL. Localhost is only accepted for local development — you will need a real domain (or a tunnel such as ngrok) before submitting for review.

---

## 2. Submit for Review
All applications must be reviewed and approved by the KingsChat team before they can be used in production. Two fields on your project page strongly influence the review outcome:

- **Description** — clearly explain what your application does and why it needs KingsChat login. Be specific about the use case.
- **Contact person** — provide an email address or KingsChat username that reviewers can reach if they have questions.

Your `client_id` will not be visible until approval. Applications with vague descriptions or no contact details are commonly rejected or delayed.

---

## 3. Get Your Client ID
Once approved, return to the project page. Your application card will now display a `client_id` — click it to copy it to the clipboard.

> [!CAUTION]
> The `client_id` uniquely identifies your application in every OAuth2 request. Store it as a server-side environment variable — never expose it in client-side code.

---

## 4. Initiate Login
When a user clicks your login button, redirect them to the KingsChat login page with your `client_id` as a query parameter:

**URL:**
```text
https://accounts.kingschat.online/log-in?clientId=YOUR_CLIENT_ID
```

### Optional: pass `origin` to survive the redirect
Because the login flow takes the user off your site and back, any in-memory state is lost. The `origin` parameter lets you attach an arbitrary string before the user leaves — KingsChat echoes it back unchanged in the callback payload so your server can resume where it left off.

**Common uses:**
- **Post-login redirect** — pass the path the user was on (e.g. `/dashboard/reports`) so you can send them back there after a successful token exchange.
- **Deep-link recovery** — pass a resource ID or encoded route so your app can re-open the correct page after login.
- **CSRF protection** — pass an unguessable random token (e.g. a UUID generated per login attempt) and verify it matches when the callback arrives, ensuring the callback was triggered by a flow your server started.

**URL with origin:**
```text
https://accounts.kingschat.online/log-in?clientId=YOUR_CLIENT_ID&origin=YOUR_STATE
```

> [!WARNING]
> `origin` is echoed back verbatim — treat it as untrusted input on arrival. If you use it as a redirect target, validate that it points to a path within your own application before redirecting. Never redirect to an arbitrary URL taken from origin without verification, as this opens an open-redirect vulnerability.

Pass `forceLogin=true` to require the user to re-enter their credentials even if they already have an active KingsChat session. Use this when your application requires a fresh authentication confirmation — for example, before a sensitive action.

**URL with forceLogin:**
```text
https://accounts.kingschat.online/log-in?clientId=YOUR_CLIENT_ID&forceLogin=true
```

---

## 5. Handle the Callback
After a successful login, KingsChat sends a POST request to your `redirect_url` with a JSON body containing the authorization code:

**Incoming POST payload:**
```json
{
  "code":   "AUTHORIZATION_CODE",
  "origin": "YOUR_STATE"
}
```

`origin` is present only if you passed it in step 4; omit any logic that depends on it if your flow does not use it. Read the `code` field and proceed immediately to exchange it for tokens — do not perform any redirects or heavy work before the exchange, as the code expires after 1 hour.

> [!IMPORTANT]
> Authorization codes expire after 1 hour. Exchange it for tokens immediately after receiving it; do not store codes for later use.

---

## 6. Exchange the Code for Tokens
From your server, make a POST request to the token endpoint with `grant_type=code`:

**curl:**
```bash
curl -X POST https://connect.kingsch.at/developer/api/oauth2/token \
  -H 'Content-Type: application/json' \
  -d '{
    "grant_type": "code",
    "client_id": "YOUR_CLIENT_ID",
    "code": "AUTHORIZATION_CODE"
  }'
```

A successful response returns both tokens:

**200 OK:**
```json
{
  "access_token":     "eyJ...",
  "refresh_token":    "abc...",
  "expires_in_millis": 3600000
}
```

Store both tokens securely on your server. Use the `access_token` in the Authorization header for KingsChat API calls, and `refresh_token` to renew it when it expires (see step 7).

> [!NOTE]
> KingsChat access tokens are RS256-signed JWTs. You can verify their signature on your server without an extra round-trip to KingsChat by using the Public Key Certificates endpoint. 

---

## 7. Refresh the Access Token
When the access token expires, use the `refresh_token` to obtain a new one without requiring the user to log in again:

**curl:**
```bash
curl -X POST https://connect.kingsch.at/developer/api/oauth2/token \
  -H 'Content-Type: application/json' \
  -d '{
    "grant_type": "refresh_token",
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

The response shape is identical to the initial token exchange. Replace both stored tokens with the new values returned.

---

## Troubleshooting

| Problem | Likely cause | What to do |
|---------|-------------|------------|
| `client_id` not visible on app card | Application not yet approved | Wait for admin review; check your contact email for updates |
| Authorization code rejected or expired | Code was not exchanged within 1 hour | Restart the login flow to obtain a fresh code |
| Token request returns an invalid client error | Wrong or mistyped `client_id` | Copy the value directly from the project page in the portal |
| Application status shows rejected | Description too vague or contact person missing | Update the project description and contact details, then resubmit |

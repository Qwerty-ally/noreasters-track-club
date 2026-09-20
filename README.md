# Nor'easters Track Club website

Static site (no build step): `index.html`, `races.html`, `contact.html`, `admin.html`.

## Try it now
Open with any local server (ES modules need http, not file://):

    cd nortc
    python -m http.server 8000     # then visit http://localhost:8000

Until Firebase is configured the site runs in **demo mode** (data saved in your browser only).
Admin demo login: `emily@parentdata.org` + any password.

## Connect Firebase (about 5 minutes)
1. https://console.firebase.google.com > **Add project**.
2. **Build > Firestore Database > Create database** (production mode).
3. **Build > Authentication > Get started > Email/Password > Enable**, then **Users > Add user**:
   `emily@parentdata.org` with a password you choose.
   The rules also require a **verified** email. Either use "send verification email" on the user
   (click the link), or remove the `email_verified` line in `firestore.rules`.
4. **Project settings > Your apps > Web (</>)** > register app, copy the config into `firebase-config.js`.
5. **Firestore > Rules**: paste `firestore.rules` and Publish.
6. **Authentication > Settings > Authorized domains**: add your site's domain once hosted.

## Host it
`firebase init hosting` + `firebase deploy` (public dir = this folder), or drop the folder on Netlify / GitHub Pages.

## How it works
- **Admin** (`/admin.html`, sign in as emily@parentdata.org): add/delete races, read contact messages, delete comments.
- **Races page & home**: visitors sign up as "I'm coming" or "Maybe" per race.
- **Comments**: public comment board on the home page; admin can remove any.
- **Contact**: form saves to Firestore (visible in admin) and shows emily@parentdata.org.
- The admin email lives in `firebase-config.js` and `firestore.rules`; change both together.

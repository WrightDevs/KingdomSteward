// js/auth.js

async function signUp(email, password, metadata) {
  const { data, error } = await window.db.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
  if (error) throw error;
  return data;
}

async function signIn(email, password) {
  const { data, error } = await window.db.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}

async function signOut() {
  const { error } = await window.db.auth.signOut();
  if (error) throw error;
  // Redirect to onboarding (index.html) after sign out
  window.location.href = '/index.html';
}

async function getSession() {
  const { data, error } = await window.db.auth.getSession();
  if (error) throw error;
  return data.session;
}

// Call this at the top of every protected page
async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = '/login.html';
    return null;
  }
  return session;
}

// Optionally, redirect to dashboard if already logged in (for login/signup pages)
async function redirectIfAuthenticated() {
  const session = await getSession();
  if (session) {
    window.location.href = '/dashboard.html';
  }
}

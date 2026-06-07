// js/auth.js - Kingdom Steward Authentication

// Sign Up - Creates new user account
async function signUp(email, password, metadata) {
  const { data, error } = await window.db.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: metadata.full_name || '',
        title: metadata.title || '',
        zone: metadata.zone || '',
        local_church: metadata.local_church || metadata.church || '',
        phone_number: metadata.phone_number || ''
      }
    }
  });
  if (error) throw error;
  return data;
}

// Sign In - Logs in existing user
async function signIn(email, password) {
  const { data, error } = await window.db.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}

// Sign Out - Logs out current user
async function signOut() {
  const { error } = await window.db.auth.signOut();
  if (error) throw error;
  window.location.href = '/index.html';
}

// Get Current Session
async function getSession() {
  const { data, error } = await window.db.auth.getSession();
  if (error) throw error;
  return data.session;
}

// Get Current User
async function getCurrentUser() {
  const { data: { user }, error } = await db.auth.getUser();
  if (error) throw error;
  return user;
}

// Require Authentication - Redirects to login if not authenticated
async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = '/login.html';
    return null;
  }
  return session;
}

// Redirect if Already Authenticated - For login/signup pages
async function redirectIfAuthenticated() {
  const session = await getSession();
  if (session) {
    window.location.href = '/dashboard.html';
  }
}

// Get User Profile Data
async function getUserProfile(userId) {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

// Update User Profile
async function updateUserProfile(userId, updates) {
  const { data, error } = await db
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  
  if (error) throw error;
  return data;
}

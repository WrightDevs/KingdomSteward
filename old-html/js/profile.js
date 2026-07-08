// js/profile.js

async function initProfilePage() {
  try {
    const session = await requireAuth();
    if (!session) return;
    
    const user = session.user;
    
    // Fill the profile form
    document.getElementById('email').value = user.email || '';
    
    // Fetch user profile from database to get avatar_url
    const { data: profileData, error: profileError } = await window.db
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profileData && profileData.avatar_url) {
      const avatarImg = document.getElementById('avatar-img');
      const avatarFallback = document.querySelector('.avatar-circle svg');
      const cardAvatarImg = document.getElementById('card-avatar-img');
      const cardAvatarFallback = document.getElementById('card-avatar-fallback');

      if (avatarImg && avatarFallback) {
        avatarImg.src = profileData.avatar_url;
        avatarImg.style.display = 'block';
        avatarFallback.style.display = 'none';
      }
      if (cardAvatarImg && cardAvatarFallback) {
        cardAvatarImg.src = profileData.avatar_url;
        cardAvatarImg.style.display = 'block';
        cardAvatarFallback.style.display = 'none';
      }
    }

    if (user.user_metadata) {
      document.getElementById('fullName').value = user.user_metadata.full_name || '';
      
      const title = user.user_metadata.title;
      if (title) {
        document.getElementById('title').value = title;
      }
      
      const zoneSelect = document.getElementById('zone');
      const churchSelect = document.getElementById('church');
      
      // Initialize dropdowns
      populateZones(zoneSelect);
      
      const userZone = user.user_metadata.zone || '';
      const userChurch = user.user_metadata.church || '';
      
      if (userZone) {
        zoneSelect.value = userZone;
        populateChurches(userZone, churchSelect);
        if (userChurch) {
          churchSelect.value = userChurch;
        }
      }
      
      // Update church options when zone changes
      zoneSelect.addEventListener('change', (e) => {
        populateChurches(e.target.value, churchSelect);
      });
      
      // Call syncNameZone globally to update display and card
      if (typeof window.syncNameZone === 'function') {
        window.syncNameZone();
      }
    }
    
    // Calculate and populate Kingdom Steward Wrapped Card
    await populateStewardshipImpact(user.id);

    // Set up form submission
    setupProfileForm(user);
    
    // Set up Avatar Upload
    setupAvatarUpload(user);
    
  } catch (error) {
    console.error("Profile initialization error:", error);
  }
}

async function populateStewardshipImpact(userId) {
  try {
    const { data: entries, error } = await window.db
      .from('giving_entries')
      .select('amount, date')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;

    if (!entries || entries.length === 0) {
      document.getElementById('stat-total').textContent = '₦0';
      document.getElementById('stat-streak').textContent = '0 wks';
      return;
    }

    // Total Impact
    const totalImpact = entries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
    const totalEspees = (totalImpact / 1000).toLocaleString();
    
    document.getElementById('stat-total').textContent = '₦' + totalImpact.toLocaleString();
    
    const statRank = document.getElementById('stat-rank');
    if (statRank) statRank.textContent = totalEspees + ' Esp';

    // Calculate Weekly Consistency Streak
    // We group giving entries by ISO Week and Year.
    const weeksGiven = new Set();
    entries.forEach(entry => {
      const date = new Date(entry.date);
      // Get ISO week number
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
      weeksGiven.add(`${d.getUTCFullYear()}-W${weekNo}`);
    });

    // Check if they gave this week or last week to keep streak alive
    let streak = 0;
    const now = new Date();
    
    // Current Week
    const dNow = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNumNow = dNow.getUTCDay() || 7;
    dNow.setUTCDate(dNow.getUTCDate() + 4 - dayNumNow);
    const yearStartNow = new Date(Date.UTC(dNow.getUTCFullYear(),0,1));
    const currentWeekNo = Math.ceil((((dNow - yearStartNow) / 86400000) + 1)/7);
    const currentWeekStr = `${dNow.getUTCFullYear()}-W${currentWeekNo}`;

    // Previous Week Calculation
    const dPrev = new Date(dNow);
    dPrev.setUTCDate(dPrev.getUTCDate() - 7);
    const yearStartPrev = new Date(Date.UTC(dPrev.getUTCFullYear(),0,1));
    const prevWeekNo = Math.ceil((((dPrev - yearStartPrev) / 86400000) + 1)/7);
    const prevWeekStr = `${dPrev.getUTCFullYear()}-W${prevWeekNo}`;

    if (weeksGiven.has(currentWeekStr) || weeksGiven.has(prevWeekStr)) {
      // Trace backwards
      let checkDate = weeksGiven.has(currentWeekStr) ? dNow : dPrev;
      while (true) {
        streak++;
        // Go back one week
        checkDate.setUTCDate(checkDate.getUTCDate() - 7);
        const yStart = new Date(Date.UTC(checkDate.getUTCFullYear(),0,1));
        const wNo = Math.ceil((((checkDate - yStart) / 86400000) + 1)/7);
        const wStr = `${checkDate.getUTCFullYear()}-W${wNo}`;
        
        if (!weeksGiven.has(wStr)) break;
      }
    }

    document.getElementById('stat-streak').textContent = `${streak} wk${streak !== 1 ? 's' : ''}`;

    // Peak Month Calculation
    const monthlyTotals = {};
    entries.forEach(entry => {
      const date = new Date(entry.date);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + parseFloat(entry.amount);
    });
    
    let peakMonth = '-';
    let peakAmount = 0;
    Object.entries(monthlyTotals).forEach(([month, amount]) => {
      if (amount > peakAmount) {
        peakAmount = amount;
        peakMonth = month;
      }
    });

    const statPeak = document.getElementById('stat-peak');
    const statPeakAmount = document.getElementById('stat-peak-amount');
    if (statPeak) statPeak.textContent = peakMonth;
    if (statPeakAmount) statPeakAmount.textContent = '₦' + peakAmount.toLocaleString();

  } catch (error) {
    console.error("Error calculating impact:", error);
    const statTotal = document.getElementById('stat-total');
    if (statTotal) statTotal.textContent = 'Error';
  }
}

function setupProfileForm(user) {
  const form = document.getElementById('profile-form');
  const submitBtn = document.getElementById('submit-btn');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';
    
    const newTitle = document.getElementById('title').value;
    const newFullName = document.getElementById('fullName').value;
    const newZone = document.getElementById('zone').value;
    const newChurch = document.getElementById('church').value;
    
    try {
      const { data, error } = await window.db.auth.updateUser({
        data: {
          full_name: newFullName,
          title: newTitle,
          zone: newZone,
          church: newChurch
        }
      });
      
      if (error) throw error;
      
      // Update profiles table as well
      const { error: dbError } = await window.db
        .from('profiles')
        .update({
          full_name: newFullName,
          title: newTitle,
          zone: newZone,
          church: newChurch,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (dbError) {
        console.error("Warning: Profile table update failed", dbError);
      }
      
      if (typeof window.syncNameZone === 'function') {
        window.syncNameZone();
      }
      showToast('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      showToast('Error updating profile: ' + err.message, true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Changes';
    }
  });
}

function setupAvatarUpload(user) {
  const fileInput = document.getElementById('avatar-upload');
  const triggerBtn = document.getElementById('upload-btn-trigger');
  const preview = document.getElementById('avatar-preview');

  triggerBtn.addEventListener('click', () => {
    fileInput.click();
  });
  
  preview.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      showToast('Uploading avatar...');
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage (bucket: 'avatars')
      const { error: uploadError } = await window.db.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = window.db.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Update profile table
      const { error: updateError } = await window.db
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update preview images
      const avatarImg = document.getElementById('avatar-img');
      const cardAvatarImg = document.getElementById('card-avatar-img');
      
      if (avatarImg) {
        avatarImg.src = publicUrl;
        avatarImg.style.display = 'block';
      }
      if (cardAvatarImg) {
        cardAvatarImg.src = publicUrl;
        cardAvatarImg.style.display = 'block';
      }
      
      const fallbackSvg = document.querySelector('.avatar-circle svg');
      const cardFallbackSvg = document.getElementById('card-avatar-fallback');
      if (fallbackSvg) fallbackSvg.style.display = 'none';
      if (cardFallbackSvg) cardFallbackSvg.style.display = 'none';
      
      showToast('Avatar updated successfully!');
      
    } catch (err) {
      console.error('Error uploading avatar:', err);
      showToast('Upload failed: ' + err.message, true);
    }
  });
}



function showToast(message, isError = false) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : ''}`;
  
  const icon = isError ? 'alert-circle' : 'check-circle';
  const color = isError ? 'var(--clr-danger)' : 'var(--clr-primary)';
  
  toast.innerHTML = `<i data-lucide="${icon}" style="color: ${color};"></i> <span>${message}</span>`;
  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

document.addEventListener('DOMContentLoaded', initProfilePage);

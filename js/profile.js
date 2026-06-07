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
      const avatarPreview = document.getElementById('avatar-preview');
      avatarPreview.innerHTML = `<img src="${profileData.avatar_url}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">`;
    }

    if (user.user_metadata) {
      document.getElementById('fullName').value = user.user_metadata.full_name || '';
      document.getElementById('wrapped-name').textContent = user.user_metadata.full_name || 'Faithful Steward';
      
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
    }
    
    // Calculate and populate Kingdom Steward Wrapped Card
    await populateStewardshipImpact(user.id);

    // Set up form submission
    setupProfileForm(user);
    
    // Set up Avatar Upload
    setupAvatarUpload(user);

    // Set up Sharing
    setupProgressSharing();
    
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
      document.getElementById('wrapped-impact').textContent = '0 Espees';
      document.getElementById('wrapped-streak').textContent = '0 Weeks';
      return;
    }

    // Total Impact
    const totalImpact = entries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
    document.getElementById('wrapped-impact').textContent = totalImpact.toLocaleString() + ' Espees';

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

    document.getElementById('wrapped-streak').textContent = `${streak} Week${streak !== 1 ? 's' : ''}`;

  } catch (error) {
    console.error("Error calculating impact:", error);
    document.getElementById('wrapped-impact').textContent = 'Error';
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
      
      document.getElementById('wrapped-name').textContent = newFullName;
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

      // Update preview
      preview.innerHTML = `<img src="${publicUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">`;
      showToast('Avatar updated successfully!');
      
    } catch (err) {
      console.error('Error uploading avatar:', err);
      showToast('Upload failed: ' + err.message, true);
    }
  });
}

function setupProgressSharing() {
  const shareBtn = document.getElementById('share-progress-btn');
  const cardToExport = document.getElementById('progress-card-export');

  shareBtn.addEventListener('click', async () => {
    shareBtn.innerHTML = '<i data-lucide="loader" class="spin"></i> Preparing...';
    lucide.createIcons();
    
    try {
      // Capture the card as a canvas
      const canvas = await html2canvas(cardToExport, {
        scale: 2, // High resolution
        backgroundColor: '#1a5276', // Match theme
        useCORS: true
      });
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'kingdom-steward-impact.png', { type: 'image/png' });
        
        // Use Web Share API if available
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'My Kingdom Steward Impact',
              text: 'Check out my kingdom impact and consistency streak on Kingdom Steward!',
              files: [file]
            });
            showToast('Shared successfully!');
          } catch (err) {
            console.log('Share canceled or failed', err);
            // Fallback to download
            downloadBlob(blob, 'kingdom-steward-impact.png');
          }
        } else {
          // Fallback for browsers that don't support file sharing
          downloadBlob(blob, 'kingdom-steward-impact.png');
          showToast('Image downloaded! You can now share it.');
        }
        
        shareBtn.innerHTML = '<i data-lucide="share-2" style="width: 16px; height: 16px; margin-right: 4px;"></i> Share';
        lucide.createIcons();
      }, 'image/png');
      
    } catch (err) {
      console.error('Error capturing card:', err);
      showToast('Failed to prepare image for sharing.', true);
      shareBtn.innerHTML = '<i data-lucide="share-2" style="width: 16px; height: 16px; margin-right: 4px;"></i> Share';
      lucide.createIcons();
    }
  });
}

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
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

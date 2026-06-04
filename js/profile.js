// js/profile.js

async function initProfilePage() {
  try {
    const session = await requireAuth();
    if (!session) return;
    
    const user = session.user;
    
    // Fill the profile form
    document.getElementById('email').value = user.email || '';
    
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
    }
    
    // Set up form submission
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
        const { data, error } = await db.auth.updateUser({
          data: {
            full_name: newFullName,
            title: newTitle,
            zone: newZone,
            church: newChurch
          }
        });
        
        if (error) throw error;
        
        // Update profiles table as well using the user ID
        const { error: dbError } = await db
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
          // Don't throw here, as auth metadata updated successfully
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
    
  } catch (error) {
    console.error("Profile initialization error:", error);
  }
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
  lucide.createIcons();
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

document.addEventListener('DOMContentLoaded', initProfilePage);

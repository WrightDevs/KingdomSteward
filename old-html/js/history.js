// js/history.js

let allEntries = [];

function renderHistory(entries) {
  const tbody = document.getElementById('history-table-body');
  if (!tbody) return;
  
  tbody.innerHTML = '';
    if (entries.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 3rem 1rem;">
            <div style="color: var(--clr-muted); max-width: 300px; margin: 0 auto;">
              <i data-lucide="inbox" style="width: 48px; height: 48px; color: var(--clr-border); margin-bottom: 1rem;"></i>
              <p style="margin-bottom: 1rem;">No giving records found.</p>
              <a href="/give.html" class="btn btn-primary" style="padding: 0.5rem 1rem;">Log Giving</a>
            </div>
          </td>
        </tr>
      `;
      lucide.createIcons();
      return;
    }
  
  entries.forEach(entry => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${new Date(entry.date).toLocaleDateString()}</td>
      <td><span class="badge ${entry.type}">${entry.type.replace('_', ' ')}</span></td>
      <td style="font-weight: 500;">₦${Number(entry.amount).toLocaleString()}</td>
      <td style="color: var(--clr-muted);">${formatEspees(entry.amount)}</td>
      <td style="text-align: right;">
        <button class="btn btn-danger-outline delete-btn" data-id="${entry.id}">
          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  // Re-initialize lucide icons for new elements
  lucide.createIcons();
  
  // Attach delete listeners
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this record?')) {
        await handleDelete(id);
      }
    });
  });
}

async function handleDelete(id) {
  try {
    await deleteGiving(id);
    
    // Remove from local array
    allEntries = allEntries.filter(e => e.id !== id);
    
    // Re-render currently filtered state
    const typeFilter = document.getElementById('type-filter').value;
    filterAndRender(typeFilter);
    
    showToast('Record deleted successfully');
  } catch (error) {
    console.error(error);
    alert('Error deleting record.');
  }
}

function filterAndRender(type) {
  if (type === 'all') {
    renderHistory(allEntries);
  } else {
    const filtered = allEntries.filter(e => e.type === type);
    renderHistory(filtered);
  }
}

function showToast(message) {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i data-lucide="check-circle" style="color: var(--clr-primary);"></i> <span>${message}</span>`;
  container.appendChild(toast);
  lucide.createIcons();
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function createToastContainer() {
  const c = document.createElement('div');
  c.id = 'toast-container';
  c.className = 'toast-container';
  document.body.appendChild(c);
  return c;
}

async function initHistoryPage() {
  try {
    await requireAuth();
    
    // Fetch all entries
    allEntries = await getGivings();
    
    // Initial render
    renderHistory(allEntries);
    
    // Setup filter listener
    document.getElementById('type-filter').addEventListener('change', (e) => {
      filterAndRender(e.target.value);
    });
    
  } catch (error) {
    console.error("History initialization error:", error);
  }
}

document.addEventListener('DOMContentLoaded', initHistoryPage);

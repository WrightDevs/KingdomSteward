// js/pledges.js

async function fetchPledges() {
  const { data, error } = await db
    .from('pledges')
    .select('*')
    .order('due_date', { ascending: true });
    
  if (error) {
    console.error(error);
    showToast("Error loading pledges", true);
    return [];
  }
  return data;
}

async function createPledge(pledgeData) {
  const session = await requireAuth();
  if (!session) return;
  
  const { error } = await db
    .from('pledges')
    .insert({
      user_id: session.user.id,
      amount: pledgeData.amount,
      category: pledgeData.category,
      due_date: pledgeData.due_date,
      notes: pledgeData.notes,
      status: 'pending'
    });
    
  if (error) throw error;
}

async function updatePledgeStatus(id, newStatus, newRedeemedAmount) {
  const updates = { updated_at: new Date().toISOString() };
  if (newStatus) updates.status = newStatus;
  if (newRedeemedAmount !== undefined) updates.redeemed_amount = newRedeemedAmount;
  
  const { error } = await db
    .from('pledges')
    .update(updates)
    .eq('id', id);
    
  if (error) throw error;
}

let currentRedeemPledgeId = null;
let currentRedeemBalance = 0;

function openRedeemModal(pledge) {
  currentRedeemPledgeId = pledge.id;
  const total = parseFloat(pledge.amount) || 0;
  const redeemed = parseFloat(pledge.redeemed_amount) || 0;
  currentRedeemBalance = total - redeemed;
  
  document.getElementById('modal-balance').textContent = `₦${currentRedeemBalance.toLocaleString()}`;
  document.getElementById('redeem-amount').value = currentRedeemBalance;
  document.getElementById('redeem-amount').max = currentRedeemBalance;
  
  const modal = document.getElementById('redeem-modal');
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.style.opacity = '1';
    document.getElementById('redeem-modal-content').style.transform = 'translateY(0)';
  }, 10);
}

function closeRedeemModal() {
  const modal = document.getElementById('redeem-modal');
  modal.style.opacity = '0';
  document.getElementById('redeem-modal-content').style.transform = 'translateY(20px)';
  setTimeout(() => {
    modal.style.display = 'none';
    currentRedeemPledgeId = null;
  }, 300);
}

async function renderPledges() {
  const pledges = await fetchPledges();
  const list = document.getElementById('pledges-list');
  
  if (!list) return;
  list.innerHTML = '';
  
  if (pledges.length === 0) {
    list.innerHTML = `
      <div class="card" style="text-align:center; padding:3rem 1rem;">
        <i data-lucide="calendar" style="width:48px; height:48px; color:var(--clr-border); margin-bottom:1rem;"></i>
        <p style="color:var(--clr-muted); margin-bottom:0;">No pledges found.</p>
        <p style="color:var(--clr-muted); font-size:0.9rem;">Create a new pledge above to get started.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }
  
  // Calculate Analytics
  let totalAmount = 0;
  let redeemedAmount = 0;
  pledges.forEach(p => {
    const amt = parseFloat(p.amount) || 0;
    const rdmd = parseFloat(p.redeemed_amount) || 0;
    totalAmount += amt;
    redeemedAmount += rdmd;
    // Legacy support: if status is redeemed but redeemed_amount is 0, add full amount
    if (p.status === 'redeemed' && rdmd === 0) redeemedAmount += amt; 
  });
  
  const analyticsDiv = document.getElementById('pledge-analytics');
  const bar = document.getElementById('pledge-progress-bar');
  const text = document.getElementById('pledge-progress-text');
  
  if (totalAmount > 0 && analyticsDiv) {
    analyticsDiv.style.display = 'block';
    const pct = Math.round((redeemedAmount / totalAmount) * 100);
    setTimeout(() => {
      bar.style.width = `${pct}%`;
      text.textContent = `${pct}%`;
    }, 100);
  }
  
  const now = new Date();
  now.setHours(0,0,0,0);
  
  // Attach pledges array to window for easy modal lookup
  window._pledgesCache = pledges;
  
  pledges.forEach(p => {
    const dueDate = new Date(p.due_date);
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    const totalAmt = parseFloat(p.amount) || 0;
    let rdmAmt = parseFloat(p.redeemed_amount) || 0;
    if (p.status === 'redeemed' && rdmAmt === 0) rdmAmt = totalAmt;
    
    let statusBadge = '';
    if (p.status === 'redeemed') {
      statusBadge = '<span class="badge" style="background:var(--clr-primary-light); color:var(--clr-primary);">Redeemed</span>';
    } else if (p.status === 'partially_redeemed') {
      statusBadge = '<span class="badge" style="background:#e0f2fe; color:#0369a1;">Partial</span>';
    } else if (diffDays < 0) {
      statusBadge = '<span class="badge" style="background:#fee2e2; color:#b91c1c;">Overdue</span>';
    } else if (diffDays <= 7) {
      statusBadge = '<span class="badge" style="background:#fef08a; color:#a16207;">Due Soon</span>';
    } else {
      statusBadge = '<span class="badge" style="background:#f1f5f9; color:var(--clr-muted);">Pending</span>';
    }
    
    let progressHTML = '';
    if (p.status !== 'redeemed' && rdmAmt > 0) {
      const itemPct = Math.round((rdmAmt / totalAmt) * 100);
      progressHTML = `
        <div style="margin-top: 1rem;">
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--clr-muted); margin-bottom:0.25rem;">
            <span>Redeemed: ₦${rdmAmt.toLocaleString()}</span>
            <span>Balance: ₦${(totalAmt - rdmAmt).toLocaleString()}</span>
          </div>
          <div style="background:var(--clr-border); border-radius:3px; height:4px; width:100%;">
            <div style="background:var(--clr-primary); height:100%; border-radius:3px; width:${itemPct}%;"></div>
          </div>
        </div>
      `;
    }
    
    const div = document.createElement('div');
    div.className = 'card';
    div.style.marginBottom = '1rem';
    div.style.padding = '1.25rem';
    
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
        <div style="flex:1; min-width:200px;">
          <div style="font-family:var(--font-display); font-size:1.25rem; font-weight:700; color:var(--clr-primary); margin-bottom:0.25rem;">
            ₦${totalAmt.toLocaleString()}
          </div>
          <div style="color:var(--clr-text); font-size:0.9rem;">
            <strong>Category:</strong> ${p.category.replace(/_/g, ' ').toUpperCase()} <br>
            <span style="color:var(--clr-muted);"><strong>Due:</strong> ${dueDate.toLocaleDateString()}</span>
          </div>
          ${p.notes ? `<div style="margin-top:0.5rem; font-size:0.85rem; color:var(--clr-muted); font-style:italic;">"${p.notes}"</div>` : ''}
          ${progressHTML}
        </div>
        <div style="text-align:right;">
          <div style="margin-bottom:0.75rem;">${statusBadge}</div>
          ${p.status !== 'redeemed' ? `
            <button class="btn btn-outline btn-redeem" data-id="${p.id}" style="padding:0.3rem 0.6rem; font-size:0.8rem;">
              Mark Redeemed
            </button>
          ` : ''}
        </div>
      </div>
    `;
    list.appendChild(div);
  });
  
  // Attach event listeners for open modal
  document.querySelectorAll('.btn-redeem').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const pledge = window._pledgesCache.find(p => p.id === id);
      if (pledge) openRedeemModal(pledge);
    });
  });
}

async function initPledgesPage() {
  await requireAuth();
  
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('due_date').setAttribute('min', today);
  
  await renderPledges();
  
  const form = document.getElementById('pledge-form');
  const btn = document.getElementById('submit-pledge-btn');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = 'Saving...';
    
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const due_date = document.getElementById('due_date').value;
    const notes = document.getElementById('notes').value;
    
    try {
      await createPledge({ amount, category, due_date, notes });
      showToast('Pledge created successfully!');
      form.reset();
      await renderPledges();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to create pledge', true);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Create Pledge';
    }
  });

  // Modal logic
  document.getElementById('close-modal-btn').addEventListener('click', closeRedeemModal);
  
  document.querySelectorAll('.quick-amount-btn').forEach(b => {
    b.addEventListener('click', (e) => {
      const pct = parseFloat(e.currentTarget.getAttribute('data-pct'));
      document.getElementById('redeem-amount').value = (currentRedeemBalance * pct).toFixed(2);
    });
  });

  document.getElementById('confirm-redeem-btn').addEventListener('click', async (e) => {
    const btnEl = e.currentTarget;
    const val = parseFloat(document.getElementById('redeem-amount').value);
    
    if (!val || val <= 0 || val > currentRedeemBalance) {
      showToast('Please enter a valid amount', true);
      return;
    }
    
    const pledge = window._pledgesCache.find(p => p.id === currentRedeemPledgeId);
    if (!pledge) return;
    
    btnEl.disabled = true;
    btnEl.textContent = 'Processing...';
    
    try {
      const newRedeemedAmt = (parseFloat(pledge.redeemed_amount) || 0) + val;
      const totalAmt = parseFloat(pledge.amount) || 0;
      const newStatus = newRedeemedAmt >= totalAmt ? 'redeemed' : 'partially_redeemed';
      
      // Update pledge
      await updatePledgeStatus(currentRedeemPledgeId, newStatus, newRedeemedAmt);
      
      // Log giving entry
      await createGiving({
        amount: val,
        type: pledge.category,
        date: new Date().toISOString().split('T')[0],
        notes: `[Redeemed Pledge] ${pledge.notes || ''}`
      });
      
      showToast(`₦${val.toLocaleString()} logged as giving!`);
      closeRedeemModal();
      await renderPledges();
    } catch (err) {
      console.error(err);
      showToast('Failed to process redemption', true);
    } finally {
      btnEl.disabled = false;
      btnEl.textContent = 'Confirm Redemption';
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
  toast.innerHTML = `<i data-lucide="${isError ? 'alert-circle' : 'check-circle'}" style="color: ${isError ? 'var(--clr-danger)' : 'var(--clr-primary)'};"></i> <span>${message}</span>`;
  container.appendChild(toast);
  lucide.createIcons();
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

document.addEventListener('DOMContentLoaded', initPledgesPage);

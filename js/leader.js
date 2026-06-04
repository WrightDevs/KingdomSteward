// js/leader.js

async function initLeaderDashboard() {
  const session = await requireAuth();
  if (!session) return;
  
  const meta = session.user.user_metadata || {};
  const title = meta.title || '';
  
  // Verify leadership status
  const leaderTitles = ['Pastor', 'Cell Leader', 'Zonal Pastor', 'Zonal Secretary', 'Deacon', 'Deaconess'];
  if (!leaderTitles.includes(title)) {
    document.querySelector('.dashboard-page').innerHTML = `
      <div style="text-align: center; padding: 5rem 1rem;">
        <i data-lucide="shield-alert" style="width: 64px; height: 64px; color: var(--clr-danger); margin-bottom: 1rem;"></i>
        <h2>Access Denied</h2>
        <p style="color: var(--clr-muted);">You do not have leadership access to view this dashboard.</p>
        <a href="/dashboard.html" class="btn btn-primary" style="margin-top: 1rem;">Return Home</a>
      </div>
    `;
    lucide.createIcons();
    return;
  }
  
  document.getElementById('leader-church').textContent = meta.church || 'Unknown Church';
  
  // Fetch aggregate giving data
  // Due to our new RLS policy, querying giving_entries without specifying a user_id 
  // will only return the entries of members in the leader's church/zone.
  const { data: entries, error } = await db
    .from('giving_entries')
    .select('*, profiles:user_id(full_name, title)')
    .order('date', { ascending: false });
    
  if (error) {
    console.error(error);
    return;
  }
  
  // Calculate stats
  let totalEspees = 0;
  const memberSet = new Set();
  
  entries.forEach(e => {
    memberSet.add(e.user_id);
    totalEspees += parseFloat(calculateEspees(e.amount, e.type)) || 0;
  });
  
  // Fetch pledges to calculate total redeemed and display list
  const { data: pledges } = await db
    .from('pledges')
    .select('*, profiles:user_id(full_name)')
    .order('created_at', { ascending: false });
    
  let totalRedeemedAmount = 0;
  if (pledges) {
    pledges.forEach(p => {
      // Add up fully redeemed pledges + partial redemptions
      const rdmd = parseFloat(p.redeemed_amount) || 0;
      const amt = parseFloat(p.amount) || 0;
      if (p.status === 'redeemed' && rdmd === 0) {
        totalRedeemedAmount += amt; // legacy support
      } else {
        totalRedeemedAmount += rdmd;
      }
    });
  }
  
  // Animate numbers
  document.getElementById('total-members').textContent = memberSet.size.toString();
  document.getElementById('total-espees').textContent = formatEspees(totalEspees);
  document.getElementById('total-redeemed').textContent = `₦${Number(totalRedeemedAmount).toLocaleString()}`;
  
  // Render recent activity table
  const tbody = document.getElementById('leader-table-body');
  tbody.innerHTML = '';
  
  if (entries.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 3rem 1rem;">
          <div style="color: var(--clr-muted);">
            <i data-lucide="inbox" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i>
            <p>No member activity found.</p>
          </div>
        </td>
      </tr>
    `;
  } else {
    // Render top 50 recent giving
    entries.slice(0, 50).forEach(e => {
      const name = e.profiles ? e.profiles.full_name : 'Unknown Member';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600;">${name}</td>
        <td>${new Date(e.date).toLocaleDateString()}</td>
        <td><span class="badge" style="background:var(--clr-bg); border:1px solid var(--clr-border); color:var(--clr-text);">${e.type.replace(/_/g, ' ').toUpperCase()}</span></td>
        <td style="font-family: var(--font-display); font-weight: 700; color: var(--clr-accent);">${formatEspees(calculateEspees(e.amount, e.type))}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Render pledges table
  const ptbody = document.getElementById('leader-pledges-table-body');
  ptbody.innerHTML = '';

  if (!pledges || pledges.length === 0) {
    ptbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 3rem 1rem;">
          <div style="color: var(--clr-muted);">
            <i data-lucide="calendar" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i>
            <p>No member pledges found.</p>
          </div>
        </td>
      </tr>
    `;
  } else {
    pledges.slice(0, 50).forEach(p => {
      const name = p.profiles ? p.profiles.full_name : 'Unknown Member';
      const tr = document.createElement('tr');
      
      const totalAmt = parseFloat(p.amount) || 0;
      let rdmAmt = parseFloat(p.redeemed_amount) || 0;
      if (p.status === 'redeemed' && rdmAmt === 0) rdmAmt = totalAmt;
      
      let statusBadge = '';
      if (p.status === 'redeemed') statusBadge = '<span class="badge" style="background:var(--clr-primary-light); color:var(--clr-primary);">Redeemed</span>';
      else if (p.status === 'partially_redeemed') statusBadge = '<span class="badge" style="background:#e0f2fe; color:#0369a1;">Partial</span>';
      else if (p.status === 'overdue') statusBadge = '<span class="badge" style="background:#fee2e2; color:#b91c1c;">Overdue</span>';
      else statusBadge = '<span class="badge" style="background:#f1f5f9; color:var(--clr-muted);">Pending</span>';

      tr.innerHTML = `
        <td style="font-weight: 600;">${name}</td>
        <td>${p.category.replace(/_/g, ' ').toUpperCase()}</td>
        <td style="font-family: var(--font-display); font-weight: 700;">₦${totalAmt.toLocaleString()}</td>
        <td style="color: var(--clr-accent); font-weight: 600;">₦${rdmAmt.toLocaleString()}</td>
        <td>${statusBadge}</td>
      `;
      ptbody.appendChild(tr);
    });
  }
  
  lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', initLeaderDashboard);

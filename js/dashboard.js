// js/dashboard.js

function computeWeekStreak(entries) {
  if (!entries || entries.length === 0) return 0;
  
  // Sort entries by date descending
  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let streak = 0;
  let currentDate = new Date();
  
  // Normalize current date to start of week (Sunday)
  currentDate.setHours(0, 0, 0, 0);
  const currentDay = currentDate.getDay();
  currentDate.setDate(currentDate.getDate() - currentDay);
  
  let expectedWeekStart = currentDate.getTime();
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  
  // Check if there's an entry for the current week or previous week to start streak
  let hasEntryThisWeek = false;
  let entryIndex = 0;
  
  // We group entries by week start timestamp
  const weekStarts = new Set();
  for (const entry of sorted) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    const entryDay = entryDate.getDay();
    entryDate.setDate(entryDate.getDate() - entryDay);
    weekStarts.add(entryDate.getTime());
  }
  
  if (weekStarts.has(expectedWeekStart)) {
    // Has entry this week
  } else if (weekStarts.has(expectedWeekStart - ONE_WEEK_MS)) {
    // No entry this week yet, but had one last week, shift expected
    expectedWeekStart -= ONE_WEEK_MS;
  } else {
    return 0; // No entries in current or last week
  }
  
  // Count consecutive weeks backwards
  while (weekStarts.has(expectedWeekStart)) {
    streak++;
    expectedWeekStart -= ONE_WEEK_MS;
  }
  
  return streak;
}

function computeStats(entries) {
  const now = new Date();
  const thisMonth = entries.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisYear = entries.filter(e => {
    return new Date(e.date).getFullYear() === now.getFullYear();
  });

  const totalMonth = thisMonth.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalYear  = thisYear.reduce((sum, e) => sum + Number(e.amount), 0);
  const streak = computeWeekStreak(entries);

  return { 
    totalMonth, 
    totalYear, 
    espeesYear: ngnToEspees(totalYear), 
    streak, 
    totalEntries: entries.length 
  };
}

function renderCards(stats) {
  document.getElementById('stat-month').textContent = `₦${stats.totalMonth.toLocaleString()}`;
  document.getElementById('stat-year').textContent = `₦${stats.totalYear.toLocaleString()}`;
  document.getElementById('stat-espees').textContent = formatEspees(stats.totalYear);
  document.getElementById('stat-streak').textContent = `${stats.streak} Week${stats.streak !== 1 ? 's' : ''}`;
}

function renderChart(entries) {
  const ctx = document.getElementById('givingChart');
  if (!ctx) return;
  
  // Aggregate last 6 months
  const now = new Date();
  const labels = [];
  const data = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleString('default', { month: 'short' }));
    
    const monthEntries = entries.filter(e => {
      const ed = new Date(e.date);
      return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
    });
    const total = monthEntries.reduce((sum, e) => sum + Number(e.amount), 0);
    data.push(total);
  }
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Giving (₦)',
        data: data,
        backgroundColor: '#059669',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: '#e2e8f0'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

function renderRecentEntries(entries) {
  const tbody = document.getElementById('recent-entries-body');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const recent = entries.slice(0, 5);
  
  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--clr-muted);">No giving history yet.</td></tr>';
    return;
  }
  
  recent.forEach(entry => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${new Date(entry.date).toLocaleDateString()}</td>
      <td><span class="badge ${entry.type}">${entry.type.replace('_', ' ')}</span></td>
      <td style="font-weight: 500;">₦${Number(entry.amount).toLocaleString()}</td>
      <td style="color: var(--clr-muted);">${formatEspees(entry.amount)}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function initDashboard() {
  try {
    const session = await requireAuth();
    if (!session) return;
    
    // Set user name and details
    const meta = session.user.user_metadata || {};
    const title = meta.title ? `${meta.title} ` : '';
    
    const fullName = meta.full_name || 'Steward';
    const nameParts = fullName.trim().split(/\s+/);
    // Many Nigerian users enter Surname FirstName OtherName.
    // If there are multiple names, pick the second one (usually the first/middle name). Otherwise pick the first.
    const displayName = nameParts.length > 1 ? nameParts[1] : nameParts[0];
    
    document.getElementById('user-name').textContent = `${title}${displayName}`;
    
    document.getElementById('user-zone').textContent = meta.zone || 'No Zone Set';
    document.getElementById('user-church').textContent = meta.church || 'No Church Set';
    
    // Show leader button if applicable
    const leaderTitles = ['Pastor', 'Cell Leader', 'Zonal Pastor', 'Zonal Secretary', 'Deacon', 'Deaconess'];
    if (meta.title && leaderTitles.includes(meta.title)) {
      document.getElementById('leader-actions').style.display = 'block';
    }
    
    // Fetch givings
    const entries = await getGivings();
    
    // Compute stats
    const stats = computeStats(entries);
    
    // Calculate Global Impact Tier based on Yearly Espees
    const espeesVal = parseFloat(stats.espeesYear);
    let tier = 'Bronze';
    if (espeesVal > 100) tier = 'Platinum';
    else if (espeesVal > 50) tier = 'Gold';
    else if (espeesVal > 10) tier = 'Silver';
    
    document.getElementById('impact-tier').textContent = tier;
    
    // Check for Pledge Reminders
    const { data: pledges } = await db
      .from('pledges')
      .select('due_date')
      .in('status', ['pending', 'partially_redeemed']);
      
    if (pledges && pledges.length > 0) {
      const now = new Date();
      now.setHours(0,0,0,0);
      
      let urgentCount = 0;
      let isOverdue = false;
      
      pledges.forEach(p => {
        const due = new Date(p.due_date);
        const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          isOverdue = true;
          urgentCount++;
        } else if (diffDays <= 7) {
          urgentCount++;
        }
      });
      
      if (urgentCount > 0) {
        const banner = document.getElementById('pledge-reminder-banner');
        const text = document.getElementById('pledge-reminder-text');
        
        if (isOverdue) {
          banner.classList.remove('warning');
          banner.classList.add('danger');
          text.innerHTML = `<strong>Overdue:</strong> You have ${urgentCount} pledge(s) waiting to be redeemed.`;
          
          // Update button outline color
          const btn = banner.querySelector('.btn');
          btn.classList.remove('btn-outline');
          btn.classList.add('btn-danger-outline');
        } else {
          text.innerHTML = `<strong>Upcoming:</strong> You have ${urgentCount} pledge(s) due within 7 days.`;
        }
        
        banner.style.display = 'flex'; // Show banner
      }
    }
    
    // Render UI
    renderCards(stats);
    renderChart(entries);
    renderRecentEntries(entries);
    
  } catch (error) {
    console.error("Dashboard initialization error:", error);
    alert("Error loading dashboard data.");
  }
}

// Ensure auth check on load
document.addEventListener('DOMContentLoaded', initDashboard);

// Logout button
document.getElementById('logout-btn')?.addEventListener('click', async (e) => {
  e.preventDefault();
  await signOut();
});

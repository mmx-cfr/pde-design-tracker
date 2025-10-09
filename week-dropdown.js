// Week dropdown data and functionality
const weeks = [
    
  { file: "august-11-2025.html", label: "Mon, 8/11/2025 — Thu, 8/14/2025" },
  { file: "august-18-2025.html", label: "Mon, 8/18/2025 — Thu, 8/21/2025" },
  { file: "august-25-2025.html", label: "Mon, 8/25/2025 — Thu, 8/28/2025" },
  { file: "september-1-2025.html", label: "Mon, 9/1/2025 — Fri, 9/5/2025" },
  { file: "september-8-2025.html", label: "Mon, 9/8/2025 — Fri, 9/12/2025" },
  { file: "september-15-2025.html", label: "Mon, 9/15/2025 — Fri, 9/19/2025" },
  { file: "september-22-2025.html", label: "Mon, 9/22/2025 — Fri, 9/26/2025" },
  { file: "september-29-2025.html", label: "Mon, 9/29/2025 — Fri, 10/3/2025" },
  { file: "october-6-2025.html", label: "Mon, 10/6/2025 — Fri, 10/10/2025" },
  { file: "october-13-2025.html", label: "Mon, 10/13/2025 — Fri, 10/17/2025", exists: true },
  { file: "october-20-2025.html", label: "Mon, 10/20/2025 — Fri, 10/24/2025" },
  { file: "october-27-2025.html", label: "Mon, 10/27/2025 — Fri, 10/31/2025" },
  { file: "november-3-2025.html", label: "Mon, 11/3/2025 — Fri, 11/7/2025" },
  { file: "november-10-2025.html", label: "Mon, 11/10/2025 — Fri, 11/14/2025" },
  { file: "november-17-2025.html", label: "Mon, 11/17/2025 — Fri, 11/21/2025" },
  { file: "november-24-2025.html", label: "Mon, 11/24/2025 — Fri, 11/28/2025" },
  { file: "december-1-2025.html", label: "Mon, 12/1/2025 — Fri, 12/5/2025" },
  { file: "december-8-2025.html", label: "Mon, 12/8/2025 — Fri, 12/12/2025" },
  { file: "december-15-2025.html", label: "Mon, 12/15/2025 — Fri, 12/19/2025" },
  { file: "december-22-2025.html", label: "Mon, 12/22/2025 — Fri, 12/26/2025" },
  { file: "december-29-2025.html", label: "Mon, 12/29/2025 — Fri, 1/2/2026" }
];

// Check if a file exists using fetch
async function checkFileExists(filename) {
  try {
    const response = await fetch(filename, { method: 'HEAD' });
    return response.ok; // returns true if status is 200-299
  } catch {
    return false;
  }
}

// Check all files and mark which ones exist
async function checkAllFiles() {
  const checkPromises = weeks.map(async (week) => {
    week.exists = await checkFileExists(week.file);
    return week;
  });
  
  await Promise.all(checkPromises);
}

// Get the most recent week that exists
function getMostRecentWeek() {
  for (let i = weeks.length - 1; i >= 0; i--) {
    if (weeks[i].exists) {
      return weeks[i];
    }
  }
  return weeks[0]; // fallback to first week
}

// Populate the dropdown
function populateDropdown() {
  const select = document.getElementById('weekSelect');
  if (!select) return;

  // Clear existing options
  select.innerHTML = '';

  weeks.forEach(week => {
    const option = document.createElement('option');
    option.value = week.file;
    
    if (week.exists) {
      option.textContent = week.label;
    } else {
      option.textContent = week.label + ' (Coming Soon)';
      option.disabled = true;
      option.style.color = '#999';
    }
    
    select.appendChild(option);
  });

  // Set dropdown to match current page, or default to most recent if page doesn't exist
  const currentFile = location.pathname.split('/').pop().toLowerCase();
  let matchFound = false;
  
  for (let i = 0; i < select.options.length; i++) {
    if (select.options[i].value.toLowerCase() === currentFile) {
      // Only select if this file exists
      const weekData = weeks.find(w => w.file.toLowerCase() === currentFile);
      if (weekData && weekData.exists) {
        select.selectedIndex = i;
        matchFound = true;
      }
      break;
    }
  }
  
  // If current page doesn't exist or wasn't found, redirect to most recent
  if (!matchFound) {
    const mostRecent = getMostRecentWeek();
    const currentFileClean = currentFile.replace(/\?.*$/, ''); // remove query params
    
    // Only redirect if we're not already on the most recent page
    if (currentFileClean !== mostRecent.file.toLowerCase() && mostRecent.file) {
      const cacheBuster = 'v=' + new Date().getTime();
      window.location.href = mostRecent.file + '?' + cacheBuster;
      return;
    }
    
    // Set dropdown to most recent
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value === mostRecent.file) {
        select.selectedIndex = i;
        break;
      }
    }
  }

  // Navigate when user changes dropdown
  select.addEventListener('change', function () {
    const selectedWeek = weeks.find(w => w.file === this.value);
    
    // If user somehow selects a non-existent week (shouldn't happen due to disabled), redirect to most recent
    if (!selectedWeek || !selectedWeek.exists) {
      const mostRecent = getMostRecentWeek();
      const cacheBuster = 'v=' + new Date().getTime();
      window.location.href = mostRecent.file + '?' + cacheBuster;
      return;
    }
    
    const baseUrl = this.value;
    const cacheBuster = 'v=' + new Date().getTime();
    const separator = baseUrl.includes('?') ? '&' : '?';
    window.location.href = baseUrl + separator + cacheBuster;
  });
}

// Main initialization function
async function initWeekDropdown() {
  // Check which files exist
  await checkAllFiles();
  
  // Populate the dropdown
  populateDropdown();
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWeekDropdown);
} else {
  initWeekDropdown();
}

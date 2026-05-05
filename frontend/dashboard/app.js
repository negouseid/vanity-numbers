const query = `
  query RecentCalls($limit: Int) {
    recentCalls(limit: $limit) {
      contactId
      callerNumberMasked
      normalizedCallerNumber
      createdAt
      topThreeVanityNumbers
      vanityNumbers {
        rank
        displayValue
        score
        reason
      }
    }
  }
`;

const body = document.querySelector('#recentCallsBody');
const statusText = document.querySelector('#statusText');
const callCount = document.querySelector('#callCount');
const lastSync = document.querySelector('#lastSync');
const refreshButton = document.querySelector('#refreshButton');

refreshButton.addEventListener('click', () => {
  loadRecentCalls();
});

loadRecentCalls();

async function loadRecentCalls() {
  setStatus('Loading');

  try {
    const response = await fetch(window.VANITY_DASHBOARD_CONFIG.graphqlUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': window.VANITY_DASHBOARD_CONFIG.apiKey
      },
      body: JSON.stringify({
        query,
        variables: {
          limit: 5
        }
      })
    });

    const payload = await response.json();

    if (!response.ok || payload.errors) {
      throw new Error(payload.errors?.[0]?.message ?? 'GraphQL request failed');
    }

    renderRows(payload.data.recentCalls ?? []);
    setStatus('Synced');
    lastSync.textContent = new Date().toLocaleTimeString();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    body.innerHTML = `<tr><td colspan="5" class="empty">Unable to load recent calls: ${escapeHtml(message)}</td></tr>`;
    callCount.textContent = '0';
    setStatus('Error', true);
  }
}

function renderRows(calls) {
  callCount.textContent = String(calls.length);

  if (calls.length === 0) {
    body.innerHTML = '<tr><td colspan="5" class="empty">No calls have been stored yet.</td></tr>';
    return;
  }

  body.innerHTML = calls
    .map((call) => {
      const best = call.vanityNumbers?.[0];
      const options = call.topThreeVanityNumbers ?? [];

      return `
        <tr>
          <td>${formatDate(call.createdAt)}</td>
          <td>
            <strong>${escapeHtml(call.callerNumberMasked)}</strong>
            <div class="muted">${escapeHtml(call.contactId)}</div>
          </td>
          <td>
            <div class="options">
              ${options.map((option) => `<span class="option">${escapeHtml(option)}</span>`).join('')}
            </div>
          </td>
          <td>${best?.score ?? '-'}</td>
          <td>${escapeHtml(best?.reason ?? '-')}</td>
        </tr>
      `;
    })
    .join('');
}

function setStatus(text, isError = false) {
  statusText.textContent = text;
  statusText.classList.toggle('error', isError);
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

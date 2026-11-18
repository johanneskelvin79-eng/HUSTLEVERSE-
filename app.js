// Add your Supabase project URL and anon/public key below. Never put a service_role key in browser code.
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const sampleProfiles = [
  { username: 'maya.builds', full_name: 'Maya Johnson', website: 'https://example.com', avatar_url: '' },
  { username: 'andrecreates', full_name: 'Andre Williams', website: '', avatar_url: '' },
  { username: 'ninaonpurpose', full_name: 'Nina Patel', website: 'https://example.com', avatar_url: '' },
  { username: 'theo.makes', full_name: 'Theo Brooks', website: '', avatar_url: '' },
  { username: 'sammoves', full_name: 'Sam Rivera', website: 'https://example.com', avatar_url: '' },
  { username: 'imaniworks', full_name: 'Imani Clarke', website: '', avatar_url: '' }
];

const configured = !SUPABASE_URL.includes('YOUR_PROJECT_ID') && !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY') && window.supabase;
const client = configured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const grid = document.querySelector('#profile-grid');
const searchInput = document.querySelector('#search-input');
const authDialog = document.querySelector('#auth-dialog');
const profileDialog = document.querySelector('#profile-dialog');
let profiles = [...sampleProfiles];
let authMode = 'signup';
let currentUser = null;

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function validWebLink(value = '') {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
function initials(name = 'H') { return name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase() || 'H'; }
function drawProfiles() {
  const query = searchInput.value.trim().toLowerCase();
  const matches = profiles.filter(profile => [profile.full_name, profile.username, profile.website].some(value => (value || '').toLowerCase().includes(query)));
  grid.innerHTML = matches.map(profile => {
    const name = profile.full_name || profile.username || 'HUSTLEVERSE member';
    const avatar = validWebLink(profile.avatar_url);
    const website = validWebLink(profile.website);
    const image = avatar ? `<img class="profile-photo" src="${escapeHTML(avatar)}" alt="${escapeHTML(name)}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'profile-initial',textContent:'${escapeHTML(initials(name))}'}))">` : `<span class="profile-initial" aria-hidden="true">${escapeHTML(initials(name))}</span>`;
    return `<article class="profile-card"><div class="card-top">${image}<div><h3>${escapeHTML(name)}</h3><span class="profile-username">${profile.username ? '@' + escapeHTML(profile.username) : 'Community member'}</span></div></div><p>${website ? 'Open to new connections and good ideas.' : 'Here to meet good people and make meaningful things.'}</p>${website ? `<a class="profile-link" href="${escapeHTML(website)}" target="_blank" rel="noopener noreferrer">Visit website ↗</a>` : ''}</article>`;
  }).join('');
  document.querySelector('#empty-state').classList.toggle('hidden', matches.length > 0);
  document.querySelector('#member-count').textContent = profiles.length ? `${profiles.length}+ community members` : 'Be the first to join';
  document.querySelector('#directory-status').textContent = `${matches.length} ${matches.length === 1 ? 'profile' : 'profiles'} to discover`;
}
function showToast(message) {
  const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3000);
}
function openAuth(mode) {
  authMode = mode; updateAuthCopy(); document.querySelector('#form-message').textContent = ''; authDialog.showModal();
}
function updateAuthCopy() {
  const signup = authMode === 'signup';
  document.querySelector('#dialog-eyebrow').textContent = signup ? 'WELCOME TO THE VERSE' : 'GOOD TO HAVE YOU BACK';
  document.querySelector('#dialog-title').textContent = signup ? 'Make your move.' : 'Pick up where you left off.';
  document.querySelector('#dialog-copy').textContent = signup ? 'Create an account to introduce yourself to the community.' : 'Log in to get back to your HUSTLEVERSE profile.';
  document.querySelector('#auth-submit').innerHTML = signup ? 'Join HUSTLEVERSE <span>↗</span>' : 'Log in <span>↗</span>';
  document.querySelector('#auth-switch').innerHTML = signup ? 'Already have an account? <button type="button" id="switch-mode">Log in</button>' : 'New around here? <button type="button" id="switch-mode">Create an account</button>';
  document.querySelector('#switch-mode').addEventListener('click', () => { authMode = signup ? 'login' : 'signup'; updateAuthCopy(); });
}
function updateAccountUI(user) {
  currentUser = user;
  document.querySelector('#login-button').classList.toggle('hidden', !!user);
  document.querySelector('#signup-button').classList.toggle('hidden', !!user);
  const account = document.querySelector('#account-button');
  account.classList.toggle('hidden', !user);
  if (user) account.textContent = initials(user.user_metadata?.full_name || user.email || 'H');
}
async function loadProfiles() {
  if (!client) { drawProfiles(); return; }
  const { data, error } = await client.from('profiles').select('id, username, full_name, avatar_url, website').order('username');
  if (error) { console.error('Could not load profiles:', error.message); document.querySelector('#directory-status').textContent = 'Profiles are temporarily unavailable'; return; }
  profiles = data || []; drawProfiles();
}
async function loadOwnProfile(user) {
  const { data, error } = await client.from('profiles').select('username, full_name, avatar_url, website').eq('id', user.id).maybeSingle();
  if (error) console.warn('Could not load your profile:', error.message);
  document.querySelector('#profile-username').value = data?.username || '';
  document.querySelector('#profile-name').value = data?.full_name || user.user_metadata?.full_name || '';
  document.querySelector('#profile-avatar').value = data?.avatar_url || '';
  document.querySelector('#profile-website').value = data?.website || '';
}

searchInput.addEventListener('input', drawProfiles);
document.querySelector('#login-button').addEventListener('click', () => openAuth('login'));
['#signup-button', '#hero-join', '#banner-join', '#manifesto-join'].forEach(selector => document.querySelector(selector).addEventListener('click', () => openAuth('signup')));
document.querySelector('#close-dialog').addEventListener('click', () => authDialog.close());
document.querySelector('#close-profile').addEventListener('click', () => profileDialog.close());
document.querySelector('#account-button').addEventListener('click', async () => { if (client && currentUser) await loadOwnProfile(currentUser); profileDialog.showModal(); });
document.querySelector('#auth-form').addEventListener('submit', async event => {
  event.preventDefault();
  const message = document.querySelector('#form-message');
  if (!client) { message.textContent = 'Connect your Supabase project to enable accounts. See README.md for setup.'; return; }
  const email = document.querySelector('#auth-email').value;
  const password = document.querySelector('#auth-password').value;
  const submit = document.querySelector('#auth-submit'); submit.disabled = true; message.textContent = 'One moment…';
  const result = authMode === 'signup' ? await client.auth.signUp({ email, password }) : await client.auth.signInWithPassword({ email, password });
  submit.disabled = false;
  if (result.error) { message.textContent = result.error.message; return; }
  if (authMode === 'signup' && !result.data.session) { message.textContent = 'Check your email to confirm your account, then log in.'; return; }
  updateAccountUI(result.data.user); authDialog.close(); showToast(authMode === 'signup' ? 'Welcome to HUSTLEVERSE!' : 'You’re back.');
  if (result.data.user) { await loadOwnProfile(result.data.user); profileDialog.showModal(); }
});
document.querySelector('#profile-form').addEventListener('submit', async event => {
  event.preventDefault(); const message = document.querySelector('#profile-message');
  if (!client || !currentUser) { message.textContent = 'Please connect Supabase and log in to save your profile.'; return; }
  const username = document.querySelector('#profile-username').value.trim().replace(/^@/, '');
  const payload = { id: currentUser.id, username: username || null, full_name: document.querySelector('#profile-name').value.trim() || null, avatar_url: document.querySelector('#profile-avatar').value.trim() || null, website: document.querySelector('#profile-website').value.trim() || null, updated_at: new Date().toISOString() };
  if ((payload.avatar_url && !validWebLink(payload.avatar_url)) || (payload.website && !validWebLink(payload.website))) { message.textContent = 'Please use a valid website URL beginning with https://'; return; }
  const { error } = await client.from('profiles').upsert(payload);
  if (error) { message.textContent = error.code === '23505' ? 'That username is already taken. Try another.' : error.message; return; }
  await loadProfiles(); profileDialog.close(); showToast('Profile saved. Your people can find you now.');
});
document.querySelector('#logout-button').addEventListener('click', async () => {
  if (client) await client.auth.signOut(); updateAccountUI(null); profileDialog.close(); showToast('You have logged out.');
});

if (client) {
  client.auth.getSession().then(({ data: { session } }) => updateAccountUI(session?.user || null));
  client.auth.onAuthStateChange((_event, session) => updateAccountUI(session?.user || null));
}
loadProfiles();

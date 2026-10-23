'use strict';
(() => {
 const connect = document.querySelector('#connect-wallet');
 const clear = document.querySelector('#disconnect-wallet');
 const address = document.querySelector('#wallet-address');
 const error = document.querySelector('#wallet-error');
 const discovered = new Map();
 let selected = null;
 let busy = false;
 const valid = value => typeof value === 'string' && /^0x[0-9a-fA-F]{40}$/.test(value);
 const reset = () => {
  address.textContent = ''; address.hidden = true; clear.hidden = true;
  connect.textContent = 'Connect MetaMask';
 };
 const showAccount = accounts => {
  if (!Array.isArray(accounts) || !valid(accounts[0])) { reset(); return; }
  address.textContent = accounts[0].slice(0, 6) + '…' + accounts[0].slice(-4);
  address.title = accounts[0]; address.hidden = false; clear.hidden = false;
  connect.textContent = 'MetaMask connected';
 };
 const detach = () => {
  selected?.removeListener?.('accountsChanged', showAccount);
  selected?.removeListener?.('disconnect', reset);
  selected = null;
 };
 window.addEventListener('eip6963:announceProvider', event => {
  const detail = event.detail;
  if (detail?.info?.rdns === 'io.metamask' && typeof detail.provider?.request === 'function') {
   discovered.set(detail.info.uuid, detail.provider);
  }
 });
 // Discovery exposes wallet providers; it does not request account access.
 window.dispatchEvent(new Event('eip6963:requestProvider'));
 connect.addEventListener('click', async () => {
  if (busy) return;
  error.hidden = true; error.textContent = ''; busy = true; connect.disabled = true;
  try {
   const injected = window.ethereum;
   const candidates = Array.isArray(injected?.providers) ? injected.providers : [injected];
   const provider = discovered.values().next().value || candidates.find(p => p?.isMetaMask && typeof p.request === 'function');
   if (!provider) throw new Error('MetaMask was not found. Open this page in the browser where MetaMask is installed and enabled.');
   // This is the only wallet RPC method used by this comparison site.
   const accounts = await provider.request({ method: 'eth_requestAccounts' });
   if (!Array.isArray(accounts) || !valid(accounts[0])) throw new Error('MetaMask did not return an account.');
   detach(); selected = provider;
   selected.on?.('accountsChanged', showAccount); selected.on?.('disconnect', reset);
   showAccount(accounts);
  } catch (caught) {
   const code = caught && typeof caught === 'object' ? caught.code : undefined;
   const message = typeof caught?.message === 'string' ? caught.message : 'MetaMask connection did not complete.';
   error.textContent = (code === undefined ? '' : `Wallet code ${code}: `) + message +
    (code === -32002 ? ' Open MetaMask to review the pending request.' : '');
   error.hidden = false;
  } finally { busy = false; connect.disabled = false; }
 });
 clear.addEventListener('click', () => {
  detach(); reset(); error.hidden = true;
  // Local display reset only. Site permissions can be revoked inside MetaMask.
  const notice = document.querySelector('#notice');
  notice.textContent = 'Address cleared from this page. To revoke site permissions, disconnect this site inside MetaMask.';
  notice.hidden = false;
 });
})();

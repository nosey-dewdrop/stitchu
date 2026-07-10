// Public frontend config. The Worker URL is not a secret (the wall endpoints
// are public and the app token never ships to the browser). Empty backend =
// local-only mode: the wall still works on this device and says so honestly.
export const BACKEND_URL = 'https://stitchu-api.damummyphus.workers.dev'; // e.g. 'https://stitchu-proxy.<account>.workers.dev' after wrangler deploy

export const THREADS = ['#3EB8AF', '#C4767B', '#B8963E', '#7A8450', '#3E5C76', '#7E5A75'];

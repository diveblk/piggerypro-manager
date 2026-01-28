
// IMPORTANT: You can replace this with your actual Client ID from Google Cloud Console
// or set it at runtime via the System Menu in the app.
const HARDCODED_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; 

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const FILE_NAME = 'piggery-pro-cloud-data.json';

let tokenClient: any;

// Check if a client ID exists in localStorage or hardcoded
export const getActiveClientId = () => {
  const stored = localStorage.getItem('piggery_google_client_id');
  if (stored && stored.length > 10) return stored;
  return HARDCODED_CLIENT_ID;
};

export const isPlaceholderId = () => {
  const id = getActiveClientId();
  return id.includes('YOUR_GOOGLE_CLIENT_ID') || id.trim() === '';
};

/**
 * Polls for the existence of Google API globals injected by external scripts.
 */
const waitForGlobals = (): Promise<void> => {
  return new Promise((resolve) => {
    const check = () => {
      // @ts-ignore
      const gapiLoaded = typeof gapi !== 'undefined';
      // @ts-ignore
      const googleLoaded = typeof google !== 'undefined' && google.accounts && google.accounts.oauth2;
      
      if (gapiLoaded && googleLoaded) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
};

export const initGoogleApi = async () => {
  await waitForGlobals();
  
  if (isPlaceholderId()) {
    console.warn('[GDRIVE] Warning: No valid Google Client ID found. Cloud sync will be disabled.');
    return;
  }

  return new Promise<void>((resolve) => {
    // @ts-ignore
    gapi.load('client', async () => {
      try {
        // @ts-ignore
        await gapi.client.init({
          discoveryDocs: DISCOVERY_DOCS,
        });
        
        // @ts-ignore
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: getActiveClientId(),
          scope: SCOPES,
          callback: (resp: any) => {
            console.log('[GDRIVE] Global token callback triggered', resp);
          },
        });
        resolve();
      } catch (error) {
        console.error('[GDRIVE] Failed to initialize GAPI client:', error);
        resolve();
      }
    });
  });
};

export const signIn = () => {
  return new Promise<string>((resolve, reject) => {
    if (isPlaceholderId()) {
      reject(new Error("Please configure your Google Client ID in the System Menu first."));
      return;
    }
    
    if (!tokenClient) {
      // If client wasn't initialized (e.g. ID was set after load), try one-time init
      initGoogleApi().then(() => {
        if (!tokenClient) {
          reject(new Error("Google API failed to initialize."));
        } else {
          requestToken(resolve, reject);
        }
      });
      return;
    }

    requestToken(resolve, reject);
  });
};

const requestToken = (resolve: any, reject: any) => {
  tokenClient.callback = (resp: any) => {
    if (resp.error !== undefined) {
      reject(resp);
      return;
    }
    resolve(resp.access_token);
  };
  tokenClient.requestAccessToken({ prompt: 'consent' });
};

async function findFile() {
  try {
    // @ts-ignore
    const response = await gapi.client.drive.files.list({
      q: `name = '${FILE_NAME}' and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });
    return response.result.files[0];
  } catch (error) {
    console.error('[GDRIVE] Error searching for file:', error);
    throw error;
  }
}

export const saveToDrive = async (data: any) => {
  const file = await findFile();
  const metadata = { name: FILE_NAME, mimeType: 'application/json' };
  const content = JSON.stringify(data);
  const boundary = '-------piggery_pro_boundary_314159';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    content +
    close_delim;

  const path = file 
    ? `/upload/drive/v3/files/${file.id}?uploadType=multipart` 
    : '/upload/drive/v3/files?uploadType=multipart';
  
  const method = file ? 'PATCH' : 'POST';

  // @ts-ignore
  const response = await gapi.client.request({
    path,
    method,
    params: { uploadType: 'multipart' },
    headers: { 'Content-Type': 'multipart/related; boundary="' + boundary + '"' },
    body: multipartRequestBody,
  });
  return response;
};

export const loadFromDrive = async () => {
  const file = await findFile();
  if (!file) return null;

  // @ts-ignore
  const response = await gapi.client.drive.files.get({
    fileId: file.id,
    alt: 'media',
  });
  return response.result;
};

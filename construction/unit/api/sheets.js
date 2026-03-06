// Vercel serverless function for Google Sheets API
// Deploy this to Vercel and it will handle all Google Sheets operations

const { google } = require('googleapis');

const SHEET_ID = process.env.VITE_GOOGLE_SHEET_ID;
const SHEET_NAMES = {
  chores: 'Chores',
  selfCare: 'SelfCare',
  bathRitual: 'BathRitual',
  fridge: 'Fridge',
  nonFood: 'NonFood',
  bathroomClean: 'BathroomClean',
  pantry: 'Pantry',
  gym: 'Gym',
  rto: 'RTO',
  firstAid: 'FirstAid'
};

// Initialize Google Sheets API with service account
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

async function appendItem(boardType, item) {
  const sheetName = SHEET_NAMES[boardType];
  if (!sheetName) throw new Error(`Unknown board type: ${boardType}`);

  const values = [[
    item.id,
    item.name,
    item.category || '',
    item.status || '',
    String(item.completed || false),
    item.timestamp || new Date().toISOString(),
    item.notes || ''
  ]];

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:G`,
    valueInputOption: 'USER_ENTERED',
    values
  });

  return { success: true, message: `Item appended to ${sheetName}` };
}

async function updateItem(boardType, itemId, updates) {
  const sheetName = SHEET_NAMES[boardType];
  if (!sheetName) throw new Error(`Unknown board type: ${boardType}`);

  // Find the row with matching ID
  const getResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:A`
  });

  const rows = getResponse.data.values || [];
  const rowIndex = rows.findIndex(row => row[0] === itemId);
  
  if (rowIndex === -1) throw new Error(`Item not found: ${itemId}`);

  // Update the row
  const updateValues = [[]];
  if (updates.name) updateValues[0][1] = updates.name;
  if (updates.completed !== undefined) updateValues[0][4] = String(updates.completed);
  if (updates.status) updateValues[0][3] = updates.status;
  if (updates.notes) updateValues[0][6] = updates.notes;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A${rowIndex + 1}:G${rowIndex + 1}`,
    valueInputOption: 'USER_ENTERED',
    values: updateValues
  });

  return { success: true, message: `Item updated in ${sheetName}` };
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { boardType, item, itemId, updates } = req.body;

    if (req.url === '/api/items/append' && req.method === 'POST') {
      const result = await appendItem(boardType, item);
      res.status(200).json(result);
    } else if (req.url === '/api/items/update' && req.method === 'POST') {
      const result = await updateItem(boardType, itemId, updates);
      res.status(200).json(result);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
};

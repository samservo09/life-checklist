const { google } = require('googleapis');

const SHEET_ID = process.env.VITE_GOOGLE_SHEET_ID;

const SHEET_NAMES = {
  chores: 'Chores',
  selfCare: 'SelfCare',
  bathRitual: 'BathRitual',
  bathroomClean: 'BathroomClean',
  gym: 'Gym',
  rto: 'RTO',
  fridge: 'Fridge',
  nonFood: 'NonFood',
  pantry: 'Pantry',
  firstAid: 'FirstAid'
};

const CHECKLIST_BOARDS = ['chores', 'selfCare', 'bathRitual', 'bathroomClean', 'gym', 'rto'];
const INVENTORY_BOARDS = ['fridge', 'nonFood', 'pantry', 'firstAid'];

let sheets;

function initializeSheets() {
  try {
    const credentialsStr = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!credentialsStr) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not set');
    
    const credentials = JSON.parse(credentialsStr);
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    sheets = google.sheets({ version: 'v4', auth });
  } catch (e) {
    console.error('Failed to initialize sheets:', e);
    throw e;
  }
}

async function getBoard(boardType) {
  const sheetName = SHEET_NAMES[boardType];
  if (!sheetName) throw new Error(`Unknown board: ${boardType}`);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:H`
  });

  const rows = response.data.values || [];
  if (rows.length <= 1) return { items: [] };

  const items = rows.slice(1).map(row => ({
    id: row[0] || '',
    name: row[1] || '',
    category: row[2] || '',
    status: row[3] || '',
    completed: row[4] === 'true',
    timestamp: row[5] || '',
    notes: row[6] || '',
    completedAt: row[7] || ''
  }));

  return { items };
}

async function appendItem(boardType, item) {
  const sheetName = SHEET_NAMES[boardType];
  if (!sheetName) throw new Error(`Unknown board: ${boardType}`);

  const values = [[
    item.id,
    item.name,
    item.category || '',
    item.status || '',
    item.completed ? 'true' : 'false',
    item.timestamp || new Date().toISOString(),
    item.notes || '',
    ''
  ]];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:H`,
    valueInputOption: 'USER_ENTERED',
    values
  });

  return { success: true };
}

async function toggleItem(boardType, itemId) {
  const sheetName = SHEET_NAMES[boardType];
  if (!sheetName) throw new Error(`Unknown board: ${boardType}`);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:H`
  });

  const rows = response.data.values || [];
  const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[0] === itemId);
  
  if (rowIndex === -1) throw new Error(`Item not found: ${itemId}`);

  const currentCompleted = rows[rowIndex][4] === 'true';
  const newCompleted = !currentCompleted;
  const completedAt = newCompleted ? new Date().toISOString() : '';

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!E${rowIndex + 1}:H${rowIndex + 1}`,
    valueInputOption: 'USER_ENTERED',
    values: [[newCompleted ? 'true' : 'false', '', '', completedAt]]
  });

  return { success: true };
}

async function updateItem(boardType, itemId, updates) {
  const sheetName = SHEET_NAMES[boardType];
  if (!sheetName) throw new Error(`Unknown board: ${boardType}`);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:H`
  });

  const rows = response.data.values || [];
  const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[0] === itemId);
  
  if (rowIndex === -1) throw new Error(`Item not found: ${itemId}`);

  const row = rows[rowIndex];
  const updateRow = [
    row[0],
    updates.name !== undefined ? updates.name : row[1],
    updates.category !== undefined ? updates.category : row[2],
    updates.status !== undefined ? updates.status : row[3],
    updates.completed !== undefined ? (updates.completed ? 'true' : 'false') : row[4],
    row[5],
    updates.notes !== undefined ? updates.notes : row[6],
    row[7]
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A${rowIndex + 1}:H${rowIndex + 1}`,
    valueInputOption: 'USER_ENTERED',
    values: [updateRow]
  });

  return { success: true };
}

async function resetBoards() {
  const results = {};

  for (const boardType of CHECKLIST_BOARDS) {
    const sheetName = SHEET_NAMES[boardType];
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A:H`
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) continue;

    const updates = rows.slice(1).map((row, idx) => [
      row[0],
      row[1],
      row[2],
      row[3],
      'false',
      row[5],
      row[6],
      ''
    ]);

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A2:H${rows.length}`,
      valueInputOption: 'USER_ENTERED',
      values: updates
    });

    results[boardType] = 'reset';
  }

  return { success: true, results };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (!sheets) initializeSheets();

    const { action, board } = req.query;
    const body = req.body || {};

    if (req.method === 'GET' && board) {
      const result = await getBoard(board);
      return res.status(200).json(result);
    }

    if (req.method === 'POST') {
      if (action === 'append') {
        const result = await appendItem(body.boardType, body.item);
        return res.status(200).json(result);
      }
      if (action === 'toggle') {
        const result = await toggleItem(body.boardType, body.itemId);
        return res.status(200).json(result);
      }
      if (action === 'update') {
        const result = await updateItem(body.boardType, body.itemId, body.updates);
        return res.status(200).json(result);
      }
      if (action === 'reset') {
        const result = await resetBoards();
        return res.status(200).json(result);
      }
    }

    res.status(400).json({ error: 'Invalid request' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
};

# Vercel Testing Guide

## Prerequisites
- CRON_SECRET added to Vercel environment variables: `ba971c4b-c2f2-4112-8919-97fcbf56ede6`
- Code pushed to main branch (✅ Done)
- Vercel should auto-deploy within 1-2 minutes

## Testing Steps

### 1. Wait for Vercel Deployment
- Go to https://vercel.com/dashboard
- Click on **life-checklist** project
- Wait for deployment to complete (should show "Ready")

### 2. Test GET Endpoint (Fetch Board)
Open browser console and run:
```javascript
fetch('https://life-checklist-iota.vercel.app/api/sheets?board=chores')
  .then(r => r.json())
  .then(d => console.log(d))
```

Expected response:
```json
{
  "items": [
    {
      "id": "...",
      "name": "...",
      "category": "...",
      "status": "...",
      "completed": false,
      "timestamp": "...",
      "notes": "...",
      "completedAt": ""
    }
  ]
}
```

### 3. Test POST Endpoint (Append Item)
```javascript
fetch('https://life-checklist-iota.vercel.app/api/sheets?action=append', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    boardType: 'chores',
    item: {
      id: 'test-' + Date.now(),
      name: 'Test Item',
      category: 'test',
      status: 'active',
      completed: false,
      timestamp: new Date().toISOString(),
      notes: 'Testing'
    }
  })
})
  .then(r => r.json())
  .then(d => console.log(d))
```

Expected response:
```json
{ "success": true }
```

### 4. Test Toggle Endpoint
First, get an item ID from step 2, then:
```javascript
fetch('https://life-checklist-iota.vercel.app/api/sheets?action=toggle', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    boardType: 'chores',
    itemId: 'YOUR_ITEM_ID_HERE'
  })
})
  .then(r => r.json())
  .then(d => console.log(d))
```

### 5. Test Update Endpoint
```javascript
fetch('https://life-checklist-iota.vercel.app/api/sheets?action=update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    boardType: 'chores',
    itemId: 'YOUR_ITEM_ID_HERE',
    updates: {
      name: 'Updated Name',
      notes: 'Updated notes'
    }
  })
})
  .then(r => r.json())
  .then(d => console.log(d))
```

### 6. Test Reset Endpoint (Cron)
This requires the CRON_SECRET header:
```javascript
fetch('https://life-checklist-iota.vercel.app/api/reset', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ba971c4b-c2f2-4112-8919-97fcbf56ede6'
  }
})
  .then(r => r.json())
  .then(d => console.log(d))
```

Expected response:
```json
{
  "success": true,
  "results": {
    "chores": "reset",
    "selfCare": "reset",
    ...
  }
}
```

## Troubleshooting

### 404 Errors
- Check that Vercel deployment is complete
- Verify environment variables are set in Vercel dashboard
- Check Vercel function logs: Dashboard → Deployments → Logs

### 500 Errors
- Check Vercel function logs for error details
- Verify GOOGLE_SERVICE_ACCOUNT_KEY is properly formatted
- Ensure VITE_GOOGLE_SHEET_ID is correct

### Cron Job Not Running
- Verify CRON_SECRET is set in Vercel
- Check Vercel dashboard for cron execution logs
- Cron runs at 16:00 UTC (midnight Philippine time)

## Next Steps
1. Test all endpoints above
2. Use the app normally at https://life-checklist-iota.vercel.app
3. Monitor Vercel logs for any errors
4. If issues occur, check the error logs and report them

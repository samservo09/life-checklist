// Data Models and localStorage Management

class ChecklistItem {
  constructor(id, name, category = 'daily', completed = false) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.completed = completed;
    this.completedAt = null;
    this.notes = '';
    this.order = 0;
  }
}

class InventoryItem {
  constructor(id, name, category = '', status = 'half') {
    this.id = id;
    this.name = name;
    this.category = category;
    this.status = status; // 'low', 'half', 'full'
    this.quantity = 0;
    this.expiryDate = null;
    this.notes = '';
  }
}

class RitualStep {
  constructor(id, name, daySchedule = 'universal', completed = false) {
    this.id = id;
    this.name = name;
    this.daySchedule = daySchedule; // 'mwfsat', 'tthsun', 'universal'
    this.completed = completed;
    this.completedAt = null;
    this.order = 0;
  }
}

// Initial Data
function getInitialData() {
  return {
    boards: {
      chores: {
        items: [
          new ChecklistItem('chores-1', 'Cooking food/meal prep baon', 'daily'),
          new ChecklistItem('chores-2', 'Dishes (every night)', 'daily'),
          new ChecklistItem('chores-3', 'Wipe kitchen counter', 'daily'),
          new ChecklistItem('chores-4', 'Wipe/tidy up desk', 'daily'),
          new ChecklistItem('chores-5', 'Floor sweep', 'daily'),
          new ChecklistItem('chores-6', 'Laundry (low energy)', 'daily'),
          new ChecklistItem('chores-7', 'Wipe one surface', 'daily'),
          new ChecklistItem('chores-8', 'Take out trash bag', 'daily'),
          new ChecklistItem('chores-9', 'Do dishes for 5 mins', 'daily'),
          new ChecklistItem('chores-10', 'Put 10 things away', 'daily'),
          new ChecklistItem('chores-11', 'Clean toilet', 'weekly'),
          new ChecklistItem('chores-12', 'Mop/sweep floor', 'weekly'),
          new ChecklistItem('chores-13', 'Fridge toss check', 'weekly'),
          new ChecklistItem('chores-14', 'Deep clean sink', 'weekly'),
          new ChecklistItem('chores-15', 'Take out all trash', 'weekly'),
          new ChecklistItem('chores-16', 'Laundry (bring to laundry)', 'biweekly'),
          new ChecklistItem('chores-17', 'Check non-food stock', 'biweekly'),
          new ChecklistItem('chores-18', 'Check food stock', 'biweekly'),
          new ChecklistItem('chores-19', 'Check first-aid kit stock', 'biweekly'),
          new ChecklistItem('chores-20', 'Fridge full clean', 'monthly'),
          new ChecklistItem('chores-21', 'Declutter stuff', 'monthly'),
        ],
        lowEnergyMode: false,
        completionPercentage: 0
      },
      selfCare: {
        items: [
          new ChecklistItem('selfcare-1', 'Face wash (morning)', 'morning'),
          new ChecklistItem('selfcare-2', 'Brush teeth (morning)', 'morning'),
          new ChecklistItem('selfcare-3', 'Moisturizer (morning)', 'morning'),
          new ChecklistItem('selfcare-4', 'Sunscreen (morning)', 'morning'),
          new ChecklistItem('selfcare-5', 'Bath (evening)', 'evening'),
          new ChecklistItem('selfcare-6', 'Brush teeth (evening)', 'evening'),
          new ChecklistItem('selfcare-7', 'Micellar water (evening)', 'evening'),
          new ChecklistItem('selfcare-8', 'Moisturizer (evening)', 'evening'),
          new ChecklistItem('selfcare-9', 'Take meds (evening)', 'evening'),
        ],
        completionPercentage: 0
      },
      bathRitual: {
        items: [
          new RitualStep('bath-1', 'Shampoo + Selsun blue', 'mwfsat'),
          new RitualStep('bath-2', 'Soap', 'mwfsat'),
          new RitualStep('bath-3', 'Conditioner', 'mwfsat'),
          new RitualStep('bath-4', 'Clarifying shampoo', 'tthsun'),
          new RitualStep('bath-5', 'Soap', 'tthsun'),
          new RitualStep('bath-6', 'Conditioner', 'tthsun'),
          new RitualStep('bath-7', 'Scrub with body wash', 'tthsun'),
          new RitualStep('bath-8', 'The Ordinary Serum', 'tthsun'),
          new RitualStep('bath-9', 'Body oil', 'universal'),
          new RitualStep('bath-10', 'Lotion', 'universal'),
          new RitualStep('bath-11', 'Powder', 'universal'),
          new RitualStep('bath-12', 'Perfume', 'universal'),
        ],
        currentVariant: 'mwfsat',
        completionPercentage: 0
      },
      fridge: {
        items: [
          new InventoryItem('fridge-1', 'Milk', 'dairy', 'half'),
          new InventoryItem('fridge-2', 'Eggs', 'dairy', 'half'),
          new InventoryItem('fridge-3', 'Butter', 'dairy', 'half'),
          new InventoryItem('fridge-4', 'Vegetables', 'produce', 'half'),
          new InventoryItem('fridge-5', 'Fruits', 'produce', 'half'),
          new InventoryItem('fridge-6', 'Leftover rice', 'cooked', 'half'),
          new InventoryItem('fridge-7', 'Leftover curry', 'cooked', 'half'),
        ],
        completionPercentage: 0
      },
      nonFood: {
        items: [
          new InventoryItem('nonfood-1', 'Paper towel', 'supplies', 'half'),
          new InventoryItem('nonfood-2', 'Napkin', 'supplies', 'half'),
          new InventoryItem('nonfood-3', 'Hand soap', 'supplies', 'half'),
          new InventoryItem('nonfood-4', 'Trash bag', 'supplies', 'half'),
          new InventoryItem('nonfood-5', 'Laundry detergent', 'laundry', 'half'),
          new InventoryItem('nonfood-6', 'Laundry fab con', 'laundry', 'half'),
          new InventoryItem('nonfood-7', 'Dish soap', 'cleaning', 'half'),
          new InventoryItem('nonfood-8', 'Floor cleaner', 'cleaning', 'half'),
          new InventoryItem('nonfood-9', 'Bathroom cleaner', 'cleaning', 'half'),
          new InventoryItem('nonfood-10', 'Daz cleaner', 'cleaning', 'half'),
          new InventoryItem('nonfood-11', 'Dish sponge', 'cleaning', 'half'),
        ],
        completionPercentage: 0
      },
      bathroomClean: {
        items: [
          new ChecklistItem('bathroom-1', 'Toilet bowl scrub', 'daily'),
          new ChecklistItem('bathroom-2', 'Toilet seat & lid wipe', 'daily'),
          new ChecklistItem('bathroom-3', 'Sink scrub', 'daily'),
          new ChecklistItem('bathroom-4', 'Tap and handles wipe', 'daily'),
          new ChecklistItem('bathroom-5', 'Mirror wipe', 'daily'),
          new ChecklistItem('bathroom-6', 'Counter wipe', 'daily'),
          new ChecklistItem('bathroom-7', 'Floor sweep', 'daily'),
          new ChecklistItem('bathroom-8', 'Floor mop', 'daily'),
          new ChecklistItem('bathroom-9', 'Shower walls wipe', 'daily'),
          new ChecklistItem('bathroom-10', 'Refill soap/shampoo', 'daily'),
        ],
        completionPercentage: 0
      },
      pantry: {
        items: [
          new InventoryItem('pantry-1', 'Rice', 'grains', 'half'),
          new InventoryItem('pantry-2', 'Salt', 'seasonings', 'half'),
          new InventoryItem('pantry-3', 'Sugar', 'seasonings', 'half'),
          new InventoryItem('pantry-4', 'Soy sauce', 'seasonings', 'half'),
          new InventoryItem('pantry-5', 'Vinegar', 'seasonings', 'half'),
          new InventoryItem('pantry-6', 'Cooking oil', 'oils', 'half'),
          new InventoryItem('pantry-7', 'Pasta', 'grains', 'half'),
          new InventoryItem('pantry-8', 'Canned tuna', 'canned', 'half'),
          new InventoryItem('pantry-9', 'Oats', 'grains', 'half'),
          new InventoryItem('pantry-10', 'Daily fix nuts', 'snacks', 'half'),
          new InventoryItem('pantry-11', 'Milk', 'dairy', 'half'),
          new InventoryItem('pantry-12', 'Ketchup', 'condiments', 'half'),
          new InventoryItem('pantry-13', 'Sandwich spread', 'condiments', 'half'),
          new InventoryItem('pantry-14', 'Bread', 'bakery', 'half'),
        ],
        completionPercentage: 0
      },
      gym: {
        items: [
          new ChecklistItem('gym-1', 'Protein drink', 'daily'),
          new ChecklistItem('gym-2', 'Water bottle', 'daily'),
          new ChecklistItem('gym-3', 'Bath towel', 'daily'),
          new ChecklistItem('gym-4', 'Slippers/crocs', 'daily'),
          new ChecklistItem('gym-5', 'At least 1 fruit/snack', 'daily'),
          new ChecklistItem('gym-6', 'Clothes to change into', 'daily'),
          new ChecklistItem('gym-7', 'Towel', 'daily'),
          new ChecklistItem('gym-8', 'Gym pouch', 'daily'),
          new ChecklistItem('gym-9', 'ID for gym', 'daily'),
          new ChecklistItem('gym-10', 'Keys', 'daily'),
        ],
        completionPercentage: 0
      },
      rto: {
        items: [
          new ChecklistItem('rto-1', 'Keys', 'daily'),
          new ChecklistItem('rto-2', 'Wallet', 'daily'),
          new ChecklistItem('rto-3', 'Company ID', 'daily'),
          new ChecklistItem('rto-4', 'Chargers', 'daily'),
          new ChecklistItem('rto-5', 'Eye glasses', 'daily'),
          new ChecklistItem('rto-6', 'Hygiene pouch', 'daily'),
          new ChecklistItem('rto-7', 'Water tumbler', 'daily'),
          new ChecklistItem('rto-8', 'Lunch', 'daily'),
          new ChecklistItem('rto-9', 'Fan', 'daily'),
        ],
        completionPercentage: 0
      },
      firstAid: {
        items: [
          new InventoryItem('firstaid-1', 'Bandages', 'supplies', 'half'),
          new InventoryItem('firstaid-2', 'Antiseptic cream', 'supplies', 'half'),
          new InventoryItem('firstaid-3', 'Pain reliever', 'medication', 'half'),
          new InventoryItem('firstaid-4', 'Antihistamine', 'medication', 'half'),
          new InventoryItem('firstaid-5', 'Thermometer', 'equipment', 'half'),
          new InventoryItem('firstaid-6', 'Gauze pads', 'supplies', 'half'),
          new InventoryItem('firstaid-7', 'Medical tape', 'supplies', 'half'),
          new InventoryItem('firstaid-8', 'Tweezers', 'equipment', 'half'),
        ],
        completionPercentage: 0
      }
    },
    lastSync: null,
    consistencyLog: []
  };
}

// localStorage Functions
function saveData(data) {
  localStorage.setItem('lifeOS_data', JSON.stringify(data));
}

function loadData() {
  const data = localStorage.getItem('lifeOS_data');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Error parsing localStorage data:', e);
      return getInitialData();
    }
  }
  return getInitialData();
}

// CRUD functions are defined in utils.js

function resetBoard(boardType) {
  const data = loadData();
  if (data.boards[boardType]) {
    data.boards[boardType].items.forEach(item => {
      item.completed = false;
      item.completedAt = null;
    });
    updateCompletionPercentage(boardType, data);
    saveData(data);
    logAction(boardType, 'board', 'reset', `${boardType} reset`, null);
  }
}

function exportData() {
  const data = loadData();
  return JSON.stringify(data, null, 2);
}

function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    saveData(data);
    return true;
  } catch (e) {
    console.error('Error importing data:', e);
    return false;
  }
}

function clearAllData() {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    localStorage.removeItem('lifeOS_data');
    location.reload();
  }
}

// Initialize data on first load
if (!localStorage.getItem('lifeOS_data')) {
  saveData(getInitialData());
}

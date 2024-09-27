import  pool  from '../config/database.js';

const checkShopOwnership = async (userId, shopId) => {
    const [rows] = await pool.execute('SELECT id FROM shops WHERE id = ? AND owner_id = ?', [shopId, userId]);
    return rows.length > 0;
  };
  
  // Function to increment alert count for a user
const incrementAlertCount = async (userId) => {
    await pool.execute('UPDATE users SET alert_count = alert_count + 1 WHERE id = ?', [userId]);
  };

  export { checkShopOwnership, incrementAlertCount };
// // lib/db/dashdata.js
// import { getDashDataCollection } from '../mongodb';

// /**
//  * Get user dashboard data
//  * @param {string} userId - User ID
//  * @returns {Promise<Object|null>}
//  */
// export async function getUserDashboard(userId) {
//   try {
//     const dashDataCollection = await getDashDataCollection();
//     let dashData = await dashDataCollection.findOne({ userId });
    
//     if (!dashData) {
//       dashData = await createDefaultDashboard(userId);
//     }
    
//     return dashData;
//   } catch (error) {
//     console.error('Error getting user dashboard:', error);
//     return null;
//   }
// }

// /**
//  * Create default dashboard data for new user
//  * @param {string} userId - User ID
//  * @returns {Promise<Object>}
//  */
// export async function createDefaultDashboard(userId) {
//   try {
//     const dashDataCollection = await getDashDataCollection();
//     const defaultData = {
//       userId,
//       bills: [],
//       recentTransactions: [],
//       paymentMethods: [],
//       preferences: {
//         theme: 'light',
//         notifications: true,
//         currency: 'USD',
//       },
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };
//     const result = await dashDataCollection.insertOne(defaultData);
//     return { ...defaultData, _id: result.insertedId };
//   } catch (error) {
//     console.error('Error creating default dashboard:', error);
//     throw error;
//   }
// }

// /**
//  * Add bill to user dashboard
//  * @param {string} userId - User ID
//  * @param {Object} billData - Bill data
//  * @returns {Promise<boolean>}
//  */
// export async function addBill(userId, billData) {
//   try {
//     const dashDataCollection = await getDashDataCollection();
//     const newBill = {
//       id: `bill_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
//       ...billData,
//       status: billData.status || 'unpaid',
//       createdAt: new Date(),
//     };
//     const result = await dashDataCollection.updateOne(
//       { userId },
//       { 
//         $push: { bills: newBill },
//         $set: { updatedAt: new Date() }
//       }
//     );
//     return result.modifiedCount > 0;
//   } catch (error) {
//     console.error('Error adding bill:', error);
//     throw error;
//   }
// }

// /**
//  * Update bill status
//  * @param {string} userId - User ID
//  * @param {string} billId - Bill ID
//  * @param {string} status - New status ('paid', 'unpaid', 'overdue')
//  * @returns {Promise<boolean>}
//  */
// export async function updateBillStatus(userId, billId, status) {
//   try {
//     const dashDataCollection = await getDashDataCollection();
//     const updateData = {
//       'bills.$.status': status,
//       updatedAt: new Date(),
//     };
    
//     if (status === 'paid') {
//       updateData['bills.$.paidDate'] = new Date();
//     }
    
//     const result = await dashDataCollection.updateOne(
//       { userId, 'bills.id': billId },
//       { $set: updateData }
//     );
//     return result.modifiedCount > 0;
//   } catch (error) {
//     console.error('Error updating bill status:', error);
//     throw error;
//   }
// }

// /**
//  * Delete a bill
//  * @param {string} userId - User ID
//  * @param {string} billId - Bill ID
//  * @returns {Promise<boolean>}
//  */
// export async function deleteBill(userId, billId) {
//   try {
//     const dashDataCollection = await getDashDataCollection();
//     const result = await dashDataCollection.updateOne(
//       { userId },
//       { 
//         $pull: { bills: { id: billId } },
//         $set: { updatedAt: new Date() }
//       }
//     );
//     return result.modifiedCount > 0;
//   } catch (error) {
//     console.error('Error deleting bill:', error);
//     throw error;
//   }
// }

// /**
//  * Add transaction to user dashboard
//  * @param {string} userId - User ID
//  * @param {Object} transactionData - Transaction data
//  * @returns {Promise<boolean>}
//  */
// export async function addTransaction(userId, transactionData) {
//   try {
//     const dashDataCollection = await getDashDataCollection();
//     const newTransaction = {
//       id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
//       ...transactionData,
//       date: new Date(),
//       status: transactionData.status || 'completed',
//     };
//     const result = await dashDataCollection.updateOne(
//       { userId },
//       { 
//         $push: { 
//           recentTransactions: { 
//             $each: [newTransaction], 
//             $position: 0, 
//             $slice: 20 
//           } 
//         },
//         $set: { updatedAt: new Date() }
//       }
//     );
//     return result.modifiedCount > 0;
//   } catch (error) {
//     console.error('Error adding transaction:', error);
//     throw error;
//   }
// }

// /**
//  * Get upcoming bills (unpaid and due soon)
//  * @param {string} userId - User ID
//  * @returns {Promise<Array>}
//  */
// export async function getUpcomingBills(userId) {
//   try {
//     const dashData = await getUserDashboard(userId);
//     if (!dashData || !dashData.bills) return [];
    
//     const now = new Date();
//     const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
//     return dashData.bills
//       .filter(bill => 
//         bill.status === 'unpaid' && 
//         new Date(bill.dueDate) <= thirtyDaysFromNow
//       )
//       .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
//   } catch (error) {
//     console.error('Error getting upcoming bills:', error);
//     return [];
//   }
// }

// /**
//  * Get recent paid bills
//  * @param {string} userId - User ID
//  * @param {number} limit - Maximum number to return
//  * @returns {Promise<Array>}
//  */
// export async function getRecentPaidBills(userId, limit = 10) {
//   try {
//     const dashData = await getUserDashboard(userId);
//     if (!dashData || !dashData.bills) return [];
    
//     return dashData.bills
//       .filter(bill => bill.status === 'paid')
//       .sort((a, b) => new Date(b.paidDate || b.dueDate) - new Date(a.paidDate || a.dueDate))
//       .slice(0, limit);
//   } catch (error) {
//     console.error('Error getting recent paid bills:', error);
//     return [];
//   }
// }

// /**
//  * Get all bills across all users (admin only)
//  * @param {number} limit - Maximum number to return
//  * @returns {Promise<Array>}
//  */
// export async function getAllBills(limit = 100) {
//   try {
//     const dashDataCollection = await getDashDataCollection();
//     const allDashData = await dashDataCollection
//       .find({})
//       .limit(limit)
//       .toArray();
    
//     const allBills = [];
//     allDashData.forEach(dash => {
//       if (dash.bills) {
//         dash.bills.forEach(bill => {
//           allBills.push({
//             ...bill,
//             userId: dash.userId,
//           });
//         });
//       }
//     });
    
//     return allBills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//   } catch (error) {
//     console.error('Error getting all bills:', error);
//     return [];
//   }
// }

// lib/db/dashdata.js
import { getDashDataCollection } from '../mongodb';

/**
 * Get user dashboard data
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>}
 */
export async function getUserDashboard(userId) {
  try {
    const dashDataCollection = await getDashDataCollection();
    let dashData = await dashDataCollection.findOne({ userId });
    
    if (!dashData) {
      dashData = await createDefaultDashboard(userId);
    } else {
      let needsUpdate = false;
      const updateData = {};

      if (!dashData.totalBalance) {
        updateData.totalBalance = { amount: "0.00", change: "0.0%" };
        needsUpdate = true;
      }
      if (!dashData.analysisBalance) {
        updateData.analysisBalance = { total: "0.00", stocks: "45%", crypto: "35%", etfs: "20%" };
        needsUpdate = true;
      }
      if (dashData.analysisSummary === undefined) {
        updateData.analysisSummary = "";
        needsUpdate = true;
      }
      // ✅ NEW: ensure analysisNote exists (number)
      if (dashData.analysisNote === undefined) {
        updateData.analysisNote = 0;
        needsUpdate = true;
      }

      if (needsUpdate) {
        updateData.updatedAt = new Date();
        await dashDataCollection.updateOne(
          { userId },
          { $set: updateData }
        );
        dashData = { ...dashData, ...updateData };
      }
    }
    
    return dashData;
  } catch (error) {
    console.error('Error getting user dashboard:', error);
    return null;
  }
}

/**
 * Create default dashboard data for new user
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export async function createDefaultDashboard(userId) {
  try {
    const dashDataCollection = await getDashDataCollection();
    const defaultData = {
      userId,
      totalBalance: { amount: "0.00", change: "0.0%" },
      analysisBalance: { total: "0.00", stocks: "45%", crypto: "35%", etfs: "20%" },
      analysisSummary: "",
      analysisNote: 0, // ✅ NEW field (number)
      bills: [
        {
          id: `bill_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          name: "gas fee",
          amount: 30.00,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "pending",
          category: "General"
        }
      ],
      recentTransactions: [],
      paymentMethods: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await dashDataCollection.insertOne(defaultData);
    return { ...defaultData, _id: result.insertedId };
  } catch (error) {
    console.error('Error creating default dashboard:', error);
    throw error;
  }
}

/**
 * Add bill to user dashboard
 * @param {string} userId - User ID
 * @param {Object} billData - Bill data
 * @returns {Promise<boolean>}
 */
export async function addBill(userId, billData) {
  try {
    const dashDataCollection = await getDashDataCollection();
    const newBill = {
      id: `bill_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      ...billData,
      status: billData.status || 'unpaid',
      createdAt: new Date(),
    };
    const result = await dashDataCollection.updateOne(
      { userId },
      { 
        $push: { bills: newBill },
        $set: { updatedAt: new Date() }
      }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error adding bill:', error);
    throw error;
  }
}

/**
 * Update bill status
 * @param {string} userId - User ID
 * @param {string} billId - Bill ID
 * @param {string} status - New status ('paid', 'unpaid', 'overdue')
 * @returns {Promise<boolean>}
 */
export async function updateBillStatus(userId, billId, status) {
  try {
    const dashDataCollection = await getDashDataCollection();
    const updateData = {
      'bills.$.status': status,
      updatedAt: new Date(),
    };
    
    if (status === 'paid') {
      updateData['bills.$.paidDate'] = new Date();
    }
    
    const result = await dashDataCollection.updateOne(
      { userId, 'bills.id': billId },
      { $set: updateData }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating bill status:', error);
    throw error;
  }
}

/**
 * Delete a bill
 * @param {string} userId - User ID
 * @param {string} billId - Bill ID
 * @returns {Promise<boolean>}
 */
export async function deleteBill(userId, billId) {
  try {
    const dashDataCollection = await getDashDataCollection();
    const result = await dashDataCollection.updateOne(
      { userId },
      { 
        $pull: { bills: { id: billId } },
        $set: { updatedAt: new Date() }
      }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error deleting bill:', error);
    throw error;
  }
}

/**
 * Add transaction to user dashboard
 * @param {string} userId - User ID
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<boolean>}
 */
export async function addTransaction(userId, transactionData) {
  try {
    const dashDataCollection = await getDashDataCollection();
    const newTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      ...transactionData,
      date: new Date(),
      status: transactionData.status || 'completed',
    };
    const result = await dashDataCollection.updateOne(
      { userId },
      { 
        $push: { 
          recentTransactions: { 
            $each: [newTransaction], 
            $position: 0, 
            $slice: 20 
          } 
        },
        $set: { updatedAt: new Date() }
      }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
}

/**
 * Get upcoming bills (unpaid and due soon)
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
export async function getUpcomingBills(userId) {
  try {
    const dashData = await getUserDashboard(userId);
    if (!dashData || !dashData.bills) return [];
    
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return dashData.bills
      .filter(bill => 
        bill.status === 'unpaid' && 
        new Date(bill.dueDate) <= thirtyDaysFromNow
      )
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  } catch (error) {
    console.error('Error getting upcoming bills:', error);
    return [];
  }
}

/**
 * Get recent paid bills
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number to return
 * @returns {Promise<Array>}
 */
export async function getRecentPaidBills(userId, limit = 10) {
  try {
    const dashData = await getUserDashboard(userId);
    if (!dashData || !dashData.bills) return [];
    
    return dashData.bills
      .filter(bill => bill.status === 'paid')
      .sort((a, b) => new Date(b.paidDate || b.dueDate) - new Date(a.paidDate || a.dueDate))
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting recent paid bills:', error);
    return [];
  }
}

/**
 * Get all bills across all users (admin only)
 * @param {number} limit - Maximum number to return
 * @returns {Promise<Array>}
 */
export async function getAllBills(limit = 100) {
  try {
    const dashDataCollection = await getDashDataCollection();
    const allDashData = await dashDataCollection
      .find({})
      .limit(limit)
      .toArray();
    
    const allBills = [];
    allDashData.forEach(dash => {
      if (dash.bills) {
        dash.bills.forEach(bill => {
          allBills.push({
            ...bill,
            userId: dash.userId,
          });
        });
      }
    });
    
    return allBills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error getting all bills:', error);
    return [];
  }
}
// ============================================================================
// AUTO-BALANCE FUNCTIONS
// ============================================================================

/**
 * Add a specific amount to a user's total balance
 * @param {string} userId - User ID
 * @param {number} amount - Amount to add (default: 0.01)
 * @param {string} reason - Reason for the addition (optional)
 * @returns {Promise<Object>} - { success: boolean, newBalance: string, transaction: Object }
 */
export async function addToUserBalance(userId, amount = 0.01, reason = 'Auto-add') {
  try {
    const dashDataCollection = await getDashDataCollection();
    
    // Get current dashboard data
    const dashData = await dashDataCollection.findOne({ userId });
    if (!dashData) {
      console.error(`❌ Dashboard not found for user: ${userId}`);
      return { success: false, error: 'Dashboard not found' };
    }

    // Calculate new balance
    const currentBalance = parseFloat(dashData.totalBalance?.amount) || 0;
    const newBalance = currentBalance + amount;
    const formattedNewBalance = newBalance.toFixed(2);

    // Create transaction record
    const transaction = {
      id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      merchant: 'System Auto-Add',
      type: 'Income',
      category: 'Bonus',
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      amount: amount.toFixed(2),
      isNegative: false,
      reason: reason,
      timestamp: new Date().toISOString(),
    };

    // Update dashboard
    const result = await dashDataCollection.updateOne(
      { userId },
      {
        $set: {
          'totalBalance.amount': formattedNewBalance,
          updatedAt: new Date(),
        },
        $push: {
          recentTransactions: {
            $each: [transaction],
            $position: 0,
            $slice: 20,
          },
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Added $${amount.toFixed(2)} to user ${userId}. New balance: $${formattedNewBalance}`);
      return {
        success: true,
        newBalance: formattedNewBalance,
        transaction,
        amount,
      };
    }

    return { success: false, error: 'No changes made' };
  } catch (error) {
    console.error('❌ Error adding to user balance:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all users who have auto-balance enabled
 * @returns {Promise<Array>} - Array of user IDs
 */
export async function getAutoBalanceUsers() {
  try {
    const dashDataCollection = await getDashDataCollection();
    const users = await dashDataCollection
      .find({ 'autoBalance.enabled': true })
      .project({ userId: 1, 'autoBalance.lastAdded': 1 })
      .toArray();
    
    return users.map(u => ({
      userId: u.userId,
      lastAdded: u.autoBalance?.lastAdded || null,
    }));
  } catch (error) {
    console.error('❌ Error getting auto-balance users:', error);
    return [];
  }
}

/**
 * Update auto-balance settings for a user
 * @param {string} userId - User ID
 * @param {Object} settings - { enabled: boolean, interval: number, lastAdded: Date }
 * @returns {Promise<boolean>}
 */
export async function updateAutoBalanceSettings(userId, settings) {
  try {
    const dashDataCollection = await getDashDataCollection();
    
    const updateData = {
      'autoBalance.enabled': settings.enabled ?? true,
      'autoBalance.interval': settings.interval ?? 7200000, // 2 hours in ms
      updatedAt: new Date(),
    };
    
    if (settings.lastAdded) {
      updateData['autoBalance.lastAdded'] = settings.lastAdded;
    }

    const result = await dashDataCollection.updateOne(
      { userId },
      { $set: updateData }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('❌ Error updating auto-balance settings:', error);
    return false;
  }
}

/**
 * Get auto-balance settings for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - { enabled: boolean, interval: number, lastAdded: Date }
 */
export async function getAutoBalanceSettings(userId) {
  try {
    const dashDataCollection = await getDashDataCollection();
    const dashData = await dashDataCollection.findOne({ userId });
    
    return {
      enabled: dashData?.autoBalance?.enabled ?? false,
      interval: dashData?.autoBalance?.interval ?? 7200000,
      lastAdded: dashData?.autoBalance?.lastAdded || null,
    };
  } catch (error) {
    console.error('❌ Error getting auto-balance settings:', error);
    return { enabled: false, interval: 7200000, lastAdded: null };
  }
}
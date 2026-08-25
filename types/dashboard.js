/**
 * @typedef {Object} TotalBalance
 * @property {string} amount
 * @property {string} change
 */
/**
 * @typedef {Object} AnalysisBalance
 * @property {string} total
 * @property {string} stocks
 * @property {string} crypto
 * @property {string} etfs
 */

/**
 * @typedef {Object} DashboardData
 * @property {string} userId
 * @property {TotalBalance} totalBalance
 * @property {AnalysisBalance} analysisBalance
 * @property {Array} bills
 * @property {Array} recentTransactions
 * @property {Array} paymentMethods
 * @property {Object} preferences
 */
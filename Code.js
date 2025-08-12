// Code.gs

/**
 * פונקציית הכניסה הראשית שמציגה את דף האינטרנט
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index.html')
    .setTitle('יומן משימות אינטראקטיבי')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * פונקציה לשמירת משימות בספרדשיט
 * כרגע אינה פעילה, אך מוכנה להרחבה עתידית
 */
function saveTasksToSheet(tasks) {
  // כאן יבוא קוד עתידי לשמירת המשימות בגיליון גוגל
  return true;
}

/**
 * פונקציה לטעינת משימות מספרדשיט
 * כרגע אינה פעילה, אך מוכנה להרחבה עתידית
 */
function loadTasksFromSheet() {
  // כאן יבוא קוד עתידי לטעינת המשימות מגיליון גוגל
  return [];
}

/**
 * הערות על השימוש באפליקציה זו:
 * 1. האפליקציה כרגע שומרת את המשימות רק בזיכרון זמני
 * 2. קיימת תשתית עתידית לשמירת הנתונים ב-Google Sheets
 * 3. קוד זה מחובר לריפו בכתובת: https://github.com/Zevik/SCRIPTUSH
 * 4. לאחר כל עדכון יש להריץ את הסקריפט update-script.ps1 כדי לדחוף את השינויים לגיטהאב ו-clasp
 */
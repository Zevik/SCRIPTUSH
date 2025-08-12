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
 * הערות על השימוש באפליקציה זו:
 * 1. האפליקציה כרגע שומרת את המשימות רק בזיכרון זמני
 * 2. ניתן להרחיב את האפליקציה כך שתשמור את הנתונים ב-Google Sheets
 * 3. קוד זה מחובר לריפו בכתובת: https://github.com/Zevik/SCRIPTUSH
 */
// Code.gs

/**
 * פונקציית הכניסה הראשית שמציגה את דף האינטרנט
 */
function doGet() {
  // וידוא שקיים גיליון tasks
  try {
    createTasksSheetIfNotExists();
    
    return HtmlService.createHtmlOutputFromFile('index.html')
      .setTitle('יומן משימות אינטראקטיבי')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    Logger.log('שגיאה בפונקציית doGet: ' + error);
    return HtmlService.createHtmlOutput('<h1>שגיאה בטעינת האפליקציה</h1><p>' + error + '</p>');
  }
}

/**
 * פונקציה לשמירת משימות בספרדשיט
 * שומרת את כל המשימות בגיליון tasks
 */
function saveTasksToSheet(tasks) {
  try {
    Logger.log('מתחיל שמירת משימות לגיליון. מספר משימות: ' + (tasks ? tasks.length : 0));
    
    // בדיקה שיש משימות לשמור
    if (!tasks || tasks.length === 0) {
      Logger.log('אין משימות לשמור');
      return true;  // אין צורך למחוק את הנתונים הקיימים אם אין מה לשמור
    }
    
    // גישה לספרדשיט הפעיל
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('tasks');
    
    if (!sheet) {
      // אם הגיליון לא קיים, צור אותו
      Logger.log('גיליון tasks לא נמצא, יוצר גיליון חדש');
      createTasksSheetIfNotExists();
      return saveTasksToSheet(tasks); // קריאה רקורסיבית לאחר יצירת הגיליון
    }
    
    // ניקוי הגיליון הקיים (מלבד כותרות) רק אם יש משימות לשמור
    if (sheet.getLastRow() > 1) {
      Logger.log('מוחק ' + (sheet.getLastRow() - 1) + ' שורות קיימות');
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }
    
    // המרת המשימות לשורות בגיליון
    const rows = tasks.map(task => {
      return [
        task.id,
        task.text,
        task.completed ? 'true' : 'false',
        task.date || '',
        task.createdAt,
        task.completedAt || '',
        task.priority || 'medium',
        task.category || 'general',
        task.mood || '',
        task.isRecurring ? 'true' : 'false',
        task.recurringId || ''
      ];
    });
    
    // הוספת כל השורות לגיליון
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    
    // שמירת משימות חוזרות אם יש
    if (tasks.some(task => task.isRecurring)) {
      saveRecurringTasksToSheet(tasks.filter(task => task.isRecurring));
    }
    
    return true;
  } catch (error) {
    Logger.log('שגיאה בשמירת המשימות: ' + error);
    return false;
  }
}

/**
 * פונקציה לטעינת משימות מספרדשיט
 * טוענת את כל המשימות מגיליון tasks
 */
function loadTasksFromSheet() {
  try {
    Logger.log('מתחיל טעינת משימות מהגיליון');
    
    // גישה לספרדשיט הפעיל
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log('נמצא ספרדשיט: ' + ss.getName());
    
    const sheet = ss.getSheetByName('tasks');
    if (!sheet) {
      // אם הגיליון לא קיים, צור אותו
      Logger.log('גיליון tasks לא נמצא, יוצר גיליון חדש');
      createTasksSheetIfNotExists();
      return [];
    }
    
    Logger.log('נמצא גיליון: ' + sheet.getName());
    
    // בדיקה אם יש נתונים בגיליון
    const lastRow = sheet.getLastRow();
    Logger.log('מספר שורות בגיליון: ' + lastRow);
    
    if (lastRow <= 1) {
      Logger.log('אין משימות בגיליון, רק כותרות');
      return []; // רק כותרות, אין משימות
    }
    
    // קריאת כל הנתונים מהגיליון
    const data = sheet.getRange(2, 1, lastRow - 1, 11).getValues();
    Logger.log('נקראו ' + data.length + ' משימות מהגיליון');
    
    // המרת הנתונים למערך של אובייקטי משימה
    const tasks = data.map(row => {
      try {
        return {
          id: Number(row[0]),
          text: row[1],
          completed: row[2] === 'true' || row[2] === true,
          date: row[3] || null,
          createdAt: row[4],
          completedAt: row[5] || null,
          priority: row[6] || 'medium',
          category: row[7] || 'general',
          mood: row[8] || null,
          isRecurring: row[9] === 'true' || row[9] === true,
          recurringId: row[10] ? Number(row[10]) : null
        };
      } catch (error) {
        Logger.log('שגיאה בהמרת שורה לאובייקט משימה: ' + error);
        Logger.log('שורה בעייתית: ' + JSON.stringify(row));
        return null; // דילוג על שורה בעייתית
      }
    }).filter(task => task !== null); // סינון שורות בעייתיות
    
    Logger.log('נוצרו ' + tasks.length + ' אובייקטי משימה');
    return tasks;
  } catch (error) {
    Logger.log('שגיאה בטעינת המשימות: ' + error);
    return [];
  }
}

/**
 * פונקציה ליצירת גיליון tasks אם הוא לא קיים
 */
function createTasksSheetIfNotExists() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('נמצא ספרדשיט: ' + ss.getName());
  let sheet = ss.getSheetByName('tasks');
  
  if (!sheet) {
    // יצירת גיליון חדש
    sheet = ss.insertSheet('tasks');
    
    // הוספת כותרות
    const headers = [
      'id', 'text', 'completed', 'date', 'createdAt', 'completedAt', 
      'priority', 'category', 'mood', 'isRecurring', 'recurringId'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    
    // עיצוב הגיליון
    sheet.autoResizeColumns(1, headers.length);
    sheet.setTabColor('#4285f4'); // צבע כחול לטאב
  }
  
  // בדיקה אם קיים גיליון recurring_tasks
  let recurringSheet = ss.getSheetByName('recurring_tasks');
  
  if (!recurringSheet) {
    // יצירת גיליון למשימות חוזרות
    recurringSheet = ss.insertSheet('recurring_tasks');
    
    // הוספת כותרות
    const recurringHeaders = [
      'id', 'text', 'frequency', 'category', 'lastCreated'
    ];
    
    recurringSheet.getRange(1, 1, 1, recurringHeaders.length).setValues([recurringHeaders]);
    recurringSheet.getRange(1, 1, 1, recurringHeaders.length).setFontWeight('bold');
    recurringSheet.setFrozenRows(1);
    
    // עיצוב הגיליון
    recurringSheet.autoResizeColumns(1, recurringHeaders.length);
    recurringSheet.setTabColor('#0f9d58'); // צבע ירוק לטאב
  }
  
  return sheet;
}

/**
 * שמירת משימות חוזרות בגיליון נפרד
 */
function saveRecurringTasksToSheet(recurringTasks) {
  try {
    if (!recurringTasks || recurringTasks.length === 0) {
      return true;
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('recurring_tasks');
    
    if (!sheet) {
      createTasksSheetIfNotExists();
      return saveRecurringTasksToSheet(recurringTasks);
    }
    
    // ניקוי הגיליון הקיים (מלבד כותרות)
    if (sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }
    
    // המרת המשימות החוזרות לשורות
    const recurringData = recurringTasks.map(task => {
      return [
        task.recurringId || task.id,
        task.text.replace(/ \(.*\)$/, ''), // הסרת הסוגריים עם תדירות
        task.frequency || 'daily',
        task.category || 'general',
        task.completedAt || ''
      ];
    });
    
    // הוספת השורות לגיליון
    sheet.getRange(2, 1, recurringData.length, recurringData[0].length).setValues(recurringData);
    
    return true;
  } catch (error) {
    Logger.log('שגיאה בשמירת משימות חוזרות: ' + error);
    return false;
  }
}

/**
 * טעינת משימות חוזרות מהגיליון
 */
function loadRecurringTasksFromSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('recurring_tasks');
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return [];
    }
    
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
    
    return data.map(row => {
      return {
        id: Number(row[0]),
        text: row[1],
        frequency: row[2] || 'daily',
        category: row[3] || 'general',
        lastCreated: row[4] || null
      };
    });
  } catch (error) {
    Logger.log('שגיאה בטעינת משימות חוזרות: ' + error);
    return [];
  }
}

/**
 * פונקציה המאפשרת להגדיר במפורש את ה-ID של הספרדשיט
 * הוסף את ה-ID של הספרדשיט שלך כאן אם יש בעיות התחברות
 */
function setSpreadsheetId(spreadsheetId) {
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheetId);
  return "מזהה הספרדשיט הוגדר בהצלחה";
}

/**
 * פונקציה לפתיחת ספרדשיט על פי ID במפורש
 * משמשת כאשר יש בעיות בפתיחת הספרדשיט הפעיל
 */
function getSpreadsheetById() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) {
    throw new Error('לא הוגדר מזהה ספרדשיט. השתמש בפונקציה setSpreadsheetId תחילה.');
  }
  return SpreadsheetApp.openById(spreadsheetId);
}

/**
 * פונקציה לבדיקת החיבור לספרדשיט
 * מחזירה מידע על הספרדשיט אם החיבור תקין
 */
function testConnection() {
  try {
    Logger.log('בדיקת חיבור לספרדשיט');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetsInfo = ss.getSheets().map(sheet => {
      const name = sheet.getName();
      const rows = sheet.getLastRow();
      return {
        name: name,
        rows: rows,
        hasContent: rows > 1
      };
    });
    
    const result = {
      status: "success",
      name: ss.getName(),
      url: ss.getUrl(),
      sheets: sheetsInfo
    };
    
    Logger.log('חיבור תקין: ' + JSON.stringify(result));
    return result;
  } catch (error) {
    Logger.log('שגיאת חיבור: ' + error);
    return {
      status: "error",
      message: error.toString()
    };
  }
}

/**
 * הערות על השימוש באפליקציה זו:
 * 1. האפליקציה שומרת את המשימות בגיליון Google Sheets בשם "tasks"
 * 2. המשימות החוזרות נשמרות בגיליון נפרד בשם "recurring_tasks"
 * 3. קוד זה מחובר לריפו בכתובת: https://github.com/Zevik/SCRIPTUSH
 * 4. לאחר כל עדכון יש להריץ את הסקריפט update-script.ps1 כדי לדחוף את השינויים לגיטהאב ו-clasp
 * 5. אם יש בעיות התחברות לספרדשיט, השתמש בפונקציה setSpreadsheetId כדי להגדיר את ה-ID במפורש
 */
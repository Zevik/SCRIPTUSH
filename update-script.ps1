# הוספת כל השינויים לגיט ודחיפה לגיטהאב ו-clasp
function updateBoth {
    param (
        [Parameter(Mandatory=$true)]
        [string]$commitMessage
    )
    
    # הוספת שינויים לגיט
    git add .
    
    # יצירת קומיט עם ההודעה שהתקבלה
    git commit -m $commitMessage
    
    # דחיפה לגיטהאב
    git push origin master
    
    # דחיפה ל-clasp
    clasp push
}

# הוספת אליאס קצר יותר לשימוש נוח
Set-Alias update-repo updateBoth

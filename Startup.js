const winreg = require('winreg');

class Startup_script
{
    constructor() { // Startup | __init__
        
      }
      async windows_startup() 
      {
        // Winreg Script
        //const REG_PATH = r"SOFTWARE\Microsoft\Windows\CurrentVersion\Run";
        try 
        {
            const key = await winreg.createKey(winreg.HKEY_CURRENT_USER, REG_PATH);
            await winreg.setValueEx(key, "YourScriptName", 0, winreg.REG_SZ, `node ${scriptPath}`);  // Include 'node' before script path
            console.log("Script added to startup successfully!");
        } catch (error) 
        {
            console.error("Error adding script to startup:", error);
        }
      }

      linux_startup()
      {

      }
}


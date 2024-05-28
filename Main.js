const notifier = require('node-notifier');
const https = require('https');
const dotenv = require('dotenv').config();
const fs = require('fs');

/* 
Order of Operations (Functions)
timer(): Checks if its time to check for wars [Done]
data_process(): Gets defensive war count & Other variables | get_data() [Done]

war_check(): Checks if the current defensive count is higher than the cached one [Done]
send_notification() [Option]: Sends desktop notification alerting to war [Done]
write_to_cache(): After checking, writes to cache for further checking [Done]
-----------------------
GUI:
Settings
 - Checkbox types of warning (Attacked, Spy attacks)
 - Start script on-startup
*/

function get_data(nationID)
{
    const apiKey = process.env.API_KEY;
    const postData = JSON.stringify({
        query: `
        {
          nations(id: ${nationID}) {
            data {
              defensive_wars_count
              offensive_wars_count
            }
          }
          me {
            requests
            max_requests
          }
        }
        `
      });
      
      const options = { // URL Options/Parameters
        hostname: 'api.politicsandwar.com',
        port: 443, // HTTPS uses port 443 by default
        path: '/graphql?api_key=' + apiKey,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
      };
      return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (d) => {
              body += d;
            });
          
            res.on('end', () => {
              try 
              {
                const parsedData = JSON.parse(body);     
                resolve(parsedData); // Resolve the promise with parsed data
   
              } catch (error) 
              {
                reject(error); // Reject the promise with any errors
                console.error('Error parsing response:', error);
              }
            });
          });

          req.on('error', reject); // Reject promise on request errors
          req.write(postData);
          req.end();
      });
      
}

function send_notification(title, message) // Sends desktop notification
{    
    // Object
    notifier.notify({
      title: title,
      message: message,
      wait: true, // Waits until user action
      icon: 'alert.ico', // Absolute path (doesn't work on balloons)
    });
}

function data_process() // Writes to cache
/* 
- Writes to cache
- Compares previous value with current one
- If higher, triggers notification | Gets war ID
*/
{
  (async () => {
    try {
      //console.log('Working');
      var JSON_Output = await get_data(606154); // Replace with your desired nation ID
      Defensive_war_count = JSON_Output.data.nations.data[0].defensive_wars_count;
      Offensive_war_count = JSON_Output.data.nations.data[0].offensive_wars_count;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    war_check(Defensive_war_count);
  })();
}

function war_check(current_defensive_count) // Checks if there is a new war
{
  const filePath = 'Cache/war_cache.json';

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
    } else {
      try {
        const jsonData = JSON.parse(data);
        const cached_defensiveWars = jsonData.Defensive_Wars; // Checks inside war_cache.json
        //console.log("---------------")
        //console.log("Current Wars: "+current_defensive_count + "\nCached War Count: " + cached_defensiveWars) 
        if (current_defensive_count > cached_defensiveWars ) // Correct symbol = > (Bigger than)
          {
            // If current is larger than cached
            send_notification(title="War Declared", message="War has been declared against you")
            jsonData["Defensive_Wars"] = current_defensive_count;
            writeModifiedData(jsonData)
          }
      } catch (error) {
        console.error('Error parsing JSON data:', error);
      }
    }
  });
}

function writeModifiedData(data) { // Writes appended data to war_cache.json
  const jsonString = JSON.stringify(data, null, 2); // Stringify with indentation
  fs.writeFile("Cache/war_cache.json", jsonString, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log('JSON data modified and written to file successfully.');
    }
  });
}

function timer() 
{
  
 let counter = 0;
 const intervalId = setInterval(() => {
   counter++;
  
 if (counter === 1) 
  { // 
    clearInterval(intervalId); // Stops counter
    data_process(); // Begins process
    timer() // Starts process again
  }
}, 3000); // 3 seconds
}

notifier.notify(
  {
    title: 'Shield Script Activated',
    message: 'Shield Active',
  })

timer()
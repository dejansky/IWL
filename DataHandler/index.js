const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Function to match and return grouped file names
function findMatchingFiles(directory) {
  const files = fs.readdirSync(directory);
  const matchedFiles = {};

  files.forEach((file) => {
    const match = file.match(/^(\d+)eventLogs_w\((\d+)\)_(\d+)\.json$/);
    if (match) {
      const [full, index, , tag] = match;
      const scoreFilePattern = new RegExp(`^${index}scoreLogs_w\\(\\d+\\)_${tag}\\.json$`);
      const scoreFile = files.find((f) => scoreFilePattern.test(f));
      if (scoreFile) {
        matchedFiles[file] = { scoreFile, number: parseInt(index, 10) };
      }
    }
  });

  return matchedFiles;
}

function sortData(a, b) {
  if (['mouseover', 'mouseout', 'mouseleave', 'mousedown'].includes(a.type) && a.customTimestamp) {
    return a.customTimestamp - b.timestamp;
  } else {
    return a.timestamp - b.timestamp;
  }
}

async function jsonToCSV(eventFilePath, scoreFilePath, outputFilePath, subject) {
  const eventData = JSON.parse(fs.readFileSync(eventFilePath, 'utf8')).sort(sortData);
  const scoreData = JSON.parse(fs.readFileSync(scoreFilePath, 'utf8')).sort(sortData);

  const intervals = scoreData.map((score, index) => {
    const start = index === 0 ? eventData[0].timestamp : scoreData[index - 1].timestamp;
    const end = score.timestamp;
    return { start, end, acr: score.score };
  });

  intervals.push({ start: scoreData[scoreData.length - 1].timestamp, end: eventData[eventData.length - 1].timestamp }); // Last interval

  const iLTs = intervals.map((interval) => {
    const eventsInInterval = eventData.filter((event) => event.timestamp >= interval.start && event.timestamp < interval.end);
    const clickEvents = eventsInInterval.filter((event) => event.type === 'mousedown');
    const clickCount = clickEvents.length;

    // Get the indices of click events in the eventsInInterval array
    const clickIndices = clickEvents.map((click) => eventsInInterval.indexOf(click));

    // Calculate the time between a click and the event before the next click
    const timeBetweenClickAndNextEvent = clickIndices.slice(0, -1).map((clickIndex, index) => {
      const nextEventIndex = clickIndices[index + 1] - 1;
      return eventsInInterval[nextEventIndex].timestamp - eventsInInterval[clickIndex].timestamp;
    });

    let totalClickIntervalTime = 0;
    let clickIntervalCount = 0;

    timeBetweenClickAndNextEvent.forEach((time) => {
      totalClickIntervalTime += time;
      clickIntervalCount++;
    });

    const averageTimeBetweenClicks = clickIntervalCount > 0 ? Math.ceil(totalClickIntervalTime / clickIntervalCount) : null;

    const requestStartEvents = eventsInInterval.filter((event) => event.type === 'requestBody');
    const requestEndEvents = eventsInInterval.filter((event) => event.type === 'onCompleted');
    let totalResponseTime = 0;
    let requestCount = 0;

    requestStartEvents.forEach((startEvent) => {
      const endEvent = requestEndEvents.find((endEvent) => endEvent.details.requestId === startEvent.details.requestId);
      if (endEvent) {
        totalResponseTime += endEvent.timestamp - startEvent.timestamp;
        requestCount++;
      }
    });

    const averageResponseTime = requestCount > 0 ? Math.ceil(totalResponseTime / requestCount) : null;

    const targetUrl = 'https://api-web-fleetservices.husqvarna.com/fleet/secure/machines/v2/listitem/e5c3417e-5ec2-46c7-b3d3-0e1abdd36xxx';
    const httpErrorExists = eventsInInterval.some((event) => event.type === 'onCompleted' && event.details.statusCode === 400 && event.details.url === targetUrl);

    return {
      ACR: interval.acr,
      no_click: clickCount,
      miLT: averageTimeBetweenClicks,
      iLTs: timeBetweenClickAndNextEvent,
      TCiL: timeBetweenClickAndNextEvent.length,
      net_delay: averageResponseTime,
      error: httpErrorExists,
      subject: subject,
    };
  });

  const filteredIntervals = intervals.filter((interval) => interval.acr !== undefined);

  const combinedData = filteredIntervals.map((interval, index) => ({
    record: index,
    iLTs: JSON.stringify(iLTs[index].iLTs || []),
    miLT: iLTs[index].miLT || null,
    ACR: interval.acr,
    net_delay: iLTs[index].net_delay ? `${iLTs[index].net_delay}ms` : null,
    no_click: iLTs[index].no_click || 0,
    TCiL: iLTs[index].TCiL || 0,
    subject: iLTs[index].subject,
    error: iLTs[index].error ? 'true' : 'false',
  }));

  const csvWriter = createCsvWriter({
    path: outputFilePath,
    header: [
      { id: 'record', title: 'record' },
      { id: 'iLTs', title: 'iLTs' },
      { id: 'miLT', title: 'miLT' },
      { id: 'ACR', title: 'ACR' },
      { id: 'net_delay', title: 'Net Delay' },
      { id: 'no_click', title: 'No Click' },
      { id: 'TCiL', title: 'TCiL' },
      { id: 'subject', title: 'Subject' },
      { id: 'error', title: 'Error' },
    ],
    append: true,
  });

  await csvWriter
    .writeRecords(combinedData)
    .then(() => console.log(`CSV file for ${outputFilePath} written successfully`))
    .catch((err) => console.error('Failed to write CSV file:', err));
}

const directory = './SanitizedData'; // Directory containing your JSON files
const matchedFiles = findMatchingFiles(directory);

(async () => {
  console.log('Matched files:', matchedFiles);
  const entries = Object.entries(matchedFiles);
  for (const [index, [eventFile, { scoreFile, number }]] of entries.entries()) {
    const outputFilePath = `records_w.csv`; // Customize your output file naming
    try {
      await jsonToCSV(path.join(directory, eventFile), path.join(directory, scoreFile), path.join(directory, outputFilePath), number);
    } catch (err) {
      console.error(`Failed to process file ${eventFile}:`, err);
    }
  }
})();

// function sanitizeObject(obj) {
//   if (obj.customTimestamp) {
//     obj.timestamp = obj.customTimestamp;
//     delete obj.customTimestamp;
//   }
//   return obj;
// }

// async function sanitizeFiles() {
//   // Get all files in the current directory
//   const files = await fs.promises.readdir(directory);
//   for (const file of files) {
//     const filePath = path.join(directory, file);
//     // Check if the file exists and the name includes "eventLogs"
//     try {
//       await fs.promises.access(filePath);
//       if (file.includes('eventLogs')) {
//         // Read the file
//         const data = await fs.promises.readFile(filePath, 'utf8');
//         // Parse the JSON string to JavaScript objects
//         const logs = JSON.parse(data);
//         // Apply the sanitizeObject function to each object
//         const sanitizedLogs = logs.map(sanitizeObject);
//         // Convert the sanitized objects back to a JSON string
//         const sanitizedData = JSON.stringify(sanitizedLogs);
//         // Write the sanitized data back to the file
//         await fs.promises.writeFile(filePath, sanitizedData, 'utf8');
//       }
//     } catch (err) {
//       console.error(`Failed to process file ${file}:`, err);
//     }
//   }
// }

// sanitizeFiles().catch(console.error);

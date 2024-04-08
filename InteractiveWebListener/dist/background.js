let batchedLogsBg = [];
let didFlushLogs = false;

const syncFlushBatchedLogs = async () => {
  console.log('Flushing logs:');

  chrome.tabs.query({}, function (tabs) {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, { action: 'flushLogsFromContentScript' });
    });
  });
};

const flushBatchedLogs = async () => {
  //if (didFlushLogs) {
  console.log('Flushing logs to storage:', batchedLogsBg.length, 'entries');

  // Retrieve the current log array (if it exists), append new logs, and save back
  chrome.storage.local.get({ eventLogs: [] }, (result) => {
    const updatedLogs = [...result.eventLogs, ...batchedLogsBg];
    console.log('All logs:', updatedLogs);
    chrome.storage.local.set({ eventLogs: updatedLogs }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving log:', chrome.runtime.lastError);
      } else {
        console.log('All logs saved successfully.');
      }
    });
  });
  // } else {
  //   console.log('Did not get all logs from content');
  // }
};

// Awaits for the synchronizeFlushLogs message from the popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'synchronizeFlushLogs') {
    await syncFlushBatchedLogs();
    console.log('Logs have been synchronized.');
  }
});

// Awaits for the flushLogs message from the popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'flushLogs') {
    // Your logic to flush the logs
    await flushBatchedLogs();
    console.log('Logs have been flushed.');
  }
});

// Awaits for the appendLog message from the content script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'appendLog') {
    console.log('Did get entry from content script', request.entry);
    batchedLogsBg.push(request.entry); // Reuse the appendLog function defined earlier
  }
  sendResponse({ result: 'response from background' });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'flushLogsFromContentScriptDone') {
    didFlushLogs = true; // Reuse the appendLog function defined earlier
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'clearLogs') {
    console.log('Clearing logs', batchedLogsBg.length, 'entries');
    batchedLogsBg = []; // Reuse the appendLog function defined earlier
    console.log('Logs cleared', batchedLogsBg.length, 'entries');
  }
});

function sanitizeDetails(details) {
  const sanitizedDetails = {};
  Object.keys(details).forEach((key) => {
    if (details[key] !== undefined) {
      sanitizedDetails[key] = details[key];
    } else {
      sanitizedDetails[key] = null;
    }
  });
  return sanitizedDetails;
}

function sanitizeForSerialization(details) {
  const sanitized = {};
  Object.keys(details).forEach((key) => {
    const value = details[key];
    // Directly assign values that are not objects or are null (implicitly covers undefined values)
    if (typeof value !== 'object' || value === null) {
      sanitized[key] = value;
      return; // Continue to next key
    }

    // Special handling for raw data
    if (value.raw && Array.isArray(value.raw)) {
      sanitized[key] = {
        // This example simply marks each array element. Adjust as needed.
        raw: null,
      };
      return; // Continue to next key
    }

    // Recursively sanitize nested objects
    sanitized[key] = sanitizeForSerialization(value);
  });
  return sanitized;
}
chrome.webRequest.onCompleted.addListener(
  (details) => {
    // Sanitize details object to remove undefined fields or set default values
    const sanitizedDetails = sanitizeForSerialization(sanitizeDetails(details));

    const {} = sanitizedDetails;

    const logEntry = {
      type: 'onCompleted',
      timestamp: Date.now(),
      details: sanitizedDetails,
    };
    console.log('Request Completed:', sanitizedDetails);
    batchedLogsBg.push(logEntry);
  },
  { urls: ['<all_urls>'] } // Adjust the filter as needed
);

chrome.webRequest.onErrorOccurred.addListener(
  (details) => {
    // Sanitize details object to remove undefined fields or set default values
    const sanitizedDetails = sanitizeForSerialization(sanitizeDetails(details));

    const {} = sanitizedDetails;

    const logEntry = {
      type: 'onErrorOccurred',
      timestamp: Date.now(),
      details: sanitizedDetails,
    };
    console.log('Request Completed:', sanitizedDetails);
    batchedLogsBg.push(logEntry);
  },
  { urls: ['<all_urls>'] } // Adjust the filter as needed
);

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    // Sanitize details object to remove undefined fields or set default values
    const sanitizedDetails = sanitizeForSerialization(sanitizeDetails(details));

    const {} = sanitizedDetails;

    const logEntry = {
      type: 'requestBody',
      timestamp: Date.now(),
      details: sanitizedDetails,
    };
    console.log('Request Made:', sanitizedDetails);
    batchedLogsBg.push(logEntry);
  },
  { urls: ['<all_urls>'] },
  ['requestBody']
);

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    const sanitizedDetails = sanitizeForSerialization(sanitizeDetails(details));

    const logEntry = {
      type: 'responseHeaders',
      timestamp: Date.now(),
      sanitizedDetails,
    };
    console.log('Headers Received:', sanitizedDetails);
    batchedLogsBg.push(logEntry);
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders']
);

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const sanitizedDetails = sanitizeForSerialization(sanitizeDetails(details));

    const logEntry = {
      type: 'websocket',
      timestamp: Date.now(),
      sanitizedDetails,
    };
    console.log('WebSocket Handshake:', sanitizedDetails);
    batchedLogsBg.push(logEntry);
  },
  { urls: ['<all_urls>'], types: ['websocket'] }
);

// Example function to add a blocking rule dynamically
function addBlockingRule() {
  const rule = {
    id: 1,
    priority: 1,
    action: { type: 'allow' },
    condition: { urlFilter: '||localhost', resourceTypes: ['main_frame'] },
  };

  chrome.declarativeNetRequest.updateDynamicRules(
    {
      addRules: [rule],
      removeRuleIds: [1],
    },
    () => {
      console.log('Blocking rule added.');
    }
  );
}

// Listen for the extension's installation event to setup initial rules
chrome.runtime.onInstalled.addListener(() => {
  addBlockingRule();
  console.log('Extension installed and initial rule set up.');
});

console.log('Content script has been injected.');
var numberOfMutations = 0;

let batchedLogs = [];

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    const serializedValues = {
      addedNodes: Array.from(mutation.addedNodes).map((node) =>
        serializeNode(node)
      ),
      removedNodes: Array.from(mutation.removedNodes).map((node) =>
        serializeNode(node)
      ),
      attributeName: mutation.attributeName,
      attributeNamespace: mutation.attributeNamespace,
      nextSibling: mutation.nextSibling
        ? serializeNode(mutation.nextSibling)
        : null,
      previousSibling: mutation.previousSibling
        ? serializeNode(mutation.previousSibling)
        : null,
      oldValue: mutation.oldValue,
      target: serializeNode(mutation.target),
      type: mutation.type,
    };

    numberOfMutations += 1;

    const logEntry = {
      numberOfMutations: numberOfMutations,
      type: 'mutation Observer',
      timestamp: Date.now(),
      details: { target: serializedValues },
    };

    appendLog(logEntry);
    //batchedLogs.push(logEntry);
    console.log('DOM mutation observed POST LOGGED :', serializedValues);
  });
});

function serializeNode(node) {
  if (!node) return null; // Handle cases where node might be null
  if (node.nodeType === Node.ELEMENT_NODE) {
    return {
      nodeType: node.nodeType,
      tagName: node.tagName,
      id: node.id,
      classes: node.className,
    };
  } else if (node.nodeType === Node.TEXT_NODE) {
    return {
      nodeType: node.nodeType,
      data: node.data.substr(0, 50), // Limiting to first 50 chars for brevity
    };
  } else {
    return {
      nodeType: node.nodeType,
      data: node.nodeName,
    };
  }
}

// Start observing the document body for DOM mutations
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  characterData: true,
  attributeOldValue: true,
  characterDataOldValue: true,
});

function addRatingButtons() {
  // Assuming you've created your ratingElement and added buttons to it
  const buttons = document.querySelectorAll('#acrRatingPrompt button');
  buttons.forEach((button) => {
    button.addEventListener('click', function () {
      const score = parseInt(this.textContent[0], 10); // Assuming button text starts with the score
      captureRating(score);
    });
  });
}

function captureRating(score) {
  console.log(`User rated: ${score}`); // Example of logging the rating

  let scoreLogEntry = {
    type: 'rating',
    timestamp: Date.now(),
    score,
  };
  // Example: Save the rating to local storage
  chrome.storage.local.get({ scoreLogs: [] }, function (result) {
    const updatedRatings = [...result.scoreLogs, scoreLogEntry];
    chrome.storage.local.set({ scoreLogs: updatedRatings }, function () {
      console.log('Rating saved.');
    });
  });

  // Remove the rating element after capturing the rating
}

let inactivityTime = function () {
  console.log('DID INITIATE INACTIVITY TIME FUNCTION');
  function showAlert() {
    const ratingElementId = 'acrRatingPrompt';
    let ratingElement = document.getElementById(ratingElementId);

    if (!ratingElement) {
      ratingElement = document.createElement('div');
      ratingElement.id = ratingElementId;
      ratingElement.innerHTML = `
      <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background-color:white;border:1px solid black;padding:20px;z-index:10000;">
      Please rate your experience:<br>
          <button>1: Bad</button>
          <button>2: Poor</button>
          <button>3: Fair</button>
          <button>4: Good</button>
          <button>5: Excellent</button>
      </div>
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.5);z-index:9999;"></div>`;
      document.body.appendChild(ratingElement);
      addRatingButtons();
    }
  }
  setTimeout(() => {
    showAlert();
  }, 1000);
};

document.addEventListener('click', function (e) {
  const isCloseButton = e.target.closest('span[title="Close asset details"]');
  if (isCloseButton) {
    console.log('Close button was clicked.');
    inactivityTime();
    setupRatingPromptClickListener();
  }

  const targetElement = document.querySelector(
    'a[title="View machine details"][data-trackingcategory="Tracking Link"]'
  );

  if (targetElement) {
    const clonedElement = targetElement.cloneNode(true);
    clonedElement.href =
      '/inventory/e5c3417e-5ec2-46c7-b3d3-0e1abdd36xxx?filters={&quot;free_text&quot;:&quot;Thes&quot;}&amp;view=details'; // Change this to the desired URL

    // Optional: If you want to add an event listener to the cloned element
    clonedElement.addEventListener('click', (e) => {
      console.log('Cloned element clicked');
      // Perform any additional actions here
    });

    targetElement.parentNode.replaceChild(clonedElement, targetElement);
  }

  if (
    (e.target.tagName === 'BUTTON' && e.target.id === 'login-button') ||
    (e.target.tagName === 'A' && e.target.innerText === 'DASHBOARD') ||
    (e.target.tagName === 'LI' && e.target.innerText === 'DASHBOARD') ||
    (e.target.tagName === 'SPAN' && e.target.innerText === 'DASHBOARD') ||
    (e.target.tagName === 'BUTTON' && e.target.innerText === 'DASHBOARD') ||
    (e.target.tagName === 'DIV' && e.target.innerText === 'DASHBOARD')
  ) {
    const xpathExpression =
      '/html/body/div[1]/div/main/section/section[2]/div/div/div/div[2]';

    const observer = new MutationObserver((mutations) => {
      const xpathResult = document.evaluate(
        xpathExpression,
        document,
        null,
        XPathResult.ANY_TYPE,
        null
      );
      const xpathElement = xpathResult.iterateNext();

      if (xpathElement) {
        // Do something if the XPath element exists
        observer.disconnect();
        inactivityTime();
        setupRatingPromptClickListener();
        // Perform your action here
      }
    });

    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
  }

  if (
    (e.target.tagName === 'A' && e.target.innerText === 'INVENTORY') ||
    (e.target.tagName === 'LI' && e.target.innerText === 'INVENTORY') ||
    (e.target.tagName === 'SPAN' && e.target.innerText === 'INVENTORY') ||
    (e.target.tagName === 'BUTTON' && e.target.innerText === 'INVENTORY') ||
    (e.target.tagName === 'DIV' && e.target.innerText === 'INVENTORY')
  ) {
    console.log('Did press inventory button');
    const xpathExpression =
      '/html/body/div[1]/div/main/section/aside[2]/div[1]/div[2]/div/div[1]/div/div/div[1]';

    const observer = new MutationObserver((mutations) => {
      const xpathResult = document.evaluate(
        xpathExpression,
        document,
        null,
        XPathResult.ANY_TYPE,
        null
      );
      const xpathElement = xpathResult.iterateNext();

      if (xpathElement) {
        // Do something if the XPath element exists
        observer.disconnect();
        inactivityTime();
        setupRatingPromptClickListener();
        // Perform your action here
      }
    });

    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
  }
});

function setupRatingPromptClickListener(redirectUrl) {
  document.addEventListener('click', function (e) {
    const ratingElement = document.getElementById('acrRatingPrompt');
    if (
      ratingElement &&
      ratingElement.contains(e.target) &&
      e.target.tagName === 'BUTTON'
    ) {
      console.log('Rating button clicked');
      ratingElement.remove();
      if (redirectUrl) {
        e.preventDefault();
        window.location.href = redirectUrl;
      }
      this.removeEventListener('click', arguments.callee);
    }
  });
}

async function handleUserAction(event) {
  const logEntry = {
    // Basic event properties
    type: event.type,
    timestamp: event.timeStamp,
    isTrusted: event.isTrusted,

    // Mouse & Keyboard event properties
    key: event.key || null, // For keyboard events
    keyCode: event.keyCode || null, // Deprecated but included for completeness
    button: event.button !== undefined ? event.button : null, // For mouse events
    buttons: event.buttons !== undefined ? event.buttons : null, // For mouse events
    clientX: event.clientX || null, // For mouse events
    clientY: event.clientY || null, // For mouse events

    // Target and related element properties
    targetTag: event.target ? event.target.tagName : null,
    targetClasses: event.target ? event.target.className : null,
    relatedTargetTag: event.relatedTarget ? event.relatedTarget.tagName : null,
    url: event.target.href ? event.target.href : null,
    text: event.target.textContent ? event.target.textContent.trim() : null, // Text of the link
    innerText: event.target.innerText ? event.target.innerText.trim() : null,

    // Modifier keys (for keyboard and mouse events)
    altKey: event.altKey || false,
    ctrlKey: event.ctrlKey || false,
    shiftKey: event.shiftKey || false,
    metaKey: event.metaKey || false, // Command key on Mac, Windows key on Windows

    // Scroll & Wheel event properties
    deltaX: event.deltaX || 0,
    deltaY: event.deltaY || 0,
    deltaZ: event.deltaZ || 0,
    deltaMode: event.deltaMode || 0,

    // Custom identifier for more complex processing or filtering
    customId: `${event.type}_${Date.now()}`,
    customTimestamp: Date.now(),
  };

  // Log and proceed to append the log entry as before
  console.log('Appending log:', logEntry);
  await appendLog(logEntry);
  //batchedLogs.push(logEntry);
}

const flushBatchedLogsContent = () => {
  console.log('Flushing logs:', batchedLogs);
  batchedLogs.forEach(async (logEntry) => await appendLog(logEntry));
  batchedLogs = []; // Reset the batch
  chrome.runtime.sendMessage({
    action: 'flushLogsFromContentScriptDone',
    entry: true,
  });
};

async function appendLog(entry) {
  console.log('Appending log:', entry);
  await chrome.runtime.sendMessage({ action: 'appendLog', entry });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'flushLogsFromContentScript') {
    flushBatchedLogsContent();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'clearLogs') {
    numberOfMutations = 0;
  }
});

// Mouse Events
document.addEventListener('click', handleUserAction);
document.addEventListener('dblclick', handleUserAction);
document.addEventListener('mousedown', handleUserAction);
document.addEventListener('mouseup', handleUserAction);
document.addEventListener('mouseenter', handleUserAction);
document.addEventListener('mouseleave', handleUserAction);
document.addEventListener('mouseover', handleUserAction);
document.addEventListener('mouseout', handleUserAction);
document.addEventListener('contextmenu', handleUserAction);

// Wheel and Scroll Events
document.addEventListener('wheel', handleUserAction);
document.addEventListener('scroll', handleUserAction);

// Keyboard Events
document.addEventListener('keydown', handleUserAction);
document.addEventListener('keyup', handleUserAction);

// Focus Events
document.addEventListener('focus', handleUserAction);
document.addEventListener('blur', handleUserAction);
document.addEventListener('focusin', handleUserAction);
document.addEventListener('focusout', handleUserAction);

// Form Events
document.addEventListener('change', handleUserAction);
document.addEventListener('input', handleUserAction);
document.addEventListener('submit', handleUserAction);
document.addEventListener('reset', handleUserAction);

// Drag & Drop Events
document.addEventListener('drag', handleUserAction);
document.addEventListener('dragstart', handleUserAction);
document.addEventListener('dragend', handleUserAction);
document.addEventListener('dragover', handleUserAction);
document.addEventListener('dragenter', handleUserAction);
document.addEventListener('dragleave', handleUserAction);
document.addEventListener('drop', handleUserAction);

// Other Events
document.addEventListener('resize', handleUserAction);
document.addEventListener('zoom', handleUserAction);

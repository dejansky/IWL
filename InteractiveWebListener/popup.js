document.getElementById('exportLogs').addEventListener('click', function () {
  chrome.storage.local.get('eventLogs', function (data) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }

    const blob = new Blob([JSON.stringify(data.eventLogs, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'eventLogs.json';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(url);
  });
});

document.getElementById('exportScores').addEventListener('click', function () {
  chrome.storage.local.get('scoreLogs', function (data) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }

    const blob = new Blob([JSON.stringify(data.scoreLogs, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'scoreLogs.json';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(url);
  });
});

document.getElementById('flushLogs').addEventListener('click', function () {
  chrome.runtime.sendMessage({ action: 'flushLogs' });
});

document
  .getElementById('synchronizeFlushLogs')
  .addEventListener('click', function () {
    chrome.runtime.sendMessage({ action: 'synchronizeFlushLogs' });
  });

document.getElementById('clearLogs').addEventListener('click', function () {
  chrome.runtime.sendMessage({ action: 'clearLogs' });
});

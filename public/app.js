const fileInput = document.getElementById('fileInput');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const resetBtn = document.getElementById('resetBtn');
const speedInput = document.getElementById('speedInput');
const transcriptList = document.getElementById('transcriptList');
const logArea = document.getElementById('logArea');
const speaker1Sel = document.getElementById('speaker1');
const speaker2Sel = document.getElementById('speaker2');
const copilotFrame = document.getElementById('copilotFrame');

function log(line) {
  const ts = new Date().toISOString();
  logArea.textContent += `[${ts}] ${line}\n`;
  logArea.scrollTop = logArea.scrollHeight;
}

function parseTranscript(text) {
  const blocks = [];
  const lines = text.split(/\r?\n/);
  let i = 0;
  const headerRe = /^(\d{2}:\d{2}:\d{2})\s+Speaker\s+(\d+)\s*$/i;
  while (i < lines.length) {
    const m = lines[i].match(headerRe);
    if (m) {
      const time = m[1];
      const speaker = m[2];
      i++;
      const contentLines = [];
      while (i < lines.length && !headerRe.test(lines[i])) {
        const line = lines[i].trimEnd();
        if (line.length > 0) contentLines.push(line);
        i++;
      }
      const content = contentLines.join('\n');
      if (content) {
        blocks.push({ time, speaker, content });
      }
    } else {
      i++;
    }
  }
  return blocks;
}

function roleForSpeaker(speakerNum) {
  if (String(speakerNum) === '1') return speaker1Sel.value;
  if (String(speakerNum) === '2') return speaker2Sel.value;
  return 'unknown';
}

function renderTranscript(blocks) {
  transcriptList.innerHTML = '';
  blocks.forEach((b, idx) => {
    const li = document.createElement('li');
    li.dataset.index = String(idx);
    li.innerHTML = `<strong>${b.time} Speaker ${b.speaker} (${roleForSpeaker(b.speaker)})</strong><br/>${b.content.replaceAll('<', '&lt;')}`;
    transcriptList.appendChild(li);
  });
}

let parsedBlocks = [];
let timerId = null;
let playIndex = 0;
let playing = false;

async function startSession() {
  log('Starting session with Cognigy...');
  const resp = await fetch('/api/session/start', { method: 'POST' });
  const data = await resp.json();
  if (!data.ok) {
    throw new Error(data.message || 'Error starting session');
  }
  log(`Session started: userId=${data.userId}, sessionId=${data.sessionId}`);
  if (data.iframeUrl) {
    copilotFrame.src = data.iframeUrl;
    log('Iframe URL received and loaded');
  } else {
    log(data.notice || 'Waiting for iframe URL...');
    // Poll state until iframe arrives
    const poll = async () => {
      try {
        const r = await fetch('/api/session/state');
        const s = await r.json();
        if (s.iframeUrl) {
          copilotFrame.src = s.iframeUrl;
          log('Iframe URL received (poll) and loaded');
        } else {
          setTimeout(poll, 1000);
        }
      } catch (e) {
        setTimeout(poll, 1500);
      }
    };
    setTimeout(poll, 800);
  }
}

async function sendOne(block) {
  const role = roleForSpeaker(block.speaker);
  const resp = await fetch('/api/session/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: block.content, role }),
  });
  const data = await resp.json();
  if (!data.ok) throw new Error('Error sending message');
  log(`Message sent: Speaker ${block.speaker} (${role}) -> ${block.content.substring(0, 80)}${block.content.length > 80 ? '…' : ''}`);
}

function scheduleNext() {
  const speed = Math.max(0.05, Number(speedInput.value) || 1);
  const intervalMs = 1000 / speed; // msgs per second
  timerId = setTimeout(async () => {
    if (!playing) return;
    if (playIndex >= parsedBlocks.length) {
      log('Transcript finished');
      playing = false;
      pauseBtn.disabled = true;
      resumeBtn.disabled = true;
      return;
    }
    try {
      // Marcar actual como "current"
      const li = transcriptList.children[playIndex];
      if (li) {
        // quitar current previo
        const prev = transcriptList.querySelector('li.current');
        if (prev) prev.classList.remove('current');
        li.classList.add('current');
        li.scrollIntoView({ block: 'nearest' });
      }
      await sendOne(parsedBlocks[playIndex]);
      // Marcar como "played"
      const liPlayed = transcriptList.children[playIndex];
      if (liPlayed) {
        liPlayed.classList.add('played');
        liPlayed.classList.remove('current');
      }
    } catch (e) {
      log(`Error sending: ${e.message || e}`);
    }
    playIndex++;
    scheduleNext();
  }, intervalMs);
}

function startPlayback() {
  if (!parsedBlocks.length) {
    log('No transcript loaded');
    return;
  }
  playing = true;
  pauseBtn.disabled = false;
  resumeBtn.disabled = true;
  scheduleNext();
}

function pausePlayback() {
  playing = false;
  if (timerId) clearTimeout(timerId);
  timerId = null;
  pauseBtn.disabled = true;
  resumeBtn.disabled = false;
}

function resumePlayback() {
  if (playing) return;
  playing = true;
  pauseBtn.disabled = false;
  resumeBtn.disabled = true;
  scheduleNext();
}

async function resetAll() {
  playing = false;
  if (timerId) clearTimeout(timerId);
  timerId = null;
  playIndex = 0;
  await fetch('/api/session/reset', { method: 'POST' });
  copilotFrame.src = 'about:blank';
  log('Reseted');
}

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  parsedBlocks = parseTranscript(text);
  renderTranscript(parsedBlocks);
  log(`Transcript loaded: ${parsedBlocks.length} blocks`);
});

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  try {
    await startSession();
    startPlayback();
    resetBtn.disabled = false;
  } catch (e) {
    log(`Error starting: ${e.message || e}`);
    startBtn.disabled = false;
  }
});

pauseBtn.addEventListener('click', () => {
  pausePlayback();
});

resumeBtn.addEventListener('click', () => {
  resumePlayback();
});

resetBtn.addEventListener('click', async () => {
  await resetAll();
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resumeBtn.disabled = true;
  resetBtn.disabled = true;
});



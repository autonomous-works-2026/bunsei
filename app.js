import { formatSafely, inspectText } from './engine.js';

const source = document.querySelector('#source');
const formatted = document.querySelector('#formatted');
const findings = document.querySelector('#findings');
const summary = document.querySelector('#summary');
const copyButton = document.querySelector('#copy');

function addFinding(kind, text) {
  const item = document.createElement('li');
  item.className = `finding ${kind === 'ok' ? 'ok' : ''}`;
  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = kind === 'ok' ? 'OK' : 'CHECK';
  const message = document.createElement('p');
  message.textContent = text;
  item.append(badge, message);
  findings.append(item);
}

function inspect() {
  findings.replaceChildren();
  const results = inspectText(source.value);
  if (!source.value.trim()) {
    summary.textContent = '点検する文章を入力してください';
    return;
  }
  if (!results.length) {
    addFinding('ok', 'この点検項目では、特に確認が必要な箇所は見つかりませんでした。');
    summary.textContent = '点検完了';
    return;
  }
  results.forEach((result) => addFinding('check', result.message));
  summary.textContent = `${results.length}種類の確認項目があります`;
}

document.querySelector('#inspect').addEventListener('click', inspect);
document.querySelector('#format').addEventListener('click', () => {
  formatted.value = formatSafely(source.value);
  copyButton.disabled = !formatted.value;
  inspect();
});
document.querySelector('#clear').addEventListener('click', () => {
  source.value = '';
  formatted.value = '';
  findings.replaceChildren();
  summary.textContent = '文章を入力すると結果を表示します';
  copyButton.disabled = true;
  source.focus();
});
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(formatted.value);
    copyButton.textContent = 'コピーしました';
    window.setTimeout(() => { copyButton.textContent = '整形結果をコピー'; }, 1600);
  } catch {
    copyButton.textContent = '手動でコピーしてください';
  }
});

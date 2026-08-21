function countMatches(text, expression) {
  return [...text.matchAll(expression)].length;
}

export function inspectText(input) {
  const text = input ?? '';
  if (!text.trim()) return [];

  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const findings = [];
  const trailing = lines.filter((line) => /[ \t]+$/.test(line)).length;
  if (trailing) findings.push({ key: 'trailing-space', message: `${trailing}行に行末の空白があります。Markdownでは意図しない改行になることがあります。` });

  const blankRuns = countMatches(text.replace(/\r\n?/g, '\n'), /\n[\t ]*\n[\t ]*\n/g);
  if (blankRuns) findings.push({ key: 'blank-runs', message: `${blankRuns}か所に3行以上の連続した空行があります。` });

  const japanesePunctuation = countMatches(text, /[、。]/g);
  // A dot or comma inside an ASCII token is usually a URL, file name, decimal,
  // or identifier rather than prose punctuation.
  const westernPunctuation = countMatches(text, /(?<![A-Za-z0-9])[,.]|[,.](?![A-Za-z0-9])/g);
  if (japanesePunctuation && westernPunctuation) findings.push({ key: 'punctuation', message: '和文の句読点（、。）と欧文の句読点（, .）が混在しています。意図した表記か確認してください。' });

  const fullWidthAlphaNum = countMatches(text, /[Ａ-Ｚａ-ｚ０-９]/g);
  const halfWidthAlphaNum = countMatches(text, /[A-Za-z0-9]/g);
  if (fullWidthAlphaNum && halfWidthAlphaNum) findings.push({ key: 'width', message: '全角と半角の英数字が混在しています。固有名詞やコード以外は統一すると読みやすくなります。' });

  const longLines = lines.filter((line) => [...line].length > 120).length;
  if (longLines) findings.push({ key: 'long-lines', message: `${longLines}行が120文字を超えています。画面幅の狭い環境での可読性を確認してください。` });

  const emptyAlt = countMatches(text, /!\[\s*\]\([^)]*\)/g);
  if (emptyAlt) findings.push({ key: 'empty-alt', message: `${emptyAlt}個のMarkdown画像に代替テキストがありません。` });

  return findings;
}

export function formatSafely(input) {
  return (input ?? '')
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n(?:[ \t]*\n){2,}/g, '\n\n');
}

type NumberUnit = 'K' | 'M' | 'B' | 'T' | 'P' | 'E';

export function shortenNumber(rawNumber: number) {
  if (rawNumber < 1000) {
    return rawNumber;
  }

  const si: { v: number; s: NumberUnit }[] = [
    { v: 1e3, s: 'K' },
    { v: 1e6, s: 'M' },
    { v: 1e9, s: 'B' },
    { v: 1e12, s: 'T' },
    { v: 1e15, s: 'P' },
    { v: 1e18, s: 'E' },
  ];
  let index;
  for (index = si.length - 1; index > 0; index--) {
    if (rawNumber >= si[index].v) {
      break;
    }
  }
  return (
    (rawNumber / si[index].v)
      .toFixed(2)
      .replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + si[index].s
  );
}

export function random() {
  return Math.floor(Math.random() * 10);
}

export function generateShort(value: string) {
  let code = '';
  value.split(' ').forEach((word, index) => {
    if (word.length > 0) {
      if (index === 0) code = `${code}${word[0].toUpperCase()}`;
      if (word.length > 3 && index !== 0)
        code = `${code}${word[0].toUpperCase()}`;
    }
  });
  return code;
}

export function getRandomString(length: number) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
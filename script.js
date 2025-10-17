function factorial(n) {
  if (n === 0) return 1n;
  let result = 1n;
  for (let i = 1n; i <= BigInt(n); i++) result *= i;
  return result;
}

async function factorialAsync(n, onProgress) {
  if (n === 0) return 1n;
  let result = 1n;
  const bigN = BigInt(n);
  const chunk = 2000n;

  for (let i = 1n; i <= bigN; i++) {
    result *= i;
    if (i % chunk === 0n) {
      if (onProgress) onProgress(Math.floor(Number((i * 100n) / bigN)));
      await new Promise(requestAnimationFrame);
    }
  }

  if (onProgress) onProgress(100);
  return result;
}

function saveTextFile(fileName, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function calculateFactorial() {
  const inputElement = document.getElementById('numberInput');
  const outputElement = document.getElementById('output');
  const tipBoxElement = document.getElementById('tipBox');
  const metaElement = document.getElementById('meta');
  const button = document.getElementById('calculateButton');

  outputElement.classList.remove('text-red-600', 'font-bold');
  outputElement.classList.add('text-primary-blue');
  tipBoxElement.style.display = 'block';
  metaElement.textContent = '';

  let num = parseInt(inputElement.value);

  if (isNaN(num) || inputElement.value.trim() === '') {
    outputElement.textContent = 'Please enter a valid number.';
    outputElement.classList.add('text-red-600', 'font-bold');
    tipBoxElement.style.display = 'none';
    return;
  }

  if (num < 0) {
    outputElement.textContent =
      'Error: Factorial is only defined for non-negative integers (0, 1, 2, ...).';
    outputElement.classList.add('text-red-600', 'font-bold');
    tipBoxElement.style.display = 'none';
    return;
  }

  try {
    button.disabled = true;
    button.classList.add('opacity-60', 'cursor-not-allowed');
    outputElement.textContent = `Calculating ${num}! ...`;

    const start = performance.now();
    const result = await factorialAsync(num, (p) => {
      outputElement.textContent = `Calculating ${num}! ... ${p}%`;
    });
    const end = performance.now();

    const str = result.toString();
    const digits = str.length;
    const DISPLAY_DIGIT_LIMIT = 10000;

    if (digits > DISPLAY_DIGIT_LIMIT) {
      const header = `${num}! (digits: ${digits.toLocaleString()})\n`;
      const content = header + str + '\n';
      const fileName = `factorial_${num}.txt`;
      saveTextFile(fileName, content);

      const head = str.slice(0, 64);
      const tail = str.slice(-64);
      outputElement.textContent = `${num}! is very large. Saved to file: ${fileName}`;
      tipBoxElement.innerHTML = `<span class="font-bold text-primary-blue">Preview:</span> ${head} … ${tail}`;
    } else {
      outputElement.textContent = `${num}! = ${str}`;
      tipBoxElement.innerHTML = `<span class="font-bold text-primary-blue">Note:</span> Factorials are the product of all positive integers up to the number denoted (5! = 5 × 4 × 3 × 2 × 1 = 120). Also, 0! = 1.`;
    }

    metaElement.textContent = `Digits: ${digits.toLocaleString()} | Time: ${(end - start).toFixed(0)} ms`;
    button.disabled = false;
    button.classList.remove('opacity-60', 'cursor-not-allowed');
  } catch (e) {
    outputElement.textContent =
      'An internal error occurred during calculation. Try a smaller number.';
    outputElement.classList.add('text-red-600', 'font-bold');
    console.error('Factorial calculation error:', e);
    tipBoxElement.style.display = 'none';
    button.disabled = false;
    button.classList.remove('opacity-60', 'cursor-not-allowed');
  }
}

document
  .getElementById('numberInput')
  .addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      calculateFactorial();
    }
  });

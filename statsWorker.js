self.onmessage = (event) => {
    const { totalChars, correctChars, startTime } = event.data;

    if (!startTime) {
        self.postMessage({ wpm: 0, accuracy: 100 });
        return;
    }

    const now = Date.now();
    const elapsedMinutes = Math.max((now - startTime) / 60000, 1 / 60);
    const wordsTyped = totalChars / 5;
    const wpm = totalChars > 0 ? Math.max(0, Math.round(wordsTyped / elapsedMinutes)) : 0;
    const accuracy = totalChars > 0
        ? Math.min(100, Math.max(0, Math.round((correctChars / totalChars) * 100)))
        : 100;

    self.postMessage({ wpm, accuracy });
};

// Copy Cat! Typing Test - DC101 Project
// Author: Jonalyn Avila

class TypingTest {
    constructor() {
        // DOM references
        this.timerDisplay = document.getElementById('timer');
        this.wpmDisplay = document.getElementById('wpm');
        this.accuracyDisplay = document.getElementById('accuracy');
        this.textDisplay = document.getElementById('sample-text');
        this.typingInput = document.getElementById('typing-input');
        this.progressBar = document.getElementById('progress');
        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.resultsSection = document.getElementById('results');
        this.finalWpm = document.getElementById('final-wpm');
        this.finalAccuracy = document.getElementById('final-accuracy');
        this.finalTime = document.getElementById('final-time');
        this.performanceMessage = document.getElementById('performance-message');
        this.durationSelect = document.getElementById('duration-select');
        this.catImage = document.getElementById('cat-anim');
        this.historyList = document.getElementById('history-list');
        this.historyEmpty = document.getElementById('history-empty');
        this.historySection = document.getElementById('history');

        // Game state
        this.isActive = false;
        this.timer = null;
        this.startTime = null;
        this.currentText = '';
        this.currentIndex = 0;
        this.correctChars = 0;
        this.incorrectChars = 0;
        this.totalChars = 0;
        this.catIdleSrc = 'assets/idle_cat.gif';
        this.catTypingSrc = 'assets/typing_cat.gif';
        this.catTimeout = null;
        this.idleDelay = 750;
        this.stopReason = 'completed';
        const initialDuration = this.durationSelect ? parseInt(this.durationSelect.value, 10) : NaN;
        this.selectedDuration = Number.isFinite(initialDuration) ? initialDuration : 60;
        this.timeLeft = this.selectedDuration;
        this.workerSupported = typeof Worker !== 'undefined';
        this.statsWorker = this.workerSupported ? new Worker('statsWorker.js') : null;
        this.latestStats = { wpm: 0, accuracy: 100 };
        this.historyKey = 'copyCatHistory';
        this.weekDuration = 7 * 24 * 60 * 60 * 1000;
        this.storageAvailable = this.checkStorageSupport();

        // Sample texts
        this.sampleTexts = [
            'The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once, making it perfect for typing practice and testing keyboard skills.',
            'In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat.',
            'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of light, it was the season of darkness.',
            "To be or not to be, that is the question. Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles and by opposing end them.",
            "All happy families are alike; each unhappy family is unhappy in its own way. Everything was in confusion in the Oblonskys' house. The wife had discovered that the husband was carrying on an intrigue with a French girl.",
            "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world."
        ];

        this.init();
    }

    init() {
        this.startBtn.addEventListener('click', () => this.startTest());
        if (this.stopBtn) {
            this.stopBtn.addEventListener('click', () => this.stopTest('stopped'));
        }
        this.restartBtn.addEventListener('click', () => this.restartTest());
        this.typingInput.addEventListener('input', (e) => this.handleTyping(e));
        this.typingInput.addEventListener('keydown', () => this.animateCatTyping());
        this.typingInput.addEventListener('blur', () => this.showIdleCat());
        if (this.durationSelect) {
            this.durationSelect.addEventListener('change', () => this.handleDurationChange());
        }
        if (this.statsWorker) {
            this.statsWorker.addEventListener('message', (event) => this.applyStats(event.data));
        }

        this.updateDisplay();
        this.applyStats(this.latestStats);
        if (this.storageAvailable) {
            this.renderHistory();
        } else if (this.historySection) {
            this.historySection.classList.add('hidden');
        }
        this.showIdleCat();
    }

    startTest() {
        if (this.isActive) return;

        this.isActive = true;
        this.stopReason = 'completed';
        this.timeLeft = this.selectedDuration;
        this.startTime = Date.now();
        this.currentIndex = 0;
        this.correctChars = 0;
        this.incorrectChars = 0;
        this.totalChars = 0;

        this.currentText = this.sampleTexts[Math.floor(Math.random() * this.sampleTexts.length)];
        this.textDisplay.textContent = this.currentText;
        this.typingInput.value = '';
        this.typingInput.disabled = false;
        this.typingInput.focus();
        this.startBtn.disabled = true;
        this.restartBtn.disabled = true;
        if (this.stopBtn) {
            this.stopBtn.disabled = false;
        }
        if (this.durationSelect) {
            this.durationSelect.disabled = true;
        }
        this.resultsSection.classList.add('hidden');
        this.showIdleCat();

        this.startTimer();
        this.updateProgress();
        this.applyStats({ wpm: 0, accuracy: 100 });
    }

    restartTest() {
        this.stopTest('stopped');
        this.startTest();
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();

            if (this.timeLeft <= 0) {
                this.endTest();
            }
        }, 1000);
    }

    stopTest(reason = 'completed') {
        this.stopReason = reason;
        this.isActive = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (this.stopBtn) {
            this.stopBtn.disabled = true;
        }
        if (this.durationSelect) {
            this.durationSelect.disabled = false;
        }

        if (reason === 'stopped') {
            this.typingInput.disabled = true;
            this.startBtn.disabled = false;
            this.restartBtn.disabled = false;
            this.resultsSection.classList.add('hidden');
            this.timerDisplay.textContent = `${this.selectedDuration}s`;
            this.applyStats({ wpm: 0, accuracy: 100 });
            this.showIdleCat();
        }
    }

    endTest() {
        this.stopTest('completed');

        const elapsedSeconds = Math.max((Date.now() - this.startTime) / 1000, 1);
        const wordsTyped = this.totalChars / 5;
        const finalWpm = Math.round((wordsTyped / elapsedSeconds) * 60);
        const finalAccuracy = this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 100;

        this.finalWpm.textContent = finalWpm;
        this.finalAccuracy.textContent = finalAccuracy + '%';
        this.finalTime.textContent = Math.round(elapsedSeconds) + 's';
        this.setPerformanceMessage(finalWpm, finalAccuracy);

        this.resultsSection.classList.remove('hidden');
        this.startBtn.disabled = false;
        this.restartBtn.disabled = false;
        this.typingInput.disabled = true;
        this.showIdleCat();
        this.persistResult({
            wpm: finalWpm,
            accuracy: finalAccuracy,
            timeTaken: Math.round(elapsedSeconds)
        });
    }

    handleTyping(event) {
        if (!this.isActive) return;

        let inputValue = event.target.value || '';
        if (inputValue.length > this.currentText.length) {
            inputValue = inputValue.slice(0, this.currentText.length);
            event.target.value = inputValue;
        }

        const comparisonLength = Math.min(inputValue.length, this.currentText.length);
        this.currentIndex = comparisonLength;
        this.totalChars = comparisonLength;
        this.correctChars = 0;
        this.incorrectChars = 0;

        for (let i = 0; i < comparisonLength; i++) {
            if (inputValue[i] === this.currentText[i]) {
                this.correctChars++;
            } else {
                this.incorrectChars++;
            }
        }

        this.animateCatTyping();
        this.updateTextHighlighting(inputValue);
        this.updateProgress();
        this.requestStatsUpdate();

        if (this.currentIndex >= this.currentText.length) {
            this.endTest();
        }
    }

    updateTextHighlighting(inputValue) {
        let highlightedText = '';
        const inputLength = Math.min(inputValue.length, this.currentText.length);

        for (let i = 0; i < this.currentText.length; i++) {
            if (i < inputLength) {
                const isCorrect = inputValue[i] === this.currentText[i];
                const className = isCorrect ? 'correct-char' : 'incorrect-char';
                highlightedText += `<span class="${className}">${this.currentText[i]}</span>`;
            } else if (i === inputLength) {
                highlightedText += `<span class="current-char">${this.currentText[i]}</span>`;
            } else {
                highlightedText += this.currentText[i];
            }
        }

        this.textDisplay.innerHTML = highlightedText;
    }

    updateProgress() {
        const progress = (this.currentIndex / this.currentText.length) * 100;
        this.progressBar.style.width = progress + '%';
    }

    updateDisplay() {
        this.timerDisplay.textContent = this.timeLeft + 's';

        this.requestStatsUpdate();
    }

    setPerformanceMessage(wpm, accuracy) {
        let message = '';

        if (wpm >= 60 && accuracy >= 95) {
            message = "Outstanding! You're a typing champion!";
        } else if (wpm >= 45 && accuracy >= 90) {
            message = 'Great job! You have excellent typing skills!';
        } else if (wpm >= 30 && accuracy >= 80) {
            message = 'Good work! Keep practicing to improve further!';
        } else if (wpm >= 20 && accuracy >= 70) {
            message = "Not bad! With more practice, you'll get even better!";
        } else {
            message = 'Keep practicing! Every expert was once a beginner!';
        }

        this.performanceMessage.textContent = message;
    }

    animateCatTyping() {
        if (!this.catImage) return;
        this.catImage.src = this.catTypingSrc;
        if (this.catTimeout) {
            clearTimeout(this.catTimeout);
        }
        this.catTimeout = setTimeout(() => this.showIdleCat(), this.idleDelay);
    }

    showIdleCat() {
        if (!this.catImage) return;
        if (this.catTimeout) {
            clearTimeout(this.catTimeout);
            this.catTimeout = null;
        }
        this.catImage.src = this.catIdleSrc;
    }

    handleDurationChange() {
        if (!this.durationSelect) return;
        const parsedValue = parseInt(this.durationSelect.value, 10);
        if (!Number.isFinite(parsedValue)) {
            this.durationSelect.value = String(this.selectedDuration);
            return;
        }

        this.selectedDuration = parsedValue;
        if (!this.isActive) {
            this.timeLeft = this.selectedDuration;
            this.updateDisplay();
        } else {
            this.durationSelect.value = String(this.selectedDuration);
        }
    }

    requestStatsUpdate() {
        if (!this.startTime) {
            this.applyStats({ wpm: 0, accuracy: 100 });
            return;
        }

        if (this.statsWorker) {
            this.statsWorker.postMessage({
                totalChars: this.totalChars,
                correctChars: this.correctChars,
                startTime: this.startTime
            });
        } else {
            this.applyStats(this.calculateStats());
        }
    }

    applyStats({ wpm, accuracy }) {
        const safeWpm = Number.isFinite(wpm) ? wpm : 0;
        const safeAccuracy = Number.isFinite(accuracy) ? accuracy : 100;
        this.wpmDisplay.textContent = String(safeWpm);
        this.accuracyDisplay.textContent = `${safeAccuracy}%`;
        this.latestStats = { wpm: safeWpm, accuracy: safeAccuracy };
    }

    calculateStats() {
        if (!this.startTime) {
            return { wpm: 0, accuracy: 100 };
        }

        const elapsedMinutes = Math.max((Date.now() - this.startTime) / 60000, 1 / 60);
        const wordsTyped = this.totalChars / 5;
        const wpm = this.totalChars > 0 ? Math.max(0, Math.round(wordsTyped / elapsedMinutes)) : 0;
        const accuracy = this.totalChars > 0
            ? Math.min(100, Math.max(0, Math.round((this.correctChars / this.totalChars) * 100)))
            : 100;

        return { wpm, accuracy };
    }

    checkStorageSupport() {
        try {
            if (!window.localStorage) return false;
            const key = '__copyCatTest__';
            localStorage.setItem(key, key);
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('Copy Cat history disabled: localStorage unavailable.', error);
            return false;
        }
    }

    loadHistory() {
        if (!this.storageAvailable) return [];
        try {
            const raw = localStorage.getItem(this.historyKey);
            return raw ? JSON.parse(raw) : [];
        } catch (error) {
            console.warn('Failed to parse Copy Cat history.', error);
            return [];
        }
    }

    persistHistory(entries) {
        if (!this.storageAvailable) return;
        try {
            localStorage.setItem(this.historyKey, JSON.stringify(entries));
        } catch (error) {
            console.warn('Failed to save Copy Cat history.', error);
        }
    }

    pruneHistory(entries = this.loadHistory()) {
        const cutoff = Date.now() - this.weekDuration;
        const filtered = entries.filter((entry) => entry.timestamp >= cutoff);
        if (filtered.length !== entries.length) {
            this.persistHistory(filtered);
        }
        return filtered;
    }

    persistResult(result) {
        if (!this.storageAvailable || this.stopReason !== 'completed') return;
        const history = this.pruneHistory();
        history.push({ ...result, timestamp: Date.now() });
        this.persistHistory(history);
        this.renderHistory(history);
    }

    renderHistory(entries = this.pruneHistory()) {
        if (!this.historyList) return;
        const sorted = entries.slice().sort((a, b) => b.timestamp - a.timestamp);
        this.historyList.innerHTML = '';

        if (!sorted.length) {
            if (this.historyEmpty) {
                this.historyEmpty.classList.remove('hidden');
            }
            return;
        }

        if (this.historyEmpty) {
            this.historyEmpty.classList.add('hidden');
        }

        sorted.forEach((entry) => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <div class="history-meta">
                    <strong>${this.formatDate(entry.timestamp)}</strong>
                    <span>Accuracy: ${entry.accuracy}% · Time: ${entry.timeTaken}s</span>
                </div>
                <div class="history-score">
                    <strong>${entry.wpm} WPM</strong>
                    <small>${this.getPerformanceLabel(entry.wpm)}</small>
                </div>
            `;
            this.historyList.appendChild(li);
        });
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });
    }

    getPerformanceLabel(wpm) {
        if (wpm >= 60) return 'Fast paws!';
        if (wpm >= 45) return 'Speedy kitten';
        if (wpm >= 30) return 'Good rhythm';
        if (wpm >= 20) return 'Warming up';
        return 'Keep practicing';
    }
}

// Add CSS for text highlighting
const style = document.createElement('style');
style.textContent = `
    .correct-char {
        color: var(--success-color);
        background-color: rgba(16, 185, 129, 0.1);
    }
    .incorrect-char {
        color: var(--danger-color);
        background-color: rgba(239, 68, 68, 0.1);
        text-decoration: underline;
    }
    .current-char {
        background-color: var(--primary-color);
        color: white;
        border-radius: 2px;
        padding: 0 1px;
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    new TypingTest();
});



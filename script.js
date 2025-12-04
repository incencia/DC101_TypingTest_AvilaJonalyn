// Copy Cat! Typing Test - DC101 Project
// Author: Jonalyn Avila
// JavaScript implementation for typing test functionality

class TypingTest {
    constructor() {
        // DOM elements
        this.timerDisplay = document.getElementById('timer');
        this.wpmDisplay = document.getElementById('wpm');
        this.accuracyDisplay = document.getElementById('accuracy');
        this.textDisplay = document.getElementById('sample-text');
        this.typingInput = document.getElementById('typing-input');
        this.progressBar = document.getElementById('progress');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.resultsSection = document.getElementById('results');
        this.finalWpm = document.getElementById('final-wpm');
        this.finalAccuracy = document.getElementById('final-accuracy');
        this.finalTime = document.getElementById('final-time');
        this.performanceMessage = document.getElementById('performance-message');
        this.catImage = document.getElementById('cat-anim');
        this.historyList = document.getElementById('history-list');
        this.historyEmpty = document.getElementById('history-empty');
        this.historySection = document.getElementById('history');
        this.durationSelect = document.getElementById('duration-select');

        // Game state
        this.isActive = false;
        this.timeLeft = 60; // default
        this.timer = null;
        this.startTime = null;
        this.currentText = '';
        this.currentIndex = 0;
        this.correctChars = 0;
        this.incorrectChars = 0;
        this.totalChars = 0;
        this.catTimeout = null;
        this.catIdleSrc = 'assets/idle_cat.gif';
        this.catTypingSrc = 'assets/typing_cat.gif';
        this.idleDelay = 750;
        this.isCatTyping = false;
        this.workerSupported = typeof Worker !== 'undefined';
        this.statsWorker = this.workerSupported ? new Worker('statsWorker.js') : null;
        this.latestStats = { wpm: 0, accuracy: 100 };
        this.highlightRequest = null;
        this.progressRequest = null;
        this.pendingInputValue = '';
        this.lastHighlightValue = '';
        this.lastProgressPercent = null;
        this.historyKey = 'copyCatResults';
        this.weekDuration = 7 * 24 * 60 * 60 * 1000;
        this.storageAvailable = this.checkStorageSupport();
        const parsedDuration = this.durationSelect ? parseInt(this.durationSelect.value, 10) : NaN;
        this.selectedDuration = Number.isFinite(parsedDuration) ? parsedDuration : 60;
        this.timeLeft = this.selectedDuration;

        // Sample texts for testing
        this.sampleTexts = [
            "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once, making it perfect for typing practice and testing keyboard skills.",
            "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat.",
            "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of light, it was the season of darkness.",
            "To be or not to be, that is the question. Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles and by opposing end them.",
            "All happy families are alike; each unhappy family is unhappy in its own way. Everything was in confusion in the Oblonskys' house. The wife had discovered that the husband was carrying on an intrigue with a French girl.",
            "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world."
        ];

        if (this.statsWorker) {
            this.statsWorker.addEventListener('message', (event) => {
                this.applyStats(event.data);
            });
        }

        this.init();
    }

    init() {
        // Event listeners
        this.startBtn.addEventListener('click', () => this.startTest());
        this.restartBtn.addEventListener('click', () => this.restartTest());
        this.typingInput.addEventListener('input', (e) => this.handleTyping(e));
        this.typingInput.addEventListener('keydown', () => this.animateCatTyping());
        this.typingInput.addEventListener('blur', () => this.showIdleCat());
        if (this.durationSelect) {
            this.durationSelect.addEventListener('change', () => this.handleDurationChange());
        }

        // Initialize display
        this.updateDisplay();
        this.applyStats(this.latestStats);
        this.showIdleCat();
        if (this.storageAvailable) {
            this.renderHistory();
        } else if (this.historySection) {
            this.historySection.classList.add('hidden');
        }
    }

    startTest() {
        if (this.isActive) return;

        this.isActive = true;
        this.timeLeft = this.selectedDuration;
        this.startTime = Date.now();
        this.currentIndex = 0;
        this.correctChars = 0;
        this.incorrectChars = 0;
        this.totalChars = 0;

        // Select random text
        this.currentText = this.sampleTexts[Math.floor(Math.random() * this.sampleTexts.length)];

        // Update UI
        this.textDisplay.textContent = this.currentText;
        this.updateTextHighlighting('');
        this.lastHighlightValue = '';
        this.typingInput.value = '';
        this.typingInput.disabled = false;
        this.typingInput.focus();
        this.startBtn.disabled = true;
        this.restartBtn.disabled = true;
        if (this.durationSelect) {
            this.durationSelect.disabled = true;
        }
        this.resultsSection.classList.add('hidden');

        // Start timer
        this.startTimer();

        // Reset progress
        this.updateProgress();
        this.lastProgressPercent = 0;

        // Reset cat animation to idle until typing begins
        this.showIdleCat();
        this.applyStats({ wpm: 0, accuracy: 100 });
    }

    restartTest() {
        this.stopTest();
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

    stopTest() {
        this.isActive = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.showIdleCat();
        if (this.durationSelect) {
            this.durationSelect.disabled = false;
        }
    }

    endTest() {
        this.stopTest();

        // Calculate final stats
        const { wpm: finalWpm, accuracy: finalAccuracy } = this.calculateStats();
        const timeElapsed = Math.max(Math.round((Date.now() - this.startTime) / 1000), 1); // in seconds

        // Update final results
        this.finalWpm.textContent = finalWpm;
        this.finalAccuracy.textContent = finalAccuracy + '%';
        this.finalTime.textContent = timeElapsed + 's';

        // Performance message
        this.setPerformanceMessage(finalWpm, finalAccuracy);

        // Show results
        this.resultsSection.classList.remove('hidden');

        // Enable restart button
        this.restartBtn.disabled = false;

        // Disable input
        this.typingInput.disabled = true;
        this.showIdleCat();

        // Persist result to history
        this.persistResult({
            wpm: finalWpm,
            accuracy: finalAccuracy,
            timeTaken: timeElapsed
        });
    }

    handleTyping(event) {
        if (!this.isActive) return;
        this.animateCatTyping();

        const inputValue = event.target.value;
        const currentChar = this.currentText[this.currentIndex];

        // Check if user is typing new characters
        if (inputValue.length > this.currentIndex) {
            // New character typed
            const typedChar = inputValue[this.currentIndex];

            if (typedChar === currentChar) {
                this.correctChars++;
            } else {
                this.incorrectChars++;
            }

            this.totalChars++;
            this.currentIndex++;
        } else if (inputValue.length < this.currentIndex) {
            // Backspace - remove last character tracking
            this.currentIndex--;
            if (this.totalChars > 0) {
                this.totalChars--;
                // Try to determine if it was correct or incorrect (approximation)
                if (this.correctChars > 0) {
                    this.correctChars--;
                } else if (this.incorrectChars > 0) {
                    this.incorrectChars--;
                }
            }
        }

        // Update display highlighting & progress using animation frames
        this.queueTextHighlighting(inputValue);
        this.updateProgress();

        // Check if test is complete (all text typed)
        if (this.currentIndex >= this.currentText.length) {
            this.endTest();
        }

        // Refresh stats asynchronously
        this.requestStatsUpdate();
    }

    handleDurationChange() {
        if (!this.durationSelect) return;
        const newDuration = parseInt(this.durationSelect.value, 10);

        if (this.isActive) {
            this.durationSelect.value = String(this.selectedDuration);
            return;
        }

        this.selectedDuration = Number.isFinite(newDuration) ? newDuration : 60;
        this.timeLeft = this.selectedDuration;
        this.updateDisplay();
    }

    queueTextHighlighting(inputValue) {
        if (inputValue === this.lastHighlightValue) {
            return;
        }

        this.pendingInputValue = inputValue;
        if (this.highlightRequest) {
            cancelAnimationFrame(this.highlightRequest);
        }

        this.highlightRequest = requestAnimationFrame(() => {
            this.updateTextHighlighting(this.pendingInputValue);
            this.highlightRequest = null;
        });
    }

    updateTextHighlighting(inputValue) {
        let highlightedText = '';
        const inputLength = Math.min(inputValue.length, this.currentText.length);

        for (let i = 0; i < this.currentText.length; i++) {
            if (i < inputLength) {
                // Character has been typed
                const isCorrect = inputValue[i] === this.currentText[i];
                const className = isCorrect ? 'correct-char' : 'incorrect-char';
                highlightedText += `<span class="${className}">${this.currentText[i]}</span>`;
            } else if (i === inputLength) {
                // Current character to type
                highlightedText += `<span class="current-char">${this.currentText[i]}</span>`;
            } else {
                // Remaining characters
                highlightedText += this.currentText[i];
            }
        }

        this.textDisplay.innerHTML = highlightedText;
        this.lastHighlightValue = inputValue;
    }

    updateProgress() {
        const totalLength = this.currentText.length || 1;
        const progress = Math.min(100, (this.currentIndex / totalLength) * 100);
        const roundedProgress = Math.round(progress * 100) / 100;

        if (this.lastProgressPercent === roundedProgress) {
            return;
        }

        if (this.progressRequest) {
            cancelAnimationFrame(this.progressRequest);
        }

        this.progressRequest = requestAnimationFrame(() => {
            this.progressBar.style.width = roundedProgress + '%';
            this.progressRequest = null;
            this.lastProgressPercent = roundedProgress;
        });
    }

    updateDisplay() {
        // Update timer
        this.timerDisplay.textContent = this.timeLeft + 's';

        // Request async stats update so WPM/accuracy stay in sync with time.
        this.requestStatsUpdate();
    }

    setPerformanceMessage(wpm, accuracy) {
        let message = '';
        let emoji = '';

        if (wpm >= 60 && accuracy >= 95) {
            message = 'Outstanding! You\'re a typing champion! 🏆';
            emoji = '🏆';
        } else if (wpm >= 45 && accuracy >= 90) {
            message = 'Great job! You have excellent typing skills! 👏';
            emoji = '👏';
        } else if (wpm >= 30 && accuracy >= 80) {
            message = 'Good work! Keep practicing to improve further! 💪';
            emoji = '💪';
        } else if (wpm >= 20 && accuracy >= 70) {
            message = 'Not bad! With more practice, you\'ll get even better! 📈';
            emoji = '📈';
        } else {
            message = 'Keep practicing! Every expert was once a beginner! 🎯';
            emoji = '🎯';
        }

        this.performanceMessage.textContent = message;
    }

    animateCatTyping() {
        if (!this.catImage) return;
        if (!this.isCatTyping) {
            this.catImage.src = this.catTypingSrc;
            this.isCatTyping = true;
        }
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
        this.isCatTyping = false;
    }

    requestStatsUpdate() {
        if (!this.startTime) {
            this.applyStats({ wpm: 0, accuracy: this.totalChars > 0 ? this.calculateAccuracy() : 100 });
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

    calculateAccuracy() {
        return this.totalChars > 0
            ? Math.min(100, Math.max(0, Math.round((this.correctChars / this.totalChars) * 100)))
            : 100;
    }

    calculateStats() {
        if (!this.startTime) {
            return { wpm: 0, accuracy: 100 };
        }

        const elapsedMinutes = Math.max((Date.now() - this.startTime) / 60000, 1 / 60);
        const wordsTyped = this.totalChars / 5;
        const wpm = this.totalChars > 0 ? Math.max(0, Math.round(wordsTyped / elapsedMinutes)) : 0;
        const accuracy = this.calculateAccuracy();

        return { wpm, accuracy };
    }

    applyStats({ wpm, accuracy }) {
        if (typeof wpm === 'number') {
            this.wpmDisplay.textContent = wpm;
        }
        if (typeof accuracy === 'number') {
            this.accuracyDisplay.textContent = accuracy + '%';
        }
        this.latestStats = {
            wpm: typeof wpm === 'number' ? wpm : this.latestStats.wpm,
            accuracy: typeof accuracy === 'number' ? accuracy : this.latestStats.accuracy
        };
    }

    checkStorageSupport() {
        try {
            if (!window.localStorage) return false;
            const testKey = '__copyCatStorage__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
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

    persistHistory(history) {
        if (!this.storageAvailable) return;
        try {
            localStorage.setItem(this.historyKey, JSON.stringify(history));
        } catch (error) {
            console.warn('Failed to save Copy Cat history.', error);
        }
    }

    pruneHistory(history = this.loadHistory()) {
        const weekAgo = Date.now() - this.weekDuration;
        const filtered = history.filter((entry) => entry.timestamp >= weekAgo);
        if (filtered.length !== history.length) {
            this.persistHistory(filtered);
        }
        return filtered;
    }

    persistResult(result) {
        if (!this.storageAvailable) return;
        const history = this.pruneHistory();
        history.push({
            ...result,
            timestamp: Date.now()
        });
        this.persistHistory(history);
        this.renderHistory(history);
    }

    renderHistory(history = this.pruneHistory()) {
        if (!this.historyList) return;
        const entries = history.slice().sort((a, b) => b.timestamp - a.timestamp);
        this.historyList.innerHTML = '';

        if (!entries.length) {
            if (this.historyEmpty) {
                this.historyEmpty.classList.remove('hidden');
            }
            return;
        }

        if (this.historyEmpty) {
            this.historyEmpty.classList.add('hidden');
        }

        entries.forEach((entry) => {
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
        const date = new Date(timestamp);
        return date.toLocaleString(undefined, {
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

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TypingTest();
});


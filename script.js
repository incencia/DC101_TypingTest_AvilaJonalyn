// Type-Tron - AI Typing Challenge - DC101 Project
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

        // Game state
        this.isActive = false;
        this.timeLeft = 60; // 60 seconds
        this.timer = null;
        this.startTime = null;
        this.currentText = '';
        this.currentIndex = 0;
        this.correctChars = 0;
        this.incorrectChars = 0;
        this.totalChars = 0;

        // Sample texts for testing
        this.sampleTexts = [
            "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once, making it perfect for typing practice and testing keyboard skills.",
            "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat.",
            "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of light, it was the season of darkness.",
            "To be or not to be, that is the question. Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles and by opposing end them.",
            "All happy families are alike; each unhappy family is unhappy in its own way. Everything was in confusion in the Oblonskys' house. The wife had discovered that the husband was carrying on an intrigue with a French girl.",
            "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world."
        ];

        this.init();
    }

    init() {
        // Event listeners
        this.startBtn.addEventListener('click', () => this.startTest());
        this.restartBtn.addEventListener('click', () => this.restartTest());
        this.typingInput.addEventListener('input', (e) => this.handleTyping(e));

        // Initialize display
        this.updateDisplay();
    }

    startTest() {
        if (this.isActive) return;

        this.isActive = true;
        this.timeLeft = 60;
        this.startTime = Date.now();
        this.currentIndex = 0;
        this.correctChars = 0;
        this.incorrectChars = 0;
        this.totalChars = 0;

        // Select random text
        this.currentText = this.sampleTexts[Math.floor(Math.random() * this.sampleTexts.length)];

        // Update UI
        this.textDisplay.textContent = this.currentText;
        this.typingInput.value = '';
        this.typingInput.disabled = false;
        this.typingInput.focus();
        this.startBtn.disabled = true;
        this.restartBtn.disabled = true;
        this.resultsSection.classList.add('hidden');

        // Start timer
        this.startTimer();

        // Reset progress
        this.updateProgress();
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
    }

    endTest() {
        this.stopTest();

        // Calculate final stats
        const timeElapsed = (Date.now() - this.startTime) / 1000; // in seconds
        const wordsTyped = this.totalChars / 5; // Standard: 5 characters = 1 word
        const finalWpm = Math.round((wordsTyped / timeElapsed) * 60);
        const finalAccuracy = this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 100;

        // Update final results
        this.finalWpm.textContent = finalWpm;
        this.finalAccuracy.textContent = finalAccuracy + '%';
        this.finalTime.textContent = Math.round(timeElapsed) + 's';

        // Performance message
        this.setPerformanceMessage(finalWpm, finalAccuracy);

        // Show results
        this.resultsSection.classList.remove('hidden');

        // Enable restart button
        this.restartBtn.disabled = false;

        // Disable input
        this.typingInput.disabled = true;
    }

    handleTyping(event) {
        if (!this.isActive) return;

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

        // Update display highlighting
        this.updateTextHighlighting(inputValue);

        // Update progress
        this.updateProgress();

        // Check if test is complete (all text typed)
        if (this.currentIndex >= this.currentText.length) {
            this.endTest();
        }
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
    }

    updateProgress() {
        const progress = (this.currentIndex / this.currentText.length) * 100;
        this.progressBar.style.width = progress + '%';
    }

    updateDisplay() {
        // Update timer
        this.timerDisplay.textContent = this.timeLeft + 's';

        // Calculate WPM (real-time)
        if (this.startTime && this.totalChars > 0) {
            const timeElapsed = (Date.now() - this.startTime) / 1000 / 60; // in minutes
            const wordsTyped = this.totalChars / 5; // Standard: 5 chars = 1 word
            const wpm = Math.round(wordsTyped / timeElapsed);
            this.wpmDisplay.textContent = wpm;
        }

        // Update accuracy
        const accuracy = this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 100;
        this.accuracyDisplay.textContent = accuracy + '%';
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

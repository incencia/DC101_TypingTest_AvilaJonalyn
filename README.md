# 😺 Copy Cat! Typing Test

A modern, responsive browser-based typing speed test game built for the DC101 Web Development course. Train with Copy Cat, an energetic study buddy that mirrors your keystrokes, to improve your WPM (Words Per Minute) and accuracy in real-time!

## 🎮 Game Features

- **Animated Copy Cat Companion**: Idle cat gif swaps to a typing gif whenever you press keys
- **Real-time WPM Calculation**: See your typing speed update as you type
- **Accuracy Tracking**: Monitor your typing accuracy percentage
- **Visual Feedback**: Characters highlight in green (correct) or red (incorrect)
- **Progress Bar**: Visual indicator of completion progress
- **60-Second Timer**: Race against time to achieve your best score
- **Multiple Sample Texts**: Random literary passages for varied practice
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Performance Feedback**: Get encouraging messages based on your results
- **Restart Functionality**: Practice multiple times to improve
- **Automatic History**: Copy Cat stores your last 7 days of scores locally and clears anything older
- **Flexible Timers**: Switch between 15s blitz, 30s sprint, or 60s marathon modes with a dropdown

## ⚙️ Performance & Scalability

- **Web Worker (Multi-threading)**: Offloads WPM and accuracy calculations to `statsWorker.js`, keeping the UI thread responsive on low-powered devices.
- **requestAnimationFrame Rendering**: Text highlighting and progress bar animations are scheduled with `requestAnimationFrame` to avoid layout thrashing.
- **Optimized DOM Updates**: Batched visual updates ensure smooth animations even during rapid typing bursts.

## 📋 How to Play

1. Click "Start Test" to wake Copy Cat from a cozy catnap
2. Type the displayed text as quickly and accurately as possible
3. Your WPM and accuracy will update in real-time
4. Race against the 60-second timer
5. View your final results and see if you can keep up with Copy Cat
6. Click "Restart" to try again and beat your score!

## 🛠️ Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with CSS variables, flexbox, and responsive design
- **JavaScript (ES6+)**: Game logic, DOM manipulation, and event handling
- **Google Fonts**: Inter font family for modern typography
- **Web Storage API**: Keeps a private, device-only history of recent scores

## 📁 Project Structure

```
DC101_CopyCat_AvilaJonalyn/
├── index.html          # Main HTML file with Copy Cat! game structure
├── style.css           # CSS styling and responsive design
├── script.js           # JavaScript game logic and functionality
├── statsWorker.js      # Web Worker that offloads stats calculations
├── README.md           # Project documentation
└── assets/             # Folder for images, sounds, and other media
    └── README.md       # Assets documentation
```

## 🗂 Result History

- Every completed round is stored in `localStorage` with a timestamp, WPM, accuracy, and time taken.
- Entries older than **7 days** are automatically purged on load or whenever a new score is saved, keeping the log lightweight.
- The log never leaves the browser—perfect for privacy and for tracking your Copy Cat streak locally.

## 🏃‍♀️ Installation & Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/DC101_TypingTest_AvilaJonalyn.git
   ```

2. Navigate to the project directory:
   ```bash
   cd DC101_TypingTest_AvilaJonalyn
   ```

3. Open `index.html` in your web browser:
   - Double-click the file, or
   - Right-click and select "Open with" your preferred browser

No server setup required - it runs entirely in the browser!

## 🎯 Game Mechanics

### WPM Calculation
- Based on the standard: 5 characters = 1 word
- Calculated in real-time as you type
- Formula: `(characters typed / 5) / time elapsed in minutes`

### Accuracy Calculation
- Percentage of correctly typed characters
- Updates continuously during the test
- Formula: `(correct characters / total characters) × 100`

### Performance Levels
- **Outstanding** (60+ WPM, 95%+ accuracy): 🏆 Champion level!
- **Great** (45+ WPM, 90%+ accuracy): 👏 Excellent skills!
- **Good** (30+ WPM, 80%+ accuracy): 💪 Keep practicing!
- **Decent** (20+ WPM, 70%+ accuracy): 📈 Getting better!
- **Beginner** (< 20 WPM or < 70% accuracy): 🎯 Practice makes perfect!

## 📱 Responsive Design

The game is fully responsive and optimized for:
- **Desktop**: Full-featured experience with all stats visible
- **Tablet**: Adjusted layout with touch-friendly controls
- **Mobile**: Optimized interface for smaller screens

## 🌟 Key Features Implementation

### Real-time Feedback
- Character-by-character highlighting
- Live WPM and accuracy updates
- Progress bar visualization
- Timer countdown

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- Focus indicators
- Screen reader friendly

### Modern UI/UX
- Clean, modern design
- Smooth animations and transitions
- Intuitive user interface
- Engaging color scheme

## 🤝 Contributing

This is a course project, but suggestions for improvement are welcome! Please feel free to:
- Report bugs or issues
- Suggest new features
- Submit pull requests for enhancements

## 📄 License

This project was created as part of the DC101 Web Development course. All rights reserved.

## 👨‍💻 Author

**Jonalyn Avila**
- GitHub: [@incencia](https://github.com/incencia)
- Course: DC101 Web Development
- Project: Individual Work - Mini Arcade Browser Game

## 📊 Project Evaluation Criteria Met

✅ **Functionality**: Game runs smoothly with all features working
✅ **Code Quality**: Clean, well-indented, and commented code
✅ **HTML Structure**: Semantic, accessible, and well-organized
✅ **CSS Styling**: Visually appealing, responsive, and consistent
✅ **JavaScript Logic**: Efficient, modular, and well-implemented
✅ **User Experience**: Intuitive, engaging, and polished interface
✅ **GitHub Repository**: Proper naming, commit history, and structure
✅ **README Documentation**: Clear, complete, and professional
✅ **Creativity & Theme**: Playful animated cat companion experience
✅ **Bonus Features**: Real-time feedback, progress tracking, performance analysis

---

**Keep up with Copy Cat!** 😺🎯


import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './index.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const paragraphs = [
  "The quick brown fox jumps over the lazy dog. This agile creature, with its sleek fur and keen eyes, easily leaps over the lethargic canine who barely lifts its head in response. The scene is a testament to the fox's nimbleness and the dog's serene, untroubled existence. In the forest, such moments are common, where the lively meet the languid in a dance of nature.",
  "Pack my box with five dozen liquor jugs. Each jug, carefully selected for its unique flavor and origin, is placed with precision into the wooden crate. The bottles clink gently against each other, promising an array of tastes from sweet to strong. The task is a meticulous one, ensuring no jug is out of place and that each one reaches its destination intact, ready to bring joy to those who appreciate fine spirits",
  "How vexingly quick daft zebras jump! In the open savanna, the striped creatures display their surprising agility, darting and leaping with unexpected grace. Their playful antics are a challenge to predict, as they seem to revel in their own unpredictability. The observers can only marvel at their speed and the seamless coordination in their movements, a true spectacle of nature's wonders.",
  "The five boxing wizards jump quickly. These magical beings, cloaked in robes and wielding wands, move with astonishing speed and agility. Their jumps are synchronized, creating a mesmerizing display of athleticism and sorcery. Each leap is accompanied by bursts of light and color, showcasing their formidable powers. The audience watches in awe as the wizards continue their spellbinding performance",
  "Jackdaws love my big sphinx of quartz. The shiny, enigmatic statue in the garden is a magnet for these intelligent birds. They perch on its shoulders and peck at its gleaming surface, intrigued by the sparkling mineral. The sphinx, with its mysterious smile, stands as a silent guardian, while the jackdaws chatter and play around it, adding life and movement to the tranquil scene"
];

const durations = [
  { label: '30 SEC', value: 30 },
  { label: '1 MIN', value: 60 },
  { label: '2 MIN', value: 120 },
  { label: '5 MIN', value: 300 }
];

function TypingTest() {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [text, setText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [attempts, setAttempts] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    /**
     * Retrieves the stored typing attempts from the local storage.
     * If no attempts are found, an empty array is returned.
     *
     * @returns {Array} The stored typing attempts.
     */
    const storedAttempts = JSON.parse(localStorage.getItem('typingAttempts') || '[]');
    setAttempts(storedAttempts);
  }, []);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endTest();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const startTest = () => {
    const randomParagraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    setTargetText(randomParagraph);
    setIsRunning(true);
    setTimeLeft(selectedDuration);
    setText('');
    setCharCount(0);
    setCorrectCount(0);
    setWpm(0);
    inputRef.current.focus();
  };

  const endTest = () => {
    setIsRunning(false);
    setCharCount(text.length);
    const newAttempt = {
      date: new Date().toISOString(),
      wpm,
      accuracy: ((correctCount / charCount) * 100).toFixed(2),
      duration: selectedDuration
    };
    const updatedAttempts = [...attempts, newAttempt];
    setAttempts(updatedAttempts);
    localStorage.setItem('typingAttempts', JSON.stringify(updatedAttempts));
  };

  /**
   * Calculates the Words Per Minute (WPM) based on the given text and time elapsed.
   * @param {string} text - The input text to calculate WPM for.
   * @param {number} timeElapsed - The time elapsed in seconds.
   * @returns {number} The calculated WPM (rounded to the nearest whole number).
   */
  const calculateWPM = (text, timeElapsed) => {
    const words = text.trim().split(/\s+/).length;
    const minutes = timeElapsed / 60;
    return Math.round(words / minutes);
  };

  /**
   * Handles the change event of the input field.
   * Updates the text, correct count, and WPM based on the new input.
   * @param {Object} e - The event object.
   */
  const handleChange = (e) => {
    if (isRunning) {
      const newText = e.target.value;
      setText(newText);
      setCorrectCount(newText.split('').filter((char, index) => char === targetText[index]).length);
      
      const timeElapsed = selectedDuration - timeLeft;
      const currentWPM = calculateWPM(newText, timeElapsed);
      setWpm(currentWPM);
    }
  };

  /**
   * Renders the target text with each character wrapped in a <span> element.
   * The className of each <span> element is determined based on whether the character is correct or incorrect.
   * 
   * @returns {JSX.Element[]} An array of <span> elements representing the target text.
   */
  const renderTargetText = () => {
    return targetText.split('').map((char, index) => {
      let className = 'neutral';
      if (index < text.length) {
        className = text[index] === char ? 'correct' : 'incorrect';
      }
      return <span key={index} className={className}>{char}</span>;
    });
  };

  /**
   * Handles the change in duration.
   * 
   * @param {Event} e - The event object.
   */
  const handleDurationChange = (e) => {
    setSelectedDuration(Number(e.target.value));
  };

  const chartData = {
    labels: attempts.map((attempt, index) => `Attempt ${index + 1}`),
    datasets: [
      {
        label: 'WPM',
        data: attempts.map(attempt => attempt.wpm),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Accuracy (%)',
        data: attempts.map(attempt => parseFloat(attempt.accuracy)),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="container">
      <h1>TYPING TEST</h1>
      <div className="duration-selector">
        <label htmlFor="duration">SELECT DURATION:</label>
        <select id="duration" value={selectedDuration} onChange={handleDurationChange} disabled={isRunning}>
          {durations.map((duration) => (
            <option key={duration.value} value={duration.value}>
              {duration.label}
            </option>
          ))}
        </select>
      </div>
      <button onClick={startTest} disabled={isRunning}>
        {isRunning ? 'TEST IN PROGRESS' : 'START TEST'}
      </button>
      <p>TIME LEFT: {timeLeft} SECONDS</p>
      {isRunning && <p>CURRENT WPM: {wpm}</p>}
      <div className="target-text">{renderTargetText()}</div>
      <textarea
        ref={inputRef}
        value={text}
        onChange={handleChange}
        disabled={!isRunning}
        placeholder={isRunning ? "TYPE HERE" : "CLICK 'START TEST' TO BEGIN"}
      />
      {!isRunning && charCount > 0 && (
        <div className="results">
          <p>CHARACTERS TYPED: {charCount}</p>
          <p>CORRECT CHARACTERS: {correctCount}</p>
          <p>ACCURACY: {((correctCount / charCount) * 100).toFixed(2)}%</p>
          <p>FINAL WPM: {wpm}</p>
        </div>
      )}
      {attempts.length > 0 && (
        <div className="progress-chart">
          <h2>YOUR PROGRESS</h2>
          <Line data={chartData} />
        </div>
      )}
    </div>
  );
}

export default TypingTest;
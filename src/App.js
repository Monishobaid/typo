import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './index.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const paragraphs = [
  "The quick brown fox jumps over the lazy dog.",
  "Pack my box with five dozen liquor jugs.",
  "How vexingly quick daft zebras jump!",
  "The five boxing wizards jump quickly.",
  "Jackdaws love my big sphinx of quartz."
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

  const calculateWPM = (text, timeElapsed) => {
    const words = text.trim().split(/\s+/).length;
    const minutes = timeElapsed / 60;
    return Math.round(words / minutes);
  };

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

  const renderTargetText = () => {
    return targetText.split('').map((char, index) => {
      let className = 'neutral';
      if (index < text.length) {
        className = text[index] === char ? 'correct' : 'incorrect';
      }
      return <span key={index} className={className}>{char}</span>;
    });
  };

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
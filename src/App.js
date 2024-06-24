import React, { useState, useEffect, useRef } from 'react';
import './index.css';

const paragraphs = [
  "The quick brown fox jumps over the lazy dog.",
  "Pack my box with five dozen liquor jugs.",
  "How vexingly quick daft zebras jump!",
  "The five boxing wizards jump quickly.",
  "Jackdaws love my big sphinx of quartz."
];

function TypingTest() {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [text, setText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const inputRef = useRef(null);

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
    setTimeLeft(60);
    setText('');
    setCharCount(0);
    setCorrectCount(0);
    inputRef.current.focus();
  };

  const endTest = () => {
    setIsRunning(false);
    setCharCount(text.length);
  };

  const handleChange = (e) => {
    if (isRunning) {
      const newText = e.target.value;
      setText(newText);
      setCorrectCount(newText.split('').filter((char, index) => char === targetText[index]).length);
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

  return (
    <div className="container">
      <h1>60-SECOND TYPING TEST</h1>
      <button onClick={startTest} disabled={isRunning}>
        {isRunning ? 'TEST IN PROGRESS' : 'START TEST'}
      </button>
      <p>TIME LEFT: {timeLeft} SECONDS</p>
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
        </div>
      )}
    </div>
  );
}

export default TypingTest;
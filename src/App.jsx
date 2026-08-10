import { useState, useEffect, useRef } from "react";
import "./App.css";

const pad = (n) => String(n).padStart(2, "0");

function App() {
  const [mode, setMode] = useState("countdown"); // "countdown" | "stopwatch"
  const [isRunning, setIsRunning] = useState(false);
  const [countdownMinutes, setCountdownMinutes] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(countdownMinutes * 60);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const intervalRef = useRef(null);

  // Tick
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      if (mode === "countdown") {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            return 0;
          }
          return s - 1;
        });
      } else {
        setSecondsElapsed((s) => s + 1);
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  const handleModeChange = (newMode) => {
    if (isRunning) return;
    setMode(newMode);
  };

  const handleStartPause = () => setIsRunning((r) => !r);

  const handleReset = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    if (mode === "countdown") {
      setSecondsLeft(countdownMinutes * 60);
    } else {
      setSecondsElapsed(0);
    }
  };

  const handleMinutesChange = (e) => {
    const value = Math.max(1, Math.min(180, Number(e.target.value) || 1));
    setCountdownMinutes(value);
    setSecondsLeft(value * 60);
  };

  const displaySeconds = mode === "countdown" ? secondsLeft : secondsElapsed;
  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;

  return (
    <section id="center">
      <div className="mode-toggle">
        <button
          type="button"
          className={mode === "countdown" ? "active" : ""}
          onClick={() => handleModeChange("countdown")}
          disabled={isRunning}
        >
          Countdown
        </button>
        <button
          type="button"
          className={mode === "stopwatch" ? "active" : ""}
          onClick={() => handleModeChange("stopwatch")}
          disabled={isRunning}
        >
          Stopwatch
        </button>
      </div>

      <div className="time-display">
        {pad(minutes)}:{pad(seconds)}
      </div>

      {mode === "countdown" && (
        <div className="minutes-input">
          <label htmlFor="minutes">Minutes</label>
          <input
            id="minutes"
            type="number"
            min="1"
            max="180"
            value={countdownMinutes}
            onChange={handleMinutesChange}
            disabled={isRunning}
          />
        </div>
      )}

      <div className="controls">
        <button
          type="button"
          className="primary"
          onClick={handleStartPause}
          disabled={mode === "countdown" && secondsLeft === 0}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button type="button" onClick={handleReset}>
          Reset
        </button>
      </div>
    </section>
  );
}

export default App;

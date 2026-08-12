import { useEffect, useRef, useState } from "react";
import "./App.css";

const pad = (n) => String(n).padStart(2, "0");

const themes = [
  {
    name: "Midnight",
    background: "#10131a",
    text: "#ffffff",
    numbers: "#61dafb",
  },
  {
    name: "Ocean",
    background: "#071e2d",
    text: "#dff7ff",
    numbers: "#38bdf8",
  },
  {
    name: "Forest",
    background: "#0c2117",
    text: "#e7f8ec",
    numbers: "#4ade80",
  },
  {
    name: "Sunset",
    background: "#2a1017",
    text: "#fff1f2",
    numbers: "#fb7185",
  },
  {
    name: "Purple",
    background: "#1a102d",
    text: "#f5eaff",
    numbers: "#c084fc",
  },
  {
    name: "Warm",
    background: "#21170d",
    text: "#fff7ed",
    numbers: "#fb923c",
  },
  {
    name: "Clean",
    background: "#f4f4f5",
    text: "#18181b",
    numbers: "#2563eb",
  },
];

const fonts = [
  {
    name: "Inter",
    value: "Inter, Arial, sans-serif",
  },
  {
    name: "Arial",
    value: "Arial, sans-serif",
  },
  {
    name: "Georgia",
    value: "Georgia, serif",
  },
  {
    name: "Courier New",
    value: "'Courier New', monospace",
  },
  {
    name: "Trebuchet MS",
    value: "'Trebuchet MS', sans-serif",
  },
  {
    name: "Verdana",
    value: "Verdana, sans-serif",
  },
];

const sounds = [
  {
    name: "Classic Beep",
    value: "classic",
  },
  {
    name: "Double Beep",
    value: "double",
  },
  {
    name: "High Beep",
    value: "high",
  },
  {
    name: "Low Beep",
    value: "low",
  },
  {
    name: "Alert",
    value: "alert",
  },
];

function App() {
  const [mode, setMode] = useState("countdown");
  const [isRunning, setIsRunning] = useState(false);

  const [countdownMinutes, setCountdownMinutes] = useState(5);
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  const [secondsLeft, setSecondsLeft] = useState(5 * 60);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const intervalRef = useRef(null);

  // Settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);

  const [backgroundColor, setBackgroundColor] = useState("#10131a");
  const [textColor, setTextColor] = useState("#ffffff");
  const [numberColor, setNumberColor] = useState("#61dafb");
  const [font, setFont] = useState("Inter, Arial, sans-serif");
  const [backgroundImage, setBackgroundImage] = useState("");

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState("classic");
  const [soundsOpen, setSoundsOpen] = useState(false);

  // Volume
  const [volume, setVolume] = useState(70);

  // Alarm
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const alarmIntervalRef = useRef(null);

  // Audio
  const audioContextRef = useRef(null);

  // --------------------------------------------------
  // LOAD SETTINGS
  // --------------------------------------------------

  useEffect(() => {
    const saved = localStorage.getItem("timerSettings");

    if (!saved) return;

    try {
      const settings = JSON.parse(saved);

      setBackgroundColor(
        settings.backgroundColor || "#10131a"
      );

      setTextColor(
        settings.textColor || "#ffffff"
      );

      setNumberColor(
        settings.numberColor || "#61dafb"
      );

      setFont(
        settings.font || "Inter, Arial, sans-serif"
      );

      setBackgroundImage(
        settings.backgroundImage || ""
      );

      setSoundEnabled(
        settings.soundEnabled === undefined
          ? true
          : settings.soundEnabled
      );

      setSelectedSound(
        settings.selectedSound || "classic"
      );

      setVolume(
        settings.volume === undefined
          ? 70
          : settings.volume
      );
    } catch (error) {
      console.error("Could not load timer settings:", error);
    }
  }, []);

  // --------------------------------------------------
  // SAVE SETTINGS
  // --------------------------------------------------

  useEffect(() => {
    localStorage.setItem(
      "timerSettings",
      JSON.stringify({
        backgroundColor,
        textColor,
        numberColor,
        font,
        backgroundImage,
        soundEnabled,
        selectedSound,
        volume,
      })
    );
  }, [
    backgroundColor,
    textColor,
    numberColor,
    font,
    backgroundImage,
    soundEnabled,
    selectedSound,
    volume,
  ]);

  // --------------------------------------------------
  // CLOSE SETTINGS WHEN CLICKING OUTSIDE
  // --------------------------------------------------

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        settingsOpen &&
        settingsRef.current &&
        !settingsRef.current.contains(event.target)
      ) {
        setSettingsOpen(false);
        setSoundsOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );
    };
  }, [settingsOpen]);

  // --------------------------------------------------
  // AUDIO
  // --------------------------------------------------

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContext) {
        throw new Error(
          "Web Audio API is not supported by this browser."
        );
      }

      audioContextRef.current = new AudioContext();
    }

    if (
      audioContextRef.current.state === "suspended"
    ) {
      audioContextRef.current.resume();
    }

    return audioContextRef.current;
  };

  const beep = (
    frequency,
    duration,
    delay = 0,
    volumeMultiplier = 1
  ) => {
    const ctx = getAudioContext();

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    const actualVolume =
      (volume / 100) *
      0.18 *
      volumeMultiplier;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      frequency,
      ctx.currentTime + delay
    );

    gain.gain.setValueAtTime(
      0.0001,
      ctx.currentTime + delay
    );

    gain.gain.exponentialRampToValueAtTime(
      Math.max(actualVolume, 0.0001),
      ctx.currentTime + delay + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + delay + duration
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(
      ctx.currentTime + delay
    );

    oscillator.stop(
      ctx.currentTime +
        delay +
        duration +
        0.03
    );
  };

  const playSound = (sound = selectedSound) => {
    if (!soundEnabled || volume <= 0) {
      return;
    }

    try {
      switch (sound) {
        case "classic":
          beep(880, 0.3);
          break;

        case "double":
          beep(880, 0.18);
          beep(880, 0.18, 0.25);
          break;

        case "high":
          beep(1200, 0.35);
          break;

        case "low":
          beep(440, 0.4);
          break;

        case "alert":
          beep(880, 0.15);
          beep(1100, 0.15, 0.2);
          beep(880, 0.15, 0.4);
          break;

        default:
          beep(880, 0.3);
      }
    } catch (error) {
      console.error(
        "Unable to play sound:",
        error
      );
    }
  };

  // --------------------------------------------------
  // ALARM
  // --------------------------------------------------

  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }

    setIsAlarmPlaying(false);
  };

  const startAlarm = () => {
    if (!soundEnabled || volume <= 0) {
      return;
    }

    if (alarmIntervalRef.current) {
      return;
    }

    setIsAlarmPlaying(true);

    // First chime immediately
    playSound();

    // Keep chiming
    alarmIntervalRef.current = setInterval(() => {
      playSound();
    }, 1500);
  };

  // Stop alarm if sound gets disabled
  useEffect(() => {
    if (!soundEnabled) {
      stopAlarm();
    }
  }, [soundEnabled]);

  // Stop alarm if volume becomes zero
  useEffect(() => {
    if (volume <= 0) {
      stopAlarm();
    }
  }, [volume]);

  // Clean up alarm when component unmounts
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(alarmIntervalRef.current);
    };
  }, []);

  // --------------------------------------------------
  // TIMER
  // --------------------------------------------------

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      if (mode === "countdown") {
        setSecondsLeft((current) => {
          if (current <= 1) {
            clearInterval(intervalRef.current);

            setIsRunning(false);

            // Countdown reached ZERO
            startAlarm();

            return 0;
          }

          return current - 1;
        });
      } else {
        setSecondsElapsed(
          (current) => current + 1
        );
      }
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  // --------------------------------------------------
  // MODE
  // --------------------------------------------------

  const handleModeChange = (newMode) => {
    if (isRunning) return;

    stopAlarm();
    setMode(newMode);
  };

  // --------------------------------------------------
  // START / PAUSE
  // --------------------------------------------------

  const handleStartPause = () => {
    // If countdown has reached zero,
    // Start creates a fresh countdown.
    if (
      mode === "countdown" &&
      secondsLeft === 0 &&
      !isRunning
    ) {
      stopAlarm();

      const startingTime = Math.max(
        0,
        countdownMinutes * 60 +
          countdownSeconds
      );

      if (startingTime === 0) {
        return;
      }

      setSecondsLeft(startingTime);
      setIsRunning(true);
      return;
    }

    // User interaction unlocks browser audio.
    if (soundEnabled) {
      try {
        getAudioContext();
      } catch (error) {
        console.error(error);
      }
    }

    // If currently playing alarm,
    // Start stops it.
    if (isAlarmPlaying) {
      stopAlarm();

      if (mode === "countdown") {
        const startingTime = Math.max(
          0,
          countdownMinutes * 60 +
            countdownSeconds
        );

        if (startingTime > 0) {
          setSecondsLeft(startingTime);
          setIsRunning(true);
        }
      }

      return;
    }

    setIsRunning(
      (running) => !running
    );
  };

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------

  const handleReset = () => {
    stopAlarm();

    setIsRunning(false);

    clearInterval(intervalRef.current);

    if (mode === "countdown") {
      setSecondsLeft(
        countdownMinutes * 60 +
          countdownSeconds
      );
    } else {
      setSecondsElapsed(0);
    }
  };

  // --------------------------------------------------
  // COUNTDOWN INPUTS
  // --------------------------------------------------

  const handleMinutesChange = (e) => {
    const value = Math.max(
      0,
      Math.min(
        180,
        Number(e.target.value) || 0
      )
    );

    setCountdownMinutes(value);

    setSecondsLeft(
      value * 60 + countdownSeconds
    );

    stopAlarm();
  };

  const handleSecondsChange = (e) => {
    const value = Math.max(
      0,
      Math.min(
        59,
        Number(e.target.value) || 0
      )
    );

    setCountdownSeconds(value);

    setSecondsLeft(
      countdownMinutes * 60 + value
    );

    stopAlarm();
  };

  // --------------------------------------------------
  // THEMES
  // --------------------------------------------------

  const handleThemeSelect = (theme) => {
    setBackgroundColor(theme.background);
    setTextColor(theme.text);
    setNumberColor(theme.numbers);

    setBackgroundImage("");
  };

  // --------------------------------------------------
  // IMAGE UPLOAD
  // --------------------------------------------------

  const handleBackgroundUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setBackgroundImage(reader.result);
    };

    reader.readAsDataURL(file);
  };

  // --------------------------------------------------
  // SOUND SELECTION
  // --------------------------------------------------

  const handleSoundChange = (sound) => {
    setSelectedSound(sound);

    // Preview selected sound
    if (soundEnabled && volume > 0) {
      setTimeout(() => {
        playSound(sound);
      }, 50);
    }
  };

  // --------------------------------------------------
  // VOLUME
  // --------------------------------------------------

  const handleVolumeChange = (e) => {
    const value = Number(e.target.value);

    setVolume(value);

    if (value === 0) {
      stopAlarm();
    }
  };

  const getVolumeIcon = () => {
    if (!soundEnabled || volume === 0) {
      return "🔇";
    }

    if (volume < 50) {
      return "🔉";
    }

    return "🔊";
  };

  // --------------------------------------------------
  // DISPLAY
  // --------------------------------------------------

  const displaySeconds =
    mode === "countdown"
      ? secondsLeft
      : secondsElapsed;

  const minutes = Math.floor(
    displaySeconds / 60
  );

  const seconds =
    displaySeconds % 60;

  const appStyle = {
    "--background-color":
      backgroundColor,

    "--text-color": textColor,

    "--number-color":
      numberColor,

    "--app-font": font,

    "--volume":
      `${volume}%`,

    backgroundImage: backgroundImage
      ? `url(${backgroundImage})`
      : "none",
  };

  return (
    <main
      className={`app ${
        isAlarmPlaying
          ? "alarm-active"
          : ""
      }`}
      style={appStyle}
    >
      <section id="center">
        {/* MODE */}
        <div className="mode-toggle">
          <button
            type="button"
            className={
              mode === "countdown"
                ? "active"
                : ""
            }
            onClick={() =>
              handleModeChange(
                "countdown"
              )
            }
            disabled={isRunning}
          >
            Countdown
          </button>

          <button
            type="button"
            className={
              mode === "stopwatch"
                ? "active"
                : ""
            }
            onClick={() =>
              handleModeChange(
                "stopwatch"
              )
            }
            disabled={isRunning}
          >
            Stopwatch
          </button>
        </div>

        {/* TIMER */}
        <div className="time-display">
          {pad(minutes)}:
          {pad(seconds)}
        </div>

        {/* ALARM STATUS */}
        {isAlarmPlaying && (
          <div className="alarm-message">
            🔔 Time's up!
          </div>
        )}

        {/* COUNTDOWN INPUTS */}
        {mode === "countdown" && (
          <div className="countdown-inputs">
            <div className="input-group">
              <label htmlFor="minutes">
                Minutes
              </label>

              <input
                id="minutes"
                type="number"
                min="0"
                max="180"
                value={
                  countdownMinutes
                }
                onChange={
                  handleMinutesChange
                }
                disabled={isRunning}
              />
            </div>

            <div className="input-group">
              <label htmlFor="seconds">
                Seconds
              </label>

              <input
                id="seconds"
                type="number"
                min="0"
                max="59"
                value={
                  countdownSeconds
                }
                onChange={
                  handleSecondsChange
                }
                disabled={isRunning}
              />
            </div>
          </div>
        )}

        {/* CONTROLS */}
        <div className="controls">
          <button
            type="button"
            className="primary"
            onClick={
              handleStartPause
            }
            disabled={
              mode ===
                "countdown" &&
              secondsLeft === 0 &&
              !isAlarmPlaying
            }
          >
            {isAlarmPlaying
              ? "Start"
              : isRunning
              ? "Pause"
              : "Start"}
          </button>

          <button
            type="button"
            onClick={
              handleReset
            }
          >
            Reset
          </button>
        </div>
      </section>

      {/* LEFT VOLUME CONTROL */}
      <div
        className={`volume-control ${
          !soundEnabled
            ? "volume-disabled"
            : ""
        }`}
      >
        <span
          className="volume-icon"
          title={`Volume ${volume}%`}
        >
          {getVolumeIcon()}
        </span>

        <input
          className="volume-slider"
          type="range"
          min="0"
          max="100"
          value={volume}
          disabled={!soundEnabled}
          onChange={
            handleVolumeChange
          }
          aria-label="Volume"
        />

        <span className="volume-value">
          {volume}%
        </span>
      </div>

      {/* SETTINGS */}
      <div
        className="settings-wrapper"
        ref={settingsRef}
      >
        {settingsOpen && (
          <div className="settings-panel">
            <div className="settings-header">
              <div>
                <h2>Settings</h2>
                <p>
                  Customise your timer
                </p>
              </div>

              <button
                className="close-settings"
                type="button"
                onClick={() => {
                  setSettingsOpen(
                    false
                  );
                  setSoundsOpen(false);
                }}
              >
                ×
              </button>
            </div>

            {/* THEME */}
            <div className="settings-section">
              <h3>Theme</h3>

              <div className="theme-grid">
                {themes.map(
                  (theme) => (
                    <button
                      type="button"
                      key={
                        theme.name
                      }
                      className="theme-card"
                      onClick={() =>
                        handleThemeSelect(
                          theme
                        )
                      }
                    >
                      <span
                        className="theme-preview"
                        style={{
                          background:
                            theme.background,
                          color:
                            theme.numbers,
                        }}
                      >
                        00:00
                      </span>

                      <span>
                        {theme.name}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* COLOURS */}
            <div className="settings-section">
              <h3>Colours</h3>

              <div className="colour-row">
                <label htmlFor="backgroundColour">
                  Background
                </label>

                <input
                  id="backgroundColour"
                  type="color"
                  value={
                    backgroundColor
                  }
                  onChange={(e) => {
                    setBackgroundColor(
                      e.target.value
                    );
                    setBackgroundImage(
                      ""
                    );
                  }}
                />
              </div>

              <div className="colour-row">
                <label htmlFor="numberColour">
                  Numbers
                </label>

                <input
                  id="numberColour"
                  type="color"
                  value={
                    numberColor
                  }
                  onChange={(e) =>
                    setNumberColor(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="colour-row">
                <label htmlFor="textColour">
                  Letters
                </label>

                <input
                  id="textColour"
                  type="color"
                  value={
                    textColor
                  }
                  onChange={(e) =>
                    setTextColor(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            {/* BACKGROUND IMAGE */}
            <div className="settings-section">
              <h3>
                Background Image
              </h3>

              <label className="upload-button">
                Upload Image

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleBackgroundUpload
                  }
                />
              </label>

              {backgroundImage && (
                <button
                  type="button"
                  className="remove-image"
                  onClick={() =>
                    setBackgroundImage(
                      ""
                    )
                  }
                >
                  Remove Image
                </button>
              )}
            </div>

            {/* FONT */}
            <div className="settings-section">
              <h3>Font</h3>

              <select
                value={font}
                onChange={(e) =>
                  setFont(
                    e.target.value
                  )
                }
              >
                {fonts.map(
                  (fontOption) => (
                    <option
                      key={
                        fontOption.name
                      }
                      value={
                        fontOption.value
                      }
                    >
                      {
                        fontOption.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* SOUND */}
            <div className="settings-section">
              <div className="sound-header">
                <h3>Sound</h3>

                <button
                  type="button"
                  className={`sound-toggle ${
                    soundEnabled
                      ? "enabled"
                      : ""
                  }`}
                  onClick={() =>
                    setSoundEnabled(
                      (enabled) =>
                        !enabled
                    )
                  }
                >
                  {soundEnabled
                    ? "ON"
                    : "OFF"}
                </button>
              </div>

              <div className="sound-picker">
                <button
                  type="button"
                  className="sound-selector"
                  onClick={() =>
                    setSoundsOpen(
                      (open) =>
                        !open
                    )
                  }
                  disabled={
                    !soundEnabled
                  }
                >
                  <span>
                    {
                      sounds.find(
                        (sound) =>
                          sound.value ===
                          selectedSound
                      )?.name
                    }
                  </span>

                  <span className="arrow">
                    {soundsOpen
                      ? "▲"
                      : "▼"}
                  </span>
                </button>

                {soundsOpen &&
                  soundEnabled && (
                    <div className="sound-options">
                      {sounds.map(
                        (sound) => (
                          <button
                            type="button"
                            key={
                              sound.value
                            }
                            className={
                              selectedSound ===
                              sound.value
                                ? "selected"
                                : ""
                            }
                            onClick={() =>
                              handleSoundChange(
                                sound.value
                              )
                            }
                          >
                            {
                              sound.name
                            }
                          </button>
                        )
                      )}
                    </div>
                  )}
              </div>

              <p className="setting-hint">
                Selecting a sound
                previews it.
                The sound repeats
                when the countdown
                reaches zero.
              </p>
            </div>
          </div>
        )}

        {/* SETTINGS BUTTON */}
        <button
          type="button"
          className="settings-button"
          onClick={() => {
            setSettingsOpen(
              (open) => !open
            );

            if (settingsOpen) {
              setSoundsOpen(false);
            }
          }}
          aria-label="Open settings"
        >
          ⚙
        </button>
      </div>
    </main>
  );
}

export default App;
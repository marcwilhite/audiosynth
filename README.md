audiosynth
==========

JavaScript Audio Synthesizer Library (Browserify Version)

##Getting Started

1. npm install audiosynth
2. var AudioSynth = require('audiosynth');

##Usage


	var AudioContext = window.AudioContext || window.webkitAudioContext;

	var context = new AudioContext();
	synth = new AudioSynth(context);

	// Default oscillator wave is sawtooth

	synth.setOscWave(0); // Sine Wave
	synth.setOscWave(1); // Square Wave
	synth.setOscWave(2); // Sawtooth Wave
	synth.setOscWave(3); // Triangle Wave

	// function(MIDINote, amplitude, filterOffset, currentTime)
	synth.playNote(69, 1.0, 1.0, 0);

	// Turn up stereo delay
	synth.setDelayFeedback(0.5); 

	// Set delay time to tempo
	synth.setDelayTimeTempo(110, 0.25);

	// Set notes using traditional note names
	synth.playNote(synth.noteToMIDI('A', 4), 1.0, 1.0, 0);

	// Set filter cuttoff
	synth.setFilterCutoff(0.2);

	// Increase amplitude release time
	synth.setAmpReleaseTime(0.7);

	// Set filter envelope modulation amount
	synth.setFilterEnvMod(0.8);

	// Set filter attack time
	synth.setFilterAttackTime(0.6);

	// And so on
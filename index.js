function SoundSynth(context) {

  this.context = context;

  this._createMasterGain();
  this._createStereoDelay();

  this._ampAttackTime = 0.0;
  this._ampReleaseTime = 2.2;
  this._filterAttackTime = 0.01;
  this._filterReleaseTime = 1.0;
  this._filterEnvMod = 0.0;
  this._filterCutoff = 5000;
  this._filterRes = 0;

  this.setOscWave('sawtooth');

}

SoundSynth.prototype.playNote = function(MIDINote, amplitude, filterOffset, currentTime) {

  amplitude = amplitude * 0.5;
  if (amplitude <= 0.0) {
    amplitude = 0.01;
  } else if (amplitude > 0.5) {
    amplitude = 0.5;
  }

  if (currentTime === undefined || currentTime === 0) {
    currentTime = this.context.currentTime;
  }

  var now = currentTime;
  var oscGain = this.context.createGain();
  var filter = this._createLowPassFilter();
  oscGain.connect(filter);
  var oscillator = this.context.createOscillator();
  oscillator.type = this.wave;
  oscillator.connect(oscGain);
  var frequency = this._MIDIToFrequency(MIDINote);
  oscillator.frequency.value = frequency;

  oscillator.start(0);
  oscillator.stop(now + this._ampAttackTime + this._ampReleaseTime);
  oscGain.gain.cancelScheduledValues(now);
  oscGain.gain.setValueAtTime(0, now);
  oscGain.gain.linearRampToValueAtTime(amplitude, now + this._ampAttackTime);
  oscGain.gain.exponentialRampToValueAtTime(0.01, now + this._ampAttackTime + this._ampReleaseTime);


  filter.frequency.cancelScheduledValues(now);
  filter.frequency.value = this._filterCutoff * filterOffset;
  filter.Q.value = this._filterRes;
  filter.frequency.setValueAtTime(this._filterCutoff * filterOffset, now);
  filter.frequency.linearRampToValueAtTime(this._filterCutoff * filterOffset + this._filterEnvMod * 10000, now + this._filterAttackTime);
  filter.frequency.linearRampToValueAtTime(this._filterCutoff * filterOffset, now + this._filterAttackTime + this._filterReleaseTime);

};


SoundSynth.prototype.setOscWave = function(value) {
  var wave;
  switch (value) {
    case 0:
      wave = 'sine';
      break;
    case 1:
      wave = 'square';
      break;
    case 2:
      wave = 'sawtooth';
      break;
    case 3:
      wave = 'triangle';
      break;
    default:
      wave = 'sawtooth';
  }
  this.wave = wave;
};

SoundSynth.prototype.setMasterGain = function(value) {

  this._gainNode.gain.value = value * 0.8;
};

SoundSynth.prototype.setAmpAttackTime = function(value) {
  this._ampAttackTime = value * 5;
};

SoundSynth.prototype.setAmpReleaseTime = function(value) {
  this._ampReleaseTime = value * 5;
};

SoundSynth.prototype.setFilterAttackTime = function(value) {
  this._filterAttackTime = value * 5;
};

SoundSynth.prototype.setFilterReleaseTime = function(value) {
  this._filterReleaseTime = value * 5;
};

SoundSynth.prototype.setFilterCutoff = function(value) {
  this._filterCutoff = value * 10000;
};

SoundSynth.prototype.setFilterResonance = function(value) {
  this._filterRes = value * 2;
};

SoundSynth.prototype.setFilterEnvMod = function(value) {
  this._filterEnvMod = value * 10;
};

SoundSynth.prototype.setDelayTimeTempo = function(tempo, beat) {
  this.setDelayTime(60 / tempo * beat);
};

SoundSynth.prototype.setDelayTime = function(value) {
  this._leftDelay.delayTime.value = value;
  this._rightDelay.delayTime.value = value * 2;
};

SoundSynth.prototype.setDelayFeedback = function(value) {
  this._leftFeedback.gain.value = value;
  this._rightFeedback.gain.value = value;
};

SoundSynth.prototype._createMasterGain = function() {
  this._gainNode = this.context.createGain();
  this._gainNode.connect(this.context.destination);
  this.setMasterGain(0.5);
};

SoundSynth.prototype._createLowPassFilter = function() {

  var lowPassFilter = this.context.createBiquadFilter();
  lowPassFilter.type = 'lowpass';
  lowPassFilter.frequency.value = this._filterCutoff;
  lowPassFilter.Q.value = 0.99;
  lowPassFilter.connect(this._leftDelay);
  lowPassFilter.connect(this._rightDelay);
  lowPassFilter.connect(this._gainNode);

  return lowPassFilter;

};

SoundSynth.prototype._createStereoDelay = function() {
  this._merger = this.context.createChannelMerger(2);
  this._merger.connect(this.context.destination);
  this._leftDelay = this.context.createDelay();
  this._rightDelay = this.context.createDelay();
  this._leftFeedback = this.context.createGain();
  this._rightFeedback = this.context.createGain();

  this._leftDelay.connect(this._leftFeedback);
  this._leftFeedback.connect(this._rightDelay);

  this._rightDelay.connect(this._rightFeedback);
  this._rightFeedback.connect(this._leftDelay);

  this._leftFeedback.connect(this._merger, 0, 0);
  this._rightFeedback.connect(this._merger, 0, 1);

  this.setDelayTime(0.25);
  this.setDelayFeedback(0.6);

};

SoundSynth.prototype._noteToMIDI = function(note, octave) {
  note = note.toUpperCase();
  if (note === 'DB') {
    note = 'C#';
  } else if (note === 'EB') {
    note = 'D#';
  } else if (note === 'GB') {
    note = 'F#';
  } else if (note === 'AB') {
    note = 'G#';
  } else if (note === 'BB') {
    note = 'A#';
  }
  var notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
  return noteNumber = notes.indexOf(note) + (octave * 12) + 21;

};

SoundSynth.prototype._MIDIToFrequency = function(MIDINote) {
  return Math.pow(2, (MIDINote - 69) / 12) * 440.0;
};

module.exports = SoundSynth;
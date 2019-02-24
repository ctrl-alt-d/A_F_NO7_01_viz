import p5 from "p5"
import 'p5/lib/addons/p5.sound';
import Midi  from '@tonejs/midi';
import Tone  from 'tone';

const scores = require('../scores/*.mid');

import webmidi from 'webmidi'
import { timeout } from "q";

var viz_function = function(p) {

  p.monoSynth = new p5.MonoSynth();

  p.MidiJson = null;
  p.AllNotes = [];
  p.MillisBase = null;
  p.PreviousMillis = 0;

  p.Synths = [];

  p.setup = function() {

    p.frameRate(60);
    p.noLoop();
    var myCanvas = p.createCanvas(800,600);
    myCanvas.parent('viz2');
    p.noStroke();

    //webmidi
    webmidi.enable(function (err) {
      webmidi.inputs.forEach( input =>  {
                              input.addListener('noteon', "all",e=>p.noteon(e) )
                              input.addListener('noteoff', "all",e=>p.noteoff(e) )          
                                        }
                            );
    });

    p.CreaSynths(20);
    Midi.fromUrl(scores["TheEnterntainer"])
        .then( p.playMidiFile );

  }

  // - Draw -------------------------------------------

  p.draw = () => {
    if (p.MidiJson == null ) return;
    let currentMillis = p.millis() - p.MillisBase;
    let notesToDraw = p.AllNotes.filter(n => n.time*1000 >= p.PreviousMillis && n.time*1000 < currentMillis );
    if (notesToDraw.length>0) console.log('notes :', notesToDraw.map(note=>note.name).join(",") );
    notesToDraw.forEach(note => p.addSynth( note ) );
    p.PreviousMillis = currentMillis;
  }

  p.addSynth = (note) => {
    let syntFreeElements = p.Synths.filter(s=>s.isfree) || [];
    if (syntFreeElements.length > 0) {
      let syntElement = syntFreeElements[0];
      syntElement.isfree = false;
      syntElement.synth.triggerAttackRelease(note.name, note.duration, Tone.now() + 0.5, note.velocity);
      setTimeout( ()=> p.rmSynth(syntElement) , note.duration*1000+10  );
    }
    else {
      console.warn("M'he quedat sense sintetitzadors");
    }
  }

  p.rmSynth = (syntElement) => {
    syntElement.isfree = true; 
  }

  // - Midi file ----------------------------------------

  p.playMidiFile = (midiJson) => {
    p.MidiJson = midiJson;
    console.log('p.MidiJson :', p.MidiJson);
    p.MidiJson
      .tracks
      .forEach(track => {p.AllNotes.push( ...track.notes ); console.log('p.AllNotes.len :', p.AllNotes.length);} );
    p.MillisBase = p.millis();
    p.loop();
  }

  // - Synth

  p.CreaSynths = (n) => {
    console.log('Creant sintetitzadors :');
    for (let i = 0; i< n; i ++ ) {
      let synth = new Tone.PolySynth(n, Tone.Synth, {
        envelope : {
          attack : 0.02,
          decay : 0.1,
          sustain : 0.3,
          release : 1
        }
      }).toMaster();
      p.Synths[i] = { id:i, isfree: true, synth: synth};
    }      
    console.log('Sintetitzadors creats :');
  }

  // - MIDI Events --------------------------------------------

  p.noteon = (e) => {
    p.monoSynth.play(e.note.name + e.note.octave, e.velocity, 0, 1/6);
  }
  p.noteoff = (e) => {
  }
  
}

var viz = new p5(viz_function)
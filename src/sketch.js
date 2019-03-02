import p5 from "p5"
import 'p5/lib/addons/p5.sound';
import Midi  from '@tonejs/midi';
import Tone  from 'tone';

const scores = require('../scores/*.mid');

import webmidi from 'webmidi'
import { timeout } from "q";
import { groupBy } from "./helper";

var viz_function = function(p) {

  p.debug = false;

  p.monoSynth = new p5.MonoSynth();

  p.MidiJson = null;
  p.AllNotes = [];
  p.MillisBase = null;
  p.PreviousMillis = 0;

  p.Synths = [];

  p.setup = function() {

    p.frameRate(60);
    p.noLoop();
    var myCanvas = p.createCanvas(p.windowWidth,p.windowHeight);
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

    p.CreaSynths(10);
    Midi.fromUrl(scores["TheEnterntainer"])
        .then( p.playMidiFile );

  }

  // - Draw -------------------------------------------

  p.draw = () => {
    if (p.MidiJson == null ) return;
    let currentMillis = p.millis() - p.MillisBase;
    let notesToDraw = p.AllNotes.filter(n => n.time*1000 >= p.PreviousMillis && n.time*1000 < currentMillis );    
    p.addManySynth( notesToDraw );
    p.addManyDraw(notesToDraw);
    p.PreviousMillis = currentMillis;
  }

  p.addManyDraw = (notes) => {
    p.stroke(0);
    notes.forEach(note => {
            let x = p.random(p.windowWidth);
            let y = p.random(p.windowHeight);
            p.ellipse(x,y,note.duration*100,note.duration*100);
    });
  }

  p.addManySynth = (notes) => {
    let syntFreeElements = p.Synths.filter(s=>s.isfree) || [];
    let notesByDuration = groupBy( notes, 'duration' );
    let dif = Object.keys(notesByDuration).length - syntFreeElements.length;
    let i = 0;
    for (const [duration, notes] of Object.entries(notesByDuration)) {      
      if (i>=syntFreeElements.length) break;
      let syntElement = syntFreeElements[i];
      syntElement.isfree = false;
      syntElement.synth.triggerAttackRelease(notes.map(note=>note.name).join(","), duration, Tone.now() + 0.25, notes[0].velocity);
      setTimeout( ()=> {syntElement.isfree = true;} , duration*1000+250  );
      i++;
    }
    if (dif > 0) {
      console.warn("M'he quedat sense sintetitzadors. En falten " + dif);
    }
    if (p.debug && notes.length>0) console.log(" Free synth "+ (-dif) + ' Notes :', notes.map(note=>note.name).join(",") + " " + Object.keys(notesByDuration).length +  " grups."  );
  }

  // - Midi file ----------------------------------------

  p.playMidiFile = (midiJson) => {
    p.MidiJson = midiJson;
    if (p.debug) console.log('p.MidiJson :', p.MidiJson);
    p.MidiJson
      .tracks
      .forEach(track => {p.AllNotes.push( ...track.notes );} );
    p.MillisBase = p.millis();
    p.loop();
  }

  // - Synth

  p.CreaSynths = (n) => {
    if (p.debug) console.log('Creant sintetitzadors :');
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
    if (p.debug) console.log('Sintetitzadors creats :');
  }  
}

var viz = new p5(viz_function)
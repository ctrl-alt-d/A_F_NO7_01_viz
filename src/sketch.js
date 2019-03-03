import p5 from "p5"
import 'p5/lib/addons/p5.sound';
import Midi  from '@tonejs/midi';
import Tone  from 'tone';

const scores = require('../scores/*.mid');
const ttf = require('../assets/*.ttf');

import webmidi from 'webmidi'
import { groupBy } from "./helper";

var viz_function = function(p) {

  p.debug = true;
  p.MidiJson = null;
  p.AllNotes = [];
  p.MillisBase = null;
  p.PreviousMillis = 0;

  p.Synths = [];
  p.currentZ = 0;

  p.setup = function() {

    p.frameRate(60);
    p.noLoop();
    var myCanvas = p.createCanvas(p.windowWidth,p.windowHeight,p.WEBGL);
    p.textFont(p.loadFont( ttf["Roboto-Light"]));
    p.pixelDensity(2);
    myCanvas.parent('viz2');

    //
    p.stroke(100,100,250);
    p.fill(0)
    p.strokeWeight(0);
    p.textAlign(p.CENTER);
    p.textSize(17);
    p.text('_ Creating Synths _', p.windowWidth/2, p.windowHeight/2);

    //
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
        .then( (midi) => {
                            p.background(255);
                            p.stroke(0);
                            p.playMidiFile(midi);
        } );
 
  }

  p.windowResized = () => {
    p.background(255);
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  }

  // - Draw -------------------------------------------

  p.draw = () => {
    if (p.MidiJson == null ) return;
    p.translate(-p.windowWidth/2, -p.windowHeight/2, 0);
    //p.translate( 0, 0, -(p.currentZ--) );
    //p.camera(p.mouseX, p.height/2, (p.height/2) / p.tan(p.PI/6), p.width/2, p.height/2, 0, 0, 1, 0);
    let currentMillis = p.millis() - p.MillisBase;
    let notesToDraw = p.AllNotes.filter(n => n.time*1000 >= p.PreviousMillis && n.time*1000 < currentMillis );    
    p.addManySynth( notesToDraw );
    p.addManyDraw(notesToDraw);
    if (p.debug) p.drawSynths();
    p.PreviousMillis = currentMillis;
  }

  p.addManyDraw = (notes) => {
    p.fill(100,100,255);
    notes.forEach(note => {
            p.push();
            p.translate(0, 0, - note.duration*1000);
            let x = p.random(p.windowWidth);
            let y = p.random(p.windowHeight);
            p.ellipse(x,y,p.windowWidth/50, p.windowWidth/50);
            p.pop();
    });
  }

  p.drawSynths = () => {
    let n = p.Synths.length;
    let h = p.windowHeight / (n+2);
    let w = h*6;
    for (let s=0; s < n; s++) {
      p.push();
      p.translate(h,h*(s+1),0);
      p.fill(200,200,250);
      p.strokeWeight(1);
      p.stroke(100,100,250);
      p.rect(0,0,w,h);
      p.fill(0)
      p.strokeWeight(0);
      p.textAlign(p.CENTER);
      p.textSize(h/2);
      p.text( p.Synths[s].playing, w/2, h/2 );
      p.pop();
    }  
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
      let notes_txt = notes.map(note=>note.name).join(",");
      syntElement.playing=notes_txt;
      syntElement.synth.triggerAttackRelease(notes_txt, duration, Tone.now() + 0.25, notes[0].velocity);
      setTimeout( ()=> {syntElement.isfree = true; syntElement.playing=""; } , duration*1000+250  );
      i++;
    }
    if (dif > 0) {
      console.warn("M'he quedat sense sintetitzadors. En falten " + dif);
    }
    if (p.debug && notes.length>0) console.log(" Free synth "+ (-dif) + 
                                               ' Notes :', notes.map(note=>note.name).join(",") +  " In " + 
                                               Object.keys(notesByDuration).length + " groups."  );
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
      p.Synths[i] = { id:i, isfree: true, playing: "", synth: synth};
    }      
    if (p.debug) console.log('Sintetitzadors creats :');
  }  
}

var viz = new p5(viz_function)
import p5 from "p5"
import 'p5/lib/addons/p5.sound';
import parse from 'url-parse';
import request from 'request';
import { parseArrayBuffer } from 'midi-json-parser';
import { loadFixtureAsArrayBuffer, loadFixtureAsJson } from './helper'

const scores = require('../scores/*.mid');

import webmidi from 'webmidi'

var viz_function = function(p) {

    p.monoSynth = new p5.MonoSynth();

     
    let url = parse(window.location.href , true);

    p.playJsonMidi = (jsonMidi) => {
      console.log('jsonMidi.tracks[0] :', jsonMidi.tracks[0].filter(x=> x.noteOn != null || (x.noteOff != null && x.noteOff.velocity > 0 )));
      //p.monoSynth.play(e.note.name + e.note.octave, e.velocity, 0, 1/6);
    }

    p.carregaMidi = (rr, arrayBuffer) => {
      parseArrayBuffer(arrayBuffer)
      .then( p.playJsonMidi )
      .catch( (e) => {console.log('e :', e);} )
    }

    loadFixtureAsArrayBuffer(scores["A_F_NO7_01"], p.carregaMidi );

    p.setup = function() {
      var myCanvas = p.createCanvas(800,600);
      myCanvas.parent('viz2');
      p.noStroke();
      p.noLoop();

      //webmidi
      webmidi.enable(function (err) {
        webmidi.inputs.forEach( input =>  {
                                input.addListener('noteon', "all",e=>p.noteon(e) )
                                input.addListener('noteoff', "all",e=>p.noteoff(e) )          
                                          }
                              );
      });

      //test sound
      myCanvas.mousePressed(this.playSynth);


    }
  
    p.draw = () => {
      p.background(255,255,255)
      p.fill(0,255,0)
      p.ellipse(p.mouseX,p.mouseY,20,20)
    }
  
    p.mouseMoved = () => {
        p.redraw()
    }

    p.noteon = (e) => {
      p.monoSynth.play(e.note.name + e.note.octave, e.velocity, 0, 1/6);
    }
    p.noteoff = (e) => {
    }
    
    p.playSynth = () => {
      // time from now (in seconds)
      var time = 0;
      // note duration (in seconds)
      var dur = 1/6;
      // note velocity (volume, from 0 to 1)
      var v = p.random();
    
      p.monoSynth.play("Fb5", v, 0, dur);
      p.monoSynth.play("Gb5", v, time += dur, dur);
    
      p.background( p.random(255), p.random(255), 255);
      p.text('click to play', p.width/2, p.height/2);
    }
    
  }
  
  var viz = new p5(viz_function)
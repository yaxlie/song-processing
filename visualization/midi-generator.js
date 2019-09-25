function generateMidi(notes, durations){
    $.getScript("lib/midi.js", function() {
        var mapper = {
            'C#': 'Db',
            'D#': 'Eb',
            'E#': 'Fb',
            'F#': 'Gb',
            'G#': 'Ab',
            'A#': 'Bb',
            'H#': 'Cb',
            'H': 'B',
        }

        
        var noteEvents = [];
        // ["C#4", "E4", "G4"]
        var mappedNotes = notes.map(function(x){ return x.replace(/([A-Z]#)|H/g, m => mapper[m]) });

        var notesWithDurations = mappedNotes.map(function(_, i) {
            return {
              pitch: noteTable[mappedNotes[i]],

              // TODO: research for proper value. 
              // This convertion is broken.
              // ?see https://stackoverflow.com/questions/2038313/converting-midi-ticks-to-actual-playback-seconds
              duration: durations[i] * 200
            };
          });
        
          notesWithDurations.forEach(function(obj) {
            Array.prototype.push.apply(noteEvents, MidiEvent.createNote({pitch: obj.pitch, duration:obj.duration, volume: 100, channel:0}));
        });


        // Create a track that contains the events to play the notes above
        var track = new MidiTrack({ events: noteEvents });

        // Creates an object that contains the final MIDI track in base64 and some
        // useful methods.
        var song  = MidiWriter({ tracks: [track] });

        // // Alert the base64 representation of the MIDI file
        // alert(song.b64);

        // // Play the song
        // song.play();

        // Play/save the song (depending of MIDI plugins in the browser). It opens
        // a new window and loads the generated MIDI file with the proper MIME type
        song.save();
    });
}
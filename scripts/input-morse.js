const { EventTarget } = require("./event-target");
const { morseToEnglish } = require("./morse-dictionary");

// https://github.com/codeincontext/node-morse-code#readme
class Morse extends EventTarget {
  emit(type, data) {
    this.dispatchEvent(new CustomEvent(type, {detail: data}))
  }

  on(type, fn) {
    this.addEventListener(type, (e) => fn(e.detail), false);
  }

  constructor() {
    super();

    var dotDuration = 250;
    // var dashDuration = (dotDuration * 3);
    var pauseDuration = (dotDuration * 1);

    var DELAY_CHAR = 1000;

    // The current sequence being evaluated
    var sequence = "";

    var keyDownDate = null;
    var resolveTimer = null;
    var spaceTimer = null;
    var sendTimer = null;


    // On key down. No return value
    this.down = function() {
      // We only want the first press event to be registered.
      if (keyDownDate) return;
      clearTimeout(resolveTimer);
      clearTimeout(spaceTimer);
      clearTimeout(sendTimer);
  
      keyDownDate = new Date();
    }

    // On key up, returns potential matches
    this.up = function() {
      var keyPressDuration = ((new Date())- keyDownDate);
      keyDownDate = null;
  
      if (keyPressDuration <= dotDuration){
        sequence += '.';
      } else {
        sequence += '-';    
      }

      // Wait to see if we need to resolve the current sequence
      var that = this;
      resolveTimer = setTimeout(function(){
        try {
          var character = resolveSequence();
          that.emit('addCharacter', character);
        } catch (e) {
          // Something went wrong
          sequence = '';
        }
        that.emit('setPossibles', []);

        // spaceTimer = setTimeout(function(){
        //   that.emit('addCharacter', '_');
        // }, DELAY_CHAR);
        // sendTimer = setTimeout(function(){
        //   that.emit('send', null);
        // }, 10000);

      }, (pauseDuration * 3));
    
      this.emit('setPossibles', resolvePartial());
    }

    this.clearTimers = function(reset) {
      sequence = "";
      clearTimeout(resolveTimer);
      clearTimeout(spaceTimer);
      clearTimeout(sendTimer);
    
      if (reset) {
        var that = this;
        // spaceTimer = setTimeout(function(){
        //   that.emit('addCharacter', '_');
        // }, DELAY_CHAR);
        // sendTimer = setTimeout(function(){
        //   that.emit('send', null)
        // }, 10000);
      }
    }

    // The potential matches for the current sequence
    function resolvePartial() { 
      var potentialCharacters = [];
  
      for (var pattern in morseToEnglish) {
        if (pattern.indexOf(sequence) === 0){
          potentialCharacters.push(morseToEnglish[pattern]);
        }
      }
  
      return potentialCharacters.sort();
    };
  
    // Get the character of the current sequence, or raise an error
    function resolveSequence(){
      var character = morseToEnglish[sequence];
      sequence = "";
    
      if (!character) throw new Error("InvalidSequence");
      return character;
    };
  }
};

class Input  {
  constructor() {
    this.handler = null
    
    var morse = this.morse = new Morse()

    document.addEventListener('keydown', morse.down.bind(morse));
    document.addEventListener('keyup', morse.up.bind(morse));
    var that = this
    morse.on('addCharacter', function(typedLetter) {
      console.log('Sent typedLetter: ' + typedLetter);
      typedLetter = typedLetter.toLowerCase();
      that.runHandler(typedLetter)
    });
    
    morse.on('setPossibles', function(possibles) {
      console.log('Matching chars: ' + possibles);
    });
  }

  runHandler(typedLetter) {
    if (this.handler) {
      this.handler(typedLetter)
    }
  }

  // Main function
  setHandler(fn) {
    this.handler = fn
  }
}

// Lets use https://github.com/codeincontext/node-morse-code#readme

module.exports.Input = Input;

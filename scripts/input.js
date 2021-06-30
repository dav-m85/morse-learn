class Input  {
  constructor() {
    this.handler = null
    
    document.addEventListener('textInput', (e) => {
      const data = e.data;
      let typedLetter;
      if (data === ' ') {
        // GBoard
        typedLetter = document.getElementById('input').value;
        typedLetter = typedLetter.trim();
        typedLetter = typedLetter[typedLetter.length - 1];
      } else {
        // Regular Keyboard
        typedLetter = data;
      }
      
      typedLetter = typedLetter.toLowerCase();
      this.runHandler(typedLetter)
    })

    document.getElementById('input').focus();
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

const CARDNAME = "wizard-clock-card";
const VERSION = "0.9.0";

const debugLogging = false;

class WizardClockCard extends HTMLElement {

  // Whenever the state changes, a new `hass` object is set: Update content.
  set hass(hass) {
    if (debugLogging) console.log(`${this.config.header ? "(" + this.config.header + ") " : ""}set hass start`);
    this._hass = hass;

    // Scale the canvas to fit the available space

    this.availableWidth = Math.min(this.card.offsetWidth, window.innerWidth, window.innerHeight).toFixed(0) - 16;
    if (debugLogging) console.log(`${this.config.header ? "(" + this.config.header + ") " : ""}availableWidth: ${this.availableWidth}px`);
    if (this.availableWidth <= 0) {
      if (debugLogging) console.log(`${this.config.header ? "(" + this.config.header + ") " : ""}skipping update`);
      return;
    }
    this.availableWidth = Math.round(Math.min(this.availableWidth, this.configuredWidth));

    this.canvas.width = this.configuredWidth;
    this.canvas.height = this.configuredWidth;
    this.canvas.style.width = `${this.availableWidth}px`;
    this.canvas.style.height = `${this.availableWidth}px`;
    this.scaleRatio = this.configuredWidth / this.availableWidth;

    this.radius = this.canvas.height / 2;
    this.ctx.translate(this.radius, this.radius);
    this.radius = this.radius * 0.90;

    // Get information about current locations and wizards

    this.zones = [];
    this.targetstate = [];
    this.exclude = [];
    this.wizardImages = [];
  
    if (this.lastframe && this.lastframe != 0){
      cancelAnimationFrame(this.lastframe);
      this.lastframe = 0;
    }

    /* First we need to build the list of locations that need to be displayed on the clock - start with those defined in the config */
    var num;
    if (this.config.locations){
      for (num = 0; num < this.config.locations.length; num++){
        if (this.zones.indexOf(this.config.locations[num]) == -1){
          this.zones.push(this.config.locations[num]);
        }
      }
    }
    /* de-duplicate the list of exclusions */
    if (this.config.exclude){
      for (num = 0; num < this.config.exclude.length; num++){
        if (this.exclude.indexOf(this.config.exclude[num]) == -1){
          this.exclude.push(this.config.exclude[num]);
        }
      }
    }
    /* If the lost and travelling config is defined then add this too */
    if (this.config.lost){
      this.zones.push(this.config.lost);
    }
    if (this.config.travelling){
      this.zones.push(this.config.travelling);
    }
    if (this.config.lost){
      this.zones.push(this.lostState);
    }

    /* Go through the current locations of the wizards to see what else we need to add to the clock */
    for (num = 0; num < this.config.wizards.length; num++){
      if (!this._hass.states[this.config.wizards[num].entity])
        throw new Error("Unable to find state for entity " + this.config.wizards[num].entity);
      const state = this._hass.states[this.config.wizards[num].entity];
      var stateStr = state && state.state && state.state != "off" && state.state != "unknown" ? 
        (state.attributes ? 
          (state.attributes.message ? state.attributes.message : state.state) 
          : state.state
        )
        :  "not_home";
      /* Replace the zone name with the friendly name where possible */
      if (this._hass.states["zone." + stateStr] && this._hass.states["zone." + stateStr].attributes && this._hass.states["zone." + stateStr].attributes.friendly_name)
      {
        stateStr = this._hass.states["zone." + stateStr].attributes.friendly_name;
      }
      /* Show locality if not in a zone (if locality is geocoded) */
      if (stateStr === 'Away') {
        if (state.attributes.locality) {
          stateStr = state.attributes.locality
        }
      var stateStr = this.getWizardState(this.config.wizards[num].entity);
      if (debugLogging) {
        console.log(`${this.config.header ? "(" + this.config.header + ") " : ""}(${this.config.wizards[num].name}) set hass stateStr: ${stateStr}`);

	/* Show travelling if not in a zone and we have a velocity > 10 */
	const stateVelo = state && state.attributes ? (
          state.attributes.velocity ? state.attributes.velocity : (
            state.attributes.source && this._hass.states[state.attributes.source] && this._hass.states[state.attributes.source].attributes && this._hass.states[state.attributes.source].attributes.speed ? this._hass.states[state.attributes.source].attributes.speed : (
            state.attributes.moving ? this.travellingMinSpeed + 1 : 0
          ))) : 0; 
	if (stateVelo > this.travellingMinSpeed) {
          stateStr = this.travellingState;
	}
      }
	    
      /* Finally add the cleaned-up location to the list */
      if (this.zones.indexOf(stateStr) == -1 && stateStr != "not_home" && stateStr != this.travellingState && !this.exclude.includes(stateStr))  {
        if (typeof(stateStr)!=="string")
          throw new Error("Unable to add state for entity " + this.config.wizards[num].entity + " of type " + typeof(stateStr) + ".");
        this.zones.push(stateStr);
      }

      /* Create an image object for each wizard, and assign the URL if we can find one. Images will only be displayed once they have completed loading. */
      if (!this.wizardImages[num])
      {
        var img = new Image();
        if (state && state.attributes && state.attributes.entity_picture)
          img.src = state.attributes.entity_picture;
        this.wizardImages.push(img);
      }
    }

    /* Add some empty slots if min_location_slots is set and we don't have that many yet, this helps to stop the clock jumping around when new locations are added */
    if (this.zones.length < this.min_location_slots) {
      for (num = this.zones.length; num < this.min_location_slots; num++){
        this.zones.push(' ')
      }
    }
    if (!this.canvas) {
      const card = document.createElement('ha-card');
      //card.header = 'Wizard Clock';
      var fontstyle = document.createElement('style');
      if (this.config.fontface){
        fontstyle.innerText = "@font-face { " + this.config.fontface + " }  ";
      } else {
        // my default
        fontstyle.innerText = "@font-face {    font-family: itcblkad_font;    src: local(itcblkad_font), url('/local/ITCBLKAD.TTF') format('opentype');}  ";
      }
      document.body.appendChild(fontstyle);

      this.div = document.createElement('div');
      this.div.style.textAlign = 'center';
      this.canvas = document.createElement('canvas');
      this.div.appendChild(this.canvas);
      card.appendChild(this.div);
      this.appendChild(card);
      this.ctx = this.canvas.getContext("2d");
    }

    this.canvas.style.maxWidth = "-webkit-fill-available";
    this.canvas.width=this.config.width ? this.config.width : "500";
    this.canvas.height=this.config.width ? this.config.width : "500";

    this.radius = this.canvas.height / 2;
    this.ctx.translate(this.radius, this.radius);
    this.radius = this.radius * 0.90;

    if (this.config.fontName) {
      this.selectedFont = this.config.fontName;
    } else { 
      this.selectedFont = "itcblkad_font";
    }
    this.fontScale = 1.1;

    var obj = this;
    this.lastframe = requestAnimationFrame(function(){ 
      obj.drawClock(); 
    });
    if (debugLogging) console.log(`${this.config.header ? "(" + this.config.header + ") " : ""}set hass end`);
  }

  // setConfig is called when the configuration changes.
  // Throw an exception and Home Assistant will render an error card.
  setConfig(config) {
    console.info("%c %s %c %s",
      "color: white; background: forestgreen; font-weight: 700;",
      CARDNAME.toUpperCase(),
      "color: forestgreen; background: white; font-weight: 700;",
      VERSION,
    );

    if (!config.wizards) {
      throw new Error('You need to define some wizards');
    }
    
    this.config = config;
    this.currentstate = [];
    this.lostState = config.lost ? config.lost : "Away";
    this.travellingMinSpeed = config.min_travelling_speed ? config.min_travelling_speed : 10; // travelling state only used if speed is above this value
    this.travellingState = config.travelling ? config.travelling : "Away";
    this.min_location_slots = this.config.min_location_slots ? this.config.min_location_slots : 0;
    this.show_images=this.config.show_images ? (this.config.show_images=="Yes" ? 1 : 0) : 0;
	this.wizardImages = [];
    
    if (this.config.shaft_colour){
      this.shaft_colour = this.config.shaft_colour;
    }
    else {
      this.shaft_colour = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
    }    

    if (this.config.fontName) {
      this.selectedFont = this.config.fontName;
    } else {
      this.selectedFont = "itcblkad_font";
    }
    this.fontScale = 1.1;

    this.exclude = [];
    if (this.config.exclude){
      for (var num = 0; num < this.config.exclude.length; num++){
        if (this.exclude.indexOf(this.config.exclude[num]) == -1){
          this.exclude.push(this.config.exclude[num]);
        }
      }
    }

    // Set up document canvas.

    this.configuredWidth = this.config.width ? this.config.width : "500";

    if (!this.canvas) {
      this.card = document.createElement('ha-card');
      if (this.config.header) {
        this.card.header = this.config.header;
      }
      var fontstyle = document.createElement('style');
      if (this.config.fontface){
        fontstyle.innerText = "@font-face { " + this.config.fontface + " }  ";
      } else {
        // my default
        fontstyle.innerText = "@font-face {    font-family: itcblkad_font;    src: local(itcblkad_font), url('/local/ITCBLKAD.TTF') format('opentype');}  ";
      }
      document.body.appendChild(fontstyle);

      this.div = document.createElement('div');
      this.div.style.textAlign = 'center';
      this.canvas = document.createElement('canvas');
      this.div.appendChild(this.canvas);
      this.card.appendChild(this.div);
      this.appendChild(this.card);
      if (!this.canvas.getContext)
        throw new Error("Browser does not support " + CARDNAME + " canvas.");
      this.ctx = this.canvas.getContext("2d");

      /* watch for changes in the size of the card */
      const observer = createResizeObserver(this);
      observer.observe(this.card);
    }
    if (debugLogging) console.log(`${this.config.header ? "(" + this.config.header + ") " : ""}getConfig end`);
  }

  // getCardSize Indicates the height of the card in 50px units. 
  // Home Assistant uses this to automatically distribute all cards over the available columns.
  getCardSize() {
    var cardSize = (this.configuredWidth / 50).toFixed(1);
    if (debugLogging) console.log(`${this.config.header ? "(" + this.config.header + ") " : ""}getCardSize = ${cardSize}`);
    return cardSize;
  }

  // get-WizardState makes all decisions about what stateStr should be. (What "number" to point to.)
  getWizardState(entity) {
    const state = this._hass.states[entity];
    if (!state) {
      console.log(`${this.config.header ? "(" + this.config.header + ") " : ""}Wizard ${entity} does not exist.`);
      return this.lostState;
    }
    const stateVelo = state && state.attributes ? (
      state.attributes.velocity ? state.attributes.velocity : (
        state.attributes.speed ? state.attributes.speed : (
          state.attributes.moving ? 16 : 0
    ))) : 0;

    /* Prioritize stateStr: 1. message attribute, 2. zone attribute, 3. state */
    var stateStr = "not_home";
    if (state && state.state && state.state !== "off" && state.state !== "unknown") {
        /* Keep the not-so-binary states from person_location integration */
        if (["home", "Home", "Just Arrived", "Just Left"].includes(state.state) && !this.exclude.includes(state.state)) {
          stateStr = state.state;
        } else if (state.attributes) {
            if (state.attributes.message) {
                stateStr = state.attributes.message;
            } else if (state.attributes.zone) {
                stateStr = state.attributes.zone;
            } else {
                stateStr = state.state;
            }
        } else {
            stateStr = state.state;
        }
    }
    /* Skip location if excluded in the config (could be reported below as locality, travelling, or lost */
    if (this.exclude.includes(stateStr)){
      stateStr = 'not_home';
    }
    /* Use friendly name for zones */
    if (this._hass.states["zone." + stateStr] && this._hass.states["zone." + stateStr].attributes && this._hass.states["zone." + stateStr].attributes.friendly_name)
    {
      stateStr = this._hass.states["zone." + stateStr].attributes.friendly_name;
    }
    /* If away and not in a zone, show locality (if locality is geocoded),
    /* otherwise show travelling (if configured and velocity > 15),
    /* otherwise show lost (if configured) or Away */
    if (stateStr.toLowerCase() === 'away' || stateStr === 'not_home') {
      if (stateVelo > 15 && this.config.travelling) {
        stateStr = this.travellingState;
      } else {
        stateStr = this.lostState;
      }
      if (state.attributes.locality && !this.exclude.includes(state.attributes.locality)) {
        stateStr = state.attributes.locality
      }
    } else if (stateStr === 'unavailable') {
      stateStr = this.lostState;
    }
    return stateStr;
  }

  drawClock() {
      this.lastframe = 0;

      this.ctx.clearRect(-this.canvas.width/2, -this.canvas.height/2, this.canvas.width/2, this.canvas.height/2)
      this.drawFace(this.ctx, this.radius);
      this.drawNumbers(this.ctx, this.radius, this.zones);
      this.drawTime(this.ctx, this.wizardImages, this.radius, this.zones, this.config.wizards);
      this.drawHinge(this.ctx, this.radius, this.shaft_colour);
      // request next frame if required
      var redraw = false;
      var num;
      for (num = 0; num < this.currentstate.length; num++){
        if (Math.round(this.currentstate[num].pos*100) != Math.round(this.targetstate[num].pos*100))
        {
          redraw = true;
        }
      }

      if (redraw){
        var obj = this;
        this.lastframe = requestAnimationFrame(function(){ 
          obj.drawClock(); 
        });
      }
  }

  /* Draw the frame of the clock */
  drawFace(ctx, radius) {
    ctx.shadowColor = null;
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2*Math.PI);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary-background-color');
    ctx.fill();

    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-background-color:');
    ctx.lineWidth = radius*0.02;
    ctx.stroke();
  }

  /* Does what it says on the tin */
  drawHinge(ctx, radius, colour) {
    ctx.beginPath();
    ctx.arc(0, 0, radius*0.05, 0, 2*Math.PI);
    ctx.fillStyle = colour;
    ctx.shadowColor = "#0008";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fill();
  }

  /* Draw the required location names around the clock. Spaces them out equally and draws the text in a curve to match the clock face. */
  drawNumbers(ctx, radius, locations) {
      /* 
        Text on a curve code modified from function written by James Alford here: http://blog.graphicsgen.com/2015/03/html5-canvas-rounded-text.html
      */
      var ang;
      var num;
      /* variable to adjust the distance from the edge of the circle - 
		  1 = good distance
		  0.5 = close
		  0 = TOO CLOSE
      */
      const textPadding = 0.6;
	  
      ctx.font = radius*0.15*this.fontScale + "px " + this.selectedFont;
      ctx.textBaseline="middle";
      ctx.textAlign="center";
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-text-color');
      for(num= 0; num < locations.length; num++){
          ang = num * Math.PI / locations.length * 2;
          // rotate to center of drawing position
          ctx.rotate(ang);

          var startAngle = 0; 
          var inwardFacing = true;
          var kerning = 0; // can adjust kerning using this - maybe automatically adjust it based on text length? 
	  /* Switched to using an array to split the text into - this means that unicode characters (i.e. emojis etc.) 
             are (for the most part) handled correctly.  */
	  var textArray = Array.from(locations[num]).reverse();
          // if we're in the bottom half of the clock then reverse the facing of the text so that it's not upside down
          if (ang > Math.PI / 2 && ang < ((Math.PI * 2) - (Math.PI / 2)))
          {
            startAngle = Math.PI;
            inwardFacing = false;
            textArray = textArray.reverse();
          }

          textArray = this.isRtlLanguage(locations[num]) ? textArray.reverse() : textArray;

          // calculate height of the font. Many ways to do this - you can replace with your own!
          var div = document.createElement("div");
          div.innerHTML = locations[num];
          div.style.position = 'absolute';
          div.style.top = '-10000px';
          div.style.left = '-10000px';
          div.style.fontFamily = this.selectedFont;
          div.style.fontSize = radius*0.15*this.fontScale + "px";
          document.body.appendChild(div);
          var textHeight = div.offsetHeight*textPadding;
          document.body.removeChild(div);

          // rotate 50% of total angle for center alignment
	  var j=0; // to count the number of chars
	  for (const character of textArray){
              var charWid = ctx.measureText(character).width;
              startAngle += ((charWid + (j == textArray.length-1 ? 0 : kerning)) / (radius - textHeight)) / 2 ;
	      j++;
          }

          // Phew... now rotate into final start position
          ctx.rotate(startAngle);

          // Now for the fun bit: draw, rotate, and repeat
	  for (const character of textArray){
              var charWid = ctx.measureText(character).width; // half letter
              // rotate half letter
              ctx.rotate((charWid/2) / (radius - textHeight) * -1); 
              // draw the character at "top" or "bottom" 
              // depending on inward or outward facing
              ctx.fillText(character, 0, (inwardFacing ? 1 : -1) * (0 - radius + textHeight ));

              ctx.rotate((charWid/2 + kerning) / (radius - textHeight) * -1); // rotate half letter
          }
          // rotate back round from the end position to the central position of the text
          ctx.rotate(startAngle);

          // rotate to the next location
          ctx.rotate(-ang);
      }
  }

  isRtlLanguage(text) {
    const rtlChar = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return rtlChar.test(text);
  }

  /* Work out where we need to put each wizard, then call the drawHand() function for each of them */
  drawTime(ctx, wizardImages, radius, locations, wizards){
      this.targetstate = [];
      var num;
      for (num = 0; num < wizards.length; num++){
	/* Get the location of the wizard */
        const state = this._hass.states[wizards[num].entity];
        var stateStr = state && state.state != "off" && state.state != "unknown" ? 
          (state.attributes ? 
            (state.attributes.message ? state.attributes.message : state.state) 
            : state.state
          )
          :  this.lostState;
        /* Point to locality if not in a zone (if locality is geocoded) */
        if (stateStr === 'Away') {
          if (state.attributes.locality) {
            stateStr = state.attributes.locality
          }
        }

	/* Use the friendly name of the zone if it has one */
        if (this._hass.states["zone." + stateStr] && this._hass.states["zone." + stateStr].attributes && this._hass.states["zone." + stateStr].attributes.friendly_name)
        {
          stateStr = this._hass.states["zone." + stateStr].attributes.friendly_name;
        }

	/* Ignore locations if they're in the exclude list - set the state to lost instead */
        if (this.exclude.includes(stateStr) ||
	  (this._hass.states["zone." + stateStr] && this._hass.states["zone." + stateStr].attributes && this._hass.states["zone." + stateStr].attributes.friendly_name &&
          this.exclude.includes(this._hass.states["zone." + stateStr].attributes.friendly_name))) {

          stateStr = this.lostState;
	}
        // Check both velocity and proximity for movement
        const stateVelo = state && state.attributes ? (
          state.attributes.velocity ? state.attributes.velocity : (
            state.attributes.source && this._hass.states[state.attributes.source] && this._hass.states[state.attributes.source].attributes && this._hass.states[state.attributes.source].attributes.speed ? this._hass.states[state.attributes.source].attributes.speed : (
            state.attributes.moving ? this.travellingMinSpeed + 1 : 0
          ))) : 0; 
        var locnum;
        var wizardOffset = ((num-((wizards.length-1)/2)) / wizards.length * 0.6);
        var location = wizardOffset; // default
        for (locnum = 0; locnum < locations.length; locnum++){
          if ((locations[locnum].toLowerCase() == stateStr.toLowerCase()) 
            || (locations[locnum] == this.travellingState && (stateVelo > this.travellingMinSpeed || isMovingByProximity))
            || (locations[locnum] == this.lostState && stateStr == "not_home" && stateVelo <= this.travellingMinSpeed && !isMovingByProximity))
          {
            location = locnum + wizardOffset;
            break;
          }
        }
        //var location = locations.indexOf(wizards[num].location) + ((num-((wizards.length-1)/2)) / wizards.length * 0.75);
        location = location * Math.PI / locations.length * 2;
        // set targetstate
        this.targetstate.push({pos: location, length: radius*0.7, width: radius*0.1, wizard: wizards[num].name, colour: wizards[num].colour, textcolour: wizards[num].textcolour});
      }
      // update currentstate from targetstate
      if (!this.currentstate)
      {
        this.currentstate = [];
      }
      for (num = 0; num < wizards.length; num++){
        if (this.currentstate[num]){
          this.currentstate[num].pos = this.currentstate[num].pos + ((this.targetstate[num].pos - this.currentstate[num].pos) / 60); 
        } else {
          // default to 12 o'clock to start
          this.currentstate.push({pos: 0, length: this.targetstate[num].length, width: this.targetstate[num].width, wizard: this.targetstate[num].wizard, colour: this.targetstate[num].colour, textcolour: this.targetstate[num].textcolour});
        }
      }
      // draw currentstate
      for (num = 0; num < wizards.length; num++){
        this.drawHand(ctx, this.currentstate[num].pos, this.currentstate[num].length, this.currentstate[num].width, this.currentstate[num].wizard, this.currentstate[num].colour, this.currentstate[num].textcolour, wizardImages[num]);
      }
  }

  /* Actually draw the hand for a wizard */
  drawHand(ctx, pos, length, width, wizard, colour, textcolour, image) {
    /* Draw the hand itself */
    ctx.beginPath();
    ctx.lineWidth = width;
    if (colour) {
      ctx.fillStyle = colour;
    } else {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
    }
    ctx.shadowColor = "#0008";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.moveTo(0,0);
    ctx.rotate(pos);
    ctx.quadraticCurveTo(width, -length*0.5, width, -length*0.75);
    ctx.quadraticCurveTo(width*0.2, -length*0.8, 0, -length);
    ctx.quadraticCurveTo(-width*0.2, -length*0.8, -width, -length*0.75);
    ctx.quadraticCurveTo(-width, -length*0.5, 0, 0);

    ctx.fill();

    /* if we have a loaded image, then slap that on the end of the hand */
    if (image && image.src!="" && image.complete){
      ctx.save();
      ctx.beginPath();
      if (colour) {
        ctx.strokeStyle = colour;
      } else {
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
      }
      ctx.lineWidth = 2;
      ctx.arc(0, -length, width, 0, Math.PI * 2, false);
      ctx.stroke();
      ctx.clip();
      ctx.drawImage(image, -width*1.2, -length-(width*1.2), (width*1.2)*2, (width*1.2)*2);
      ctx.restore();
    }

    /* Finally draw the name of the wizard */
    ctx.font = width*this.fontScale + "px " + this.selectedFont;
    if (textcolour) {
      ctx.fillStyle = textcolour;
    } else {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-text-color');
    }
    ctx.translate(0, -length/2);
    ctx.rotate(Math.PI/2)
    if (pos < Math.PI && pos >= 0) 
        ctx.rotate(Math.PI);
    ctx.fillText(wizard, 0, 0);
    if (pos < Math.PI && pos >= 0) 
        ctx.rotate(-Math.PI);
    ctx.rotate(-Math.PI/2);
    ctx.translate(0, length/2);
    
    ctx.rotate(-pos);
  }

}

/* debounce the reaction to a card resize */
let resizeTimeout = false;
let resizeDelay = 500;

function debouncedOnResize(thisObject) {
  if (debugLogging) console.log(`${thisObject.config && thisObject.config.header ? "(" + thisObject.config.header + ") " : ""}debouncedOnResize triggering set hass`);
  /* trigger an update */
  thisObject.hass = thisObject._hass;
}

function createResizeObserver(thisObject) {
  return new ResizeObserver((entries) => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => debouncedOnResize(thisObject), resizeDelay);  });
}

customElements.define(CARDNAME, WizardClockCard);

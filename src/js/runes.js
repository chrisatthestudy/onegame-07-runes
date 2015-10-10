/*
 * =============================================================================
 * Casting The Runes
 * =============================================================================
 * July game for One Game A Month
 *
 * (c) 2013 chrisatthestudy
 * -----------------------------------------------------------------------------
 * See the end of this file for the main entry point
 */

buttons = {
    NONE: -1,
    START: 0,
    GO: 1,
    NEXT: 2,
    TRY_AGAIN: 3,
    PLAY_AGAIN: 4
};

messages = {
    NONE: -1,
    TOO_LATE: 0,
    WIN_ROUND: 1,
    WIN_LEVEL: 2,
    WIN_GAME: 3,
    ROUND_1: 4,
    ROUND_2: 5,
    ROUND_3: 6
};

prompts = {
    NONE: -1,
    STUDY: 0,
    CAST: 1
};

runeState = {
    INVISIBLE: 0,
    FADING_IN: 1,
    VISIBLE: 2,
    FADING_OUT: 3
};

fadeType = {
    NONE: 0,
    FADE_IN: 1,
    FADE_OUT: 2
};

fadeStyle = {
    IN: 0,          // Runes fade in, but instantly disappear when fully visible
    OUT: 1,         // Runes instantly appear, then fade out
    BOTH: 3,        // Runes fade in then fade out
    SINGLE_IN: 4,   // Runes fade in one at a time, and instantly disappear
    SINGLE_OUT: 5,  // Runes instantly appear, then fade out, one at a time
    SINGLE_BOTH: 6  // Runes fade in then fade out, one at a time
}

/* 
 * =============================================================================
 * Object.create
 * =============================================================================
 * For creating descendant objects (from Douglas Crockford's "Javascript: The 
 * Good Parts"):
 *
 *      newObject = Object.create(oldObject);
 *
 */
//{{{
if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
};
//}}}

/*
 * Opponent() - opponent details
 * This object generates and displays the name of the opponent, based on the
 * current game level 
 */
//{{{
Opponent = function(options) {
    
    var self = {
        // Variables
        //{{{
        context: options.context,
        level: 0,
        visible: false,
        name: "",
        runeCount: 0,
        allowDuplicates: false,
        roster: {                                          
            1:  {name: "Baldric the Unskilled", runeCount: 3, allowDuplicates: false, time: 50},
            2:  {name: "Isobel the Unskilled",  runeCount: 3, allowDuplicates: false, time: 50},
            3:  {name: "Theobald the Novice",   runeCount: 4, allowDuplicates: false, time: 50},
            4:  {name: "Isolda the Novice",     runeCount: 4, allowDuplicates: false, time: 50},
            5:  {name: "Osbert the Acolyte",    runeCount: 6, allowDuplicates: false, time: 70},
            6:  {name: "Avelina the Acolyte",   runeCount: 6, allowDuplicates: false, time: 70},
            7:  {name: "Elias the Adept",       runeCount: 7, allowDuplicates: false, time: 80},
            8:  {name: "Cecilia the Adept",     runeCount: 7, allowDuplicates: false, time: 80},
            9:  {name: "Anselm the Champion",   runeCount: 8, allowDuplicates: true , time: 80},
            10: {name: "Lucia the Champion",    runeCount: 8, allowDuplicates: true , time: 80}
        },
        //}}}
        
        // Methods
        //{{{
        update: function() {
            
        },
        draw: function() {
            if (this.visible) {
                this.context.textAlign = 'left';
                this.context.fillStyle = 'white';
                this.context.font = "bold 24pt serif";
                this.context.fillText("Level " + this.level, 32, 120);
                this.context.textAlign = 'center';
                this.context.font = "normal 12pt serif";
                this.context.fillText("Your opponent", 160, 160);
                this.context.font = "bold 14pt serif";
                this.context.fillStyle = '#ffaa55';
                this.context.fillText(this.name, 160, 192);
            }
        },
        next: function() {
            if (this.level < 10) {
                this.level = this.level + 1;
                this.name = this.roster[this.level].name;
                this.runeCount = this.roster[this.level].runeCount;
                this.allowDuplicates = this.roster[this.level].allowDuplicates;
                this.time = this.roster[this.level].time;
            }
        }
        //}}}
    };
    
    return self;
    
};
//}}}

/*
 * =============================================================================
 * Countdown() - handles Timer countdowns
 * =============================================================================
 * This is a private class used internally by the Timer object (see below), and
 * holds details of a single countdown
 */
//{{{
Countdown = function(duration) {
    'use strict';
    
    var self = {
        duration: duration,
        active: true,
        expired: false,
        last_tick: jaws.game_loop.current_tick,
        
        // ---------------------------------------------------------------------
        // reset(duration)
        // ---------------------------------------------------------------------
        reset: function(duration) {
            this.duration = duration;
            this.active = true;
            this.expired = false;
            this.last_tick = jaws.game_loop.current_tick;
        },
        
        // -----------------------------------------------------------------------------
        // update()
        // -----------------------------------------------------------------------------
        update: function(tick) {
            if ((!this.expired) && (Math.floor((tick - this.last_tick) / 100) >= 1)) {
                this.last_tick = tick;
                this.duration--;
                if (this.duration <= 0) {
                    this.expired = true;
                }
            }
        },
        
        // -----------------------------------------------------------------------------
        // remove()
        // -----------------------------------------------------------------------------
        remove: function() {
            this.active = false;
        }
    };
    
    return self;
    
};
//}}}

/*
 * =============================================================================
 * Timer() - game timer, stopwatch, and countdown handler
 * =============================================================================
 * Keeps track of the duration of the game and provides countdown and counter
 * facilities.
 *
 * This class has to be slightly tricky because it needs to accommodate the game
 * pausing (when the browser tab loses focus, for example) and to continue the
 * timing correctly when it is unpaused.
 *
 * It also provides a 'counter' facility. Start it using 'startCounter', and
 * then check the 'counter' property to find out how long it has been since the
 * counter was started.
 */
//{{{ 
Timer = function() {
    'use strict';
    
    var self = {

        // Number of seconds since the Timer was created or last reset        
        seconds: 1,
        
        // Collection of active countdowns
        countdowns: [],
        
        // Keep a record of the last game tick so that we can track the time
        last_tick: jaws.game_loop.current_tick,
            
        // ---------------------------------------------------------------------
        // reset()
        // ---------------------------------------------------------------------
        reset: function() {
            'use strict';
            // Set the timer to 1 second (starting from 0 seems to cause issues if
            // you attempt to use mod (%) on the seconds)
            this.seconds = 1;
            this.last_tick = jaws.game_loop.current_tick;
        },
        
        // ---------------------------------------------------------------------
        // update()
        // ---------------------------------------------------------------------
        update: function() {
            'use strict';
            var tick = jaws.game_loop.current_tick;
            // Check the difference between the last tick and the current tick. If
            // amounts to 1 second or more, assume that 1 second has passed. This
            // means that if multiple seconds have passed (because the game has been
            // paused), it will still only count as a single second. This is not
            // exactly accurate, but works well enough for the game.
            this.countdowns.forEach( function(item, total) { item.update(tick); } );
            if (Math.floor((tick - this.last_tick) / 1000) >= 1) {
                this.last_tick = tick;
                this.seconds++;
                if (this.counter >= 0) {
                    if (Math.floor((tick - this.last_counter_tick) / 1000) >= 1) {
                        this.last_counter_tick = tick;
                        this.counter++;
                    }
                }
            }
            this.countdowns = this.countdowns.filter(function(item) { return (item.active); });
        },
        
        // ---------------------------------------------------------------------
        // startCountdown()
        // ---------------------------------------------------------------------
        // Creates and returns a new Countdown.
        startCountdown: function(duration) {
            'use strict';
            var countdown = Countdown(duration);
            this.countdowns.push(countdown);
            return countdown;
        },
        
        // Starts a counter, taking the current second as 0 and counting up each
        // second.
        startCounter: function() {
            this.counter = 0;
            this.last_counter_tick = jaws.game_loop.current_tick;
        },
        
        // Stops the counter.
        stopCounter: function() {
            this.counter = -1;
        },
        
        // Returns True if the counter is active.
        isActive: function() {
            return (this.counter != -1);
        }
    };
    
    return self;
    
};
//}}}

/*
 * =============================================================================
 * Button() - main Button handler
 * =============================================================================
 * There is only one real button in the game (apart from the player's rune
 * stones), and it is handled by this object.
 */
//{{{
Button = function(options) {
    var self = {
        anim: new jaws.Animation({sprite_sheet: "graphics/buttons.png", frame_size: [146, 50], frame_duration: -1}),
        sprite: new jaws.Sprite({image: "graphics/buttons.png"}),
        button: -1,
        x: 0,
        y: 0,
        // ---------------------------------------------------------------------
        // Methods
        // ---------------------------------------------------------------------
        //{{{

        // ---------------------------------------------------------------------
        // update()
        // ---------------------------------------------------------------------
        // Updates the button, making sure that it displays the correct image
        update: function() {
            if (this.button !== -1) {
                this.anim.index = this.button;
                this.sprite.setImage(this.anim.currentFrame());
            }
        },
        // ---------------------------------------------------------------------
        // draw()
        // ---------------------------------------------------------------------
        // Draws the button, provided that the button number is valid
        draw: function() {
            if (this.button !== -1) {
                this.sprite.x = this.x;
                this.sprite.y = this.y;
                this.sprite.draw();
            }
        },
        // ---------------------------------------------------------------------
        // isAt(x, y)
        // ---------------------------------------------------------------------
        // Returns true if the specified position is within the button. This
        // will always return null if the button is not active.
        isAt: function(x, y) {
        //}}}
        
            if (this.button !== -1) {
                return this.sprite.rect().collidePoint(x, y);
            } else {
                return null;
            }
        }
        //}}}
    };
    
    return self;
    
};
//}}}

/*
 * =============================================================================
 * Messenger() - displays game messages
 * =============================================================================
 * Apart from the introduction/help page, all the in-game messages are displayed
 * as overlays on top of the "opponent's runes" area in the top half of the
 * screen. This object handles the display of messages which are required to
 * 'fade-out' the underlying images.
 */
//{{{
Messenger = function(options) {
    var self = {
        // ---------------------------------------------------------------------
        // Variables
        // ---------------------------------------------------------------------
        //{{{
        // The animation actually holds the different messages, as frames. It is
        // a quirk of the jaws library that this is the best way to handle
        // a sprite-sheet (provided all the sprites are the same size).
        anim: new jaws.Animation({sprite_sheet: "graphics/messages.png", frame_size: [274, 145], frame_duration: -1}),
        // The sprite handles the actual visual display
        sprite: new jaws.Sprite({image: "graphics/messages.png"}),
        // The overlay is placed over the display area, to 'fade' the images
        // underneath it, so that the message is clearly displayed on top.
        overlay: new jaws.Sprite({image: "graphics/message_overlay.png"}),
        // The message number. If this is -1, no message is displayed (calling
        // the draw() method will have no effect).
        message: -1,
        // The position of the message area.
        x: options.x || 0,
        y: options.y || 0,
        //}}}
        
        // ---------------------------------------------------------------------
        // Methods
        // ---------------------------------------------------------------------
        //{{{

        // ---------------------------------------------------------------------
        // update()
        // ---------------------------------------------------------------------
        // Updates the message, making sure that it displays the correct image
        update: function() {
            if (this.message !== -1) {
                this.anim.index = this.message;
                this.sprite.setImage(this.anim.currentFrame());
            }
        },
        // ---------------------------------------------------------------------
        // draw()
        // ---------------------------------------------------------------------
        // Draws the message, provided that the message number is valid
        draw: function() {
            if (this.message !== -1) {
                this.overlay.x = this.x;
                this.overlay.y = this.y
                this.overlay.draw();
                this.sprite.x = this.x;
                this.sprite.y = this.y;
                this.sprite.draw();
            }
        }
        //}}}
    };
    
    return self;
    
};
//}}}

/*
 * =============================================================================
 * Prompter() - displays game hints
 * =============================================================================
 * This object handles the display of messages which are displayed alongside
 * other images, and are usually prompts for the user
 */
//{{{
Prompter = function(options) {
    var self = {
        // ---------------------------------------------------------------------
        // Variables
        // ---------------------------------------------------------------------
        //{{{
        // The animation actually holds the different messages, as frames. It is
        // a quirk of the jaws library that this is the best way to handle
        // a sprite-sheet (provided all the sprites are the same size).
        anim: new jaws.Animation({sprite_sheet: "graphics/prompts.png", frame_size: [162, 17], frame_duration: -1}),
        // The sprite handles the actual visual display
        sprite: new jaws.Sprite({image: "graphics/prompts.png"}),
        // The message number. If this is -1, no message is displayed (calling
        // the draw() method will have no effect).
        message: -1,
        // The position of the message area.
        x: options.x || 0,
        y: options.y || 0,
        //}}}
        
        // ---------------------------------------------------------------------
        // Methods
        // ---------------------------------------------------------------------
        //{{{

        // ---------------------------------------------------------------------
        // update()
        // ---------------------------------------------------------------------
        // Updates the message, making sure that it displays the correct image
        update: function() {
            if (this.message !== -1) {
                this.anim.index = this.message;
                this.sprite.setImage(this.anim.currentFrame());
            }
        },
        // ---------------------------------------------------------------------
        // draw()
        // ---------------------------------------------------------------------
        // Draws the message, provided that the message number is valid
        draw: function() {
            if (this.message !== -1) {
                this.sprite.x = this.x;
                this.sprite.y = this.y;
                this.sprite.draw();
            }
        }
        //}}}
    };
    
    return self;
    
};
//}}}

/*
 * =============================================================================
 * SpriteFader()
 * =============================================================================
 * Object for controlling the fading in and out of rune-stones
 */
//{{{
SpriteFader = function(sprite) {
    'use strict';

    var self = {
        // Variables
        // {{{
        sprite: sprite,
        timer: Timer(),
        type: fadeType.NONE,
        speed: 0.01,
        delay: 0,
        countdown: null,
        done: false,
        //}}}
        
        // Methods
        //{{{
        
        // ---------------------------------------------------------------------
        // start(options)
        // ---------------------------------------------------------------------
        // This starts the rune fading, based on the options passed to it. Note
        // that unless a delay is specified, the fade will start as soon as 
        // this method has been called.
        start: function(options) {
            // The type of fade (fadeType.FADE_IN or fadeType.FADE_OUT) must 
            // always be specified. The rune-stone sprite is assumed to already
            // have the starting alpha-value correctly set.
            this.type = options.type;
            // The alpha-value of the sprite will be adjusted (either up or
            // down depending on the fade type) by this value on each call to
            // the update() method
            this.speed = options.speed || 0.01;
            // If a delay is specified, the fader will wait for this amount of
            // time before actually starting the fade action
            this.delay = options.delay || 0;
            // The countdown is used if a delay is specified. It is set to the
            // delay value (if non-zero), and the fade action will begin when
            // the countdown expires.
            if (this.delay > 0) {
                this.countdown = this.timer.startCountdown(this.delay);
            } else {
                this.countdown = null;
            }
            // This value will be set to true when the alpha-value has reached
            // its limit -- either 0.0 for fade-out, or 1.0 for fade-in
            this.done = false;
        },
        // ---------------------------------------------------------------------
        // stop()
        // ---------------------------------------------------------------------
        // Instantly stops any fader action. This allows external objects to
        // cancel the action. It leaves the sprite's alpha-value at whatever
        // value it had reached.
        stop: function() {
            this.done = true;
            if (this.countdown) {
                this.countdown.remove();
                this.countdown = null;
            }
        },
        // ---------------------------------------------------------------------
        // fade()
        // ---------------------------------------------------------------------
        // Performs the actual fading of the sprite. This is called from the
        // update() method, and does not need to be called directly.
        fade: function() {
            if (this.type === fadeType.FADE_IN) {
                if (this.sprite.alpha < 1.0) {
                    this.sprite.alpha = this.sprite.alpha + this.speed;
                    this.state = runeState.FADING_IN;
                } else {
                    this.sprite.alpha = 1.0;
                    this.done = true;
                }
            } else if (this.type === fadeType.FADE_OUT) {
                if (this.sprite.alpha > this.speed) {
                    this.sprite.alpha = this.sprite.alpha - this.speed;
                } else {
                    this.sprite.alpha = 0.0;
                    this.done = true;
                }
            }
        },
        // ---------------------------------------------------------------------
        // update()
        // ---------------------------------------------------------------------
        // Updates the sprite, fading it if we are currently active
        update: function(sprite) {
            if ((this.type !== fadeType.NONE) && (!this.done)) {
                this.timer.update();
                if ((this.countdown === null) || (this.countdown.expired)) {
                    this.fade();
                    if (this.countdown) {
                        this.countdown.remove();
                        this.countdown = null;
                    }
                }
            }
        }
        //}}}
    };
    
    return self;
    
}
//}}}
/*
 * =============================================================================
 * Rune() - Rune handler.
 * =============================================================================
 * Represents a single rune.
 */
//{{{
Rune = function(options) {
    'use strict';
    
    var self = {

        // ---------------------------------------------------------------------
        // Variables
        // ---------------------------------------------------------------------
        //{{{
        
        // The original filename, in case it needs to be referenced later
        filename: options.filename,
        
        // Whether this sprite is selected
        selected: false,
        
        // The actual sprite for this rune
        sprite: new jaws.Sprite({image: options.filename}),
        
        // The 'selected' sprite
        selector: new jaws.Sprite({image: "graphics/selector.png"}),
        
        // The shadow sprite
        shadow: new jaws.Sprite({image: "graphics/shadow.png"}),
        
        // Object to handle fading the rune image in and out
        fader: null,

        state: runeState.VISIBLE,        
        //}}}
        
        // ---------------------------------------------------------------------
        // Methods
        // ---------------------------------------------------------------------
        //{{{

        // ---------------------------------------------------------------------
        // contains(x, y)
        // ---------------------------------------------------------------------
        // Returns true if x, y is within the sprite
        //{{{
        contains: function(x, y) {
            // Simply pass the query on to the jaws sprite
            return this.sprite.rect().collidePoint(x, y);
        },
        //}}}

        // ---------------------------------------------------------------------
        // fade(type, speed, delay)
        // ---------------------------------------------------------------------
        // Starts the rune fading in or out (based on the fade type). If 'delay'
        // is specified there will be a delay for the rune actual starts to
        // fade
        //{{{
        fade: function(type, speed, delay) {
            this.fader = SpriteFader(this.sprite);
            this.fader.start({type: type, speed: speed, delay: delay});
            this.state = (type === fadeType.FADE_IN) ? runeState.FADING_IN : runeState.FADING_OUT;            
        },
        //}}}

        // ---------------------------------------------------------------------
        // isFading()
        // ---------------------------------------------------------------------
        // Returns true if the fader exists and is active
        //{{{
        isFading: function() {
            return ((this.fader) && (!this.fader.done));
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // update()
        // ---------------------------------------------------------------------
        // Updates the rune
        //{{{
        update: function() {
            if (this.isFading()) {
                this.fader.update(this.sprite);
                if (this.fader.done) {
                    this.state = (this.fader.type === fadeType.FADE_IN) ? runeState.VISIBLE : runeState.INVISIBLE;
                }
            }
        },
        //}}}

        // ---------------------------------------------------------------------
        // show(value)
        // ---------------------------------------------------------------------
        // Shows or hides (depending on the value) the rune. This will override
        // any existing fader.
        //{{{
        show: function(value) {
            if (this.isFading()) {
                this.fader.stop();
            }
            if (value) {
                this.state = runeState.VISIBLE;
                this.sprite.alpha = 1.0;
            } else {
                this.state = runeState.INVISIBLE;
                this.sprite.alpha = 0.0;
            }
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // draw()
        // ---------------------------------------------------------------------
        // Draws the rune if it is marked as visible
        //{{{
        draw: function(x, y) {
            if (this.state !== runeState.INVISIBLE) {
                this.shadow.x = x;
                this.shadow.y = y;
                // this.shadow.draw();
    
                this.sprite.x = x;
                this.sprite.y = y;
                this.sprite.draw();
            }
        }
        //}}}
        //}}}
    };
    
    return self;
    
};

//}}}

/*
 * =============================================================================
 * RuneSet() - Rune Set handler.
 * =============================================================================
 * Maintains a collection of runes, with methods to load, select, display, and 
 * hide them.
 */
//{{{
RuneSet = function() {
    'use strict';
    
    var self = {
        
        // ---------------------------------------------------------------------
        // Variables
        // ---------------------------------------------------------------------
        //{{{
        
        // The collection of runes
        runes: [],
    
        // The starting position
        x: 0,
        y: 0,
    
        //}}}
        
        // ---------------------------------------------------------------------
        // Methods
        // ---------------------------------------------------------------------
        //{{{
        
        // ---------------------------------------------------------------------
        // load()
        // ---------------------------------------------------------------------
        // Loads a single runes, using the specified file as the image. The 
        // images are assumed to have already been loaded as jaws library 
        // assets.
        //{{{
        load: function(filename) {
            // runes.push(jaws.Sprite({image: filename}));
            this.runes.push(Rune({filename: filename}));
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // show(rune_number, show = true)
        // ---------------------------------------------------------------------
        // Makes the specified rune visible or invisible (based on the value of
        // the 'show' argument).
        //{{{
        show: function(rune_number, show) {
            if ((rune_number > 0) && (rune_number < this.runes.length)) {
                this.runes[rune_number].show(show);
            }
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // showAll(show = true)
        // ---------------------------------------------------------------------
        // Shows or hides all the runes in the set
        //{{{
        showAll: function(show) {
            var i;
            var type = show ? fadeType.FADE_IN : fadeType.FADE_OUT;
            for (i = 0; i < this.runes.length; i++) {
                this.runes[i].show(show);
            }
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // update()
        // ---------------------------------------------------------------------
        // Updates the Rune Set
        //{{{
        update: function() {
            var i;
            for (i = 0; i < this.runes.length; i++) {
                this.runes[i].update();
            }
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // draw()
        // ---------------------------------------------------------------------
        // Draws all the visible runes
        //{{{
        draw: function() {
            var i;
            var y = this.y;
            var x = this.x;
            for (i = 0; i < this.runes.length; i++) {
                this.runes[i].draw(x, y);
                if (i === 3) {
                    x = this.x;
                    y = y + 64;
                }
                else {
                    x = x + 64;
                }
            }
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // pick()
        // ---------------------------------------------------------------------
        // Selects and returns a random set of runes
        //{{{
        pick: function(total, allowDuplicates) {
            var i;
            var choice;
            var picked = [];
            var rune;
            for (i = 0; i < total; i++) {
                choice = Math.floor(Math.random() * this.runes.length);
                rune = this.runes[choice];
                if (!allowDuplicates) {
                    while (picked.indexOf(rune.filename) > -1) {
                        choice = Math.floor(Math.random() * this.runes.length);
                        rune = this.runes[choice];
                    }
                }
                picked.push(rune.filename);
            }
            return picked;
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // runeAt(x, y)
        // ---------------------------------------------------------------------
        // Returns the rune which contains the specified co-ordinates. Returns 
        // null if no matching rune can be found.
        //{{{
        runeAt: function(x, y) {
            var i;
            for (i = 0; i < this.runes.length; i++) {
                if (this.runes[i].contains(x, y)) {
                    return this.runes[i];
                }
            }
            return null;
        }
        //}}}
        
        //}}}
    };
    
    return self;
    
};
//}}}

/*
 * =============================================================================
 * SelectedRunes()
 * =============================================================================
 * Collection of selected runes
 */
//{{{
SelectedRunes = function() {
    'use strict';
    
    var self = {

        // ---------------------------------------------------------------------
        // Variables        
        // ---------------------------------------------------------------------
        //{{{

        // The collection of runes
        runes: [],
        
        // The starting position
        x: 0,
        y: 0,
        
        allFaded: false,
        
        //}}}

        // ---------------------------------------------------------------------
        // Methods
        // ---------------------------------------------------------------------
        // {{{
        
        // ---------------------------------------------------------------------
        // setSelection
        // ---------------------------------------------------------------------
        // Applies a new set of runes to the collection. It expects an array of
        // the filenames of the runes (see the RuneSet.pick() method).
        //{{{
        setSelection: function(runeSelection) {
            var i;
            var filename;
            var rune;
            this.runes = [];
            for (i = 0; i < runeSelection.length; i++) {
                filename = runeSelection[i];
                rune = Rune({filename: filename});
                this.runes.push(rune);
            }
        },
        //}}}

        // ---------------------------------------------------------------------
        // showAll(show = true)
        // ---------------------------------------------------------------------
        // Shows or hides all the runes in the set
        //{{{
        showAll: function(show) {
            var i;
            for (i = 0; i < this.runes.length; i++) {
                this.runes[i].show(show);
            }
            this.allHidden = !show;
            this.allShown = show;
        },
        //}}}

        // ---------------------------------------------------------------------
        // fade()
        // ---------------------------------------------------------------------
        // Starts the runes fading in or out
        fade: function(type, speed, delay) {
            if (type === fadeType.FADE_IN) {
                this.startFadeIn(speed, delay);
            } else {
                this.startFadeOut(speed, delay);
            }
        },
        
        // startFadeIn
        //{{{
        startFadeIn: function(speed, delay) {
            this.allFaded = false;
            for (i = 0; i < this.runes.length; i++) {
                this.runes[i].fade(fadeType.FADE_IN, speed, delay);
            }
        },
        //}}}
        
        // startFadeOut
        //{{{
        startFadeOut: function(speed, delay) {
            this.allFaded = false;
            for (i = 0; i < this.runes.length; i++) {
                this.runes[i].fade(fadeType.FADE_OUT, speed, (delay + i) * 10);
            }
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // update()
        // ---------------------------------------------------------------------
        // Updates the Rune Selection
        //{{{
        update: function() {
            this.allFaded = true;
            for (i = 0; i < this.runes.length; i++) {
                this.runes[i].update();
                if (this.runes[i].isFading()) {
                    this.allFaded = false;
                }
            }
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // draw()
        // ---------------------------------------------------------------------
        // Draws all the runes
        //{{{
        draw: function() {
            var i;
            var y = this.y;
            var x = this.x;
            for (i = 0; i < this.runes.length; i++) {
                this.runes[i].draw(x, y);
                if (i === 3) {
                    x = this.x;
                    y = y + 64;
                }
                else {
                    x = x + 64;
                }
            }
        }
        //}}}
        //}}}
    };
    
    return self;
    
};
//}}}

/*
 * =============================================================================
 * StateHandler()
 * =============================================================================
 * Base object for handling one game state
 */
//{{{
StateHandler = {
    // -------------------------------------------------------------------------
    // Variables
    // -------------------------------------------------------------------------
    // These are set up by the State() object when it is initialised
    //{{{
    initialised: false,
    name: "Base",
    nextState: null,
    changeRequired: false,
    //}}}

    // -------------------------------------------------------------------------
    // Methods
    // -------------------------------------------------------------------------
    // These can be replaced in descendant state-handler objects
    //{{{

    // init(engine)
    // Initialises the state, taking references to all the required components
    // from the supplied game-engine.
    //
    // NOTE: This means that there is a **very** tight coupling between the
    // Engine object and the various StateHandler objects.
    //{{{
    init: function(engine) {
        this.engine = engine;
        this.context = engine.context;
        this.board = engine.board;
        this.hourglass = engine.hourglass;
        this.coin = engine.coin;
        this.button = engine.button;
        this.messenger = engine.messenger;
        this.prompter = engine.prompter;
        this.opponent = engine.opponent;
        this.playerRunes = engine.playerRunes;
        this.opponentRunes = engine.opponentRunes;
        this.runesOverlay = engine.runesOverlay;
        this.intro = engine.intro;
        this.timer = Timer();
        this.roundCountdown = null;
        this.initialised = true;
    },
    //}}}
    
    // -------------------------------------------------------------------------
    // onEntry()
    // -------------------------------------------------------------------------
    // This should be called when the state is activated, to allow the state to
    // do any set-up that is required
    //{{{
    onEntry: function() {
        if (!this.initialised) {
            throw new Error("State not initialised!");
        }
        
    },
    //}}}

    // -------------------------------------------------------------------------
    // onExit()
    // -------------------------------------------------------------------------
    // This should be called when the state is de-activated, to allow the state 
    // to do any clean-up that is required
    //{{{
    onExit: function() {
        if (!this.initialised) {
            throw new Error("State not initialised!");
        }
        
    },
    //}}}

    // -------------------------------------------------------------------------
    // update()
    // -------------------------------------------------------------------------
    // This is called by the game every frame-tick, and should update the 
    // on-screen components.
    //{{{
    update: function() {
        if (!this.initialised) {
            throw new Error("State not initialised!");
        }
        this.beforeUpdate();
        this.playerRunes.update();
        this.opponentRunes.update();
        this.button.update();
        this.opponent.update();
        this.messenger.update();
        this.prompter.update();
        this.timer.update();
        this.afterUpdate();
    },
    //}}}

    beforeUpdate: function() {
    },
    
    afterUpdate: function() {
    },
    
    // -------------------------------------------------------------------------
    // update()
    // -------------------------------------------------------------------------
    // This is called by the game every frame-tick, and should draw the 
    // on-screen components.
    //{{{
    draw: function() {
        var x = 28;
        var y = 290;
        var w = 36;
        var h = 30;
        if (!this.initialised) {
            throw new Error("State not initialised!");
        }
        jaws.clear();
        if (this.intro.visible) {
            this.intro.draw();
        } else {
            this.board.draw();
            this.context.textAlign = 'center';
            this.context.fillStyle = 'black';
            this.context.font = "bold 12pt serif";
            this.context.fillText("Winnings: " + this.engine.winnings + " Sovereigns", 160, 83);
            if (this.name === "Cast Runes") {
                this.context.beginPath();
                
                y = y - this.roundCountdown.duration * (30/this.opponent.time);
                h = this.roundCountdown.duration * (30/this.opponent.time);
                this.context.rect(x, y, w, h);
                this.context.fillStyle = '#fbedb3';
                this.context.fill();
                this.context.lineWidth = 7;
                this.context.strokeStyle = 'black';
                this.context.stroke();
                if (this.bonus > 0) {                
                    for (y = 280; y > (280 - (this.bonus * 4)); y = y - 4) {
                        this.coin.y = y;
                        this.coin.draw();
                    }
                }
            }
            this.hourglass.draw();
            this.button.draw();
            this.opponent.draw();
            this.opponentRunes.draw();
            this.playerRunes.draw();
            if (this.name !== "Cast Runes") {
                this.runesOverlay.draw();
            };
            this.messenger.draw();
            this.prompter.draw();
                
        }
    }
    //}}}
    
}
//}}}

/*
 * -----------------------------------------------------------------------------
 * GameIntroState()
 * -----------------------------------------------------------------------------
 */
//{{{
var GameIntroState = Object.create(StateHandler);
GameIntroState.name = "Game Intro";
GameIntroState.onEntry = function() {
    this.intro.visible = true;
    this.engine.winnings = 0;
    this.opponent.level = 0;
    this.nextState = LevelIntroState;
    this.messenger.message = messages.NONE;
    this.prompter.message = prompts.NONE;
    this.button.button = buttons.START;
    this.opponent.visible = false;
};
GameIntroState.onExit = function() { 
    this.intro.visible = false;
};
//}}}

/*
 * -----------------------------------------------------------------------------
 * LevelIntroState()
 * -----------------------------------------------------------------------------
 */
//{{{
var LevelIntroState = Object.create(StateHandler);
LevelIntroState.name = "Level Intro";
LevelIntroState.onEntry = function() {
    this.opponent.next();
    RoundIntroState.round = 0;
    this.nextState = RoundIntroState;
    this.messenger.message = messages.NONE;
    this.prompter.message = prompts.NONE;
    this.button.button = buttons.START;
    this.opponent.visible = true;
    this.opponentRunes.showAll(false);
};
LevelIntroState.onExit = function() { 
};
//}}}

/*
 * -----------------------------------------------------------------------------
 * RoundIntroState()
 * -----------------------------------------------------------------------------
 */
//{{{
var RoundIntroState = Object.create(StateHandler);
RoundIntroState.name = "Round Intro";
RoundIntroState.round = 0;
RoundIntroState.onEntry = function() {
    this.round = this.round + 1;
    this.nextState = ShowRunesState;
    this.messenger.message = messages.ROUND_1 + (this.round - 1);
    this.prompter.message = prompts.NONE;
    this.button.button = buttons.GO;
    this.opponent.visible = false;
};
RoundIntroState.onExit = function() { 
};
//}}}

/*
 * -----------------------------------------------------------------------------
 * ShowRunesState()
 * -----------------------------------------------------------------------------
 */
//{{{
var ShowRunesState = Object.create(StateHandler);
ShowRunesState.name = "Show Runes";
ShowRunesState.onEntry = function() { 
    this.changeRequired = false;
    this.nextState = HideRunesState;
    this.messenger.message = messages.NONE;
    this.prompter.message = prompts.STUDY;
    this.button.button = buttons.NONE;
    
    var sequence = this.playerRunes.pick(this.opponent.runeCount, this.opponent.allowDuplicates);
    this.opponentRunes.setSelection(sequence);
    this.opponentRunes.showAll(false);
    this.opponentRunes.fade(fadeType.FADE_IN, 1.0, 0);
    this.opponent.visible = false;
};
ShowRunesState.afterUpdate = function() {
    if(this.opponentRunes.allFaded) {
        if (!this.countdown) {
            this.countdown = this.timer.startCountdown(50);
        } else if (this.countdown.expired) {
            this.changeRequired = true;
        }
    };
};
ShowRunesState.onExit = function() { 
};
//}}}

/*
 * -----------------------------------------------------------------------------
 * HideRunesState()
 * -----------------------------------------------------------------------------
 */
//{{{
var HideRunesState = Object.create(StateHandler);
HideRunesState.name = "Hide Runes";
HideRunesState.onEntry = function() {
    this.changeRequired = false;
    this.nextState = CastRunesState;
    this.messenger.message = messages.NONE;
    this.prompter.message = prompts.STUDY;
    this.button.button = buttons.NONE;
    this.opponentRunes.fade(fadeType.FADE_OUT, 0.01, 1.0);
    this.opponent.visible = false;
};
HideRunesState.afterUpdate = function() {
    if(this.opponentRunes.allFaded) {
        this.changeRequired = true;
    };
};
HideRunesState.onExit = function() { 
};
//}}}

/*
 * -----------------------------------------------------------------------------
 * CastRunesState()
 * -----------------------------------------------------------------------------
 */
//{{{
var CastRunesState = Object.create(StateHandler);
CastRunesState.name = "Cast Runes";
CastRunesState.onEntry = function() {
    this.changeRequired = false;
    this.bonus = 8;
    if ((this.opponent.level === 10) && (RoundIntroState.round === 3)) {
        this.nextState = WinGameState;
    } else if (RoundIntroState.round === 3) {
        this.nextState = WinLevelState;
    } else {
        this.nextState = WinRoundState;
    }
    this.messenger.message = messages.NONE;
    this.prompter.message = prompts.CAST;
    this.button.button = buttons.NONE;
    this.opponent.visible = false;
    this.roundCountdown = this.timer.startCountdown(this.opponent.time);
};
CastRunesState.afterUpdate = function() {
    if (this.roundCountdown.expired) {
        this.nextState = LoseRoundState;
        this.changeRequired = true;
    }
};
CastRunesState.onExit = function() {
    if (this.nextState !== LoseRoundState) {
        this.engine.winnings = this.engine.winnings + this.bonus;
    }
    this.opponentRunes.showAll(false);
};
//}}}

/*
 * -----------------------------------------------------------------------------
 * LoseRoundState()
 * -----------------------------------------------------------------------------
 */
//{{{
var LoseRoundState = Object.create(StateHandler);
LoseRoundState.name = "Lose Round";
LoseRoundState.onEntry = function() { 
    this.nextState = RoundIntroState;
    RoundIntroState.round = RoundIntroState.round - 1;
    this.messenger.message = messages.TOO_LATE;
    this.prompter.message = prompts.NONE;
    this.button.button = buttons.TRY_AGAIN;
    this.opponent.visible = false;
};
LoseRoundState.onExit = function() { 
};
//}}}

/*
 * -----------------------------------------------------------------------------
 * WinRoundState()
 * -----------------------------------------------------------------------------
 */
//{{{
var WinRoundState = Object.create(StateHandler);
WinRoundState.name = "Win Round";
WinRoundState.onEntry = function() {
    this.nextState = RoundIntroState;
    this.messenger.message = messages.WIN_ROUND;
    this.prompter.message = prompts.NONE;
    this.button.button = buttons.NEXT;
    this.opponent.visible = false;
};
WinRoundState.onExit = function() {
    
};
//}}}

/*
 * -----------------------------------------------------------------------------
 * WinLevelState()
 * -----------------------------------------------------------------------------
 */
//{{{
var WinLevelState = Object.create(StateHandler);
WinLevelState.name = "Win Level";
WinLevelState.onEntry = function() {
    this.nextState = LevelIntroState;
    this.messenger.message = messages.WIN_LEVEL;
    this.prompter.message = prompts.NONE;
    this.button.button = buttons.NEXT;
    this.opponent.visible = false;
};
WinLevelState.onExit = function() { 
};
//}}}

/*
 * -----------------------------------------------------------------------------
 * WinGameState()
 * -----------------------------------------------------------------------------
 */
//{{{
var WinGameState = Object.create(StateHandler);
WinGameState.name = "Win Game";
WinGameState.onEntry = function() { 
    this.nextState = GameIntroState;
    this.messenger.message = messages.WIN_GAME;
    this.prompter.message = prompts.NONE;
    this.button.button = buttons.PLAY_AGAIN;
    this.opponent.visible = false;
};
WinGameState.onExit = function() { 
};
//}}}

/*
 * =============================================================================
 * Engine() - Main game state handler.
 * =============================================================================
 * This class creates all the components of the game and assigns them to the
 * game states. It is responsible for initialising the states and for dealing
 * switching between states.
 */
//{{{ 
var Engine = function() {
    
    var self = {
        // Game components. These are actually created and initialised when the
        // init() method is called.
        board: null,
        playerRunes: null,
        opponentRunes: null,
        button: null,
        messenger: null,
        opponent: null,

        // The next rune number in the sequence, to check whether the player
        // has the sequence correct.
        nextRune: 0,
        
        state: {        
            GAME_INTRO: GameIntroState,
            LEVEL_INTRO: LevelIntroState,
            ROUND_INTRO: RoundIntroState,
            HIDE_RUNES: HideRunesState,
            SHOW_RUNES: ShowRunesState,
            CAST_RUNES: CastRunesState,
            LOSE_ROUND: LoseRoundState,
            WIN_ROUND: WinRoundState,
            WIN_LEVEL: WinLevelState,
            WIN_GAME: WinGameState
        },
        currentState: null,
        
        // ---------------------------------------------------------------------
        // Methods
        // ---------------------------------------------------------------------
        //{{{
        init: function() {
            this.canvas  = document.getElementById("board");
            this.context = this.canvas.getContext("2d");
            
            this.context.font      = "12px Georgia";
            this.context.fillStyle = "#ffeecc";
            
            this.board = new jaws.Sprite({image: "graphics/board.png"});
            this.intro = new jaws.Sprite({image: "graphics/intro.png"});
            this.intro.visible = true;
            
            this.playerRunes = RuneSet();
            this.playerRunes.load("graphics/rune_01.png");
            this.playerRunes.load("graphics/rune_02.png");
            this.playerRunes.load("graphics/rune_03.png");
            this.playerRunes.load("graphics/rune_04.png");
            this.playerRunes.load("graphics/rune_05.png");
            this.playerRunes.load("graphics/rune_06.png");
            this.playerRunes.load("graphics/rune_07.png");
            this.playerRunes.load("graphics/rune_08.png");
            this.playerRunes.y = 320;
            this.playerRunes.x = 32;

            this.opponentRunes = SelectedRunes();
            this.opponentRunes.y = 92;
            this.opponentRunes.x = 32
            
            this.button = Button({});
            this.button.button = 0;
            this.button.x = 88;
            this.button.y = 248;
            
            this.messenger = Messenger({});
            this.messenger.x = 24;
            this.messenger.y = 88;
            
            this.prompter = Prompter({});
            this.prompter.x = 78;
            this.prompter.y = 222;
            
            this.opponent = Opponent({context: this.context});
            this.opponent.visible = false;
            
            this.coin = jaws.Sprite({image: "graphics/coin.png", x: 250, y: 280});
            this.winnings = 0;
            
            this.runesOverlay = jaws.Sprite({image: "graphics/runes_overlay.png", x: 28, y: 312});
            
            this.hourglass = jaws.Sprite({image: "graphics/hourglass.png", x: 24, y: 247});
            
            this.state.GAME_INTRO.init(self);
            this.state.LEVEL_INTRO.init(self);
            this.state.ROUND_INTRO.init(self);
            this.state.HIDE_RUNES.init(self);
            this.state.SHOW_RUNES.init(self);
            this.state.CAST_RUNES.init(self);
            this.state.LOSE_ROUND.init(self);
            this.state.WIN_ROUND.init(self);
            this.state.WIN_LEVEL.init(self);
            this.state.WIN_GAME.init(self);
            
            this.changeStateTo(GameIntroState);
        },
        update: function() {
            this.currentState.update();
            if (this.currentState.changeRequired) {
                this.changeStateTo(this.currentState.nextState);
            }
        },
        draw: function() {
            this.currentState.draw();
            /*
            if ((this.currentState === ShowRunesState) || (this.currentState == HideRunesState)) {
                this.messenger.overlay.y = 312;
                this.messenger.overlay.draw();
            }
            */
        },
        onClick: function(key) {
            var x = jaws.mouse_x;
            var y = jaws.mouse_y;
            var rune;
            if (key === "left_mouse_button") {
                rune = this.playerRunes.runeAt(x, y);
                button = this.button.isAt(x, y);
                if ((rune) && (this.currentState === CastRunesState)) {
                    if (rune.filename == this.opponentRunes.runes[this.nextRune].filename) {
                        // rune.selected = true;
                        this.opponentRunes.runes[this.nextRune].show(true);
                        // Matching rune
                        this.nextRune++;
                        if (this.nextRune >= this.opponentRunes.runes.length) {
                            this.changeStateTo(this.currentState.nextState);
                        }
                    }
                    else
                    {
                        // Non-matching rune
                        if (CastRunesState.bonus > 0) {
                            CastRunesState.bonus = CastRunesState.bonus - 1;
                        }
                    }
                } else if ((button) && (this.currentState.nextState !== null)) {
                    this.changeStateTo(this.currentState.nextState);
                    this.nextState = null;
                } else if (this.currentState == GameIntroState) {
                    this.changeStateTo(this.currentState.nextState);
                }
            }
        },
        changeStateTo: function(newState) {
            jaws.log("State:" + newState.name);
            if (this.currentState) {
                this.currentState.onExit();
            }
            this.nextRune = 0;
            this.currentState = newState;
            this.currentState.onEntry();
        }
        //}}}
    };
    
    return self;
    
};
//}}}

/*
 * =============================================================================
 * Game() - Main game state handler.
 * =============================================================================
 */
//{{{ 
var Game = (function() { 
    'use strict';
        
    var self = {
 
        // ---------------------------------------------------------------------
        // Variables
        // ---------------------------------------------------------------------
        //{{{
        
        // The main game engine
        engine: null,        
        
        //}}}
        
        // ---------------------------------------------------------------------
        // Methods
        // ---------------------------------------------------------------------
        //{{{
        
        // ---------------------------------------------------------------------
        // setup()
        // ---------------------------------------------------------------------
        // Creates and initialises the main game elements and controllers. This
        // is automatically called by the jaws library.
        //{{{
        setup: function() {
            //jaws.log("setup()", false);
            this.engine = Engine();
            this.engine.init();
            
            this.gameTrack = new Audio("sounds/DST-OurRealm.ogg");
            this.gameTrack.volume = 0.5;
            this.gameTrack.addEventListener("ended", function() {
                this.currentTime = 0;
                this.play();
            }, false);
            this.gameTrack.play();
    
            jaws.on_keydown(["left_mouse_button", "right_mouse_button"], function(key) { self.onClick(key); });
            
        },
        //}}}

        // ---------------------------------------------------------------------
        // update()
        // ---------------------------------------------------------------------
        // Updates the main game elements, and calls the update() for the 
        // current game state, to allow state-specific elements to be updated.
        // This is automatically called by the jaws library.
        //{{{
        update: function() {
            //jaws.log("update()", false);
            this.engine.update();
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // draw()
        // ---------------------------------------------------------------------
        // Draws the main game elements, and calls the draw() for the current 
        // state to allow state-specific elements to be drawn. This is
        // automatically called by the jaws library.
        //{{{
        draw: function() {
            this.engine.draw();
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // onclick()
        // ---------------------------------------------------------------------
        // Click-handler for the game
        //{{{
        onClick: function(key) {
            this.engine.onClick(key);
        }
        //}}}
        
        //}}}
    };
    
    return self;
    
}());
//}}}

/*
 * =============================================================================
 * Main entry point
 * =============================================================================
 * Loads the game assets and launches the game.
 */
//{{{ 
jaws.onload = function( ) {
    // Pre-load the game assets
    jaws.assets.add( [
            "graphics/board.png",
            "graphics/buttons.png",
            "graphics/messages.png",
            "graphics/message_overlay.png",
            "graphics/runes_overlay.png",
            "graphics/prompts.png",
            "graphics/intro.png",
            "graphics/hourglass.png",
            "graphics/coin.png",
            "graphics/rune_01.png",
            "graphics/rune_02.png",
            "graphics/rune_03.png",
            "graphics/rune_04.png",
            "graphics/rune_05.png",
            "graphics/rune_06.png",
            "graphics/rune_07.png",
            "graphics/rune_08.png",
            "graphics/selector.png",
            "graphics/shadow.png",
    ] ); 
    // Start the game running. jaws.start() will handle the game loop for us.
    jaws.start( Game, {fps: 60} ); 
}
//}}}


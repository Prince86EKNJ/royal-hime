define( [ "royal/math" ], function( math ) 
{
	// CLOCKS: 
	// Clocks should be built in the following order in order for all their features to work
	// properly.
	//
	// [ ROOTED TIME SOURCE ]
	// SystemClock / ManualClock
	// ResetClock - This first reset clock is to root the initial time source
	
	// [ TIME CONTROL ]
	// SpeedClock
	// StopClock
	// MotionClock
	// ResetClock
	// PlusClock
	
	// [ TIME REPORTING ]
	// DeltaClock
	
	var time = {
			
	};
	
    // Constructor
	time.SystemClock = function() {};
    
    // Definition
	time.SystemClock.prototype = 
    {
    	getTime: function() 
    	{
    		return Date.now();
    	}
    };
    
    // Constructor
	time.ManualClock = function()
    {
    	this.time = 0;
    };
    
    // Definition
    time.ManualClock.prototype = 
    {
    	getTime: function() 
    	{
    		return this.time;
    	},
    
    	setTime: function( time )
    	{
    		this.time = time;
    	}
    };
    
    // Constructor
    time.PlusClock = function( parentClock )
    {
    	this.parentClock = parentClock;
    	
    	this.plusTime = 0;
    };
    
    // Definition
    time.PlusClock.prototype = {
    	
    	setPlusTime: function( plusTime )
    	{
    		this.plusTime = plusTime;
    	},
    	
    	getPlusTime: function()
    	{
    		return this.plusTime;
    	},
    	
    	getTime: function()
    	{
    		var time = this.parentClock.getTime() + this.plusTime;
    		return time;
    	}
    };
    
    // Constructor
    time.StopClock = function( parentClock )
    {
    	this.parentClock = parentClock;
    	
    	this.running = true;
    	this.startTime = 0;
    	this.plusTime = 0;
    };
    
    // Definition
    time.StopClock.prototype = {
    	
    	start: function() 
    	{
    		if( !this.running ) 
    		{
    			this.startTime = this.parentClock.getTime();
    			this.running = true;
    		}
    		
    		return this;
    	},
    	
    	stop: function()
    	{
    		if( this.running )
    		{
    			var baseTime = this.parentClock.getTime();
    			this.plusTime += baseTime - this.startTime;
    			this.running = false;
    		}
    		
    		return this;
    	},
    		
    	toggle: function()
    	{
    		if( this.running )
    		{
    			this.stop();
    		}
    		else
    		{
    			this.start();
    		}
    		
    		return this;
    	},
    	
    	isRunning: function()
    	{
    		return this.running;
    	},
    	
    	setRunning: function( running )
    	{
    		if( running )
    		{
    			this.start();
    		}
    		else
    		{
    			this.stop();
    		}
    	},
    	
    	getTime: function()
    	{
    		var time = null;
    		
    		if( this.running )
    		{
    			var baseTime = this.parentClock.getTime();
    			time = baseTime - this.startTime + this.plusTime;
    		}
    		else
    		{
    			time = this.plusTime;
    		}
    		
    		return time;
    	}
    };
    
    // Constructor
    time.ResetClock = function( parentClock ) 
    {
    	this.parentClock = parentClock;
    	
    	this.resetTime = 0;
    };
    
    // Definition
    time.ResetClock.prototype = 
    {
    	reset: function()
    	{
    		this.resetTime = this.parentClock.getTime();
    		return this;
    	},
    		
    	getTime: function() 
    	{
    		var baseTime = this.parentClock.getTime();
    		var time = baseTime - this.resetTime;
    		
    		return time;
    	}
    };
    
    // Constructor
    time.DeltaClock = function( parentClock ) 
    {
    	this.parentClock = parentClock;
    	
    	this.lastTime = 0;
    	this.deltaTime = 0;
    };
    
    // Definition
    time.DeltaClock.prototype = 
    {
    	lap: function()
    	{
    		var thisTime = this.parentClock.getTime();
    		this.deltaTime = thisTime - this.lastTime;
    		this.lastTime = thisTime;
    		
    		return this;
    	},
    	
    	clear: function()
    	{
    		this.deltaTime = 0;
    		
    		return this;
    	},
    	
    	getDeltaTime: function()
    	{
    		return this.deltaTime;
    	},
    		
    	getTime: function() 
    	{
    		var time = this.parentClock.getTime();
    		return time;
    	}
    };
    
    
    // Constructor
    time.SpeedClock = function( parentClock ) 
    {
    	this.parentClock = parentClock;
    	
    	this.speed = 1;
    	this.switchTime = 0;
    	this.plusTime = 0;
    };
    
    // Definition
    time.SpeedClock.prototype = 
    {
    	getSpeed: function()
    	{
    		return this.speed;
    	},
    	
    	setSpeed: function( speed )
    	{
    		var baseTime = this.parentClock.getTime();
    		this.plusTime += ( ( baseTime - this.switchTime ) * this.speed );
    		this.switchTime = baseTime;
    		this.speed = speed;
    	},
    		
    	getTime: function() 
    	{
    		var baseTime = this.parentClock.getTime();
    		var time = ( ( baseTime - this.switchTime ) * this.speed ) + this.plusTime;
    		return time;
    	}
    };
    
    // Constructor
    time.MotionClock = function( parentClock )
    {
    	this.parentClock = parentClock;
    	
    	this.initalTime = 0;
    	this.finalTime = 0;
    	
    	this.offset = 0;
    	this.motionOffset = 0;
    	
    	this.filter = math.filters.linear;
    };
    
    time.MotionClock.prototype = 
    {
    	setFilter: function( filter )
    	{
    		this.filter = filter;
    	},
    	
    	move: function( offset, duration )
    	{
    		var baseTime = this.parentClock.getTime();
    		if( baseTime < this.finalTime )
    		{
//    			// TODO: [enicholes] Special considerations
//    			// Implement this
    		
    			// Caluclate remaining offset is old motion
    			var motionTime = baseTime - this.initalTime;
    			var theta = motionTime / this.duration;
    			theta = this.filter( theta );
    			var remainingOffset = ( 1 - theta ) * this.motionOffset;
    			
    			// Add remaining offset to new offset
    			var totalOffset = offset + remainingOffset;
    			this.motionOffset = totalOffset - duration;
    	    	this.offset += offset - motionTime;
    		}
    		else
    		{
	    		this.motionOffset = offset - duration;
		    	this.offset += this.motionOffset;
    		}
	    	
    		this.initalTime = baseTime;
    		this.duration = duration;
    		this.finalTime = this.initalTime + duration;
    		
    		return this;
    	},
    
    	getTime: function()
    	{
    		var baseTime = this.parentClock.getTime();
    		
    		var time;
    		if( baseTime < this.finalTime )
    		{
    			var theta = ( baseTime - this.initalTime ) / this.duration;
    			theta = this.filter( theta );
    			var totalOffset = this.offset - ( ( 1 - theta ) * this.motionOffset );
    			time = baseTime + totalOffset;
    		}
    		else
    		{
    			time = baseTime + this.offset;
    		}
    		
    		return time;
    	}
    };
    
    /////////////////////////////////////////////////
    // Helper Functions
    /////////////////////////////////////////////////
    
    // Build a clock with all features
    time.buildFullClock = function()
    {
    	var clock = this.buildClock( 
    		"SystemClock", 
    		"ResetClock",
        	"SpeedClock",
    		"StopClock",
    		"MotionClock",
    		"ResetClock",
    		"PlusClock",
    		"DeltaClock"
    	);
    	
    	// Reset first reset clock to anchor time
    	clock.clocks[1].reset();
    	
    	return clock;
    };
    
    // Pass in clock types in order you want them built
    time.buildClock = function() 
    {	
    	var clocks = [];
    	
    	// Build all clock objects
    	for( var i = 0; i < arguments.length; i++ ) 
    	{
    		var className = arguments[i];
    		var constructor = time[className];
    		
    		if( constructor == null )
    		{
    			throw "Could not find constructor for class named "+className+" in imports";
    		}
    		
    		var clock = null;
    		if( i == 0 )
    		{
    			clock = new constructor();
    		}
    		else
    		{
    			clock = new constructor( clocks[i-1] );   			
    		}
    		
    		clock.className = className;
    		clocks.push( clock );
    	}
    	
    	// Merge all functions into final clock
    	var finalClock = clocks[clocks.length-1];
    	for( var i = 0; i < clocks.length; i++ )
    	{
    		var clock = clocks[i];
    		finalClock[clock.className] = clock;
    	}
    	
    	finalClock.clocks = clocks;
    	
    	return finalClock;
    };
    
    return time;
});
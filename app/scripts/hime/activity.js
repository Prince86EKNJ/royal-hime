define( function() {
	
	var activity = {};
	
	activity.buildActivityService = function()
	{
		var activityService = 
		{
			time: 0,
			activityFrames: [],	
			
			addActivity: function()
			{
				switch( arguments.length )
				{
					case 2:
						return this.addActivityNow.apply( this, arguments );
						break;
					case 3:
						return this.addActivityLater.apply( this, arguments );
						break;
					default:
						throw [ "Illegal arguments for \"addActivity()\"", arguments ];
						break;
				}
			},
			
			addActivityNow: function( activity, duration ) 
			{	
				if( duration == undefined )
				{
					throw "Must specify duration";
				}
				
				var startTime = this.time;
				var endTime = startTime + duration;
				
				return this.commitActivity( activity, startTime, endTime );
			},
			
			addActivityLater: function( activity, offset, duration )
			{
				var startTime = this.time + offset;
				var endTime = startTime + duration;
				
				return this.commitActivity( activity, startTime, endTime );
			},
			
			commitActivity: function( activity, startTime, endTime )
			{
				var commitActivity;
				
				if( typeof activity == "function" )
				{
					commitActivity = { complete: activity };
				}
				else if( angular.isArray( activity ) )	
				{
					commitActivity = { complete: activity[0], progress: activity[1] };
				} 
				else
				{
					commitActivity = activity;
				}
				
				var activityFrame = 
				{
					startTime: startTime,
					endTime: endTime,
					activity: commitActivity
				};
				
				var activityId = this.activityFrames.push( activityFrame ) - 1;
				return activityId;
			},
			
			getActivityProgress: function( activityId )
			{
				var activityFrame = this.activityFrames[activityId];
				
				if( activityFrame == undefined )
				{
					if( activityId < this.activityFrames.length )
					{
						return -1;
					}
					throw "No Activity found for Activity Id: " + activityId;
				}
				
				var duration = activityFrame.endTime - activityFrame.startTime;
				var elapsed = this.time - activityFrame.startTime;
				
				var progress = elapsed / duration;
				
				return progress;
			},
			
			getNextCompletedActivity: function() 
			{
				var nextFrame = null;
				
				for( var activityId in this.activityFrames )
				{
					var activityFrame = this.activityFrames[activityId];
					
					if( nextFrame == null )
					{
						nextFrame = activityFrame;
						continue;
					}
					
					if( activityFrame.endTime > nextFrame.endTime )
					{
						nextFrame = activityFrame;
					}
				}
				
				return nextFrame;
			},
			
			updateTime: function( time ) 
			{
				if( this.time > time )
				{
					throw "Can't rewind ActivityService";
				}
				
				if( this.time == time )
				{
					return;
				}
				
				this.time = time;
				
				for( var activityId in this.activityFrames )
				{
					var activityFrame = this.activityFrames[activityId];
					
					if( activityFrame.activity.progress != null )
					{
						var progress = this.getActivityProgress( activityId );
						if( progress >= 0 )
						{
							activityFrame.activity.progress( progress );
						}
					}
					
					if( activityFrame.endTime <= this.time )
					{
						activityFrame.activity.complete();
						
						// Remove Activity Frame
						delete this.activityFrames[activityId];
					}
				}
			}
		};
		
		return activityService;
	};
	
	return activity;
});
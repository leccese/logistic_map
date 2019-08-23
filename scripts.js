var logmap;
var ctx;
var plot_width;
var plot_height;
var x_axis;
var y_axis;
var iterations;
var curr_iteration;
var animation = 0;
var x_0;
var x_n;
var x_start;
var r;
var animate;
var lastClick;
var animation_running = true;
var keep = false; //like MATLAB
var paused = false;
var axisLabelled = false;
var continuingFromPaused = false;



document.addEventListener("DOMContentLoaded", function(){
	logmap = document.getElementById('logmap');
	plot_width = logmap.width;
	plot_height = logmap.height;
	if (logmap.getContext){
	  ctx = logmap.getContext('2d');
	  //adjust coordinate plane to be cartesian
	  //move origin 	
		ctx.translate(0, plot_height);
		//flip about x axis
		ctx.scale(1, -1);
	  draw_plot();
	} 
	document.getElementById('submit').addEventListener('click', function(){
		lastClick = 'submit';
		if (animation){ //animation will contain nonzero id if animation is currently running or has already run, will need to clear 
				clearInterval(animation);
			}
		if (validateInputs() === 1){
			document.getElementById('errors').style.display = 'none';
			document.getElementById('errors').innerHTML = '';			
			curr_iteration = 0; 
			keep = false;
			continuingFromPaused = false;
			paused = false;
			document.getElementById('pause').innerHTML = 'pause'
			evaluate();
		}
				
	}
	);
	//show animation options if animate is checked
	document.getElementById('animate').addEventListener('click', function(){
		if (document.getElementById('animate').checked){
			document.getElementById('animation_options').style.display = 'block'
		}
		else{
			document.getElementById('animation_options').style.display = 'none'
		}
	});
	//pause button function
	document.getElementById('pause').addEventListener('click', function(){
		lastClick = 'pause';
		paused = !paused;
		debugger;
		if (paused){
			clearInterval(animation);
			document.getElementById('pause').innerHTML = 'play_arrow';
			animation_running = false;
			curr_iteration--;
		}
		else{
			document.getElementById('pause').innerHTML = 'pause'
			animation_running = true;
			keep = true;
			continuingFromPaused = true;
			x_start = x_n;
			evaluate();

		}
		
		
	});
	//foward button function
	document.getElementById('forward').addEventListener('click', function(){
	//	debugger;
		lastClick = 'forward';
		clearInterval(animation);
		document.getElementById('pause').innerHTML = 'play_arrow';
		animation_running = false;
		continuingFromPaused = false;
		iterations = curr_iteration + 1
		x_start = x_0;
		evaluate();

	});
	//back button function
	document.getElementById('back').addEventListener('click', function(){
		//debugger;
		let intialDecrement = 1
		if (lastClick == 'submit'){
			intialDecrement = 2
		}
		lastClick = 'back';
		clearInterval(animation);
		document.getElementById('pause').innerHTML = 'play_arrow';
		animation_running = false;
		continuingFromPaused = false;
		//first time backwards is clicked curr_iteration is 1 more than when backwards is clicked consecutively
		iterations = curr_iteration - intialDecrement;
		keep = false;
		x_start = x_0;
		evaluate();
	});
	
});

var evaluate = function(){
	if (!keep){
		//clear previous curve
		draw_plot();
	  draw_curve();
	}
	  ctx.strokeStyle = '#f20915';
	  x_n = x_start;
	  //if no animation or animation is paused, graph everything without delays
	  if (!animation_running){
	  		draw_web(iterations);
	  		curr_iteration = iterations;
	  	}	  
	  //animate: delay between iterations based on "speed" setting
	  else{
	  		iterations = document.getElementById('iterations').value*1;
			animation = setInterval(() => { 
			    draw_web(curr_iteration);
			    if (curr_iteration >= iterations) {
			    	clearInterval(animation);
			    }
			    x_n = x_start;
			    curr_iteration++;
	    }, 1000/ document.getElementById('speed').value);
	  
	  }
	  
};

var draw_web = function(iterations){
	for (let i = 1; i <= iterations; i++){
		
		if (i != 1){
			x_n = fun(x_n);
		}
		ctx.beginPath();
		let y = (i == 1 && !continuingFromPaused) ? 0 : x_n*plot_height; //for first iteration, draw line from x-axis 
	  	ctx.moveTo(x_n*plot_width, y);
	  	ctx.lineTo(x_n*plot_width, fun(x_n)*plot_height);
	  	ctx.lineTo(fun(x_n)*plot_width, fun(x_n)*plot_height);
	  	ctx.stroke();
  	}	
};

var validateInputs = function(){
	//debugger;
	let error = '';
	let error_count = 0;
	iterations = document.getElementById('iterations').value*1;
	x_0 = document.getElementById('x_0').value;
	x_start = x_0;
	r = document.getElementById('r').value;
	if (iterations === '' || !(Number.isInteger(iterations) && iterations > 0)){
		error += 'Iterations must be a positive integer. ';
		error_count++;
	}
	if (x_0 === '' || x_0 > 1 || x_0 < 0){
		error += 'Initial value (x_0) must be between 0 and 1. ';
		error_count++;
	}
	if (r === '' || r < 1 || r > 4){
		error += 'r must be between 1 and 4.'
		error_count++;
	}
	if (error_count === 0){
		return 1;
	}
	else{
		document.getElementById('errors').style.display = 'block';
		document.getElementById('errors').innerHTML = error_count == 1 ? 'Error: ' + error : 'Errors: ' + error;
		return 0;
	}
};

var draw_plot = function(){
	//debugger;
	ctx.clearRect(0,0,plot_width, plot_height);
	//draw plot square
	ctx.strokeStyle = 'black';
	ctx.strokeRect(0,0,plot_width, plot_height);
	draw_gridlines(0,0,plot_width, plot_height, 5, 5);
	draw_indentity();
};

//draws gridlines within the rectangle specified by (x, y, width, height), 
//divides rectangle into x_n horizontal subunits and y_n vertical subunits
//to generalize this function, add x_label_min, x_label_max, etc args, but here we know range is [0,1]
var draw_gridlines = function(x, y, width, height, x_n, y_n){
	ctx.strokeStyle = "#d7d9de";
	x_incr = width/x_n;
	y_incr = height/y_n;
	x_axis = document.getElementById('x_axis');
	x_axis.style.width = x_incr * (x_n +1) + 'px';
	y_axis = document.getElementById('y_axis');
	y_axis.style.height = y_incr * (y_n +1) + 'px';
	for (let j = 0, i = 0; j <= x_n; j++, i+=x_incr){
		ctx.beginPath();
		ctx.moveTo(i, y);
		ctx.lineTo(i, y+height);
		ctx.stroke();
		if (!axisLabelled){
			let label = document.createElement('span');
			label.style.width = x_incr + 'px';
			let num_string = (j/(x_n)).toString();
			if (num_string.length > 4){
				num_string = num_string.substring(0,4);
			}
			let num = document.createTextNode(num_string);
			label.appendChild(num);
			x_axis.appendChild(label);
		}	
	}
	for (let j = 0, i = 0; j <= y_n; j++, i+=y_incr){
		ctx.beginPath();
		ctx.moveTo(x, i);
		ctx.lineTo(x+width, i);
		ctx.stroke();
		if (!axisLabelled){
			let label = document.createElement('div');
			label.style.height = y_incr + 'px';
			let num_string = ((y_n-j)/(y_n)).toString();
			if (num_string.length > 4){
				num_string = num_string.substring(0,4);
			}
			let num = document.createTextNode(num_string);
			label.appendChild(num);
			y_axis.appendChild(label);
			}		
	}
	axisLabelled = true;
}

//renders function x=y
var draw_indentity = function(){
	ctx.strokeStyle = '#a454a5';
	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.lineTo(plot_width, plot_height);
	ctx.stroke();
};


var draw_curve = function(){
	ctx.strokeStyle = '#4ad075';
	let dx = .001;
	for (let x_n=0; x_n<1; x_n+=dx){
		ctx.beginPath();
		ctx.moveTo(x_n*plot_width,fun(x_n)*plot_height);
		ctx.lineTo((x_n+dx)*plot_width, fun(x_n+dx)*plot_height);
		ctx.stroke();
	}
	return;
}

var fun = function(x){
	return r*x*(1-x);
}
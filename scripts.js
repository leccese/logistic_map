var logmap;
var ctx;
var plot_width;
var plot_height;
var x_axis;
var y_axis;
var iterations;
var iteration;
var animation = 0;
var x_0;
var x_n;
var r;
var animate;
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
		if (validateInputs() === 1){
			document.getElementById('errors').innerHTML = '';
			if (animation){ //animation will contain nonzero id if animation has already run, will need to clear 
				clearInterval(animation);
			}
			keep = false;
			continuingFromPaused = false;
			evaluate();
		}		
	}
	);
	//show animation options if animate is checked
	document.getElementById('animate').addEventListener('click', function(){
		if (document.getElementById('animate').checked){
			document.getElementById('animation_options').style.display = 'block';
		}
		else{
			document.getElementById('animation_options').style.display = 'none';
		}
	});
	//pause button function
	document.getElementById('pause').addEventListener('click', function(){
		paused = !paused;
		if (paused){
			clearInterval(animation);
			document.getElementById('pause').innerHTML = 'play';
		}
		else{
			document.getElementById('animate').checked = false;
			let prev_iterations = iterations;
			iterations = iteration;			
			evaluate();
			keep = true;
			continuingFromPaused = true;
			x_0 = x_n;
			document.getElementById('animate').checked = true;
			iterations = prev_iterations+1;
			evaluate();

		}
		
		
	});
	//foward button function
	document.getElementById('forward').addEventListener('click', function(){
	//	debugger;
		clearInterval(animation);
		document.getElementById('animate').checked = false;
		iterations = iteration + 1;
		evaluate();
	});
	//back button function
	document.getElementById('back').addEventListener('click', function(){
	//	debugger;
		clearInterval(animation);
		document.getElementById('animate').checked = false;
		iterations = iteration - 1;
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
	  x_n = x_0;
	  //if no animation, graph everything without delays
	  if (document.getElementById('animate').checked === false){
	  	for (let i = 0; i < iterations; i++){
	  		ctx.beginPath();
	  		let y = (i == 0 && !continuingFromPaused) ? 0 : x_n*plot_height; //for first iteration, draw line from x-axis 
		  	ctx.moveTo(x_n*plot_width, y);
		  	ctx.lineTo(x_n*plot_width, fun(x_n)*plot_height);
		  	ctx.lineTo(fun(x_n)*plot_width, fun(x_n)*plot_height);
		  	ctx.stroke();
		  	x_n = fun(x_n);
		  	iteration = iterations;
	  	}
	  }
	  //if animation is checked, delay between iterations based on "speed" setting
	  else{
	  	iteration = 0;
		animation = setInterval(function() { 
		    ctx.beginPath();
		    let y = (iteration == 0 && !continuingFromPaused) ? 0 : x_n*plot_height; //for first iteration, draw line from x-axis 
		  	ctx.moveTo(x_n*plot_width, y);
		  	ctx.lineTo(x_n*plot_width, fun(x_n)*plot_height);
		  	ctx.lineTo(fun(x_n)*plot_width, fun(x_n)*plot_height);
		  	ctx.stroke();
		    if (iteration >= iterations) {
		    	clearInterval(animation);
		    }
		    iteration++;
		  	x_n = fun(x_n);
	    }, 1000/(document.getElementById('speed').value));
	  
	  }
	  
};



var validateInputs = function(){
	//debugger;
	let error = '';
	let error_count = 0;
	iterations = document.getElementById('iterations').value*1;
	x_0 = document.getElementById('x_0').value;
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
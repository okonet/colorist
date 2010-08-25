// 
//  colorist.js
//  colorist
//  
//  Created by Andrew Okonetchnikov on 2010-08-09.
//  Copyright 2010 okonet.ru. All rights reserved.
// 


// Color goodies based on Mootools
function rgbToHsb(color){
	var red = color[0],
			green = color[1],
			blue = color[2],
			hue = 0;
	var max = Math.max(red, green, blue),
			min = Math.min(red, green, blue);
	var delta = max - min;
	var brightness = max / 255,
			saturation = (max != 0) ? delta / max : 0;
	if(saturation != 0) {
		var rr = (max - red) / delta;
		var gr = (max - green) / delta;
		var br = (max - blue) / delta;
		if (red == max) hue = br - gr;
		else if (green == max) hue = 2 + rr - br;
		else hue = 4 + gr - rr;
		hue /= 6;
		if (hue < 0) hue++;
	}
	return [Math.round(hue * 360), Math.round(saturation * 100), Math.round(brightness * 100)];
};

function hsbToRgb(color){
	var br = Math.round(color[2] / 100 * 255);
	if (this[1] == 0){
		return [br, br, br];
	} else {
		var hue = this[0] % 360;
		var f = hue % 60;
		var p = Math.round((color[2] * (100 - color[1])) / 10000 * 255);
		var q = Math.round((color[2] * (6000 - color[1] * f)) / 600000 * 255);
		var t = Math.round((color[2] * (6000 - color[1] * (60 - f))) / 600000 * 255);
		switch (Math.floor(hue / 60)){
			case 0: return [br, t, p];
			case 1: return [q, br, p];
			case 2: return [p, br, t];
			case 3: return [p, q, br];
			case 4: return [t, p, br];
			case 5: return [br, p, q];
		}
	}
	return false;
}

/* Creates array from native objects */
function createArray(nativeObject) {
  var array = [];
  // iterate backwards ensuring that length is an UInt32
  for (var i = nativeObject.length >>> 0; i--;) { 
    array[i] = nativeObject[i];
  }
  return array;
}

function getAverageColor(col1, col2) {
  var r = Math.round((col1[0] + col2[0]) / 2);
  var g = Math.round((col1[1] + col2[1]) / 2);
  var b = Math.round((col1[2] + col2[2]) / 2);
  return [r,g,b];
}

function averageColorFor(data) {
  var result = [0, 0, 0],
      total_pixels = data.length / 4;
  
  for (var i = 0; i <= total_pixels; i += 4) {
    result[0] += data[i];
    result[1] += data[i + 1];
    result[2] += data[i + 2];
  }

  result[0] = Math.round(result[0] / total_pixels) * 4;
  result[1] = Math.round(result[1] / total_pixels) * 4;
  result[2] = Math.round(result[2] / total_pixels) * 4;

  return result;
}

function areSimilarColors(col1, col2) {
  var delta = 30;
  if( 
      (Math.abs(col2[0] - col1[0]) <= delta) && 
      (Math.abs(col2[1] - col1[1]) <= delta) && 
      (Math.abs(col2[2] - col1[2]) <= delta) 
    )
    return true;
  else
    return false;
}

function sortColors(colorsArray) {
  var res = createArray(colorsArray);
  function sortColor(col1,col2) {

    col1 = rgbToHsb(col1);
    col2 = rgbToHsb(col2);
    
    if (
      (col1[0] > col2[0]) ||
      (col1[1] > col2[1]) ||
      (col1[2] > col2[2])
    ) 
      return 1;
    
    else if (
      (col1[0] < col2[0]) ||
      (col1[1] < col2[1]) ||
      (col1[2] < col2[2])
    ) 
      return -1;
    
    else 
      return 0;
  }
  return res.sort(sortColor);
}

function buildColorPalette(colorsArray) {
  var prevCol = [0,0,0],
      uniqueColors = 0,
      container = document.createElement('DIV');
      
  container.className = 'b-palette-wrap';
  
  for(var i = 0; i < colorsArray.length; i++) {
    var col = colorsArray[i];
    
    var paletteEl = document.createElement('div');
    paletteEl.className = 'b-palette';
    paletteEl.style.backgroundColor = 'rgb('+col[0]+','+col[1]+','+col[2]+')';
    container.appendChild(paletteEl);
    
    if(!areSimilarColors(prevCol, col)) {
      
      prevCol = col;
      uniqueColors++;
    }
  }
  
  return { 
    'el': container, 
    'unique': uniqueColors, 
    'total': colorsArray.length
  };
}

function cancel(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  return false;
}

var dropEl = document.querySelector('#drop');
var targetEl = document.querySelector('#result');

// Tells the browser that we *can* drop on this target
dropEl.addEventListener('dragover', cancel, false);
dropEl.addEventListener('dragenter', cancel, false);
dropEl.addEventListener('drop', function (e) {
  e.preventDefault();
  var files = e.dataTransfer.files;
  
  // We've got some files, so let's loop throught each.
  files = createArray(files);
  files.forEach(function(file){
    var image = new Image();
    image.onload = function(){
      // Image is loaded. Let's start working with data.
      // Prepare canvas and clear container element
      targetEl.innerHTML = '';
      var canvas = document.createElement('canvas');
      ctx = canvas.getContext('2d');
      
      // Reduce image size to fit container. Right now it's just twice as small.
      canvas.width = image.width / 2 >> 0;
      canvas.height = image.height / 2 >> 0;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      var averageColors = [],
          sortedColors = [],
          rows = 40,
          cells = 40,
          cellWidth = Math.ceil(canvas.width / cells),
          cellHeight = Math.ceil(canvas.height / rows);
      
      // Devide the original image into slices and get average color for each slice.
      for(var i = 0; i < rows; i++) {
        for(var j = 0; j < cells; j++) {
          var colorArray = ctx.getImageData(cellWidth * j, cellHeight * i, cellWidth, cellHeight);
          var averageColor = averageColorFor(colorArray.data);
          averageColors.push(averageColor);
        }
      }
      
      averagePalette = buildColorPalette(averageColors);
      targetEl.appendChild(averagePalette.el);
      
      // Sort average colors
      // sortedColors = sortColors(averageColors);
      sortedColors = createArray(averageColors);
      
      var uniqueColors = [];
      
      // Iterate until array is empty
      while(sortedColors.length > 0) {
        // Select next color and search for similar in the same array
        var baseCol = sortedColors.shift(),
            avgColor = baseCol,
            k = 0;
            
        while(true) {
          if(sortedColors.length > k) {
            var secondCol = sortedColors[k];
            if(areSimilarColors(baseCol, secondCol)) {
              avgColor = getAverageColor(avgColor, sortedColors.splice(k,1)[0]);              
            } else {
              k++;
            }
          } else {
            break;
          }
        }
        uniqueColors.push(avgColor);
      }
      
      // Insert into DOM
      targetEl.appendChild(buildColorPalette(uniqueColors).el);
      targetEl.appendChild(canvas);
      
      // Some stats
      // if(typeof console.log != 'undefined'){console.log('Found %d visually unique colors from %d total colors.', sortPalette.unique, sortPalette.total)};
    };
    
    
    var reader = new FileReader();
    reader.onloadend = function(e) {
      image.src = e.target.result;
    };
    reader.readAsDataURL(file);
    
  });
  
  return false;
}, false);
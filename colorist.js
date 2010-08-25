// 
//  colorist.js
//  colorist
//  
//  Created by Andrew Okonetchnikov on 2010-08-09.
//  Copyright 2010 okonet.ru. All rights reserved.
// 

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

var dropEl = document.querySelector('#drop');
var targetEl = document.querySelector('#result');

// Tells the browser that we *can* drop on this target
dropEl.addEventListener('dragover', function(e){ e.preventDefault(); }, false);
dropEl.addEventListener('dragenter', function(e){ e.preventDefault(); }, false);
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
          uniqueColors = [],
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
      
      // Iterate until array is empty
      while(averageColors.length > 0) {
        var baseCol = averageColors.shift(),
            avgColor = baseCol,
            k = 0;
            
        while(true) {
          if(averageColors.length > k) {
            var secondCol = averageColors[k];
            if(areSimilarColors(baseCol, secondCol)) {
              avgColor = getAverageColor(avgColor, averageColors.splice(k,1)[0]);              
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
    };
    
    
    var reader = new FileReader();
    reader.onloadend = function(e) {
      image.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
  
  return false;
}, false);
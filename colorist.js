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

function isSimilarColors(col1, col2) {
  var delta = 30;
  if( 
      ((col2[0] - col1[0]) <= delta) && 
      ((col2[1] - col1[1]) <= delta) && 
      ((col2[2] - col1[2]) <= delta) 
    )
    return true;
  else
    return false;
}

function sortColors(colorsArray) {
  var res = createArray(colorsArray);
  function sortColor(col1,col2) {
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
    
    if(!isSimilarColors(prevCol, col)) {
      var paletteEl = document.createElement('div');
      paletteEl.className = 'b-palette';
      paletteEl.style.backgroundColor = 'rgb('+col[0]+','+col[1]+','+col[2]+')';
      container.appendChild(paletteEl);
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
  
  files = createArray(files);
  files.forEach(function(file){
    var image = new Image();
    image.onload = function(){
      
      targetEl.innerHTML = '';
      
      var canvas = document.createElement('canvas');
      ctx = canvas.getContext('2d');
      
      canvas.width = image.width / 2 >> 0;
      canvas.height = image.height / 2 >> 0;
      
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      var uniqueColors = 0,
          averageColors = [],
          sortedColors = [],
          rows = 10,
          cells = 10,
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
      
      // Sort average colors
      sortedColors = sortColors(averageColors);
      
      // Build a palette and search for unique colors
      var sortPalette = buildColorPalette(sortedColors);
      
      // Insert into DOM
      targetEl.appendChild(sortPalette.el);
      targetEl.appendChild(canvas);
      
      // Some stats
      if(typeof console.log != 'undefined'){console.log('Found %d visually unique colors from %d total colors.', sortPalette.unique, sortPalette.total)};
    };
    
    
    var reader = new FileReader();
    reader.onloadend = function(e) {
      image.src = e.target.result;
    };
    reader.readAsDataURL(file);
    
  });
  
  return false;
}, false);
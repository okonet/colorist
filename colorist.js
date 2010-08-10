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

function getMidColorFor(data) {
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

function cancel(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  return false;
}

var targetEl = document.querySelector('#drop');

// Tells the browser that we *can* drop on this target
targetEl.addEventListener('dragover', cancel, false);
targetEl.addEventListener('dragenter', cancel, false);
targetEl.addEventListener('drop', function (e) {
  e.preventDefault();
  var files = e.dataTransfer.files;
  
  files = createArray(files);
  files.forEach(function(file){
    var image = new Image();
    image.onload = function(){

      var canvas = document.createElement('canvas');
      ctx = canvas.getContext('2d');
      
      canvas.width = image.width;
      canvas.height = image.height;
      
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      var rows = 2;
      var cells = 2;
      var cellWidth = Math.ceil(canvas.width / cells);
      var cellHeight = Math.ceil(canvas.height / rows);
      
      // if(typeof console.log != 'undefined'){console.log(cellWidth, cellHeight)};
      
      for(var i = 0; i < rows; i++) {
        for(var j = 0; j < cells; j++) {
          var colorArray = ctx.getImageData(cellWidth * j, cellHeight * i, cellWidth, cellHeight);
          var midColor = getMidColorFor(colorArray.data);
          
          var paletteEl = document.createElement('div');
          paletteEl.className = 'b-palette';
          paletteEl.style.backgroundColor = 'rgb('+midColor[0]+','+midColor[1]+','+midColor[2]+')';
          targetEl.appendChild(paletteEl);
          
          // var slice = document.createElement('canvas');
          // slice.width = colorArray.width; 
          // slice.height = colorArray.height;
          // var context = slice.getContext('2d');
          // context.putImageData(colorArray, 0,0);
          // targetEl.appendChild(slice);
        }
      }
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
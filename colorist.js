// 
//  colorist.js
//  Colorist app
//  
//  Created by Andrew Okonetchnikov on 2010-08-09.
//  Copyright 2010 okonet.ru. All rights reserved.
// 

/* Creates array from native objects. Thanks @thomasfuchs for this suggestion. */
function createArray(nativeObject){ return [].slice.call(nativeObject); }

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
  
  for (var i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] / total_pixels) * 4;
    result[i] = (result[i] > 255) ? 255 : result[i];
  }

  return result;
}

function areSimilarColors(col1, col2) {
  var delta = 50;
  if( 
      (Math.abs(col2[0] - col1[0]) <= delta) && 
      (Math.abs(col2[1] - col1[1]) <= delta) && 
      (Math.abs(col2[2] - col1[2]) <= delta) 
    )
    return true;
  else
    return false;
}

function rgbToHex(array){
	var hex = [];
	for (var i = 0; i < 3; i++){
		var bit = (array[i] - 0).toString(16);
		hex.push((bit.length == 1) ? '0' + bit : bit);
	}
	return '#' + hex.join('');
}

function buildColorPalette(colorsArray) {
  var prevCol = [0,0,0],
      uniqueColors = 0,
      container = document.createElement('DIV');
      
  container.className = 'b-palette-wrap';
  
  for(var i = 0; i < colorsArray.length; i++) {
    var col = colorsArray[i];
    
    var el = document.createElement('input');
    el.type = 'text';
    el.className = 'b-palette';
    el.style.backgroundColor = 'rgb('+col[0]+','+col[1]+','+col[2]+')';
    el.style.width = Math.ceil(90 / colorsArray.length) + '%'; 
    el.value = rgbToHex(col);
    el.addEventListener('click', function(e){ e.target.select(); }, false);
    container.appendChild(el);
    
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

function handleDragDropEvent(e) {
  if (e.preventDefault) e.preventDefault();
  var targetEl = document.getElementById('drop');
    
  switch(e.type) {
    case 'dragenter':
      targetEl.innerHTML = '<h2>Drop you image here...</h2>'
      targetEl.className = 'drag-waiting drag-hover';
      break;
      
    case 'dragover':
      break;
      
    case 'dragleave':
      targetEl.className = targetEl.className.replace(' drag-hover','');
      break;
      
    case 'drop':
      targetEl.className = targetEl.className.replace(' drag-hover','drag-processing');
      targetEl.innerHTML = 'Processing...';
      var files = e.dataTransfer.files;

      // We've got some files, so let's loop throught each.
      file = files[0];
      // files.forEach(function(file){
        var image = new Image();
        image.onload = function(){
          // Image is loaded. Let's start working with data.
          // Prepare canvas and clear container element
          targetEl.innerHTML = '';
          targetEl.className = '';
          
          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext('2d');

          // Reduce image size to fit container. Right now it's just twice as small.
          canvas.width = image.width / 2 >> 0;
          canvas.height = image.height / 2 >> 0;
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

          var averageColors = [],
              uniqueColors = [],
              rows = 20,
              cells = 20,
              cellWidth = (canvas.width / cells) >> 0,
              cellHeight = (canvas.height / rows) >> 0;

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
                } else 
                  k++;
              } else break; 
            }
            uniqueColors.push(avgColor);
          }
          targetEl.appendChild(buildColorPalette(uniqueColors).el);
          targetEl.appendChild(canvas);
        };

        var reader = new FileReader();
        reader.onloadend = function(e) { image.src = e.target.result; };
        reader.readAsDataURL(file);
      // });
      break;
      
    default: return false;
  }
  
  return false;
}
document.addEventListener('dragover',   handleDragDropEvent, false);
document.addEventListener('dragenter',  handleDragDropEvent, false);
document.addEventListener('dragleave',  handleDragDropEvent, false);
document.addEventListener('drop',       handleDragDropEvent, false);
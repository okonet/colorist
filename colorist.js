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
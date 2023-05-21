const canvas = document.querySelector("canvas"),
toolBtns = document.querySelectorAll(".tool"),
fillColor = document.querySelector("#fill-color"),
sizeSlider = document.querySelector("#size-slider"),
colorBtns = document.querySelectorAll(".colors .option"),
colorPicker = document.querySelector("#color-picker"),
clearCanvas = document.querySelector(".clear-canvas"),
saveImg = document.querySelector(".save-img"),
ctx = canvas.getContext("2d");

// var myImage = new Image();
// myImage.src = imgData;
// ctx.drawImage(myImage, 0, 0);
// global variables with default value
let prevMouseX, prevMouseY, snapshot,
isDrawing = false,
selectedTool = "brush",
brushWidth = 5,
selectedColor = "#4A98F7";
const setCanvasBackground = () => {
    // setting whole canvas background to white, so the downloaded img background will be white
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor; // setting fillstyle back to the selectedColor, it'll be the brush color
}
window.addEventListener("load", () => {
    // setting canvas width/height.. offsetwidth/height returns viewable width/height of an element
    canvas.width = 1000;
    canvas.height = 5000;
    setCanvasBackground();
});

const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX; // passing current mouseX position as prevMouseX value
    prevMouseY = e.offsetY; // passing current mouseY position as prevMouseY value
    ctx.beginPath(); // creating new path to draw
    ctx.lineWidth = brushWidth; // passing brushSize as line width
    ctx.strokeStyle = selectedColor; // passing selectedColor as stroke style
    ctx.fillStyle = selectedColor; // passing selectedColor as fill style
    // copying canvas data & passing as snapshot value.. this avoids dragging the image
    let x = e.offsetX;
    let y = e.offsetY;
    ctx.moveTo(x, y);
    socket.emit("down", { x, y, brushWidth, selectedColor });

    //snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    //console.log(snapshot);
}
const drawing = (e) => {
    if(!isDrawing) return; // if isDrawing is false return from here
    //ctx.putImageData(snapshot, 0, 0); // adding copied canvas data on to this canvas
    let x, y, strokeStyle;
    if(selectedTool === "brush" || selectedTool === "eraser") {
        // if selected tool is eraser then set strokeStyle to white 
        // to paint white color on to the existing canvas content else set the stroke color to selected color
        x = e.offsetX;
        y = e.offsetY;
    
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(e.offsetX, e.offsetY); // creating line according to the mouse pointer
        ctx.stroke(); // drawing/filling line with color
        strokeStyle = ctx.strokeStyle;
        
    }
    socket.emit("draw", { x, y, strokeStyle });
}

const stopDraw = (e) => {
    isDrawing = false;
    // socket.emit("up");
    //let snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // let snapshot = canvas.toDataURL();
    // console.log(snapshot);
    // sendInstance(room, 'wbData', snapshot);
    //snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    //console.log(snapshot);
}


socket.on("ondraw", ({ x, y, strokeStyle }) => {
    // console.log("ondraw_called", { x, y, strokeStyle });
    ctx.strokeStyle = strokeStyle;
    ctx.lineTo(x, y);
    ctx.stroke();
  });
  
socket.on("ondown", ({ x, y, brushWidth, selectedColor }) => {
    // console.log("ondown_called", { x, y, brushWidth, selectedColor });
    ctx.beginPath();
    ctx.lineWidth = brushWidth; // passing brushSize as line width
    ctx.strokeStyle = selectedColor; // passing selectedColor as stroke style
    //ctx.fillStyle = selectedColor; // passing selectedColor as fill style
    ctx.moveTo(x, y);
  });

//   socket.on("onup", () => {
//     // console.log("onup_called");
//     isDrawing = false;
//   });

  socket.on("onclear", () => {
    // console.log("onclear_called");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clearing whole canvas
    setCanvasBackground();
  });

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => { // adding click event to all tool option
        // removing active class from the previous option and adding on current clicked option
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
    });
});
sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value); // passing slider value as brushSize
colorBtns.forEach(btn => {
    btn.addEventListener("click", () => { // adding click event to all color button
        // removing selected class from the previous option and adding on current clicked option
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        // passing selected btn background color as selectedColor value
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});
colorPicker.addEventListener("change", () => {
    // passing picked color value from color picker to last color btn background
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

const clearDraw = (e) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clearing whole canvas
    setCanvasBackground();
    socket.emit("clear");
}

clearCanvas.addEventListener("click", clearDraw);

saveImg.addEventListener("click", () => {
    const link = document.createElement("a"); // creating <a> element
    link.download = `${room}.jpg`; // passing current date as link download value
    link.href = canvas.toDataURL(); // passing canvasData as link href value
    link.click(); // clicking link to download image
});
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", stopDraw);
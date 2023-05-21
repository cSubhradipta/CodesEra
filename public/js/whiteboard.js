const canvas = document.querySelector("canvas"),
toolBtns = document.querySelectorAll(".tool"),
fillColor = document.querySelector("#fill-color"),
sizeSlider = document.querySelector("#size-slider"),
colorBtns = document.querySelectorAll(".colors .option"),
colorPicker = document.querySelector("#color-picker"),
clearCanvas = document.querySelector(".clear-canvas"),
saveImg = document.querySelector(".save-img"),
ctx = canvas.getContext("2d");

let prevMouseX, prevMouseY, snapshot,
isDrawing = false,
selectedTool = "brush",
brushWidth = 5,
selectedColor = "#4A98F7";
const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
}
window.addEventListener("load", () => {
    canvas.width = 1000;
    canvas.height = 5000;
    setCanvasBackground();
});

const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY; 
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    let x = e.offsetX;
    let y = e.offsetY;
    ctx.moveTo(x, y);
    socket.emit("down", { x, y, brushWidth, selectedColor });

    //snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    //console.log(snapshot);
}
const drawing = (e) => {
    if(!isDrawing) return;
    let x, y, strokeStyle;
    if(selectedTool === "brush" || selectedTool === "eraser") {
        x = e.offsetX;
        y = e.offsetY;
    
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
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
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    //ctx.fillStyle = selectedColor;
    ctx.moveTo(x, y);
  });

//   socket.on("onup", () => {
//     // console.log("onup_called");
//     isDrawing = false;
//   });

  socket.on("onclear", () => {
    // console.log("onclear_called");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
  });

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
    });
});
sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);
colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});
colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

const clearDraw = (e) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
    socket.emit("clear");
}

clearCanvas.addEventListener("click", clearDraw);

saveImg.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${room}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
});
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", stopDraw);
// 儲存 cookie(cookie的名字、cookie的值、儲存的天數)
function setCookie(cname, cvalue, exdays) {
  let d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000));   // 因為是毫秒, 所以要乘以1000
  let expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
}

// 取得 cookie
function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }
  return "";
}

// 取得個別元素
const video1 = document.getElementById('inputVideo')
const idn = document.getElementById('identify')
const board_url = document.referrer;

// 讓輸入框圓角一點  需要 jquery-ui.min.js 和 jquery-ui.min.css
$('input:text').addClass("ui-widget ui-widget-content ui-corner-all ui-textfield");

Promise.all([
  // 顯示模型載入中的 gif 動畫
  mask.style.display = "block",
  loadImg.style.display = "block",
  // 載入模型
  faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
  // faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  // faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.loadFaceExpressionModel('./models'),
  console.log("模型載入成功"),
]).then(startVideo)

async function startVideo() {
  // await navigator.mediaDevices.getUserMedia({ video: {} },) // 前鏡頭
  await navigator.mediaDevices.getUserMedia({ 
    video: { facingMode: { exact: "environment" } } },  // 後鏡頭
    )
    .then(function (stream) {
      video1.srcObject = stream;
    })
  await video1.play();
  // 讀取照片
  initRecognizeFaces()
}

// let labeledDescriptors;
let faceMatcher;
let canvas;
let detections;
let resizedDetections;
let results;
let init = false;

function changeCanvasSize() {
  canvas.style.width = video1.offsetWidth.toString() + "px"
  canvas.style.height = video1.offsetHeight.toString() + "px"
  canvas.style.left = getPosition(video1)["x"] + "px";
  canvas.style.top = getPosition(video1)["y"] + "px";
  displaySize = { width: video1.offsetWidth, height: video1.offsetHeight }
  faceapi.matchDimensions(canvas, displaySize)
}

async function initRecognizeFaces() {
  // console.log(init)
  // labeledDescriptors = await loadLabel()
  // 描述標籤
  // console.log(labeledDescriptors)
  // faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7)
  canvas = faceapi.createCanvasFromMedia(video1)
  document.body.append(canvas)
  mask.style.display = "none"
  loadImg.style.display = "none"
  changeCanvasSize()
  window.addEventListener("resize", changeCanvasSize);
  await faceapi.detectAllFaces(video1).withFaceExpressions()
  console.log("初始化成功")
}

const exprIdx = {
  neutral: 'normal',
  happy: 'good', 
  angry: 'bad',
  disgusted: 'bad', 
  fearful: 'bad',
  sad: 'bad',
  surprised: 'bad' 
};

async function recognizeFaces() {
  detections = await faceapi.detectAllFaces(video1).withFaceExpressions()
  resizedDetections = faceapi.resizeResults(detections, displaySize)
  faceapi.draw.drawDetections(canvas, resizedDetections)
  // faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  // console.log(faceapi);
  if (resizedDetections.length > 0) {
    let exprMax = "";
    let pos = 0;
    for (let expr in resizedDetections[0].expressions) {
      if (resizedDetections[0].expressions[expr] > pos) {
        pos = resizedDetections[0].expressions[expr];
        exprMax = expr;
      }
    }
    // console.log(exprMax, pos);
    new faceapi.draw.DrawTextField(
      [
      `${exprMax} (${parseInt(pos * 100, 10)})`
      ], 
      resizedDetections[0].detection.box.topLeft
    )
    .draw(canvas)
    setTimeout(async () => {
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    }, 1000)
    $.get(board_url + "playmusic?mood=" + exprIdx[exprMax]);
  }
}

$('#identify').click((e) => {
  console.log("辨識")
  recognizeFaces();
});

// 取得元素位置
function getPosition(element) {
  let x = 0;
  let y = 0;
  while (element) {
    x += element.offsetLeft - element.scrollLeft + element.clientLeft;
    y += element.offsetTop - element.scrollLeft + element.clientTop;
    element = element.offsetParent;
  }
  return { x: x, y: y };
}
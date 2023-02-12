/**
 * 显示本地摄像头的视频
 */

'use strict';

const constraints = window.constraints = {
  audio: false,
  video: true
};

function gotStream(stream) {
  const videoEle = document.querySelector('video');
  const videoTracks = stream.getVideoTracks();
  showMsg(`正在使用的设备: ${videoTracks[0].label}`);
  window.stream = stream;
  videoEle.srcObject = stream;
}

function onErr(error) {
  if (error.name === 'OverconstrainedError') {
    const v = constraints.video;
    showErrMsg(`设备不支持分辨率 ${v.width.exact}x${v.height.exact} px `);
  } else if (error.name === 'NotAllowedError') {
    showErrMsg('请允许浏览器打开摄像头');
  }
  showErrMsg(`getUserMedia error: ${error.name}`, error);
}

function showErrMsg(msg, error) {
  const errorElement = document.querySelector('#errorMsg');
  errorElement.innerHTML += `<p>${msg}</p>`;
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}

function showMsg(msg) {
  const msgEle = document.querySelector('#tipMsg');
  msgEle.innerHTML += `<p>-> ${msg}</p>`;
  console.log(msg);
}

async function openCamera(e) {
  try {
    showMsg('正在打开摄像头');
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    showMsg('获取到了stream');
    gotStream(stream);
    e.target.disabled = true;
  } catch (err) {
    onErr(err);
  }
}

function stopVideo(e) {
  showMsg("停止视频");
  const videoElem = document.querySelector('video');
  const stream = videoElem.srcObject;

  document.querySelector('#showVideo').disabled = false; // 允许开启

  if (stream == null) {
    return;
  }
  const tracks = stream.getTracks();

  tracks.forEach(function (track) {
    track.stop();
  });
  videoElem.srcObject = null;
}

const mCanvas = window.canvas = document.querySelector('#mainCanvas');
mCanvas.width = 480;
mCanvas.height = 360;
const list = document.querySelector('#list'); // 拿来存放多个元素

function takeSnapshot(e) {
  const videoElem = document.querySelector('video');
  mCanvas.width = videoElem.videoWidth;
  mCanvas.height = videoElem.videoHeight;
  mCanvas.getContext('2d').drawImage(videoElem, 0, 0, mCanvas.width, mCanvas.height);

  // 新增1张
  var divItem = document.createElement("div");
  divItem.style.display = "block";
  divItem.width = 100;
  divItem.height = divItem.width * videoElem.videoHeight / videoElem.videoWidth; // 计算一下比例
  divItem.style.width = divItem.width + "px";
  divItem.style.height = divItem.height + "px";
  console.log("div item size: ", divItem.width, divItem.height);

  var c1 = document.createElement("canvas");
  c1.width = divItem.width;
  c1.height = divItem.height;
  c1.getContext('2d').drawImage(videoElem, 0, 0, mCanvas.width, mCanvas.height, 0, 0, c1.width, c1.height);

  divItem.appendChild(c1);
  list.appendChild(divItem);
}

function clearList(e) {
  var child = list.lastElementChild;
  while (child) {
    list.removeChild(child);
    child = list.lastElementChild;
  }
}

document.querySelector('#showVideo').addEventListener('click', e => openCamera(e));
document.querySelector('#stopVideo').addEventListener('click', e => stopVideo(e));
document.querySelector('#takeSnapshot').addEventListener('click', e => takeSnapshot(e));
document.querySelector('#clearList').addEventListener('click', e => clearList(e));

showMsg("准备完毕")
'use strict';

var naiveSessionID = Math.round(Number.MAX_SAFE_INTEGER * Math.random());
console.log('id = ' + naiveSessionID);

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
  console.log(`getUserMedia error: ${error.name}`, error);
}

function showErrMsg(msg, error) {
  alert(msg);
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
    showMsg('正在打开摄像头...');
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

function sendPhoto(photoData, isReserve, tagElem) {
  var XHR = new XMLHttpRequest();
  var data = { photo: photoData, reserve: isReserve };
  showMsg('上传照片并等待服务器处理...');
  XHR.addEventListener('error', function (event) {
    showErrMsg('处理失败');
  });
  XHR.open('POST', '/api', true);
  XHR.setRequestHeader("Content-type", "application/json");
  XHR.setRequestHeader("App-SessionID", naiveSessionID);
  XHR.send(JSON.stringify(data));
  XHR.onreadystatechange = function () {
    if (XHR.readyState == 4 && XHR.status == 200) {
      showMsg('处理完成');
      var json = XHR.responseText;
      console.log(json);
      json = JSON.parse(json);
      if (isReserve === false) {
        if (json.result === undefined) {
          const verdictStr = "尚未预留照片";
          showErrMsg('无法比对，请先预留照片');
          tagElem.innerHTML = verdictStr;
          tagElem.style.color = 'red';
        }
        else {
          const verdict = (json.result > 0.5);
          const verdictStr = (verdict ? "一致" : "不一致");
          showMsg('比对结果：' + verdictStr + ' (' + json.result + ')');
          tagElem.innerHTML = verdictStr;
          tagElem.style.color = (verdict ? 'green' : 'red');
        }
      }
    }
  };
}

const mCanvas = window.canvas = document.querySelector('#mainCanvas');
mCanvas.width = 480;
mCanvas.height = 360;
const list = document.querySelector('#list'); // 拿来存放多个元素

var hasActivePic = false;

function takeSnapshot(e) {
  const videoElem = document.querySelector('video');
  mCanvas.width = videoElem.videoWidth;
  mCanvas.height = videoElem.videoHeight;
  mCanvas.getContext('2d').drawImage(videoElem, 0, 0, mCanvas.width, mCanvas.height);
  hasActivePic = true;
}

function useLocal(e) {
  var file = document.getElementById('file').files[0];
  const pattern = /^image/;
  if (!pattern.test(file.type)) {
    showErrMsg('无效的图片文件');
    return;
  }
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function (e) {
    var img = new Image();
    img.src = e.target.result;
    img.onload = function () {
      console.log(img.width, img.height);
      mCanvas.width = img.width;
      mCanvas.height = img.height;
      mCanvas.getContext('2d').drawImage(img, 0, 0, mCanvas.width, mCanvas.height);
      hasActivePic = true;
    };
  };
}

function uploadSnapshot(e, isReserve) {
  if (hasActivePic === false) {
    showErrMsg('照片为空，请先截取画面或使用本地图片');
    return;
  }

  const videoElem = document.querySelector('video');
  // 上传照片
  var c2 = document.createElement("p");
  sendPhoto(mCanvas.toDataURL(), isReserve, c2);

  // 新增1张
  var divItem = document.createElement("div");
  var c1 = document.createElement("canvas");
  divItem.style.display = "block";

  divItem.width = 100;
  divItem.height = divItem.width * mCanvas.height / mCanvas.width; // 计算一下比例
  c1.width = divItem.width;
  c1.height = divItem.height;

  divItem.height = divItem.height + 20;

  divItem.style.width = divItem.width + "px";
  divItem.style.height = divItem.height + "px";
  console.log("div item size: ", divItem.width, divItem.height);

  c1.getContext('2d').drawImage(mCanvas, 0, 0, mCanvas.width, mCanvas.height, 0, 0, c1.width, c1.height);

  if (isReserve) {
    c2.innerHTML = "预留照片";
  }
  else {
    c2.innerHTML = "等待服务器";
  }
  c2.className = "caption";

  divItem.appendChild(c1);
  divItem.appendChild(c2);
  list.appendChild(divItem);
}

function clearList(e) {
  var child = list.lastElementChild;
  while (child) {
    list.removeChild(child);
    child = list.lastElementChild;
  }
  child = document.querySelector('#tipMsg').lastElementChild;
  while (child) {
    list.removeChild(child);
    child = list.lastElementChild;
  }
  naiveSessionID = Math.round(Number.MAX_SAFE_INTEGER * Math.random());
}

document.querySelector('#showVideo').addEventListener('click', e => openCamera(e));
document.querySelector('#stopVideo').addEventListener('click', e => stopVideo(e));
document.querySelector('#takeSnapshot').addEventListener('click', e => takeSnapshot(e));
document.querySelector('#uploadPic').addEventListener('click', e => useLocal(e));
document.querySelector('#reservePhoto').addEventListener('click', e => uploadSnapshot(e, true));
document.querySelector('#comparePhoto').addEventListener('click', e => uploadSnapshot(e, false));
document.querySelector('#clearList').addEventListener('click', e => clearList(e));

showMsg("准备完毕");

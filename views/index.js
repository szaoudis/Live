let start = document.getElementById('start');
let stop  = document.getElementById('stop');
let mediaRecorder;

start.addEventListener('click', async function(){
    let stream = await recordScreen();
    let mimeType = 'video/webm';
    mediaRecorder = createRecorder(stream, mimeType);
  let node = document.createElement("p");
    node.textContent = "Started recording";
    document.body.appendChild(node);
})

stop.addEventListener('click', function(){
    mediaRecorder.stop();
    let node = document.createElement("p");
    node.textContent = "Stopped recording";
    document.body.appendChild(node);
})

async function recordScreen() {
    return await navigator.mediaDevices.getDisplayMedia({
        audio: true, 
        video: { mediaSource: "screen"}
    });
}

function createRecorder (stream, mimeType) {
  const xhttp = new XMLHttpRequest();
  // the stream data is stored in this array
  let recordedChunks = []; 

  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = function (e) {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
      const blob = new Blob([e.data], {
        type: 'video/webm'
      });
      console.log(blob);
      let batch = URL.createObjectURL(blob);
      xhttp.open("POST", "/room");
      xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhttp.send("BlobUrl=" + batch);
      URL.revokeObjectURL(blob); // remove from memory
    }  
  };
  mediaRecorder.onstop = function () {
     saveFile(recordedChunks);
     recordedChunks = [];
  };
  mediaRecorder.start(200); // For every 200ms the stream data will be stored in a separate chunk.
  return mediaRecorder;
}

function saveFile(recordedChunks){
  let video = document.getElementById("video");
  const blob = new Blob(recordedChunks, {
    type: 'video/webm'
  });
  let filename = window.prompt('Enter file name'),
      downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `${filename}.webm`;

  document.body.appendChild(downloadLink);
  downloadLink.click();
  URL.revokeObjectURL(blob); // clear from memory
  document.body.removeChild(downloadLink);
  video.setAttribute("src", downloadLink.href);
}
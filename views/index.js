let start = document.getElementById('start');
let stop  = document.getElementById('stop');
let mediaRecorder;
let count = 0;
let source = document.getElementById("video");

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
      console.log(e);
      recordedChunks.push(e.data);
      
      const blob = new Blob(recordedChunks, {
        type: 'video/mp4'
      });

      let batch = URL.createObjectURL(blob);
      console.log(blob);
      console.log(batch);

      let downloadLink = document.createElement('a');
      downloadLink.href = batch;
      let filename = uuidv4();
      downloadLink.download = `${filename}.mp4`;
      downloadLink.click();

      xhttp.open("POST", "/room");
      xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhttp.send("filename=" + filename);

      URL.revokeObjectURL(blob); // remove from memory
      setTimeout(function () {
        if(count == 0) {
          console.log(source);
          count++;
          source.src = "/videoPlay";
        }
      }, 1000);
    }  
  };
  mediaRecorder.onstop = function () {
     saveFile(recordedChunks);
     recordedChunks = [];
  };
  mediaRecorder.start(2000); // For every 200ms the stream data will be stored in a separate chunk.
  return mediaRecorder;
}

function saveFile(recordedChunks){
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
}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
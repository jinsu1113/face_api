// 이미지 로드 및 표시
function load_img() {
  const file = document.getElementById("load_bt").files[0];
  const url = URL.createObjectURL(file);
  const imgBox = document.getElementById('img_box');
  imgBox.src = url;
}

const imageUpload = document.getElementById('load_bt');

// face-api 모델 로드 및 시작
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(start);

// 얼굴 추출 시작
function start() {
  imageUpload.addEventListener('change', async () => {
    const img = document.getElementById('img_box');
    await img.decode();
    const canvas = faceapi.createCanvasFromMedia(img);
    document.body.append(canvas);
    const displaySize = { width: img.width, height: img.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions());
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

      const extractImg = document.getElementById('face_extraction');
      extractImg.innerHTML = ''; // 기존 이미지 초기화

      detections.forEach((detection, index) => {
        const { x, y, width, height } = detection.box;
        const faceCanvas = document.createElement('canvas');
        faceCanvas.width = width;
        faceCanvas.height = height;
        const faceCanvasCtx = faceCanvas.getContext('2d');
        faceCanvasCtx.drawImage(img, x, y, width, height, 0, 0, width, height);

        // 추출된 이미지를 표시
        const extractedImageDataURL = faceCanvas.toDataURL();
        const imgElement = document.createElement('img');
        imgElement.src = extractedImageDataURL;
        imgElement.alt = `Face ${index + 1}`;
        extractImg.append(imgElement);
      });

    }, 100);
  });
}

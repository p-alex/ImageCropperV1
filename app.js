const cropper = document.getElementById('cropper');
const image = document.getElementById('image');
const cropArea = document.getElementById('cropArea');
const cropBtn = document.getElementById('cropBtn');
const aspectRatioBtns = document.querySelectorAll('#aspectRatioBtn');

const canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');

let cropAreaWidth;
let cropAreaHeight;

let maxResultImageWidth;
let maxResultImageHeight;

const calculateCropArea = (aspectRatio = 4 / 5) => {
  const imageWidth = image.offsetWidth;
  const imageHeight = image.offsetHeight;
  let areaWidth;
  let areaHeight;
  if (imageWidth > imageHeight) {
    areaWidth = imageHeight * aspectRatio;
    areaHeight = imageHeight;
  } else {
    areaWidth = imageWidth;
    areaHeight = imageWidth / aspectRatio;
  }
  cropAreaWidth = areaWidth;
  cropAreaHeight = areaHeight;
};

const setCropAreaDimensions = () => {
  cropArea.style.width = `${cropAreaWidth}px`;
  cropArea.style.height = `${cropAreaHeight}px`;
  cropArea.style.left = `0px`;
  cropArea.style.top = `0px`;
};

let canMove = false;
let maxMove = { x: 0, y: 0 };
let initialTouchX;
let initialTouchY;
let cropAreaMoveX = 0;
let cropAreaMoveY = 0;

const calculateMaxMove = () => {
  const imageWidth = image.offsetWidth;
  const imageHeight = image.offsetHeight;
  const cropAreaWidth = cropArea.offsetWidth;
  const cropAreaHeight = cropArea.offsetHeight;
  maxMove = { x: imageWidth - cropAreaWidth, y: imageHeight - cropAreaHeight };
  console.log('maxMove: ', maxMove);
};

aspectRatioBtns.forEach((btn) => {
  btn.addEventListener('click', () => handleChangeAspectRatio(eval(btn.innerText)));
});

const handleChangeAspectRatio = (aspectRatio) => {
  calculateCropArea(aspectRatio);
  setCropAreaDimensions();
  calculateMaxMove();
  drawImage();
};

const touchStart = (event) => {
  canMove = true;
  if (!initialTouchX) initialTouchX = event.changedTouches[0].pageX;
  if (!initialTouchY) initialTouchY = event.changedTouches[0].pageY;
};

const touchMove = (event) => {
  event.preventDefault();
  if (canMove) {
    cropAreaMoveX = initialTouchX - event.changedTouches[0].pageX;
    if (cropAreaMoveX < -maxMove.x) cropAreaMoveX = -maxMove.x;
    if (cropAreaMoveX > 0) cropAreaMoveX = 0;
    cropArea.style.left = `${-cropAreaMoveX}px`;
    cropAreaMoveY = initialTouchY - event.changedTouches[0].pageY;
    if (cropAreaMoveY < -maxMove.y) cropAreaMoveY = -maxMove.y;
    if (cropAreaMoveY > 0) cropAreaMoveY = 0;
    console.log('cropAreaMoveX: ' + cropAreaMoveX);
    console.log('cropAreaMoveY:' + cropAreaMoveY);
    cropArea.style.top = `${-cropAreaMoveY}px`;
  }
};

const touchEnd = () => {
  canMove = false;
  drawImage();
};

const mouseDown = (event) => {
  canMove = true;
  initialTouchX = event.x;
  initialTouchY = event.y;
};

const mouseMove = (event) => {
  if (canMove) {
    cropAreaMoveX = initialTouchX - event.x;
    if (cropAreaMoveX < -maxMove.x) cropAreaMoveX = -maxMove.x;
    if (cropAreaMoveX > 0) cropAreaMoveX = 0;
    cropArea.style.left = `${-cropAreaMoveX}px`;
    cropAreaMoveY = initialTouchY - event.y;
    if (cropAreaMoveY < -maxMove.y) cropAreaMoveY = -maxMove.y;
    if (cropAreaMoveY > 0) cropAreaMoveY = 0;
    console.log('cropAreaMoveX: ' + cropAreaMoveX);
    console.log('cropAreaMoveY:' + cropAreaMoveY);
    cropArea.style.top = `${-cropAreaMoveY}px`;
  }
};

const mouseUp = () => {
  canMove = false;
  drawImage();
};

const mouseLeave = () => {
  canMove = false;
};

cropArea.addEventListener('touchstart', touchStart);
cropArea.addEventListener('touchmove', touchMove);
cropArea.addEventListener('touchend', touchEnd);

cropArea.addEventListener('mousedown', mouseDown);
cropArea.addEventListener('mousemove', mouseMove);
cropArea.addEventListener('mouseup', mouseUp);
cropArea.addEventListener('mouseleave', mouseLeave);

window.addEventListener('resize', () => {
  calculateCropArea();
  setCropAreaDimensions();
  calculateMaxMove();
});

let croppedBase64;

const drawImage = (aspectRatio = 4 / 5) => {
  maxResultImageWidth = 1500;
  maxResultImageHeight = 1500;
  let imageWidth = image.naturalWidth;
  let imageHeight = image.naturalHeight;
  if (imageWidth > imageHeight) {
    if (imageWidth > maxResultImageWidth) {
      imageHeight *= maxResultImageWidth / imageWidth;
      imageWidth = maxResultImageWidth;
    }
  } else {
    if (imageHeight > maxResultImageHeight) {
      imageWidth *= maxResultImageHeight / imageHeight;
      imageHeight = maxResultImageHeight;
    }
  }
  const displayedImageWidth = image.offsetWidth;
  const displayedImageHeight = image.offsetHeight;

  const displayedCropAreaWidth = cropArea.offsetWidth;
  const displayedCropAreaHeight = cropArea.offsetHeight;

  const cropAreaPercentageWidth =
    displayedCropAreaWidth / displayedImageWidth > 1
      ? 1
      : displayedCropAreaWidth / displayedImageWidth;

  const cropAreaPercentageHeight =
    displayedCropAreaHeight / displayedImageHeight > 1
      ? 1
      : displayedCropAreaHeight / displayedImageHeight;

  console.log('cropAreaPercentageWidth: ' + cropAreaPercentageWidth * 100 + '%');
  console.log('cropAreaPercentageHeight: ' + cropAreaPercentageHeight * 100 + '%');

  const canvasWidth = imageWidth * cropAreaPercentageWidth;
  const canvasHeight = imageHeight * cropAreaPercentageHeight;

  console.log('ImageWidth: ', imageWidth);
  console.log('Image Height: ', imageHeight);
  console.log('CanvasWidth: ', canvasWidth);
  console.log('CanvasHeight: ', canvasHeight);

  if (imageWidth > imageHeight) {
    if (aspectRatio === 1) {
      canvas.width = canvasHeight;
      canvas.height = canvasHeight;
    }
  } else {
    if (aspectRatio === 1) {
      canvas.width = canvasWidth;
      canvas.height = canvasWidth;
    }
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const isCropAreaCoveringAllImage = cropAreaPercentageWidth === cropAreaPercentageHeight;

  console.log('isCropAreaCoveringAllImage: ' + isCropAreaCoveringAllImage);

  const movedX = (cropAreaMoveX / displayedImageWidth) * imageWidth;
  const movedY = (cropAreaMoveY / displayedImageHeight) * imageHeight;

  ctx.drawImage(
    image,
    isCropAreaCoveringAllImage ? 0 : movedX,
    isCropAreaCoveringAllImage ? 0 : movedY,
    imageWidth,
    imageHeight
  );

  croppedBase64 = canvas.toDataURL('image/jpeg', 0.75);
};

const handleCropImage = () => {
  const resultImg = document.querySelector('#resultImg');
  if (!resultImg) {
    const img = document.createElement('img');
    img.src = croppedBase64;
    img.id = 'resultImg';
    document.body.appendChild(img);
    return;
  }
  resultImg.src = croppedBase64;
};

cropBtn.addEventListener('click', handleCropImage);

calculateCropArea();
setCropAreaDimensions();
calculateMaxMove();
drawImage();

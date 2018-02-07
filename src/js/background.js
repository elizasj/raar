function getURL() {
  const min = 1;
  const max = 7;
  const imgNum = Math.floor(Math.random() * (max - min + 1)) + min;
  const url = `url(images/gifs/${imgNum}.gif)`;

  return url;
}

function setBackground() {
  const img = getURL();

  let classname = document.querySelector('.background');
  classname.style.backgroundImage = img;

  return classname;
}

export default setBackground();

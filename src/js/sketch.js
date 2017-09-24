export default function sketch(s) {
  console.log('inside module');

  s.setup = () => {
    console.log('working');
    cnv = s.createCanvas(s.windowWidth, s.windowHeight);
    cnv.parent('p5');
  };

  s.draw = () => {};

  function windowResized() {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
  }
}

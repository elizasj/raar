export default function sketch(s) {
    console.log("inside module")
    let backgroundImg, cnv, img

    s.preload = () => {
        const imgNum = s.floor(s.random(1, 7))
        img = s.createImg( "images/gifs/" + imgNum + ".gif") 
    }

    s.setup = () => {
        cnv = s.createCanvas(s.windowWidth, s.windowHeight)
        cnv.parent("p5")
        img.class("resizeImg")
    }

    s.draw = () => {
        s.background(img)
    }
 }
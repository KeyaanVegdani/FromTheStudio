var a = document.getElementById("audio");
var interval = 200; // 200ms interval
var fadeIn = false;

window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;

    if (scrollY > 1300) {
        a.volume -= 0.05;
        if (a.currentTime <= 1 || a.volume < 0) {
            a.volume = 0;
        }
        console.log(window.scrollY);
        fadeIn = false;
    }

    else if (scrollY <= 1200 && a.volume < 1) {
        fadeIn = true;
    }

    // console.log(a.volume);
    // console.log(fadeIn);
    if (a.volume < 1 && fadeIn == true) {
        a.volume += 0.05;
    }

    else {
        fadeIn == false;
    }


});


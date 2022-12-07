const container = document.querySelector(".container");
const yoursky = document.querySelector(".yoursky");
const darksky = document.querySelector(".darksky");
const overlay = document.querySelector(".overlay");
const searchbtn = document.querySelector(".searchbtn");
const words = ["DARK SKY", "YOUR SKY"];
/*let rawsqm = 20;*/
let sqm = 20;

// Map JS

let coordinates = "";

function loadMapScenario() {
  var map = new Microsoft.Maps.Map(document.getElementById("myMap"), {
    /* No need to set credentials if already passed in URL */
  });
  Microsoft.Maps.loadModule("Microsoft.Maps.AutoSuggest", function () {
    var options = {
      maxResults: 4,
      map: map,
    };
    var manager = new Microsoft.Maps.AutosuggestManager(options);
    manager.attachAutosuggest(
      "#searchBox",
      "#searchBoxContainer",
      selectedSuggestion
    );
  });
  function selectedSuggestion(suggestionResult) {
    let coordinates = `${suggestionResult.location.longitude},${suggestionResult.location.latitude}`;
    console.log(coordinates);

    const getData = async () => {
      const response = await fetch(
        `https://www.lightpollutionmap.info/QueryRaster/?ql=wa_2015&qt=point&qd=${coordinates}&key=1h63lhCCnIMpLD2k`
      );
      const data = await response.json();
      const rawsqm = Math.log10((data + 0.171168465) / 108000000) / -0.4;
      const SQM = rawsqm.toFixed(2);
      return SQM;
    };

    // Making sure SQM mesurement doesn't go out of bounds in rare circumstances
    getData().then((SQM) => {
      if (SQM < 18) {
        sqm = 18;
      } else if (SQM > 22) {
        sqm = 22;
      } else {
        sqm = SQM;
      }

      return sqm;
    });
  }
}



// Set defult light pollution level
overlay.style.setProperty(
  "background-color",
  "rgba(100, 100, 100, " + `${((sqm - 22) / 4) * -0.8}` + ")"
);
overlay.style.setProperty(
  "backdrop-filter",
  "contrast(" +
    `${((sqm - 22) * -1) / 4 + 1}` +
    ") brightness(" +
    `${((sqm - 18) * 0.8) / 4 + 0.2}` +
    ") saturate(" +
    `${(sqm - 18) / 4}` +
    ")"
);
overlay.style.setProperty(
  "box-shadow",
  "inset 0px -330px 100px -150px rgba(255, 255, 255, " +
    `${((sqm - 22) / 4) * -0.1}` +
    ")"
);

// Slider
document.querySelector(".slider").addEventListener("input", (e) => {
  container.style.setProperty("--position", `${e.target.value}%`);
  yoursky.style.setProperty("left", `calc(${e.target.value}% / 2)`);
  darksky.style.setProperty(
    "left",
    `calc((100% - ${e.target.value}%) / 2 + ${e.target.value}%)`
  );

  if (e.target.value < 10) {
    $(".yoursky").hide();
  } else {
    $(".yoursky").show();
  }

  if (e.target.value > 90) {
    $(".darksky").hide();
  } else {
    $(".darksky").show();
  }
});

// Search animation

function addInfo() {
  let SQM = sqm;

  if (SQM <= 22 && SQM > 21.99) {
    document.getElementById("bortleValue").innerHTML =
      "Bortle Class: 1 <hr> Excellent Dark Sky";
  } else if (SQM <= 21.99 && SQM > 21.89) {
    document.getElementById("bortleValue").innerHTML =
      "Bortle Class: 2 <hr> Average Dark Sky";
  } else if (SQM <= 21.89 && SQM > 21.69) {
    document.getElementById("bortleValue").innerHTML =
      "Bortle Class: 3 <hr> Rural Sky";
  } else if (SQM <= 21.69 && SQM > 20.49) {
    document.getElementById("bortleValue").innerHTML =
      "Bortle Class: 4 <hr> Rural/Suburban Transition";
  } else if (SQM <= 20.49 && SQM > 19.5) {
    document.getElementById("bortleValue").innerHTML =
      "Bortle Class: 5 <hr> Suburban";
  } else if (SQM <= 19.5 && SQM > 18.94) {
    document.getElementById("bortleValue").innerHTML =
      "Bortle Class: 6 <hr> Bright Suburban";
  } else if (SQM <= 18.94 && SQM > 18.38) {
    document.getElementById("bortleValue").innerHTML =
      "Bortle Class: 7 <hr> Suburban/Urban Transition";
  } else {
    document.getElementById("bortleValue").innerHTML =
      "Bortle Class: 8 <hr> City Sky";
  }

  document.getElementById("sqmValue").innerHTML = `SQM: ${SQM}`;
  document.getElementById('SQMinfo').style.display = "block";
}

function search() {
  console.log(sqm);

  // create reverse animation for text change
  const reverseTween = gsap
    .from(".darksky", { text: "", duration: 1 })
    .reverse(0);
  const tl = gsap.timeline({});
  tl.add(reverseTween, 1);

  // slide to the left
  tl.to(
    ".searchbtn",
    {
      filter: "grayscale(1)",
      cursor: "default",
      duration: 0.2,
      onStart: function disablebtn() {
        searchbtn.setAttribute("disabled", "true");
      },
    },
    0
  )
    .to('.container', {'cursor': 'default', duration: 0.2, onStart: function disableslider(){container.style.pointerEvents = "none"}}, 0)

    .to(
      ".container",
      { "--position": "0%", ease: Power3.easeInOut, duration: 1 },
      0
    )
    .to(
      ".darksky",
      {
        onComplete: function shower() {
          $(".darksky").show();
        },
        duration: 0.5,
      },
      0
    )
    .to(".yoursky", { left: "0%", ease: Power3.easeInOut, duration: 1 }, 0)
    .to(".darksky", { left: "50%", ease: Power3.easeInOut, duration: 1 }, 0)
    .to(".yoursky", { opacity: 0, ease: Power3.easeInOut, duration: 0.5 }, 0.3)
    .to(
      ".overlay, .slider-line, .slider-button",
      { opacity: 0, ease: Power3.easeInOut, duration: 0.2 },
      0.8
    )

    // ready position and new polution level
    .to(
      ".container",
      {
        "--position": "100%",
        onComplete: function pollute() {
          overlay.style.setProperty(
            "background-color",
            "rgba(100, 100, 100, " + `${((sqm - 22) / 4) * -0.8}` + ")"
          );
          overlay.style.setProperty(
            "backdrop-filter",
            "contrast(" +
              `${((sqm - 22) * -1) / 4 + 1}` +
              ") brightness(" +
              `${((sqm - 18) * 0.8) / 4 + 0.2}` +
              ") saturate(" +
              `${(sqm - 18) / 4}` +
              ")"
          );
          overlay.style.setProperty(
            "box-shadow",
            "inset 0px -330px 100px -150px rgba(255, 255, 255, " +
              `${((sqm - 22) / 4) * -0.1}` +
              ")"
          );
        },
      },
      1
    )

    // show light pollution
    .to(".overlay", { opacity: 1, ease: Power2.easeInOut, duration: 3 }, 2.5)
    .to(
      ".darksky",
      {
        innerText: `${100 - ((sqm - 18) / 4) * 100}` + "%",
        snap: "innerText",
        duration: 3,
      },
      2.5
    )
    .to(".darksky", { opacity: 0, duration: 0.5 }, 7)
    .to(".darksky", { text: "", opacity: 1, duration: 0 }, 8)
    .to(
      ".darksky",
      {
        text: "YOUR SKY",
        duration: 1,
        onComplete: function shower() {
          $(".yoursky").show();
        },
      },
      8
    )
    .to(".yoursky", { opacity: 1, left: "50%", duration: 0 }, 9)
    .to(
      ".darksky",
      { text: "DARK SKY", opacity: 0, left: "90%", duration: 0 },
      9
    )

    // return
    .to(
      ".slider-line, .slider-button",
      { opacity: 1, ease: Power3.easeInOut, duration: 3 },
      8
    )
    .to(
      ".container",
      { "--position": "50%", ease: Power3.easeInOut, duration: 1 },
      10
    )
    .to(".yoursky", { left: "25%", ease: Power3.easeInOut, duration: 1 }, 10)
    .to(".darksky", { opacity: 1, duration: 0.5 }, 10.3)
    .to(
      ".darksky",
      { left: "75%", opacity: 1, ease: Power3.easeInOut, duration: 0.7 },
      10.3
    )
    .to(
      ".searchbtn",
      {
        filter: "grayscale(0)",
        cursor: "pointer",
        duration: 0.2,
        onComplete: function enablebtn() {
          searchbtn.removeAttribute("disabled");
        },
      },
      11
    )
    .to('.container', {'cursor': 'grab', duration: 0.2, onComplete: function enableslider(){container.style.pointerEvents = "auto"}}, 11);

  setTimeout("addInfo()", 11000);
}

function splash() {
  document.getElementById("splashScreen").classList.add("slide-out");
  document.getElementById("blur").classList.add("fade-out");

  setTimeout(function remove() {
    document.getElementById("blur").style.display = "none";
  }, 1500);
}

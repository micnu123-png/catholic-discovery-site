const READINGS_API =
  "https://cpbjr.github.io/catholic-readings-api/readings";

const BIBLE_API =
  "https://bible-api.com";


function $(selector) {
  return document.querySelector(selector);
}


function setText(selector, value) {
  const element = $(selector);

  if (element) {
    element.textContent = value ?? "";
  }
}


function todayInfo() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return {
    year,
    month,
    day,
    apiDate: `${month}-${day}`,
    fullDate: `${year}-${month}-${day}`
  };
}


function formatDate(dateString) {
  const date = new Date(dateString + "T12:00:00");

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}


function getSeasonDescription(season) {

  const descriptions = {

    "Ordinary Time":
      "A season of growing in faith and following Christ in everyday life.",

    "Advent":
      "A season of preparation and joyful expectation for the coming of Christ.",

    "Christmas":
      "A season celebrating the birth of Jesus Christ.",

    "Lent":
      "A season of prayer, fasting, repentance, and preparation for Easter.",

    "Easter":
      "A joyful season celebrating the Resurrection of Jesus Christ."
  };

  return descriptions[season] ||
    "The Church's liturgical season for today.";
}


function getLiturgicalColor(season) {

  const value = String(season || "").toLowerCase();

  if (
    value.includes("advent") ||
    value.includes("lent")
  ) {
    return "Purple";
  }

  if (
    value.includes("christmas") ||
    value.includes("easter")
  ) {
    return "White / Gold";
  }

  return "Green";
}


/* =========================================================
   BIBLE TEXT
========================================================= */

async function getBibleText(reference) {

  if (!reference) {
    return null;
  }

  try {

    const url =
      BIBLE_API +
      "/" +
      encodeURIComponent(reference) +
      "?translation=web";

    console.log("Fetching Bible text:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        "Bible API error: " + response.status
      );
    }

    return await response.json();

  } catch (error) {

    console.error(
      "Bible text error:",
      error
    );

    return null;
  }
}


/* =========================================================
   DISPLAY SCRIPTURE
========================================================= */

function displayBibleText(
  selector,
  reference,
  data
) {

  const element = $(selector);

  if (!element) {
    console.warn(
      "Element not found:",
      selector
    );

    return;
  }

  if (!data) {

    element.innerHTML =
      "<p>Unable to load the Scripture text.</p>";

    return;
  }

  let text = "";

  if (data.text) {
    text = data.text;
  }

  if (!text && data.verses) {

    text = data.verses
      .map(function (verse) {
        return verse.text || "";
      })
      .join(" ");
  }

  if (!text) {

    element.innerHTML =
      "<p>Scripture text is unavailable.</p>";

    return;
  }

  element.innerHTML = `
    <p class="scripture-quotation">
      ${text}
    </p>

    
  `;
}


/* =========================================================
   LOAD ONE READING
========================================================= */

async function loadReading(
  reference,
  referenceSelector,
  textSelector
) {

  setText(
    referenceSelector,
    reference || "Not available"
  );

  if (!reference) {

    setText(
      textSelector,
      "This reading is not available today."
    );

    return;
  }

  const bibleData =
    await getBibleText(reference);

  displayBibleText(
    textSelector,
    reference,
    bibleData
  );
}


/* =========================================================
   LOAD DAILY READINGS
========================================================= */

async function loadReadings() {

  console.log(
    "Faith Lantern readings starting..."
  );

  const today = todayInfo();

  const apiURL =
    `${READINGS_API}/${today.year}/${today.apiDate}.json`;

  console.log(
    "Fetching readings:",
    apiURL
  );

  try {

    const response =
      await fetch(apiURL);

    if (!response.ok) {

      throw new Error(
        `Readings API error: ${response.status}`
      );
    }

    const data =
      await response.json();

    console.log(
      "Reading data:",
      data
    );


    /* =====================================================
       READINGS
    ===================================================== */

    const readings =
      data.readings || {};

    const firstReading =
      readings.firstReading || "";

    const psalm =
      readings.psalm || "";

    const secondReading =
      readings.secondReading || "";

    const gospel =
      readings.gospel || "";


    /* =====================================================
       BASIC INFORMATION
    ===================================================== */

    const season =
      data.season ||
      "Ordinary Time";


    const celebration =
      data.celebration ||
      null;


    /* =====================================================
       PAGE TITLE
    ===================================================== */

    setText(
      "#reading-title",
      data.title ||
      "Today's Catholic Readings"
    );


    setText(
      "#reading-date",
      formatDate(
        data.date ||
        today.fullDate
      )
    );


    /* =====================================================
       LITURGICAL SEASON
    ===================================================== */

    setText(
      "#season-name",
      season
    );


    setText(
      "#season-description",
      getSeasonDescription(season)
    );


    /* =====================================================
       LITURGICAL COLOR
    ===================================================== */

    setText(
      "#liturgical-color",
      data.color ||
      data.liturgicalColor ||
      getLiturgicalColor(season)
    );


    /* =====================================================
       CELEBRATION
    ===================================================== */

    if (
      celebration &&
      typeof celebration === "object"
    ) {

      setText(
        "#celebration-name",
        celebration.name ||
        "Daily Mass"
      );

      setText(
        "#celebration-type",
        celebration.type ||
        "Liturgical Celebration"
      );

    } else {

      setText(
        "#celebration-name",
        celebration ||
        "Daily Mass"
      );

      setText(
        "#celebration-type",
        "Liturgical Celebration"
      );
    }


    /* =====================================================
       OFFICIAL USCCB LINK
    ===================================================== */

    const usccbURL =
      data.usccbLink ||
      `https://bible.usccb.org/bible/readings/${today.month}${today.day}${today.year}.cfm`;


    const officialLink =
      $("#official-readings");

    if (officialLink) {
      officialLink.href = usccbURL;
    }


    const officialButton =
      $("#official-readings-button");

    if (officialButton) {
      officialButton.href = usccbURL;
    }


    /* =====================================================
       LOAD ALL FOUR READINGS
    ===================================================== */

    await Promise.all([

      loadReading(
        firstReading,
        "#first-reference",
        "#first-text"
      ),

      loadReading(
        psalm,
        "#psalm-reference",
        "#psalm-text"
      ),

      loadReading(
        secondReading,
        "#second-reference",
        "#second-text"
      ),

      loadReading(
        gospel,
        "#gospel-reference",
        "#gospel-text"
      )

    ]);


    console.log(
      "Daily readings loaded successfully."
    );

  } catch (error) {

    console.error(
      "Could not load readings:",
      error
    );


    /* =====================================================
       ERROR STATE
    ===================================================== */

    setText(
      "#reading-title",
      "Unable to load today's readings"
    );


    setText(
      "#reading-date",
      formatDate(today.fullDate)
    );


    const cards = [
      "#first-text",
      "#psalm-text",
      "#second-text",
      "#gospel-text"
    ];


    cards.forEach(function (selector) {

      const element =
        $(selector);

      if (element) {

        element.innerHTML =
          "<p>Unable to load this reading.</p>";
      }

    });

  }
}


/* =========================================================
   START
========================================================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    loadReadings
  );

} else {

  loadReadings();

}
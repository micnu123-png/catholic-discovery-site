/* =========================================================
   FAITH LANTERN
   DAILY HOMILY & REFLECTION
   ========================================================= */


/* ---------------------------------------------------------
   CONFIGURATION
--------------------------------------------------------- */

const API_BASE =
    "https://cpbjr.github.io/catholic-readings-api";


/* ---------------------------------------------------------
   ELEMENTS
--------------------------------------------------------- */

const loading = document.getElementById("loading");
const content = document.getElementById("content");
const errorBox = document.getElementById("error");
const errorMessage = document.getElementById("errorMessage");

const currentDate = document.getElementById("currentDate");
const season = document.getElementById("season");

const celebrationName =
    document.getElementById("celebrationName");

const celebrationType =
    document.getElementById("celebrationType");

const gospelReference =
    document.getElementById("gospelReference");

const gospelMessage =
    document.getElementById("gospelMessage");

const firstReading =
    document.getElementById("firstReading");

const psalm =
    document.getElementById("psalm");

const secondReading =
    document.getElementById("secondReading");

const secondReadingCard =
    document.getElementById("secondReadingCard");

const homilyText =
    document.getElementById("homilyText");

const prayerText =
    document.getElementById("prayerText");

const usccbLink =
    document.getElementById("usccbLink");

const year =
    document.getElementById("year");


/* ---------------------------------------------------------
   DATE
--------------------------------------------------------- */

function getLocalDate() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(now.getDate())
            .padStart(2, "0");

    return {
        year,
        month,
        day,

        iso:
            `${year}-${month}-${day}`,

        monthDay:
            `${month}-${day}`
    };
}


/* ---------------------------------------------------------
   FORMAT DATE
--------------------------------------------------------- */

function formatDate(date) {

    const object =
        new Date(
            `${date.year}-${date.month}-${date.day}T12:00:00`
        );

    return object.toLocaleDateString(
        "en-GH",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


/* ---------------------------------------------------------
   LOAD DATA
--------------------------------------------------------- */

async function loadDailyContent() {

    loading.classList.remove("hidden");
    content.classList.add("hidden");
    errorBox.classList.add("hidden");

    try {

        const date = getLocalDate();

        const readingsURL =
            `${API_BASE}/readings/${date.year}/${date.monthDay}.json`;

        const calendarURL =
            `${API_BASE}/liturgical-calendar/${date.year}/${date.monthDay}.json`;


        const [
            readingsResponse,
            calendarResponse
        ] = await Promise.all([

            fetch(readingsURL),

            fetch(calendarURL)

        ]);


        if (!readingsResponse.ok) {

            throw new Error(
                "Today's reading data could not be loaded."
            );

        }


        if (!calendarResponse.ok) {

            throw new Error(
                "Today's liturgical calendar could not be loaded."
            );

        }


        const readings =
            await readingsResponse.json();

        const calendar =
            await calendarResponse.json();


        displayData(
            date,
            readings,
            calendar
        );


    } catch (error) {

        console.error(error);

        loading.classList.add("hidden");

        errorBox.classList.remove("hidden");

        errorMessage.textContent =
            error.message ||
            "Something went wrong while loading today's content.";

    }
}


/* ---------------------------------------------------------
   DISPLAY DATA
--------------------------------------------------------- */

function displayData(
    date,
    readings,
    calendar
) {

    const readingData =
        readings.readings || {};

    const celebration =
        calendar.celebration || {};


    currentDate.textContent =
        formatDate(date);


    season.textContent =
        readings.season ||
        calendar.season ||
        "Liturgical Season";


    celebrationName.textContent =
        celebration.name ||
        "Today's Catholic Celebration";


    celebrationType.textContent =
        celebration.type ||
        "Daily Celebration";


    firstReading.textContent =
        readingData.firstReading ||
        "See the official readings.";


    psalm.textContent =
        readingData.psalm ||
        "See the official readings.";


    if (
        readingData.secondReading &&
        readingData.secondReading.trim() !== ""
    ) {

        secondReading.textContent =
            readingData.secondReading;

        secondReadingCard.style.display =
            "block";

    } else {

        secondReadingCard.style.display =
            "none";

    }


    gospelReference.textContent =
        readingData.gospel ||
        "Today's Gospel";


    /*
       We deliberately do not reproduce the complete
       Scripture text here. Instead, visitors are directed
       to the official reading source.
    */

    gospelMessage.innerHTML = `
        <p>
            Today's Gospel invites us to encounter Jesus
            with an open heart. The reference for today's
            Gospel is <strong>${escapeHTML(
                readingData.gospel || "the Gospel"
            )}</strong>.
        </p>

        <p>
            Take time to read the complete Gospel prayerfully,
            asking the Holy Spirit to show you what Christ is
            saying to you today.
        </p>
    `;


    /*
       Create the reflection.
    */

    createReflection(
        readingData,
        celebration
    );


    /*
       USCCB LINK
    */

    if (readings.usccbLink) {

        usccbLink.href =
            readings.usccbLink;

    }


    /*
       Finish loading.
    */

    loading.classList.add("hidden");

    content.classList.remove("hidden");
}


/* ---------------------------------------------------------
   REFLECTION GENERATOR
--------------------------------------------------------- */

function createReflection(
    readings,
    celebration
) {

    const gospel =
        readings.gospel ||
        "today's Gospel";

    const first =
        readings.firstReading ||
        "today's first reading";

    const psalmReference =
        readings.psalm ||
        "today's Responsorial Psalm";


    const celebrationName =
        celebration.name ||
        "today's celebration";


    homilyText.innerHTML = `

        <p>
            <strong>Dear brothers and sisters in Christ,</strong>
        </p>

        <p>
            Today the Church invites us to listen carefully
            to the Word of God. We are reminded that our faith
            is not simply something we practise on Sundays.
            It is a relationship with Jesus Christ that should
            shape the way we think, speak and live each day.
        </p>

        <p>
            The Gospel appointed for today is
            <strong>${escapeHTML(gospel)}</strong>.
            Before reading it, take a quiet moment and ask
            the Lord: “Jesus, what are You asking me to
            understand today?”
        </p>

        <p>
            The first reading,
            <strong>${escapeHTML(first)}</strong>,
            and the Responsorial Psalm,
            <strong>${escapeHTML(psalmReference)}</strong>,
            help us place the Gospel within the wider story
            of God's relationship with His people.
        </p>

        <p>
            Today's liturgical celebration,
            <strong>${escapeHTML(celebrationName)}</strong>,
            is also an invitation to grow in holiness.
            The saints and holy people of the Church remind
            us that ordinary acts of faith, charity,
            forgiveness and prayer can become paths to God.
        </p>

        <p>
            Perhaps there is something in your life today
            that you need to surrender to Christ. Perhaps
            someone needs your forgiveness. Perhaps you need
            courage to do what is right even when nobody is
            watching.
        </p>

        <p>
            Do not allow today's Word to remain only on the
            screen. Carry it into your home, your school,
            your workplace and your relationships.
        </p>

        <p>
            <strong>
                The question for today is simple:
                What will I do differently because I have
                encountered Christ today?
            </strong>
        </p>

        <p>
            May the Holy Spirit give us the grace to listen,
            understand and put God's Word into action.
            May Mary, Mother of the Church, lead us closer
            to her Son.
        </p>

        <p>
            <strong>Amen.</strong>
        </p>
    `;


    prayerText.innerHTML = `

        Lord Jesus Christ,

        <br><br>

        open my heart to Your Word today.
        Help me to understand what You are asking of me
        and give me the courage to live according to Your
        teaching.

        <br><br>

        Help me to love those around me, forgive those who
        hurt me, serve those in need and remain faithful
        when life becomes difficult.

        <br><br>

        May Your Holy Spirit guide my thoughts, my words
        and my actions.

        <br><br>

        Mary, Mother of the Church, pray for us.

        <br><br>

        <strong>Amen.</strong>
    `;
}


/* ---------------------------------------------------------
   HTML SAFETY
--------------------------------------------------------- */

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


/* ---------------------------------------------------------
   TEXT TO SPEECH
--------------------------------------------------------- */

const listenButton =
    document.getElementById("listenButton");

let speaking = false;

listenButton.addEventListener(
    "click",
    function () {

        if (!("speechSynthesis" in window)) {

            alert(
                "Your browser does not support text-to-speech."
            );

            return;
        }


        if (speaking) {

            speechSynthesis.cancel();

            speaking = false;

            listenButton.textContent =
                "🔊 Listen";

            return;
        }


        const text =
            homilyText.innerText;


        const speech =
            new SpeechSynthesisUtterance(text);


        speech.lang = "en-US";

        speech.rate = 0.9;

        speech.pitch = 1;


        speech.onend = function () {

            speaking = false;

            listenButton.textContent =
                "🔊 Listen";

        };


        speechSynthesis.speak(speech);

        speaking = true;

        listenButton.textContent =
            "⏹ Stop";

    }
);


/* ---------------------------------------------------------
   SHARE
--------------------------------------------------------- */

const shareButton =
    document.getElementById("shareButton");


shareButton.addEventListener(
    "click",
    async function () {

        const shareData = {

            title:
                "Daily Homily & Reflection | Faith Lantern",

            text:
                "Today's Catholic Daily Homily & Reflection from Faith Lantern.",

            url:
                window.location.href

        };


        try {

            if (navigator.share) {

                await navigator.share(
                    shareData
                );

            } else {

                await navigator.clipboard.writeText(
                    window.location.href
                );

                alert(
                    "Link copied. You can now share it."
                );

            }

        } catch (error) {

            console.log(
                "Share cancelled."
            );

        }

    }
);


/* ---------------------------------------------------------
   COPY LINK
--------------------------------------------------------- */

const copyButton =
    document.getElementById("copyButton");


copyButton.addEventListener(
    "click",
    async function () {

        try {

            await navigator.clipboard.writeText(
                window.location.href
            );

            copyButton.textContent =
                "✓ Copied";

            setTimeout(
                () => {

                    copyButton.textContent =
                        "🔗 Copy Link";

                },
                2000
            );

        } catch {

            alert(
                "Copying is not available in this browser."
            );

        }

    }
);


/* ---------------------------------------------------------
   MOBILE MENU
--------------------------------------------------------- */

const menuToggle =
    document.getElementById("menuToggle");

const navLinks =
    document.getElementById("navLinks");


menuToggle.addEventListener(
    "click",
    function () {

        navLinks.classList.toggle(
            "open"
        );

    }
);


/* ---------------------------------------------------------
   DARK / LIGHT MODE
--------------------------------------------------------- */

const themeToggle =
    document.getElementById("themeToggle");


function setTheme(theme) {

    if (theme === "dark") {

        document.body.classList.add("dark");

        themeToggle.textContent =
            "☀️";

    } else {

        document.body.classList.remove("dark");

        themeToggle.textContent =
            "🌙";

    }

    localStorage.setItem(
        "faithLanternTheme",
        theme
    );
}


const savedTheme =
    localStorage.getItem(
        "faithLanternTheme"
    );


if (savedTheme) {

    setTheme(savedTheme);

}


themeToggle.addEventListener(
    "click",
    function () {

        const isDark =
            document.body.classList.contains(
                "dark"
            );

        setTheme(
            isDark ? "light" : "dark"
        );

    }
);


/* ---------------------------------------------------------
   YEAR
--------------------------------------------------------- */

year.textContent =
    new Date().getFullYear();


/* ---------------------------------------------------------
   START
--------------------------------------------------------- */

loadDailyContent();


/*
   Check every 15 minutes.

   If the visitor keeps the page open across midnight,
   the page will automatically reload the new day's content.
*/

setInterval(
    function () {

        loadDailyContent();

    },
    15 * 60 * 1000
);
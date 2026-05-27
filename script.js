let resistanceChart;

// ======================================
// INITIAL LOAD
// ======================================

window.onload = function () {

    attachRowEvents();

    updateRatios();

    updateMap();

    initializeChart();

};

// ======================================
// ADD INSTRUMENT ROW
// ======================================

function addInstrumentRow() {

    const tableBody =
    document.querySelector(
        "#instrumentTable tbody"
    );

    const rowCount =
    tableBody.rows.length + 1;

    const row =
    document.createElement("tr");

    row.innerHTML = `

        <td>${rowCount}</td>

        <td>
            <input
            type="text"
            placeholder="DET4TD2">
        </td>

        <td>
            <input
            type="text"
            placeholder="SN00${rowCount}">
        </td>

        <td>
            <input type="date">
        </td>

    `;

    tableBody.appendChild(row);

}

// ======================================
// ADD OBSERVATION ROW
// ======================================

function addReadingRow() {

    const tableBody =
    document.querySelector(
        "#readingTable tbody"
    );

    const row =
    document.createElement("tr");

    row.innerHTML = `

        <td>
            <input
            type="number"
            value="50"
            class="c2-input">
        </td>

        <td>
            <input
            type="number"
            value="0"
            class="p2-input">
        </td>

        <td class="ratio-cell">
            0.00
        </td>

        <td>
            <input
            type="number"
            value="0"
            class="resistance-input">
        </td>

    `;

    tableBody.appendChild(row);

    attachRowEvents();

    updateRatios();

}

// ======================================
// ATTACH EVENTS
// ======================================

function attachRowEvents() {

    const rows =
    document.querySelectorAll(
        "#readingTable tbody tr"
    );

    rows.forEach((row) => {

        const c2Input =
        row.querySelector(".c2-input");

        const p2Input =
        row.querySelector(".p2-input");

        const resistanceInput =
        row.querySelector(".resistance-input");

        c2Input.oninput = function () {

            updateRatios();

        };

        p2Input.oninput = function () {

            updateRatios();

        };

        resistanceInput.oninput = function () {

            updateChart();

        };

    });

}

// ======================================
// UPDATE RATIOS
// ======================================

function updateRatios() {

    const rows =
    document.querySelectorAll(
        "#readingTable tbody tr"
    );

    rows.forEach((row) => {

        const c2 =
        parseFloat(
            row.querySelector(".c2-input").value
        ) || 0;

        const p2 =
        parseFloat(
            row.querySelector(".p2-input").value
        ) || 0;

        const ratioCell =
        row.querySelector(".ratio-cell");

        let ratio = 0;

        if (c2 !== 0) {

            ratio = p2 / c2;

        }

        ratioCell.textContent =
        ratio.toFixed(2);

    });

    updateChart();

}

// ======================================
// GET OBSERVATION DATA
// ======================================

function getObservationData() {

    const rows =
    document.querySelectorAll(
        "#readingTable tbody tr"
    );

    let data = [];

    rows.forEach((row) => {

        const c2 =
        parseFloat(
            row.querySelector(".c2-input").value
        ) || 0;

        const p2 =
        parseFloat(
            row.querySelector(".p2-input").value
        ) || 0;

        const ratio =
        c2 !== 0
        ? p2 / c2
        : 0;

        const resistance =
        parseFloat(
            row.querySelector(".resistance-input").value
        ) || 0;

        data.push({

            c2,
            p2,
            ratio,
            resistance

        });

    });

    return data;

}

// ======================================
// CALCULATE DATA
// ======================================

function calculateData() {

    const data =
    getObservationData();

    if (data.length === 0) {

        alert(
            "Please enter observation data."
        );

        return;

    }

    // ==================================
    // SORT DATA BY RATIO
    // ==================================

    data.sort((a, b) => a.ratio - b.ratio);

    // ==================================
    // AVERAGE RESISTANCE
    // ==================================

    let totalResistance = 0;

    data.forEach(item => {

        totalResistance += item.resistance;

    });

    const avgResistance =
    totalResistance / data.length;

    document.getElementById(
        "avgResistance"
    ).textContent =

    avgResistance.toFixed(2)
    + " Ω";

    // ==================================
    // 62% INTERPOLATION
    // ==================================

    const targetRatio = 0.62;

    let resistance62 = 0;

    let found = false;

    for (
        let i = 0;
        i < data.length - 1;
        i++
    ) {

        const x1 = data[i].ratio;
        const x2 = data[i + 1].ratio;

        const y1 = data[i].resistance;
        const y2 = data[i + 1].resistance;

        if (
            targetRatio >= x1 &&
            targetRatio <= x2
        ) {

            resistance62 =

                y1 +

                (
                    (
                        targetRatio - x1
                    )
                    *
                    (
                        y2 - y1
                    )
                    /
                    (
                        x2 - x1
                    )
                );

            found = true;

            break;

        }

    }

    // IF EXACT 0.62 NOT FOUND

    if (!found) {

        let nearest = data[0];

        data.forEach(item => {

            if (

                Math.abs(
                    item.ratio - targetRatio
                )

                <

                Math.abs(
                    nearest.ratio - targetRatio
                )

            ) {

                nearest = item;

            }

        });

        resistance62 =
        nearest.resistance;

    }

    // ==================================
    // DISPLAY 62% VALUES
    // ==================================

    document.getElementById(
        "distance62"
    ).textContent = "0.62";

    document.getElementById(
        "resistance62"
    ).textContent =

    resistance62.toFixed(2)
    + " Ω";

    // ==================================
    // MAXIMUM DEVIATION
    // ==================================

    const deviation =

    Math.abs(
        resistance62 - avgResistance
    )

    /

    avgResistance

    *

    100;

    document.getElementById(
        "maxDeviation"
    ).textContent =

    deviation.toFixed(2)
    + " %";

    // ==================================
    // PREVIOUS FINAL RESISTANCE
    // ==================================

    const previousResistance =
    parseFloat(

        document.getElementById(
            "previousFinalResistance"
        ).value

    ) || 0;

    // ==================================
    // DIFFERENCE
    // ==================================

    const difference =
    resistance62 - previousResistance;

    let differenceText =

    difference.toFixed(2)
    + " Ω";

    if (difference > 0) {

        differenceText += " ↑";

    }

    else if (difference < 0) {

        differenceText += " ↓";

    }

    // ===================================
// ACCURACY CHECK
// ===================================

const desiredAccuracy =
parseFloat(
    document.getElementById(
        "desiredAccuracy"
    ).value
) || 0;

// deviation from previous test

let deviationPercent = 0;

if(previousResistance > 0){

    deviationPercent =

    Math.abs(
        resistance62 - previousResistance
    )

    /

    previousResistance

    *

    100;

}

// actual achieved accuracy

let achievedAccuracy =
100 - deviationPercent;

if(achievedAccuracy < 0){

    achievedAccuracy = 0;

}

finalAccuracyPercent =
achievedAccuracy;

const accuracyElement =
document.getElementById(
    "accuracyValue"
);

// PASS/FAIL BASED ON TOLERANCE

if(deviationPercent <= desiredAccuracy){

    finalAccuracyStatus =
    "PASS";

    accuracyElement.innerHTML = `

        PASS
        <br>
        ${achievedAccuracy.toFixed(2)} %

    `;

    accuracyElement.style.color =
    "green";

}
else{

    finalAccuracyStatus =
    "FAIL";

    accuracyElement.innerHTML = `

        FAIL
        <br>
        ${achievedAccuracy.toFixed(2)} %

    `;

    accuracyElement.style.color =
    "red";

}

    // ==================================
    // UPDATE CHART
    // ==================================

    updateChart();

}

// ======================================
// INITIALIZE CHART
// ======================================

function initializeChart() {

    const ctx =
    document.getElementById(
        "resistanceChart"
    );

    const linePlugin = {

        id: "linePlugin",

        afterDraw(chart) {

            const {

                ctx,

                chartArea: {
                    top,
                    bottom
                },

                scales: {
                    x,
                    y
                }

            } = chart;

            const xPos =
            x.getPixelForValue(0.62);

            ctx.save();

            // VERTICAL LINE

            ctx.beginPath();

            ctx.strokeStyle =
            "red";

            ctx.lineWidth = 2;

            ctx.setLineDash([6, 6]);

            ctx.moveTo(xPos, top);

            ctx.lineTo(xPos, bottom);

            ctx.stroke();

            ctx.setLineDash([]);

            // LABEL

            ctx.fillStyle =
            "red";

            ctx.font =
            "bold 14px Arial";

            ctx.fillText(

                "62% Position",

                xPos + 10,

                top + 20

            );

            ctx.restore();

        }

    };

    resistanceChart =
    new Chart(ctx, {

        type: "line",

        data: {

            datasets: [

                {

                    label:
                    "Resistance (Ω)",

                    data: [],

                    borderColor:
                    "#0047ab",

                    backgroundColor:
                    "#0047ab",

                    borderWidth: 3,

                    tension: 0.4,

                    fill: false,

                    pointRadius: 5,

                    pointHoverRadius: 7

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: true

                }

            },

            scales: {

                x: {

                    type: "linear",

                    min: 0,

                    max: 1,

                    ticks: {

                        stepSize: 0.1

                    },

                    title: {

                        display: true,

                        text: "P2/C2 Ratio"

                    }

                },

                y: {

                    beginAtZero: true,

                    title: {

                        display: true,

                        text: "Resistance (Ω)"

                    }

                }

            }

        },

        plugins: [linePlugin]

    });

    updateChart();

}

// ======================================
// UPDATE CHART
// ======================================

function updateChart() {

    if (!resistanceChart) return;

    const data =
    getObservationData();

    resistanceChart.data.datasets[0].data =

    data.map(item => ({

        x: item.ratio,

        y: item.resistance

    }));

    resistanceChart.update();

}

// ======================================
// UPDATE MAP
// ======================================

function updateMap() {

    const mapUrl =

    document.getElementById(
        "mapUrl"
    ).value;

    document.getElementById(
        "mapFrame"
    ).src = mapUrl;

}

// ======================================
// IMAGE PREVIEW
// ======================================

function previewImage(event, imageId) {

    const file =
    event.target.files[0];

    if (!file) return;

    const reader =
    new FileReader();

    reader.onload = function (e) {

        document.getElementById(
            imageId
        ).src = e.target.result;

    };

    reader.readAsDataURL(file);

}

// ======================================
// SAVE HISTORY
// ======================================

function saveHistory() {

    calculateData();

    const history =

    JSON.parse(
        localStorage.getItem(
            "earthHistory"
        )
    ) || [];

    const observations =
    getObservationData();

    const chartImage =
    resistanceChart.toBase64Image();

    const saveObject = {

        savedDate:
        new Date().toLocaleString(),

        projectName:
        document.getElementById(
            "projectName"
        ).value,

        projectReference:
        document.getElementById(
            "projectReference"
        ).value,

        location:
        document.getElementById(
            "location"
        ).value,

        engineer:
        document.getElementById(
            "engineer"
        ).value,

        weather:
        document.getElementById(
            "weather"
        ).value,

        avg:
        document.getElementById(
            "avgResistance"
        ).textContent,

        resistance62:
        document.getElementById(
            "resistance62"
        ).textContent,

        deviation:
        document.getElementById(
            "maxDeviation"
        ).textContent,

        accuracy:
        document.getElementById(
            "accuracyValue"
        ).innerText,

        observations,

        chart: chartImage,

        img1:
        document.getElementById(
            "img1"
        ).src,

        img2:
        document.getElementById(
            "img2"
        ).src

    };

    history.push(saveObject);

    localStorage.setItem(

        "earthHistory",

        JSON.stringify(history)

    );

    alert(
        "History Saved Successfully"
    );

}


// =======================================
// GLOBAL REPORT VARIABLES
// =======================================

let finalResistance62 = 0;
let finalDifferenceText = "";
let finalAccuracyStatus = "";
let finalAccuracyPercent = 0;

// =======================================
// OVERRIDE CALCULATE DATA
// =======================================

const originalCalculateData = calculateData;

calculateData = function () {

    const data =
    getObservationData();

    if (data.length === 0) {

        alert(
            "Please enter observation data."
        );

        return;

    }

    data.sort((a, b) => a.ratio - b.ratio);

    // ===================================
    // AVERAGE RESISTANCE
    // ===================================

    let totalResistance = 0;

    data.forEach(item => {

        totalResistance += item.resistance;

    });

    const avgResistance =
    totalResistance / data.length;

    document.getElementById(
        "avgResistance"
    ).textContent =

    avgResistance.toFixed(2)
    + " Ω";

    // ===================================
    // 62% RESISTANCE
    // ===================================

    const targetRatio = 0.62;

    let resistance62 = 0;

    let found = false;

    for (
        let i = 0;
        i < data.length - 1;
        i++
    ) {

        const x1 = data[i].ratio;
        const x2 = data[i + 1].ratio;

        const y1 = data[i].resistance;
        const y2 = data[i + 1].resistance;

        if (
            targetRatio >= x1 &&
            targetRatio <= x2
        ) {

            resistance62 =

                y1 +

                (
                    (
                        targetRatio - x1
                    )

                    *

                    (
                        y2 - y1
                    )

                    /

                    (
                        x2 - x1
                    )
                );

            found = true;

            break;

        }

    }

    if (!found) {

        let nearest = data[0];

        data.forEach(item => {

            if (

                Math.abs(
                    item.ratio - targetRatio
                )

                <

                Math.abs(
                    nearest.ratio - targetRatio
                )

            ) {

                nearest = item;

            }

        });

        resistance62 =
        nearest.resistance;

    }

    finalResistance62 =
    resistance62;

    document.getElementById(
        "distance62"
    ).textContent = "0.62";

    document.getElementById(
        "resistance62"
    ).textContent =

    resistance62.toFixed(2)
    + " Ω";

    // ===================================
    // DEVIATION
    // ===================================

    const deviation =

    Math.abs(
        resistance62 - avgResistance
    )

    /

    avgResistance

    *

    100;

    document.getElementById(
        "maxDeviation"
    ).textContent =

    deviation.toFixed(2)
    + " %";

    // ===================================
    // PREVIOUS RESISTANCE
    // ===================================

    const previousResistance =
    parseFloat(

        document.getElementById(
            "previousFinalResistance"
        ).value

    ) || 0;

    // ===================================
    // DIFFERENCE
    // ===================================

    const difference =
    resistance62 - previousResistance;

    finalDifferenceText =
    difference.toFixed(2)
    + " Ω";

    if (difference > 0) {

        finalDifferenceText += " ↑";

    }

    else if (difference < 0) {

        finalDifferenceText += " ↓";

    }

    // ===================================
    // ACCURACY
    // ===================================

    const desiredAccuracy =
    parseFloat(

        document.getElementById(
            "desiredAccuracy"
        ).value

    ) || 0;

    let accuracy = 100;

    if (previousResistance !== 0) {

        accuracy =

        100 -

        (
            Math.abs(
                resistance62 - previousResistance
            )

            /

            previousResistance

            *

            100
        );

    }

    if (accuracy < 0) {

        accuracy = 0;

    }

    finalAccuracyPercent =
    accuracy;

    const minimumAllowed =
    100 - desiredAccuracy;

    const accuracyElement =
    document.getElementById(
        "accuracyValue"
    );

    if (accuracy >= minimumAllowed) {

        finalAccuracyStatus =
        "PASS";

        accuracyElement.innerHTML =

        `
        PASS
        <br>
        ${accuracy.toFixed(2)} %
        `;

        accuracyElement.style.color =
        "green";

    }

    else {

        finalAccuracyStatus =
        "FAIL";

        accuracyElement.innerHTML =

        `
        FAIL
        <br>
        ${accuracy.toFixed(2)} %
        `;

        accuracyElement.style.color =
        "red";

    }

    updateChart();

};

// =======================================
// FINAL PDF FUNCTION
// =======================================

// =======================================
// GENERATE PROFESSIONAL PDF
// =======================================

async function generateProfessionalPDF(){

    // ===================================
    // CALCULATE DATA FIRST
    // ===================================

    calculateData();

    // ===================================
    // WAIT FOR CHART TO RENDER
    // ===================================

    await new Promise(resolve => setTimeout(resolve, 800));

    // ===================================
    // GET CHART IMAGE
    // ===================================

    let chartImage = "";

try {

    const canvas =
    document.getElementById(
        "resistanceChart"
    );

    chartImage =
    canvas.toDataURL(
        "image/png",
        1.0
    );

}
catch(error){

    console.log(
        "Chart export failed"
    );

}

    // ===================================
// GET MAP URL
// ===================================

const mapUrl =
document.getElementById(
    "mapUrl"
)?.value || "";

// ===================================
// USE MAP IFRAME SRC DIRECTLY
// ===================================

let staticMap = mapUrl;

    // ===================================
    // CREATE REPORT OBJECT
    // ===================================

    const reportData = {

        // PROJECT

        projectName:
        document.getElementById(
            "projectName"
        )?.value || "",

        projectReference:
        document.getElementById(
            "projectReference"
        )?.value || "",

        location:
        document.getElementById(
            "location"
        )?.value || "",

        date:
        document.getElementById(
            "date"
        )?.value || "",

        engineer:
        document.getElementById(
            "engineer"
        )?.value || "",

        weather:
        document.getElementById(
            "weather"
        )?.value || "",

        // RESULTS

        avgResistance:
        document.getElementById(
            "avgResistance"
        )?.textContent || "",

        distance62:
        document.getElementById(
            "distance62"
        )?.textContent || "",

        resistance62:
        document.getElementById(
            "resistance62"
        )?.textContent || "",

        previousResistance:
        document.getElementById(
            "previousFinalResistance"
        )?.value || "",

        difference:
        document.getElementById(
            "differenceValue"
        )?.textContent || "",

        maxDeviation:
        document.getElementById(
            "maxDeviation"
        )?.textContent || "",

        accuracy:
        document.getElementById(
            "accuracyValue"
        )?.innerText || "",

        status:
        document.getElementById(
            "accuracyValue"
        )?.innerText.includes("PASS")
        ? "PASS"
        : "FAIL",

        // MAP

        map:
        mapUrl,

        staticMap:
        staticMap,

        // REMARKS

        remarks:
        document.getElementById(
            "remarks"
        )?.value || "",

        // IMAGES

        img1:
        document.getElementById(
            "img1"
        )?.src || "",

        img2:
        document.getElementById(
            "img2"
        )?.src || "",

        desc1:
        document.getElementById(
            "desc1"
        )?.value || "",

        desc2:
        document.getElementById(
            "desc2"
        )?.value || "",

        // CHART

        chart:
        chartImage,

        // TABLES

        instruments: [],

        observations: []

    };

    // ===================================
    // SAVE INSTRUMENTS
    // ===================================

    const instrumentRows =
    document.querySelectorAll(
        "#instrumentTable tbody tr"
    );

    instrumentRows.forEach((row, index)=>{

        const inputs =
        row.querySelectorAll("input");

        reportData.instruments.push({

            no:
            index + 1,

            type:
            inputs[0]?.value || "",

            serial:
            inputs[1]?.value || "",

            due:
            inputs[2]?.value || ""

        });

    });

    // ===================================
    // SAVE OBSERVATIONS
    // ===================================

    const observationRows =
    document.querySelectorAll(
        "#readingTable tbody tr"
    );

    observationRows.forEach((row)=>{

        reportData.observations.push({

            c2:
            row.querySelector(
                ".c2-input"
            )?.value || "",

            p2:
            row.querySelector(
                ".p2-input"
            )?.value || "",

            ratio:
            row.querySelector(
                ".ratio-cell"
            )?.textContent || "",

            resistance:
            row.querySelector(
                ".resistance-input"
            )?.value || ""

        });

    });

    // ===================================
    // SAVE TO LOCAL STORAGE
    // ===================================

    localStorage.setItem(

        "earthReport",

        JSON.stringify(reportData)

    );

    // ===================================
    // OPEN PDF PAGE
    // ===================================

    window.open(

        "pdf.html",

        "_blank"

    );

}

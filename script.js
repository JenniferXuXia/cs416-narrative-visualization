// global variables for saving parameters and data
let albums = ["WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?", "Happier Than Ever", "HIT ME HARD AND SOFT"];
let features = ["energy", "danceability", "valence", "acousticness", "speechiness", "tempo"];

let feature_range = {
    "energy": [0, 1],
    "danceability": [0, 1],
    "valence": [0, 1],
    "acousticness": [0, 1],
    "speechiness": [0, 1],
    "tempo": [0, 200]
}

let feature_description = {
    "energy": "Energy represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy. A value of 0.0 is least energetic and 1.0 is most energetic.",
    "danceability": "Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable.",
    "valence": "Valence describes the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g., happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g., sad, depressed, angry). A value of 0.0 is least positive and 1.0 is most positive.",
    "acousticness": "A confidence measure of whether the track is acoustic. A score of 1.0 indicates high confidence that the track is acoustic. The more acoustic the recording, the closer to 1.0 the attribute value.",
    "speechiness": "Speechiness detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book, poetry), the closer to 1.0 the attribute value. Values above 0.66 describe tracks that are probably made entirely of spoken words. Values between 0.33 and 0.66 describe tracks that may contain both music and speech, either in sections or layered, including such cases as rap music. Values below 0.33 most likely represent music and other non-speech-like tracks.",
    "tempo": "The overall estimated tempo of a track in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration."
}

let album_color = {
    "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?": "#292520",
    "Happier Than Ever": "#e7ab96",
    "HIT ME HARD AND SOFT": "#0e3552"
}

// string formatting
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// data processing
function calculateMean(data, key) {
    return d3.mean(data, d => d[key]);
}

function filterByAlbum(data, album) {
    return data.filter(d => d.album == album);
}

function meansForFeature(data, feature) {
    let means = [];
    for (let i = 0; i < albums.length; i++) {
        let albumData = filterByAlbum(data, albums[i]);
        let mean = calculateMean(albumData, feature);
        means.push(mean);
    }
    return means;
}

// updating text
function updateFeatureDescription(feature) {
    document.getElementById("feature-description").innerHTML = feature_description[feature];
}

// chart constants
let margin = {top: 50, right: 50, bottom: 100, left: 50};

// visualization functions
function updateAlbumChart(data, feature) {
    width = document.getElementById("by-album-chart").width.baseVal.value;
    height = document.getElementById("by-album-chart").height.baseVal.value;

    let means = meansForFeature(data, feature);

    let xScale = d3.scaleBand()
        .domain(albums)
        .range([margin.left, width - margin.right])
        .padding(0.2);

    let yScale = d3.scaleLinear()
        .domain(feature_range[feature])
        .range([height - margin.bottom, margin.top]);

    let svg = d3.select("#by-album-chart");

    svg.selectAll("*").remove();

    svg.append("g")
        .selectAll("rect")
        .data(means)
        .enter()
        .append("rect")
        .attr("x", (d, i) => xScale(albums[i]))
        .attr("y", d => yScale(d))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d))
        .attr("fill", (d, i) => album_color[albums[i]]);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(`Mean ${capitalize(feature)} per Album`);

}

function updateTrackChart(data, album, feature) {
    width = document.getElementById("by-track-chart").width.baseVal.value;
    height = document.getElementById("by-track-chart").height.baseVal.value;

    let albumData = filterByAlbum(data, album).sort((a, b) => +a.track_number - +b.track_number);

    let xScale = d3.scaleBand()
        .domain(albumData.map(d => d.name))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    let yScale = d3.scaleLinear()
        .domain(feature_range[feature])
        .range([height - margin.bottom, margin.top]);

    let svg = d3.select("#by-track-chart");

    svg.selectAll("*").remove();

    svg.append("g")
        .selectAll("rect")
        .data(albumData)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.name))
        .attr("y", d => yScale(d[feature]))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d[feature]))
        .attr("fill", album_color[album]);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale))
        .selectAll("text");

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(`${capitalize(feature)} Per Track`);
}

// main visualization function
async function init() {
    let data = await d3.csv("data/billie_eilish_discography.csv");

    // initialize values
    updateAlbumChart(data, features[0]);
    updateTrackChart(data, albums[0], features[0]);
    updateFeatureDescription(features[0]);

    // event listeners
    document.getElementById("feature-select").addEventListener("change", function() {
        let selectedFeature = document.querySelector('input[name="feature"]:checked').value;

        updateAlbumChart(data, selectedFeature);
        updateTrackChart(data, document.getElementById("album-select").value, document.querySelector('input[name="feature"]:checked').value);

        updateFeatureDescription(selectedFeature);
    });

    document.getElementById("album-select").addEventListener("change", function() {
        updateTrackChart(data, this.value, document.querySelector('input[name="feature"]:checked').value);
    });
}
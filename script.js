// global variables for saving parameters and data
const albums = ["WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?", "Happier Than Ever", "HIT ME HARD AND SOFT"];
const album_color = {
    "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?": "#292520",
    "Happier Than Ever": "#e7ab96",
    "HIT ME HARD AND SOFT": "#0e3552"
}

const features = ["energy", "danceability", "valence", "acousticness", "speechiness", "tempo"];
const feature_range = {
    "energy": [0, 1],
    "danceability": [0, 1],
    "valence": [0, 1],
    "acousticness": [0, 1],
    "speechiness": [0, 1],
    "tempo": [0, 200]
}
const feature_description = {
    "energy": "Energy represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy. A value of 0.0 is least energetic and 1.0 is most energetic.",
    "danceability": "Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable.",
    "valence": "Valence describes the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g., happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g., sad, depressed, angry). A value of 0.0 is least positive and 1.0 is most positive.",
    "acousticness": "A confidence measure of whether the track is acoustic. A score of 1.0 indicates high confidence that the track is acoustic. The more acoustic the recording, the closer to 1.0 the attribute value.",
    "speechiness": "Speechiness detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book, poetry), the closer to 1.0 the attribute value. Values above 0.66 describe tracks that are probably made entirely of spoken words. Values between 0.33 and 0.66 describe tracks that may contain both music and speech, either in sections or layered, including such cases as rap music. Values below 0.33 most likely represent music and other non-speech-like tracks.",
    "tempo": "The overall estimated tempo of a track in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration."
}

const margin = {top: 100, right: 50, bottom: 100, left: 50};

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

// visualization and interface functions
function updateFeatureDescription(feature) {
    document.getElementById("feature-description").innerHTML = feature_description[feature];
}

function updateBarOnMouseover(barElement) {
    let selectedIdx = Array.from(document.getElementsByClassName("album-bar")).indexOf(barElement);

    d3.selectAll(".album-bar")
        .style("opacity", "50%");

    d3.select(barElement)
        .style("opacity", "100%");

    d3.selectAll(".album-label")
        .style("font-weight", function (d, i) {
            if (i == selectedIdx) { return "bold"; }
            return "normal";
        })
    
    return selectedIdx;
}

function updateAlbumChart(data, feature) {
    width = document.getElementById("by-album-chart").width.baseVal.value;
    height = document.getElementById("by-album-chart").height.baseVal.value;

    let albumMeans = meansForFeature(data, feature);
    console.log(`Album means for ${feature}: ${albumMeans}`);

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
        .data(albumMeans)
        .enter()
        .append("rect")
        .attr("class", "album-bar")
        .attr("x", (d, i) => xScale(albums[i]))
        .attr("y", d => yScale(d))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d))
        .attr("fill", (d, i) => album_color[albums[i]])

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("class", "album-label")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .text(`Mean ${capitalize(feature)} per Album`);
    
    updateAlbumChartAnnotations(svg, feature, xScale, yScale, albumMeans);
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
        .style("font-size", "24px")
        .text(`${capitalize(feature)} Per Track`);
}

function drawAlbumPath(svg, xScale, yScale, albumMeans, verticalOffset) {
    let x1 = xScale(albums[0]) + xScale.bandwidth() / 2;
    let y1 = yScale(albumMeans[0]) - verticalOffset;
    let x2 = xScale(albums[albums.length - 1]) + xScale.bandwidth() / 2;
    let y2 = yScale(albumMeans[albums.length - 1]) - verticalOffset;

    pathData = [{x1, y1, x2, y2}];

    svg.append("g")
        .selectAll("line")
        .data(pathData)
        .enter()
        .append("line")
        .attr("x1", d => d.x1)
        .attr("y1", d => d.y1)
        .attr("x2", d => d.x2)
        .attr("y2", d => d.y2)
        .attr("stroke", "gray")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,3");
}

function updateAlbumChartAnnotations(svg, feature, xScale, yScale, albumMeans) {
    const verticalOffset = 25;
    const hasAnnotationPath = ["energy", "valence", "tempo"]
    
    const annotationLabels = {
        "energy": "Gradual increase in energy across albums, but consistently around 0.3",
        "danceability": "Danceability peaks in the second album, but consistently medium-high around 0.6",
        "valence": "Gradual increase in valence across albums, but consistently around 0.3",
        "acousticness": "Steep drop in acousticness in third album, shifting from around 0.65 to 0.40 between the second and third album",
        "speechiness": "Steep drop in speechiness in second album, with overall decreasing trend across albums from around 0.20 to 0.05",
        "tempo": "Gradual increase in tempo across albums, ranging between around 100 to 120 bpm"
    };

    const callouts = {
        "energy": [{
            type: d3.annotationLabel,
            note: {
                label: annotationLabels["energy"],
                bgPadding: 20,
            },
            x: xScale(albums[1]) + xScale.bandwidth() / 2,
            y: yScale(albumMeans[1]) - verticalOffset,
            dy: -50,
            dx: 25,
            color: "gray",
        }],
        "danceability": [{
            type: d3.annotationCallout,
            note: {
                label: annotationLabels["danceability"],
                bgPadding: 20,
            },
            x: xScale(albums[1]) + xScale.bandwidth() / 2,
            y: yScale(albumMeans[1]),
            dy: -50,
            dx: 25,
            color: "gray",
        }],
        "valence": [{
            type: d3.annotationLabel,
            note: {
                label: annotationLabels["valence"],
                bgPadding: 20,
            },
            x: xScale(albums[1]) + xScale.bandwidth() / 2,
            y: yScale(albumMeans[1]) - verticalOffset - 5,
            dy: -50,
            dx: 50,
            color: "gray",
        }],
        "acousticness": [{
            type: d3.annotationCallout,
            note: {
                label: annotationLabels["acousticness"],
                bgPadding: 50,
            },
            x: xScale(albums[2]) + xScale.bandwidth() / 2,
            y: yScale(albumMeans[2]),
            dy: -130,
            dx: -50,
            color: "gray",
        }],
        "speechiness": [{
            type: d3.annotationCallout,
            note: {
                label: annotationLabels["speechiness"],
                bgPadding: 20,
            },
            x: xScale(albums[1]) + xScale.bandwidth() / 2,
            y: yScale(albumMeans[1]),
            dy: -70,
            dx: -10,
            color: "gray",
        }],
        "tempo": [{
            type: d3.annotationLabel,
            note: {
                label: annotationLabels["tempo"],
                bgPadding: 20,
            },
            x: xScale(albums[1]) + xScale.bandwidth() / 2,
            y: yScale(albumMeans[1]) - verticalOffset - 10,
            dy: -50,
            dx: 50,
            color: "gray",
        }],
    };

    svg.append("g")
        .attr("class", "annotation")
        .call(d3.annotation().annotations(callouts[feature]));

    if (hasAnnotationPath.includes(feature)) {
        drawAlbumPath(svg, xScale, yScale, albumMeans, verticalOffset);
    }
}

// main visualization function
async function init() {
    let data = await d3.csv("data/billie_eilish_discography.csv");

    // selected variables
    let selectedFeature = features[0]
    let selectedAlbum = albums[0]

    function updateScene() {
        // selected feature is the main parameter that changes the graphs in each scene
        selectedFeature = document.querySelector('input[name="feature"]:checked').value;

        // update each graph and description based on feature selection (radio item) trigger
        updateAlbumChart(data, selectedFeature);
        updateTrackChart(data, selectedAlbum, selectedFeature);
        updateFeatureDescription(selectedFeature);
        updateBarOnMouseover(document.getElementsByClassName("album-bar")[albums.indexOf(selectedAlbum)]);

        // update by-track chart based on album change (click) trigger
        Array.from(document.getElementsByClassName("album-bar")).forEach(bar => {
            // event listener for each bar in mean feature per album bar chart
            bar.addEventListener("mouseover", function() {
                let selectedIdx = updateBarOnMouseover(this);
                selectedAlbum = albums[selectedIdx];

                updateTrackChart(data, selectedAlbum, selectedFeature);
            });
        });
    }

    // initialize graphs and descriptions
    updateScene();

    // event listener for feature radio items
    document.getElementById("feature-select").addEventListener("change", function() {
        updateScene();
    });
}
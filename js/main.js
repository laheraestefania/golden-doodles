// Start application by loading the data
loadData();

// Dict, keys data by country name
var dataByCountry = {};
// Data in original list form
var allData = [];
var topology = [];
var metadata = {};
var noDataColor = "#999999";
var categorical = new Set(["iso3", "country", "region", "subregion",
    "child_overweight_plan", "fbdg", "overweight_adults_adoles_plan", "sugar_tax",
    "sodium_plan", "wasting_plan", "country_class", "adult_fem_diabetes_track", "adult_fem_obesity_track",
    "adult_mal_diabetes_track", "adult_mal_obesity_track", "burden_text"]);

function loadData() {
    queue()
        .defer(d3.csv, "data/cleaned_nutrition_data.csv")
        .defer(d3.json, "data/world-110m.json")
        .defer(d3.json, "data/world-110m-country.json")
        .defer(d3.csv, "data/metadata.csv")
        .await(function(error, nutritionData, topology_, countryCodes_, metadata_) {
        if(!error){
            let temp = {};
            // Save nutrition data keyed by country name
            // d is a country object from inside the nutritionData list
            nutritionData.forEach(function (d) {
                temp[d["country"]] = {};
                Object.keys(d).forEach(function (key) {
                    if (!categorical.has(key)) {
                        d[key] = +d[key];
                    }
                    temp[d["country"]][key] = d[key];
                });
            });
            // go through each country code and save an object for each code
            // transfer data from temp
            countryCodes_.forEach(function (d) {
                if (temp[d["name"]] !== undefined) {
                    dataByCountry[d["id"]] = temp[d["name"]];
                    // Save the id as well
                    dataByCountry[d["id"]]["id"] = d["id"];
                }
            });

            metadata_.forEach(function (obj) {
                metadata[obj["variable"]] = obj["description"];
            });

            allData = nutritionData;
            topology = topology_;

            console.log(allData);
            createVis();
        }
    });
}


function createVis() {
	// TO-DO: Instantiate visualization objects here
    var feature = $("#selected-feature").val();
    console.log(feature);
    var game = new ChoroplethGame("game", dataByCountry, topology, feature);
    var map = new Choropleth("map", dataByCountry, topology, feature);
    var scatterplot = new Scatterplot("scatterplot", dataByCountry);
    var histogram = new Histogram("histogram", allData);
    var malOverview = new ChoroplethCategorical("malnutrition-overview-map", dataByCountry, topology, "country_class")

    $("#selected-feature").on("change", function () {
        var feature = $("#selected-feature").val();
        console.log("feature is now " + feature);
        $("#map").html("");
        $("#game").html("");
        var game = new ChoroplethGame("game", dataByCountry, topology, feature);
        var map = new Choropleth("map", dataByCountry, topology, feature);


    });
}
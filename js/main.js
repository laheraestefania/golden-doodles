// Start application by loading the data
loadData();

// Dict, keys data by country name
var dataByCountry = {};
// Data in original list form
var allData = [];
var topology = [];
var categorical = new Set(["iso3", "country", "region", "subregion",
    "child_overweight_plan", "fbdg", "overweight_adults_adoles_plan", "sugar_tax",
    "sodium_plan", "wasting_plan", "country_class", "adult_fem_diabetes_track", "adult_fem_obesity_track",
    "adult_mal_diabetes_track", "adult_mal_obesity_track"]);

function loadData() {
    queue()
        .defer(d3.csv, "data/cleaned_nutrition_data.csv")
        .defer(d3.json, "data/world-110m.json")
        .defer(d3.json, "data/world-110m-country.json")
        .await(function(error, nutritionData, topology_, countryCodes_) {
        if(!error){
            let temp = {};
            nutritionData.forEach(function (d) {
                temp[d["country"]] = {};
                Object.keys(d).forEach(function (key) {
                    if (!categorical.has(key)) {
                        // console.log(key);
                        d[key] = +d[key];
                    }
                    temp[d["country"]][key] = d[key];
                });
            });
            countryCodes_.forEach(function (d) {
                if (temp[d["name"]] !== undefined) {
                    dataByCountry[d["id"]] = temp[d["name"]];
                }
            });
            allData = nutritionData;
            topology = topology_;
            createVis();
        }
    });
}


function createVis() {
	// TO-DO: Instantiate visualization objects here
    var hi = new Choropleth("map", dataByCountry, topology);
}
// Start application by loading the data
loadData();

var data = [];
var categorical = new Set(["iso3", "country", "region", "subregion",
    "child_overweight_plan", "fbdg", "overweight_adults_adoles_plan", "sugar_tax",
    "sodium_plan", "wasting_plan", "country_class", "adult_fem_diabetes_track", "adult_fem_obesity_track",
    "adult_mal_diabetes_track", "adult_mal_obesity_track"]);

function loadData() {
    d3.csv("data/cleaned_nutrition_data.csv", function(error, data_){
        if(!error){
            data_.forEach(function (d) {
                Object.keys(d).forEach(function (key) {
                    if (!categorical.has(key)) {
                        console.log(key);
                        d[key] = +d[key];
                    }
                });
            });
            console.log(data_);
            data = data_;
            createVis();
        }
    });
}


function createVis() {
	// TO-DO: Instantiate visualization objects here
    var hi = new Choropleth("map", data);
}
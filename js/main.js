// Dict, keys data by country name
var dataByCountry = {};
var dataByCountryName = {};
// Data in original list form
var allData = [];
var topology = [];
var metadata = {};
var noDataColor = "#999999";
var femaleObesity = [], maleObesity = [], femaleDiabetes = [], maleDiabetes = [];
var categorical = new Set(["iso3", "country", "region", "subregion",
    "child_overweight_plan", "fbdg", "overweight_adults_adoles_plan", "sugar_tax",
    "sodium_plan", "wasting_plan", "country_class", "adult_fem_diabetes_track", "adult_fem_obesity_track",
    "adult_mal_diabetes_track", "adult_mal_obesity_track", "burden_text"]);

// Start application by loading the data
loadData();

function loadData() {
    queue()
        .defer(d3.csv, "data/cleaned_nutrition_data.csv")
        .defer(d3.json, "data/world-110m.json")
        .defer(d3.json, "data/world-110m-country.json")
        .defer(d3.csv, "data/female_diabetes.csv")
        .defer(d3.csv, "data/male_diabetes.csv")
        .defer(d3.csv, "data/female_obesity.csv")
        .defer(d3.csv, "data/male_obesity.csv")
        .defer(d3.csv, "data/metadata.csv")
        .await(function(error,
                        nutritionData,
                        topology_,
                        countryCodes_,
                        femaleDiabetes_,
                        maleDiabetes_,
                        femaleObesity_,
                        maleObesity_,
                        metadata_) {
        if(!error){
            // Save nutrition data keyed by country name
            // d is a country object from inside the nutritionData list
            nutritionData.forEach(function (d) {
                dataByCountryName[d["country"]] = {};
                Object.keys(d).forEach(function (key) {
                    if (!categorical.has(key)) {
                        d[key] = +d[key];
                    }
                    dataByCountryName[d["country"]][key] = d[key];
                });
            });
            // go through each country code and save an object for each code
            // transfer data from temp
            countryCodes_.forEach(function (d) {
                if (dataByCountryName[d["name"]] !== undefined) {
                    dataByCountry[d["id"]] = dataByCountryName[d["name"]];
                    // Save the id as well
                    dataByCountry[d["id"]]["id"] = d["id"];
                }
            });

            metadata_.forEach(function (obj) {
                metadata[obj["variable"]] = obj["description"];
            });

            allData = nutritionData;

            // console.log(allData);

            var sugarTaxData = allData.map(function(d) {
                return d.sugar_tax;
            });

            var sodiumPlanData = allData.map(function(d) {
                return d.sodium_plan;
            });

            var childOverweightPlanData = allData.map(function(d) {
                return d.child_overweight_plan;
            });

            var wastingPlanData = allData.map(function(d) {
                return d.wasting_plan;
            });

            // console.log(wastingPlanData);

            topology = topology_;

            femaleObesity = clean(femaleObesity_);
            maleObesity = clean(maleObesity_);
            femaleDiabetes = clean(femaleDiabetes_);
            maleDiabetes = clean(maleDiabetes_);

            // console.log("data by country");
            // console.log(dataByCountry);
            //
            // console.log("dataByCountryName");
            // console.log(dataByCountryName);
            //
            console.log("fem obesity");
            console.log(femaleObesity);

            // console.log(allData);
            createVis();
        }
    });
}


function createVis() {
	// TO-DO: Instantiate visualization objects here
    var feature = $("#selected-feature").val();
    var game = new ChoroplethGame("game", dataByCountry, topology, feature);
    var map = new Choropleth("map", dataByCountry, topology, feature);
    var scatterplot = new Scatterplot("scatterplot", dataByCountry);
    var histogram = new Histogram("histogram", allData);
    var malOverview = new ChoroplethCategorical("malnutrition-overview-map", dataByCountry, topology, "country_class")
    var bubble = new Bubble("bubble", dataByCountry, feature);

    //Pie charts
    var piecharts = new PieChart("pieChartSugarTax", allData);
    var piecharts = new PieChart("pieChartSodiumPlan", allData);
    var piecharts = new PieChart("pieChartWastingPlan", allData);
    var piecharts = new PieChart("pieChartChildOverweightPlan", allData);

    // line charts
    var lineChart = new LineChart("female-obesity-line-chart", femaleObesity, dataByCountryName);
    var lineChart = new LineChart("female-diabetes-line-chart", femaleDiabetes, dataByCountryName, gender="Female", condition="Diabetes");
    var lineChart = new LineChart("male-obesity-line-chart", maleObesity, dataByCountryName, gender="Male");
    var lineChart = new LineChart("male-diabetes-line-chart", maleDiabetes, dataByCountryName, gender="Male", condition="Diabetes");

    $("#choro-bubble-title").html(metadata[feature]);
    $("#selected-feature").on("change", function () {
        var feature = $("#selected-feature").val();
        $("#map").html("");
        $("#game").html("");
        $("#bubble").html("");
        $("#choro-bubble-title").html(metadata[feature]);
        var game = new ChoroplethGame("game", dataByCountry, topology, feature);
        var map = new Choropleth("map", dataByCountry, topology, feature);
        var bubble = new Bubble("bubble", dataByCountry, feature);

    });
}

function clean(data) {
    data.forEach(function (obj) {
        Object.keys(obj).forEach(function (key) {
            if (!isNaN(+obj[key])) {
                obj[key] = +obj[key]
            }
        })
    })
    return data;
}
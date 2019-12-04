// Dict, keys data by country name
var dataByCountry = {};
var dataByCountryName = {};
// Data in original list form
var allData = [];
var topology = [];
var metadata = {};
var sugarTaxData = [], sodiumPlanData = [], childOverweightPlanData = [], wastingPlanData = [];
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

            sugarTaxData = allData.map(function(d) {
                return {plan: d.sugar_tax,
                    Sugar_sweetened_beverages_2016: d.Sugar_sweetened_beverages_2016,
                    Red_meat_2016: d.Red_meat_2016,
                    Salt_2016: d.Salt_2016,
                    Calcium_2016: d.Calcium_2016,
                    Vegetables_2016: d.Vegetables_2016,
                    Fruit_2016: d.Fruit_2016,
                    Whole_grain_2016: d.Whole_grain_2016
                };
            });

            sodiumPlanData = allData.map(function(d) {
                return {plan: d.sodium_plan,
                    Sugar_sweetened_beverages_2016: d.Sugar_sweetened_beverages_2016,
                    Red_meat_2016: d.Red_meat_2016,
                    Salt_2016: d.Salt_2016,
                    Calcium_2016: d.Calcium_2016,
                    Vegetables_2016: d.Vegetables_2016,
                    Fruit_2016: d.Fruit_2016,
                    Whole_grain_2016: d.Whole_grain_2016
                };
            });

            childOverweightPlanData = allData.map(function(d) {
                return {plan: d.child_overweight_plan,
                    Sugar_sweetened_beverages_2016: d.Sugar_sweetened_beverages_2016,
                    Red_meat_2016: d.Red_meat_2016,
                    Salt_2016: d.Salt_2016,
                    Calcium_2016: d.Calcium_2016,
                    Vegetables_2016: d.Vegetables_2016,
                    Fruit_2016: d.Fruit_2016,
                    Whole_grain_2016: d.Whole_grain_2016
                };
            });

            wastingPlanData = allData.map(function(d) {
                return {plan: d.wasting_plan,
                    Sugar_sweetened_beverages_2016: d.Sugar_sweetened_beverages_2016,
                    Red_meat_2016: d.Red_meat_2016,
                    Salt_2016: d.Salt_2016,
                    Calcium_2016: d.Calcium_2016,
                    Vegetables_2016: d.Vegetables_2016,
                    Fruit_2016: d.Fruit_2016,
                    Whole_grain_2016: d.Whole_grain_2016
                };
            });

            topology = topology_;

            femaleObesity = clean(femaleObesity_);
            maleObesity = clean(maleObesity_);
            femaleDiabetes = clean(femaleDiabetes_);
            maleDiabetes = clean(maleDiabetes_);

            createVis();
        }
    });
}


function createVis() {
    var vis = this;

    // (3) Create event handler
    var MyEventHandler = {};

    $('#micronutrient-selection-button').click(function(){
        fullpage_api.moveSectionDown();
    });

    var feature = $("#selected-feature").val();
    var choroplethBubble = new ChoroplethBubble("map-bubble-hybrid", dataByCountry, topology, feature);
    var game = new ChoroplethGame("game", dataByCountry, topology, feature);
    var scatterplot = new Scatterplot("scatterplot", dataByCountry);
    vis.histogram = new Histogram("histogram", allData, MyEventHandler);
    var malOverview = new ChoroplethCategorical("malnutrition-overview-map", dataByCountry, topology, "country_class")

    //Pie charts
    var piechartSugarTax = new PieChart("pieChartSugarTax", sugarTaxData);
    var piechartSodiumPlan = new PieChart("pieChartSodiumPlan", sodiumPlanData);
    var piechartWastingPlan = new PieChart("pieChartWastingPlan", childOverweightPlanData);
    var piechartChildOverweightPlan = new PieChart("pieChartChildOverweightPlan", wastingPlanData);

    $(MyEventHandler).bind("selectionChanged", function(event, rangeStart, rangeEnd){
        piechartSugarTax.onSelectionChange(rangeStart, rangeEnd);
        piechartSodiumPlan.onSelectionChange(rangeStart, rangeEnd);
        piechartWastingPlan.onSelectionChange(rangeStart, rangeEnd);
        piechartChildOverweightPlan.onSelectionChange(rangeStart, rangeEnd);
    });

    $("#selected-feature").on("change", function () {
        var feature = $("#selected-feature").val();
        $("#map-bubble-hybrid").html("");
        $("#map-bubble-hybrid").html("");
        $("#game").html("");
        var game = new ChoroplethGame("game", dataByCountry, topology, feature);
        var choroplethBubble = new ChoroplethBubble("map-bubble-hybrid", dataByCountry, topology, feature);

    });
}

function clean(data) {
    data.forEach(function (obj) {
        Object.keys(obj).forEach(function (key) {
            if (!isNaN(+obj[key])) {
                obj[key] = +obj[key]
            }
        })
    });
    return data;
}

function updateHistogram()  {
    var vis = this;

    vis.histogram.updateVis();
};
var transitionDuration = 1000;
var noDataColor = "#999999";

var mostColor = "#35536b";
var leastColor = "#e7f8fa";

var categorical = new Set(["iso3", "country", "region", "subregion",
        "child_overweight_plan", "fbdg", "overweight_adults_adoles_plan", "sugar_tax",
        "sodium_plan", "wasting_plan", "country_class", "adult_fem_diabetes_track", "adult_fem_obesity_track",
        "adult_mal_diabetes_track", "adult_mal_obesity_track", "burden_text"]);

var catColorScale = {"country_class": [noDataColor, "#a3cd61", "#f5bdbc", "#ed5f59", "#971c13"]};
var catColorDomain = {"country_class":[
        "No data",
        "None",
        "experiencing one form of malnutrition",
        "experiencing two forms of malnutrition",
        "experiencing three forms of malnutrition"]};

// main color scheme: https://visme.co/blog/website-color-schemes/
var sequentialInterpolator = d3.interpolateRgb(leastColor, mostColor);
var lightBlue = "#abd1e2";
var medBlue = "#64a8c7";
var darkBlue = "#35536b";
var accent4 = "#f3cfd5";
var backgroundColor = 'rgb(251,245,232)';
var accentColor = "#d79922";
var darkGreen = "#90893f";
var accent2 = "#97677b";
var accent3 = "#493e49";
var mainRed = "#ab3c61";
var darkestBlue = "#213342";
var hoverColor = "#cd728e";
var hoverColor = "#cd728e";

alternateMedBlue = "#749fa8";
alternateLightBlue = "#cfdbcc";

const regionNumbers = {
        "Africa": 0,
        "Asia": 1,
        "Europe": 2,
        "Latin America and the Caribbean": 3,
        "N. America": 4,
        "Oceania": 5
};

const subRegionNumbers = {
        "Australia and New Zealand": 0,
        "Caribbean" : 1,
        "Central America": 2,
        "Central Asia": 3,
        "Eastern Africa" : 4,
        "Eastern Asia": 5,
        "Eastern Europe": 6,
        "Melanesia": 7,
        "Micronesia": 8,
        "Middle Africa": 9,
        "Northern Africa": 10,
        "Northern America": 11,
        "Northern Europe": 12,
        "Polynesia": 13,
        "South America": 14,
        "South-eastern Asia": 15,
        "Southern Africa": 16,
        "Southern Asia": 17,
        "Southern Europe": 18,
        "Western Africa": 19,
        "Western Asia": 20,
        "Western Europe": 21
};

const numRegions = 6, numSubRegions = 22;

const numbering = {
        "region": {"num": numRegions, "labels": regionNumbers},
        "subregion": {"num": numSubRegions, "labels": subRegionNumbers},
}
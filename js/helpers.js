var transitionDuration = 1000;
var noDataColor = "#999999";

var mostColor = "#ced4ea";
var leastColor = "#28345d";

var catColorScale = {"country_class": [noDataColor, "#a3cd61", "#f5bdbc", "#ed5f59", "#971c13"]};
var catColorDomain = {"country_class":[
        "No data",
        "None",
        "experiencing one form of malnutrition",
        "experiencing two forms of malnutrition",
        "experiencing three forms of malnutrition"]};

var sequentialInterpolator = d3.interpolateRgb("#ced4ea", "#28345d");
var lightBlue = "#c5cbe3";
var darkBlue = "#4056A1";
var mainRed = "#f13c20";
var backgroundColor = 'rgb(237,225,190)';
var accentColor = "#d79922";

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
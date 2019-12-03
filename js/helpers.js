var transitionDuration = 1000;
var noDataColor = "#999999";

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
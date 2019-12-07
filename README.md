# golden-doodles

### Intro
This is our fall 2019 CS171 final project.

### Files
#### CSS files
All CSS files are in the css folder. The style.css file is written by us, 
and the remaining files are from libraries.
#### Javascript files
Javascript files are located in the js folder. Libraries are in the assets folder.
All .js files in the js folder itself were written by us.
#### Data
Data was acquired from the Global Nutrition report 
[website](https://globalnutritionreport.org/reports/global-nutrition-report-2018/dataset-and-metadata/)
and cleaned. Various cross sections and derivations of the data were saved in the data folder.
#### Images
All images are from Google Image search and the source websites are listed
 in the references section of the website.
 #### node\_modules
External libraries that require multiple files are in the node\_modules folder.
#### HTML
We wrote index.html, which is our main dashboard.
#### Other
We include the following standard files for Github repositories:
 - .gitignore: an automated file for git version control.
 - LICENSE: we use the GPL-3.0 license to open source our code.
 - README.md: this file, which is, of course, written by us.
 
### Interface Features
We hope that all features are sufficiently clear, but just in case, we provide 
here an overview of the main features in our website.

##### Tracking Progress
- Click on the nodes of the tree to expand and view regional, subregional, and country nodes. Regional and subregional nodes are colored according the classification of the majority of their constituent countries.
- Select a track from the dropdown menu, which updates the tree and the accompanying line or bar chart to show progress or the distribution of that condition.
- With a diabetes or obesity track selected, hovering over the country nodes of the tree will highlight the respective country's trend line in the line chart.
- Hover over a trend line within the line chart to reveal the country name.
- The colors of the regional and subregional nodes correspond to the condition of the majority of countries within that particular region or subregion given the selected criteria. 

##### Game
- Anytime, you can select a food or micronutrient from the dropdown menu in the navigation bar at the top of the webpage.
- First choose the countries that consume the most of the selected micronutrient.
- Next select the countries that consume the least of the selected micornutrient.
- Finally you will see which countries you answered correctly and an answer key.

##### Micronutrient Estimates
- Select a food or micronutrient from the dropdown menu in the navigation bar at the top of the webpage.
- Hover over the map to reveal the country name, the country's region and subregion, and the country's estimated per capita intake of the selected criterion.
- Select population to reveal a force bubble chart, in which each bubble and its size represent a country and its population.
- The country bubbles can be clustered by region or by subregion. 

##### Money
- Click play to activate the scatterplot animation (from 2000 to 2017), and the user can click "Replay" once the animation finishes to reanimate the image.
- Use the slider to update the scatterplot for a given year within the timeframe and investigate data for individual years.
- Hover over a bubble to reveal the country name and the country's GDP per Capita and Under 5 Mortality Rate for the particular year.

##### Policy
- Select a nutrient from the dropdown menu in the navigation bar at the top of the webpage.
- Hover over each bar of the histogram to reveal the countries with similar consumption levels.
- Brushing over the histogram will automatically update the pie chart for each policy.
 
### Links
- Our website can be found [here](https://laheraestefania.github.io/golden-doodles/).
- Our video can be found [here](https://youtu.be/3iRLQF-L5kA).

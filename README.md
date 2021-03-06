# EO4GEO-bok-dataviz

EO4GEO-bok-dataviz is an script to parse EO4GEO BoK and visualize it in a circle packing d3 layout.

## Installation

Using npm: 

```bash
npm i @eo4geo/bok-dataviz
```

Using bundle:

- Donwload bundle.js and index.html from releases to see a minimim working example.


## Usage

Place a div and give it an id.
If you want to show also the textual information, place a div and give it an id.

```html
<div id="bubbles"> </div>
<div id="textInfo"></div>
```

In Javascript call the function visualizeBOKData( svgID, textID)

- svgID : is the id you gave to the element in the HTML you want to display the graph
- textID : is the id you gave to the div for the textual information


```javascript
import * as bok from '@eo4geo/bok-dataviz';
[...]
bok.visualizeBOKData('#bubbles') // will only render the graphical view

bok.visualizeBOKData('#bubbles', '#textInfo') // will render the graphical view and the textual view

```

Other functions

```javascript
import * as bok from '@eo4geo/bok-dataviz'; // no need if using bundle.js
[...]
// returns an array of concepts matching the searchText string
selectedNodes = bok.searchInBoK(searchText); 
// navigates to the concept specified
bok.browseToConcept(conceptShortName); 
// returns the current node selected in the graph
bok..getCurrentNode(); 
```
Examples

```javascript
selectedNodes = bok.searchInBoK('Analytics');
bok.browseToConcept('GIST'); // navigates to root concept
bok.browseToConcept('AM'); // navigates to Analytical Methods concept
console.log(bok..getCurrentNode()); // will print to the console current node

```



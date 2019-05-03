# EO4GEO-bok-dataviz

EO4GEO-bok-dataviz is an script to parse a customxml file and visualize it in a circle packing d3 layout.

## Installation

Using npm: 

```bash
npm i @eo4geo/bok-dataviz
```

## Usage

Place an svg and give it an id and the desired size.
If you want to show also the textual information, place a div and give it an id.

```html
<svg id="bubbles" width ="500" height= "500"> </svg>
<div id="textInfo"></div>
```

In Javascript call the function visualizeBOKData( svgID, xmlFile, textID)

- svgID : is the id you gave to the svg in the HTML
- xmlFile : is the location of the customxml file 
- textID : is the id you gave to the div for the textual information


```javascript
import * as bok from '@eo4geo/bok-dataviz';
[...]
bok.visualizeBOKData('#bubbles', 'assets/saved-bok.xml') // will only render the graphical view

bok.visualizeBOKData('#bubbles', 'assets/saved-bok.xml', '#textInfo') // will render the graphical view and the textual view
```


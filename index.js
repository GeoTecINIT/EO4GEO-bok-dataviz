var d3 = require("d3");

var Relationtype = {
  SIMILAR: "similarTo",
  PREREQUISITE: "prerequisites",
  POSTREQUISITE: "postrequisites",
  BROADER: "broader",
  NARROWER: "narrower",
  DEMONSTRATES: "demonstrates"
};

// d3-compliant java object node with default values:
CostumD3Node = function () {
  this.name;
  //field required by D3
  this.nameShort = "";
  this.description = "";
  this.size = 100;
  //field required by D3, equals super-concept:
  this.parent = null;
  this.additionalParents = [];
  //field required by D3, equals subconcepts
  this.children = [];
  //other relations equal to 'relationtype'
  this.prerequisites = [];
  this.postrequisites = [];
  this.similarConcepts = [];
  this.demonstrableSkills = [];
  //Source documents are not retrieved by the XML
  this.sourceDocuments = [];
  this.uri = "";

  //field required to discard the old one when notation is repeated
  this.timestamp = "";
};

CostumD3NodeCollection = function () {
  this.nodes = [];
};

var cD3NCollection = new CostumD3NodeCollection();

CostumD3NodeCollection.prototype.add = function (node) {
  this.nodes.push(node);
};

CostumD3NodeCollection.prototype.pop = function () {
  this.nodes.pop();
};

CostumD3NodeCollection.prototype.getNodeByURI = function (uri) {
  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i].id.split("_rev")[0] == uri) {
      return this.nodes[i];
    }
  }
  return null;
};

CostumD3NodeCollection.prototype.getNodeByNameShort = function (nameShort) {
  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i].nameShort == nameShort) {
      return this.nodes[i];
    }
  }
  return null;
};

/* FOR SEARCH FUNCTIONALITY */
CostumD3NodeCollection.prototype.getNodesByKeyword = function (keyword) {
  var result = []
  keyword = keyword.toUpperCase();

  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i].nameShort.toUpperCase().indexOf(keyword) > -1) {
      if (!result.includes(this.nodes[i])) {
        result.push(this.nodes[i]);
      }
    }
  }
  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i].name && this.nodes[i].name.toUpperCase().indexOf(keyword) > -1) {
      if (!result.includes(this.nodes[i])) {
        result.push(this.nodes[i]);
      }
    }
  }
  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i].demonstrableSkills != null && this.nodes[i].demonstrableSkills != "" && this.nodes[i].demonstrableSkills.length > 0) {
      for (var j = 0; j < this.nodes[i].demonstrableSkills.length; j++) {
        if (this.nodes[i].demonstrableSkills[j].description.toUpperCase().indexOf(keyword) > -1) {
          if (!result.includes(this.nodes[i])) {
            result.push(this.nodes[i]);
          }
        }
      }
    }
  }
  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i].description != null && this.nodes[i].description != "") {
      if (this.nodes[i].description.toUpperCase().indexOf(keyword) > -1) {
        if (!result.includes(this.nodes[i])) {
          result.push(this.nodes[i]);
        }
      }
    }
  }
  return result;
};

/* FOR SEARCH FUNCTIONALITY */
CostumD3NodeCollection.prototype.getNodesIdByKeyword = function (keyword) {
  var result = [];
  keyword = keyword.toUpperCase();

  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i].nameShort.toUpperCase().indexOf(keyword) > -1) {
      if (!result.includes(this.nodes[i])) {
        result.push(this.nodes[i].id);
      }
    }
  }
  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i].name && this.nodes[i].name.toUpperCase().indexOf(keyword) > -1) {
      if (!result.includes(this.nodes[i])) {
        result.push(this.nodes[i].id);
      }
    }
  }
  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i].demonstrableSkills != null && this.nodes[i].demonstrableSkills != "" && this.nodes[i].demonstrableSkills.length > 0) {
      for (var j = 0; j < this.nodes[i].demonstrableSkills.length; j++) {
        if (this.nodes[i].demonstrableSkills[j].description.toUpperCase().indexOf(keyword) > -1) {
          if (!result.includes(this.nodes[i])) {
            result.push(this.nodes[i].id);
          }
        }
      }
    }
  }
  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i].description != null && this.nodes[i].description != "") {
      if (this.nodes[i].description.toUpperCase().indexOf(keyword) > -1) {
        if (!result.includes(this.nodes[i])) {
          result.push(this.nodes[i].id);
        }
      }
    }
  }
  return result;
};


SkillsCollection = function () {
  this.skills = [];
};

SkillsCollection.prototype.add = function (skill) {
  this.skills.push(skill);
};

SkillsCollection.prototype.getSkillByURI = function (uri) {
  for (var i = 0; i < this.skills.length; i++) {
    if (this.skills[i].uri == uri) {
      return this.skills[i];
    }
  }
  return null;
};

// data structure that represent a relation between to concpets of a given type, e.g. similar concept, prerequisite concept...
Relation = function (sourceID, targetID, type) {
  this.source = sourceID;
  this.target = targetID;
  this.type = type;
  this.id = Math.random();
};
/**
 * Indicates if two relations are identical (have the same id)
 * Note that detecting dublicates would require comparism of each attribute rather than the id
 */
Relation.prototype.equals = function (relation) {
  return this.id == relation.id;
};

Relation.prototype.similar = function (relation) {
  return (this.source == relation.source && this.target == relation.target && this.type == relation.type) ||
    //for reflexive relationships:
    (this.type == Relationtype.SIMILAR && this.type == relation.type && this.target == relation.source && this.source == relation.target);
};

RelationCollection = function () {
  this.relations = [];
};

RelationCollection.prototype.add = function (relation) {
  //if a similar relationship exists, don't add
  for (var i = 0; i < this.relations.length; i++) {
    if (this.relations[i].similar(relation))
      return;
  };
  this.relations.push(relation);
};

RelationCollection.prototype.getRelations = function (nameShort) {
  var res = [];
  for (var i = 0; i < this.relations.length; i++) {
    if (this.relations[i].source == nameShort) {
      res.push(this.relations[i]);
    }
  }
  return res;
};

exports.parseBOKData = function (bokXML) {
  //Parent node: gin2k:BodyOfKnowledge
  var d3output = new CostumD3Node();

  //First we gather all the concepts in a CostumD3Collection
  var concepts = bokXML.documentElement.getElementsByTagName("Concept");
  var nhashAndcd3Collection = parseConcepts(concepts);
  var costumD3Collection = nhashAndcd3Collection.collection;
  var namehash = nhashAndcd3Collection.hash;
  var relationCollection = nhashAndcd3Collection.relations;
  var colorhash = nhashAndcd3Collection.colors;

  //We also gather all the skills in a SkillsCollection
  var skills = bokXML.documentElement.getElementsByTagName("Skill");
  var skillsCollection = parseSkills(skills);

  //Here we make the relations between every concept and skill
  var relations = bokXML.documentElement.getElementsByTagName("Relationship");
  parseRelations(relations, costumD3Collection, skillsCollection);

  //Once we have the relations made (inside the CostumD3Collection),
  //we must get the concepts with no parent (the most abstract concepts)
  var higherCostumD3Nodes = getHigherCostumD3Nodes(costumD3Collection);

  removeNodesWithNoParent(costumD3Collection);

  //Our main Concept (or node) is the d3output node (created before),
  //so we must add to it the more abstract concepts
  d3output = higherCostumD3Nodes;

  return {
    nodes: d3output,
    relations: relationCollection,
    namehash: namehash,
    conceptNodeCollection: costumD3Collection,
    colors: colorhash
  };

};

removeNodesWithNoParent = function (costumD3Collection) {
  var newNodes = [];
  removed = 0;
  added = 0;
  for (var i = 0; i < costumD3Collection.nodes.length; i++) {
    if (costumD3Collection.nodes[i].parent == null && costumD3Collection.nodes[i].nameShort != "GIST") {
      removed++;
      // console.log("Node incorrect: %s", costumD3Collection.nodes[i].nameShort);
    } else {
      newNodes.push(costumD3Collection.nodes[i]);
      added++;
    }
  }
  // console.log("Total nodes with no parent: %i", removed);
  // console.log("Total nodes with parent: %i", added);

  //change array of nodes to remove the null parents
  costumD3Collection.nodes = newNodes;

};

getHigherCostumD3Nodes = function (costumD3Collection) {

  var res;
  for (var i = 0; i < costumD3Collection.nodes.length; i++) {
    if ((costumD3Collection.nodes[i].parent == null && costumD3Collection.nodes[i].nameShort == "GIST") || (costumD3Collection.nodes[i].parent == null && costumD3Collection.nodes[i].name == "Geographic Information Science and Technology")) {
      res = costumD3Collection.nodes[i];
    }
  }
  return res;

};

parseConcepts = function (concepts) {

  var listOfConceptNames = [];

  //Fake relations
  var relationCollection = new RelationCollection();

  //It is created the CostumD3NodeCollection in order to have all the nodes created
  //and work with them
  cD3NCollection = new CostumD3NodeCollection();
  var namehash = {};
  var colorhash = {};
  var cD3N;
  for (var i = 0; i < concepts.length; i++) {
    var description = concepts[i].getAttribute("Definition");
    var name = concepts[i].getAttribute("PrefLabel");
    var nameShort = concepts[i].getAttribute("Notation");
    var uri = concepts[i].getAttribute("URI");
    var timestamp = concepts[i].getAttribute("TimeStamp");
    cD3N = new CostumD3Node();
    cD3N.description = description;
    cD3N.name = name;
    cD3N.nameShort = nameShort;
    cD3N.timestamp = timestamp;
    cD3N.id = uri;
    cD3N.uri = uri;

    if (namehash[cD3N.id] == null) {
      cD3NCollection.add(cD3N);
    }
    namehash[cD3N.id] = cD3N.name;
    colorhash[cD3N.nameShort.substring(0, 2)] = 0;

    if (!listOfConceptNames.includes(nameShort)) {
      listOfConceptNames.push(nameShort)
    } else {
      // console.log("REPEATED NOTATION: " + nameShort);

      var alreadyConcept = cD3NCollection.getNodeByNameShort(nameShort);
      var alreadyTimestamp = new Date(alreadyConcept.timestamp)
      var currentTimestamp = new Date(timestamp)

      // If current node timestamp is newer, replace the old node
      if (currentTimestamp > alreadyTimestamp) {
        // console.log("**** REPLACED OLD CONCEPT " + alreadyConcept.nameShort + " " + alreadyConcept.name + " BY " + nameShort + " " + name);
        cD3NCollection.pop(); // Pop old one
        cD3NCollection.pop(); // Pop old one
        cD3NCollection.add(cD3N);  //Push new one
      }
    }
  }
  var i = 0;
  for (var key in colorhash) {
    colorhash[key] = i;
    i++;
  }

  return { collection: cD3NCollection, hash: namehash, relations: relationCollection, colors: colorhash };

};

parseRelations = function (relations, costumD3Collection, skillsCollection) {

  //We work with the CostumD3Collection and add the childrens and the parents
  //to the appropiate nodes
  for (var i = 0; i < relations.length; i++) {
    var objectUri = relations[i].getAttribute("Object").split("_rev")[0];
    var subjectUri = relations[i].getAttribute("Subject").split("_rev")[0];
    var predicateUri = relations[i].getAttribute("Predicate");
    var relation = getRelationFromPredicate(predicateUri);
    var object = costumD3Collection.getNodeByURI(objectUri);
    //XML ERROR: Some RelationShip Object's URIs don't match with any concept
    if (object != null) {
      //If relation is BROADER, it is a hierarchy relation, so we add the corresponding
      //children and the corresponding parent to the node
      if (relation == Relationtype.BROADER) {
        var subject = costumD3Collection.getNodeByURI(subjectUri);
        if (subject != null) {
          var alreadyChild = false;
          //Here we check that the relation was not previously added to prevent duplicating concepts
          for (var j = 0; j < object.children.length; j++) {
            if (object.children[j].uri.split("_rev")[0] == subjectUri) {
              alreadyChild = true;
            }
          }
          if (!alreadyChild) {

            if (subject.parent == null) {
              object.children.push(subject);
              subject.parent = object;
            } else if (subject.parent.nameShort != object.nameShort && subject.nameShort != object.nameShort) { // Because narrower relations we have to see if the parent is already there. And there are relations pointing to same concept with different revision
              //we will use the additional Parent to save other parents when more than one
              subject.additionalParents.push(object);
              //in case there are more than one parent, duplicate node

              var newCD3N = duplicateNode(subject);
              object.children.push(newCD3N);
              newCD3N.parent = object;
              newCD3N.additionalParents.push(subject.parent);

              cD3NCollection.add(newCD3N);

            }
          }
        }

      }//If relation is NARROWER, it is a hierarchy relation, so we add the corresponding
      //children and the corresponding parent to the node
      else if (relation == Relationtype.NARROWER) {
        var subject = costumD3Collection.getNodeByURI(subjectUri);
        if (subject != null) {
          var alreadyChild = false;
          //Here we check that the relation was not previously added to prevent duplicating concepts
          for (var j = 0; j < subject.children.length; j++) {
            if (subject.children[j].uri.split("_rev")[0] == objectUri) {
              alreadyChild = true;
            }
          }
          if (!alreadyChild) {
            if (object.parent == null) {
              subject.children.push(object);
              object.parent = subject;
            } else if (object.parent.nameShort != subject.nameShort && subject.nameShort != object.nameShort) { // Because narrower relations we have to see if the parent is already there. And there are relations pointing to same concept with different revision
              //we will use the additional Parent to save other parents when more than one
              object.additionalParents.push(subject);
              //in case there are more than one parent, duplicate node

              var newCD3N = duplicateNode(object);
              subject.children.push(newCD3N);
              newCD3N.parent = subject;
              newCD3N.additionalParents.push(object.parent);

              cD3NCollection.add(newCD3N);

            }
          }
        }
      }
      //If relation is DEMONSTRATES, it is a leaf node (a Skill)
      //and we add that skill to the correspoding concept
      else if (relation == Relationtype.DEMONSTRATES) {
        var skill = skillsCollection.getSkillByURI(subjectUri);
        if (object.objectives == null) {
          object.objectives = [];
        }
        object.objectives.push(skill);
        object.demonstrableSkills.push(skill);
      }
      //This should add the SIMILAR relations
      //However, there is an error in the XML file
      //and the "subject" concepts of the "similarTo"
      //relations dont exist
      else if (relation == Relationtype.SIMILAR) {
        //var subject = costumD3Collection.getNodeByURI( subjectUri );
        //subject.similarConcepts.push( object );
        //object.similarConcepts.push( subject );
      }
    } else {
      // console.log("Relationship with incorrect URI: " + objectUri);
    }
  }
};

parseSkills = function (skills) {
  var skillsCollection = new SkillsCollection();
  for (var i = 0; i < skills.length; i++) {
    var description = skills[i].getAttribute("Definition");
    var nameShort = skills[i].getAttribute("Notation");
    var uri = skills[i].getAttribute("URI").split("_rev")[0];
    var skill = {};
    skill.description = description;
    skill.nameShort = nameShort;
    skill.uri = uri;
    skillsCollection.add(skill);
  }
  return skillsCollection;
};

getRelationFromPredicate = function (predicate) {
  if (predicate != null) {
    var relation = predicate.split('#').pop(-1);
    return relation;
  }
};

duplicateNode = function (subject) {
  var newCD3N = new CostumD3Node();
  newCD3N.description = subject.description;
  newCD3N.name = subject.name;
  var rand = randomString(3);
  //Add a random string to the name to differentiate the copy from the original node
  newCD3N.nameShort = subject.nameShort + rand;
  newCD3N.id = subject.id + rand;
  newCD3N.uri = subject.uri;
  newCD3N.children = [];
  for (var i = 0; i < subject.children.length; i++) {
    var child = duplicateNode(subject.children[i]);
    newCD3N.children.push(child);
  }
  return newCD3N;
};

function randomString(length) {
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i)
    result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}

exports.visualizeBOKData = function (svgId, xmlFile, textId) {

  var COLOR_STROKE_SELECTED = "black";

  var svg = d3.select("div#"+svgId)
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 300 300")
  .classed("svg-content", true);

  var margin = 5,
    diameter = svg.node().getAttribute('viewBox').split(" ")[2],
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

  var color = d3.scaleLinear()
    .domain([-1, 5])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl);

  var pack = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);

  d3.xml(xmlFile).then((root, error) => {
    var bokData = exports.parseBOKData(root);

    if (error) throw error;

    dataAndFunctions = function () {
      this.conceptNodeCollection = null;
      this.zoom = null;
      this.namehash = null;
      this.colorhash = null;
      this.nodes = null;
    };

    dataAndFunctions.conceptNodeCollection = bokData.conceptNodeCollection;
    dataAndFunctions.namehash = bokData.namehash;
    dataAndFunctions.colorhash = bokData.colors;

    root = d3.hierarchy(bokData.nodes)
      .sum(function (d) { return d.size; })
      .sort(function (a, b) { return b.value - a.value; });

    var focus = root,
      nodes = pack(root).descendants(),
      view;

    dataAndFunctions.nodes = nodes;

    var colorPalette = d3.scaleOrdinal(d3.schemeCategory10);

    var circle = g.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", function (d) { return d.r; })
      .attr("x", function (d) { return d.x; })
      .attr("y", function (d) { return d.y; })
      .attr("id", function (d) { return d.data.id; })
      .attr("class", function (d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
      .style("fill", function (d) {
        if (d.depth == 1) {
          return colorPalette(dataAndFunctions.colorhash[d.data.nameShort.substring(0, 2)]);
        } else if (d.depth == 2) {
          return colorPalette(dataAndFunctions.colorhash[d.parent.data.nameShort.substring(0, 2)]);
        } else if (d.depth >= 3) {
          return colorPalette(dataAndFunctions.colorhash[d.parent.parent.data.nameShort.substring(0, 2)]);
        } else {
          return "turquoise";
        }
      }).style("fill-opacity", function (d) {
        if (d.depth >= 1) {
          return "0.5";
        } else {
          return "1";
        }
      }).attr("stroke", "black")
      .attr("stroke-width", "0.5px")
      .on("click", function (d) { if (focus !== d) { dataAndFunctions.zoom(d); exports.displayConcept(d); } d3.event.stopPropagation(); })
      .on("mouseover", function (d) {
        if (this.style.stroke != COLOR_STROKE_SELECTED) this.style.strokeWidth = 1
      })
      .on("mouseleave", function (d) {
        if (this.style.stroke != COLOR_STROKE_SELECTED) this.style.strokeWidth = 0.5
      });

    var text = g.selectAll("text").data(nodes).enter().append("text").attr("class", "label").style("pointer-events", "none").style("fill-opacity", function (d) {
      return d.parent === root || (d === root && d.children == null) ? 1 : 0;
    })
      .style("display", function (d) {
        return d.parent === root || (d === root && d.children == null) ? "inline" : "none";
      })
      .style("font", '11px "Helvetica Neue", Helvetica, Arial, sans-serif')
      .style("text-shadow", '0 1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff, 0 -1px 0 #fff')
      .each(function (d) { //This function inserts a label and adds linebreaks, avoiding lines > 13 characters
        var arr = d.data.name.split(" ");
        var arr2 = [];
        arr2[0] = arr[0];
        var maxLabelLength = 13;
        for (var i = 1, j = 0; i < arr.length; i++) {
          if (arr2[j].length + arr[i].length < maxLabelLength)
            arr2[j] += " " + arr[i];
          else {
            j++;
            arr2[j] = arr[i];
          }
        }
        for (var i = 0; i < arr2.length; i++) {
          d3.select(this).append("tspan").text(arr2[i]).attr("dy", i ? "1.2em" : (-0.5 * (j - 1)) + "em").attr("x", 0).attr("text-anchor", "middle").attr("class", "tspan" + i);
        }
      });


    var node = g.selectAll("circle,text");

    svg
      .style("background", "transparent")
      .on("click", function () { dataAndFunctions.zoom(root); });

    zoomTo([root.x, root.y, root.r * 2 + margin]);

    dataAndFunctions.zoom = function zoom(d) {
      var focus0 = focus; focus = d;

      var transition = d3.transition()
        .duration(d3.event && d3.event.altKey ? 7500 : 750)
        .tween("zoom", function (d) {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function (t) { zoomTo(i(t)); };
        });

      transition.selectAll("text")
        .filter(function (d) { return d.parent === focus || this.style.display === "inline" || (d === focus && (d.children == null || d.children == [])); })
        .style("fill-opacity", function (d) { return d.parent === focus || (d === focus && (d.children == null || d.children == [])) ? 1 : 0; })
        .on("start", function (d) {
          if (d.parent === focus || (d === focus && (d.children == null || d.children == [])))
            this.style.display = "inline";
        })
        .on("end", function (d) {
          if (d.parent !== focus && (d !== focus && (d.children == null || d.children == [])))
            this.style.display = "none";
        });
    }

    function zoomTo(v) {
      var k = diameter / v[2]; view = v;
      node.attr("transform", function (d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
      circle.attr("r", function (d) { return d.r * k; });

    }

    var nodeData = dataAndFunctions.conceptNodeCollection.getNodeByNameShort("GIST");
    exports.displayConcept(nodeData);
  });

  //displays all available content for the currently focussed concept in the description box:
  exports.displayConcept = function (d) {
    if (textId != null) {

      if (textId[0] == "#")
        textId = textId.split("#")[1];


      var oldD = d;
      if (d.data)
        d = d.data;

      var mainNode = document.getElementById(textId)
      mainNode.innerHTML = "";

      var titleNode = document.createElement("h4");
      titleNode.id = "boktitle";
      titleNode.attributes = "#boktitle";
      titleNode.innerHTML = "[" + d.nameShort + "] " + d.name;   //display Name and shortcode of concept:

      mainNode.appendChild(titleNode);

      //display description of concept.
      var descriptionNode = document.createElement("div");
      if (d.description != null) {
        var timeFormat = "<small> Last Updated: " + new Date(d.timestamp).toUTCString() + " </small><br>";
        var headline = "<h5>Description:</h5>";
        var currentTxt = "<div id='currentDescription' class='hideContent'>" + d.description + "</div>";
        descriptionNode.innerHTML = timeFormat + headline + currentTxt;
      } else
        descriptionNode.innerHTML = "";

      mainNode.appendChild(descriptionNode);
      var infoNode = document.createElement("div");


      // Display hierarchy of parent concepts in a definition list:
      if (d.parent != null) {
        parents = [];
        //trace all parents upwards from the hierarchy
        for (var p = d.parent; p != null; p = p.parent) {
          parents.push(p);
        }
        var tab = "";
        var text = "<h5>Superconcepts [" + parents.length + "] </h5><div><dl>";
        var parent = parents.pop();
        /* We attach the browseToConcept function in order to be able to browse to SuperConcepts
         from the concept's list browser of the right */
        text += "<a class='concept-name' onclick='browseToConcept(\"" + parent.nameShort + "\")'><b>-</b> " + parent.name + "</a>";
        tab += "";
        while (parents.length > 0) {
          parent = parents.pop();
          text += "<dd style='margin: 0 0 1.5em 0.8em'><dl><dt style='color: #007bff; font-weight: 400; cursor: pointer;' class='concept-name' onclick='browseToConcept(\"" + parent.nameShort + "\")'><b>-</b> " + "[" + parent.nameShort + "] " + parent.name + "</dt>";
          tab += "</dl></dd>";
        }
        text += tab + "</dl></div>";

        infoNode.innerHTML = text;
      } else
        infoNode.innerHTML = "";

      //display description of subconcepts (if any):
      displayUnorderedList(d.children, "name", "Subconcepts", infoNode, "boksubconcepts");

      //display description of prerequisites (if any):
      displayUnorderedList(d.prerequisites, null, "Prequisites", infoNode, "bokprequisites");

      //display description of postrequisites (if any):
      displayUnorderedList(d.postrequisites, null, "Postrequisites", infoNode, "bokpostrequisites");

      //display description of similar concepts (if any):
      displayUnorderedList(d.similarConcepts, null, "Similar concepts", infoNode, "boksimilar");

      //display description of demonstrable skills (if any):
      displayUnorderedList(d.demonstrableSkills, "description", "Demonstrable skills", infoNode, "bokskills");

      //display source documents of concept (if any):
      displayUnorderedList(d.sourceDocuments, null, "Source documents", infoNode, "boksource");

      mainNode.appendChild(infoNode);

    }
  };

  //displays a list of textelements in HTML
  displayUnorderedList = function (array, propertyname, headline, domElement, idNode) {
    if (array != null && array.length != 0) {
      var text = "";
      text += "";
      text += "<h5>" + headline + " [" + array.length + "] </h5><div #" + idNode + " id=" + idNode + "><ul>";
      for (var i = 0, j = array.length; i < j; i++) {
        var nameShort;
        var value;
        if (propertyname != null) { //For Subconcepts and Demonstrable Skills
          value = array[i][propertyname];
          nameShort = array[i]['nameShort'];
        } else { //For Similar, Postrequisites and Prerequisites
          value = array[i];
          nameShort = array[i];
        }
        /* We attach the browseToConcept function to each subconcept of the list */
        if (headline == "Subconcepts") {
          text += "<a style='color: #007bff; font-weight: 400; cursor: pointer;' class='concept-name' id='sc-" + nameShort + "' onclick='browseToConcept(\"" + nameShort + "\")'>" + "[" + nameShort + "] " + value + "</a> <br>";
        }
        else if (headline == "Similar concepts" || headline == "Postrequisites" || headline == "Prequisites") {
          text += "<a style='color: #007bff; font-weight: 400; cursor: pointer;' class='concept-name' onclick='browseToConcept(\"" + nameShort + "\")'>" + value + "</a> <br>";
        }
        else {
          text += "<a>" + value + "</a> <br>";
        }
      };
      text += "</ul></div>";
      domElement.innerHTML += text;
    }
  },

    browseToConcept = function (nameShort) {
      var node = null
      dataAndFunctions.nodes.forEach(n => {
        if (n.data.nameShort == nameShort) {
          node = n;
        }
      });
      if (node != null) {
        var nodeData = dataAndFunctions.conceptNodeCollection.getNodeByNameShort(nameShort);
        exports.displayConcept(nodeData);
        dataAndFunctions.zoom(node);
      }
    },
    exports.browseToConcept = function (nameShort) {
      browseToConcept(nameShort);
    }

  var selectedNodes = [];

  exports.searchInBoK = function (string) {
    cleanSearchInBOK();

    searchInputFieldDoc = string.trim();

    if (searchInputFieldDoc != "" && searchInputFieldDoc != " ") {
      selectedNodes = dataAndFunctions.conceptNodeCollection.getNodesIdByKeyword(searchInputFieldDoc);
      //highlight search
      for (var i = 0; i < selectedNodes.length; i++) {
        var circle = document.getElementById(selectedNodes[i]);
        if (circle != null) {
          circle.style.stroke = COLOR_STROKE_SELECTED;
          circle.style.strokeWidth = "2px";
        }
      }
    }
    return dataAndFunctions.conceptNodeCollection.getNodesByKeyword(searchInputFieldDoc);
  }

  cleanSearchInBOK = function (d) {
    //clean search
    for (var i = 0; i < selectedNodes.length; i++) {
      var circle = document.getElementById(selectedNodes[i]);
      if (circle != null) {
        circle.style.stroke = "";
        circle.style.strokeWidth = "";
      }
    }
    selectedNodes = [];
  }

  exports.searchInBoKAndWriteResults = function (string) {
    var results = exports.searchInBoK(string);

  }
}

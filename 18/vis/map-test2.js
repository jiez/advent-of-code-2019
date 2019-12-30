/*
########################
#f.D.E.e.C.b.A.@.a.B.c.#
######################.#
#d.....................#
########################
*/
// create an array with nodes
var nodes = new vis.DataSet([
  { id: 1, label: "f", shape: "circle", color: "green" },
  { id: 2, label: "D", shape: "circle", color: "red" },
  { id: 3, label: "E", shape: "circle", color: "red" },
  { id: 4, label: "e", shape: "circle", color: "green" },
  { id: 5, label: "C", shape: "circle", color: "red" },
  { id: 6, label: "b", shape: "circle", color: "green" },
  { id: 7, label: "A", shape: "circle", color: "red" },
  { id: 8, label: "@", shape: "circle", color: "black" },
  { id: 9, label: "a", shape: "circle", color: "green" },
  { id: 10, label: "B", shape: "circle", color: "red" },
  { id: 11, label: "c", shape: "circle", color: "green" },
  { id: 12, label: "d", shape: "circle", color: "green" },
]);
// create an array with edges
var edges = new vis.DataSet([
  { from: 1, to: 2, label: "2" },
  { from: 2, to: 3, label: "2" },
  { from: 3, to: 4, label: "2" },
  { from: 4, to: 5, label: "2" },
  { from: 5, to: 6, label: "2" },
  { from: 6, to: 7, label: "2" },
  { from: 7, to: 8, label: "2" },
  { from: 8, to: 9, label: "2" },
  { from: 9, to: 10, label: "2" },
  { from: 10, to: 11, label: "2" },
  { from: 11, to: 12, label: "24" },
]);

// create a network
var container = document.getElementById("mynetwork");
var data = {
  nodes: nodes,
  edges: edges
};
var options = {
  nodes: {
    shape: "box",

    font : {
        size: 50
    }
  },

  edges: {
    font : {
        size: 40
    }
  }
};
var network = new vis.Network(container, data, options);


/*
#################
#i.G..c...e..H.p#
########.########
#j.A..b...f..D.o#
########@########
#k.E..a...g..B.n#
########.########
#l.F..d...h..C.m#
#################
*/

// create an array with nodes
var nodes = new vis.DataSet([
  { id: 1, label: "i", shape: "circle", color: "green" },
  { id: 2, label: "G", shape: "circle", color: "red" },
  { id: 3, label: "c", shape: "circle", color: "green" },
  { id: 4, label: "e", shape: "circle", color: "green" },
  { id: 5, label: "H", shape: "circle", color: "red" },
  { id: 6, label: "p", shape: "circle", color: "green" },
  { id: 7, label: "j", shape: "circle", color: "green" },
  { id: 8, label: "A", shape: "circle", color: "red" },
  { id: 9, label: "b", shape: "circle", color: "green" },
  { id: 10, label: "f", shape: "circle", color: "green" },
  { id: 11, label: "D", shape: "circle", color: "red" },
  { id: 12, label: "o", shape: "circle", color: "green" },
  { id: 13, label: "@", shape: "circle", color: "black" },
  { id: 14, label: "k", shape: "circle", color: "green" },
  { id: 15, label: "E", shape: "circle", color: "red" },
  { id: 16, label: "a", shape: "circle", color: "green" },
  { id: 17, label: "g", shape: "circle", color: "green" },
  { id: 18, label: "B", shape: "circle", color: "red" },
  { id: 19, label: "n", shape: "circle", color: "green" },
  { id: 20, label: "l", shape: "circle", color: "green" },
  { id: 21, label: "F", shape: "circle", color: "red" },
  { id: 22, label: "d", shape: "circle", color: "green" },
  { id: 23, label: "h", shape: "circle", color: "green" },
  { id: 24, label: "C", shape: "circle", color: "red" },
  { id: 25, label: "m", shape: "circle", color: "green" },
]);
// create an array with edges
var edges = new vis.DataSet([
  { from: 1, to: 2, label: "2" },
  { from: 2, to: 3, label: "3" },
  { from: 3, to: 4, label: "4" },
  { from: 3, to: 9, label: "6" },
  { from: 3, to: 10, label: "6" },
  { from: 3, to: 13, label: "5" },
  { from: 4, to: 5, label: "3" },
  { from: 4, to: 9, label: "6" },
  { from: 4, to: 10, label: "6" },
  { from: 4, to: 13, label: "5" },
  { from: 5, to: 6, label: "2" },
  { from: 7, to: 8, label: "2" },
  { from: 8, to: 9, label: "3" },
  { from: 9, to: 10, label: "4" },
  { from: 9, to: 13, label: "3" },
  { from: 10, to: 11, label: "3" },
  { from: 10, to: 13, label: "3" },
  { from: 11, to: 12, label: "2" },
  { from: 13, to: 16, label: "3" },
  { from: 13, to: 17, label: "3" },
  { from: 13, to: 22, label: "5" },
  { from: 13, to: 23, label: "5" },
  { from: 14, to: 15, label: "2" },
  { from: 15, to: 16, label: "3" },
  { from: 16, to: 17, label: "4" },
  { from: 16, to: 22, label: "6" },
  { from: 16, to: 23, label: "6" },
  { from: 17, to: 18, label: "3" },
  { from: 17, to: 22, label: "6" },
  { from: 17, to: 23, label: "6" },
  { from: 18, to: 19, label: "2" },
  { from: 20, to: 21, label: "2" },
  { from: 21, to: 22, label: "3" },
  { from: 22, to: 23, label: "4" },
  { from: 23, to: 24, label: "3" },
  { from: 24, to: 25, label: "2" },
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


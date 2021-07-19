function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// Create the buildCharts function.
function buildCharts(sample) {

  // Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {

    //// Bar Chart ////
    // Create a variable that holds the samples array. 
    var allSamples = data.samples;

    // Create a variable that filters the samples for the object with the desired sample number.
    var desiredSample = allSamples.filter(sampleObj => sampleObj.id == sample);

    //  Create a variable that holds the first sample in the array.
    var result = desiredSample[0];

    // Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otuIds = result.otu_ids;
    var otuLabels = result.otu_labels;
    var sampleValues = result.sample_values;

    // Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 

    var yticks = otuIds.slice(0,10).map(otuIds => `OTU ${otuIds}`).reverse();
    var topTenSamples = sampleValues.slice(0, 10).reverse();
    var topTenLabels = otuLabels.slice(0, 10).reverse();

    // Create the trace for the bar chart. 
    var traceBar = {
          x: topTenSamples,
          y: yticks,
          text: topTenLabels,
          type: "bar",
          orientation: "h"
      };

    var barData = [traceBar];
      
    // Create the layout for the bar chart. 
    var barLayout = {
      title: "Top 10 Bacteria Cultures Found",
    };

    // Use Plotly to plot the data with the layout. 
     Plotly.newPlot("bar", barData, barLayout);

    //// Bubble Chart ////
    // Create the trace for the bubble chart.
    var bubbleData = [{
      x:otuIds,
      y:sampleValues,
      text:otuLabels,
      mode:"markers",
      marker:{
        size:sampleValues,
        color:otuIds,
        colorscale:'RdBu'
      }   
    }];

    // Create the layout for the bubble chart.
    var bubbleLayout = {
      title:"Bacteria Cultures per Sample",
      xaxis:{title:"OTU ID"},
      hovermode: 'closest',
      height: 600,
      width: 1200
    };

    // Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout); 

    //// Gauge Chart ////
    // Create a variable that filters the metadata array for the object with the desired sample number.
    var metadata = data.metadata;
    var resultFilter = metadata.filter(sampleObj => sampleObj.id == sample);

    // Create a variable that holds the first sample in the metadata array.
    var resultFinal = resultFilter[0];

    // Create a variable that holds the washing frequency.
    var washFreq = parseFloat(resultFinal.wfreq);

    // Create the trace for the gauge chart.
    var gaugeData = [{
        value: washFreq,
        type: 'indicator',
        mode: 'gauge+number',
        title: {text: "Belly Button Washing Frequency Per Week"},
        gauge: {
          axis: {range: [0,10]},
          bar: {color: 'black'},
          steps: [
            {range: [0,2], color:'red'},
            {range: [2,4], color:'orange'},
            {range: [4,6], color:'yellow'},
            {range: [6,8], color:'limegreen'},
            {range: [8,10], color:'green'},
          ]
        }
    }];
        
    // Create the layout for the gauge chart.
    var gaugeLayout = { 
      height: 400,
      width: 500
    };
    
    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout); 

  });
}


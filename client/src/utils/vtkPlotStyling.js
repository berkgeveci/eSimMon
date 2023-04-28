import { scaleLinear } from "d3-scale";
import { format } from "d3-format";

export function setAxesStyling(axes, scale) {
  const tickCounts = axes.getTickCounts();
  let textValues = axes.getTextValues();
  const labels = new Array(3);
  const ticks = new Array(3);
  let start = 0;
  for (var i = 0; i < 2; i++) {
    let factor = i === 0 ? scale : 1;
    // We only want x and y values for 2D plots, hence i < 2
    let numLabels = tickCounts[i] + 1;
    labels[i] = textValues.slice(start + 1, start + numLabels);
    ticks[i] = textValues.slice(start + 1, (start += numLabels)).map((v) => {
      if (v.startsWith("−")) {
        // The negative values are stored with an em dash rather than a dash
        return parseFloat(v.slice(1)) * factor * -1;
      }
      return parseFloat(v) * factor;
    });
  }
  // Hardcode the z values that we're not using
  labels[2] = ["0"];
  ticks[2] = [0];
  const faces = [false, false, false, false, false, true];
  // Only place labels on the left and bottom of the axes
  const edges = [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0];
  return { faces, edges, ticks, labels };
}

/*
This function is a modified version of the defaultAutoLayout found at 
https://github.com/Kitware/vtk-js/blob/master/Sources/Rendering/Core/ScalarBarActor/index.js#L66-L146.
The purpose of this modified function is to retain auto-sizing functionality 
while enforcing a vertical scalar bar.
*/
export function scalarBarAutoLayout(model) {
  return (helper) => {
    // we don't do a linear scale, the proportions for
    // a 700 pixel window differ from a 1400
    const lastSize = helper.getLastSize();
    const xAxisAdjust = (lastSize[0] / 700) ** 0.8;
    const yAxisAdjust = (lastSize[1] / 700) ** 0.8;
    const minAdjust = Math.min(xAxisAdjust, yAxisAdjust);

    const axisTextStyle = helper.getAxisTextStyle();
    const tickTextStyle = helper.getTickTextStyle();
    Object.assign(axisTextStyle, model.axisTextStyle);
    Object.assign(tickTextStyle, model.tickTextStyle);

    // compute a reasonable font size first
    axisTextStyle.fontSize = Math.max(24 * minAdjust, 12);
    if (helper.getLastAspectRatio() > 1.0) {
      tickTextStyle.fontSize = Math.max(20 * minAdjust, 10);
    } else {
      tickTextStyle.fontSize = Math.max(16 * minAdjust, 10);
    }

    // rebuild the text atlas
    const textSizes = helper.updateTextureAtlas();

    // now compute the boxSize and pixel offsets, different algorithm
    // for horizonal versus vertical
    helper.setTopTitle(false);

    const boxSize = helper.getBoxSizeByReference();

    // if vertical
    if (helper.getLastAspectRatio() > 1.0) {
      helper.setTickLabelPixelOffset(0.4 * tickTextStyle.fontSize);
      helper.setAxisTitlePixelOffset(0.8 * axisTextStyle.fontSize);
    } else {
      // Would have been horizontal
      helper.setAxisTitlePixelOffset(2.0 * tickTextStyle.fontSize);
      helper.setTickLabelPixelOffset(0.5 * tickTextStyle.fontSize);
    }

    helper.setTickLabelPixelOffset(0.4 * tickTextStyle.fontSize);
    const tickWidth =
      (2.0 * (textSizes.tickWidth + helper.getTickLabelPixelOffset())) /
      lastSize[0];
    helper.setAxisTitlePixelOffset(0.8 * axisTextStyle.fontSize);
    // width required if the title is vertical
    const titleWidth =
      (2.0 * (textSizes.titleHeight + helper.getAxisTitlePixelOffset())) /
      lastSize[0];

    // Rotate the title and place it sideways
    boxSize[0] = tickWidth + 1.4 * titleWidth;
    helper.setBoxPosition([0.99 - boxSize[0], -0.92]);
    boxSize[1] = Math.max(1.2, Math.min(1.84 / yAxisAdjust, 1.84));

    // recomute bar segments based on positioning
    helper.recomputeBarSegments(textSizes);
  };
}

// Copied from the example at
// https://github.com/Kitware/vtk-js/blob/1400faebd8899265ad3ffb5f165ec624ce3389fe/Sources/Rendering/Core/ScalarBarActor/example/index.js#L44-L65
// Modified to use scientific notation
export function customGenerateTicks(numberOfTicks) {
  return (helper) => {
    const lastTickBounds = helper.getLastTickBounds();
    // compute tick marks for axes
    const scale = scaleLinear()
      .domain([0.0, 1.0])
      .range([lastTickBounds[0], lastTickBounds[1]]);
    const samples = scale.ticks(numberOfTicks);
    const ticks = samples.map((tick) => scale(tick));
    const tickFormat = format(".2e");
    const tickStrings = ticks.map(tickFormat);
    helper.setTicks(ticks);
    helper.setTickStrings(tickStrings);
  };
}

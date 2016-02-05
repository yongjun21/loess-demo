/* global Plotly */
import Loess from 'loess'
import gasData from '../data/gas.json'
import ethanolData from '../data/ethanol.json'

const model2D = new Loess({y: gasData.NOx, x: gasData.E}, {span: 0.8, band: 0.8})
const x_new2D = model2D.grid([30])
const fit2D = model2D.predict(x_new2D)

const model3D = new Loess({y: ethanolData.NOx, x: ethanolData.C, x2: ethanolData.E})
const x_new3D = model3D.grid([30, 30])
const fit3D = model3D.predict(x_new3D)

const container2D = document.getElementById('chart2D')
const container3D = document.getElementById('chart3D')

const layout2D = {
  title: 'LOESS Smoothing - 2D chart demo',
  titlefont: {
    size: 30
  },
  hovermode: 'closest'
}

const scatter2D = {
  name: 'Actual',
  x: model2D.x[0],
  y: model2D.y,
  type: 'scatter',
  mode: 'markers',
  marker: {
    color: 'black',
    size: 4,
    symbol: 'circle-open'
  }
}

const fitted2D = {
  name: 'Fitted',
  x: x_new2D.x,
  y: fit2D.fitted,
  type: 'scatter',
  mode: 'lines',
  line: {
    shape: 'spline',
    color: 'black',
    width: 1
  }
}

const lowerLimit = {
  x: x_new2D.x,
  y: fit2D.fitted.map((yhat, idx) => yhat - fit2D.halfwidth[idx]),
  type: 'scatter',
  mode: 'none',
  fill: 'tozeroy',
  fillcolor: 'rgba(0, 0, 0, 0)',
  showlegend: false
}

const upperLimit = {
  name: 'Uncertainty',
  x: x_new2D.x,
  y: fit2D.fitted.map((yhat, idx) => yhat + fit2D.halfwidth[idx]),
  type: 'scatter',
  mode: 'none',
  fill: 'tonexty',
  fillcolor: 'pink'
}

const dataset2D = [lowerLimit, upperLimit, scatter2D, fitted2D]

const layout3D = {
  title: 'LOESS Smoothing - 3D chart demo',
  titlefont: {
    size: 30
  },
  hovermode: 'closest'
}

const scatter3D = {
  name: 'Actual',
  x: model3D.x[0],
  y: model3D.x[1],
  z: model3D.y,
  type: 'scatter3d',
  mode: 'markers',
  marker: {
    color: 'black',
    size: 3
  }
}

const surfaceZ = []
for (let i = 0; i < 30; i++) {
  const bandZ = []
  for (let j = 0; j < 30; j++) {
    bandZ.push(fit3D.fitted[j * 30 + i])
  }
  surfaceZ.push(bandZ)
}

const fitted3D = {
  name: 'Fitted',
  x: x_new3D.x_cut,
  y: x_new3D.x_cut2,
  z: surfaceZ,
  type: 'surface',
  opacity: 0.9
}

const dataset3D = [scatter3D, fitted3D]

Plotly.newPlot(container2D, dataset2D, layout2D)
Plotly.newPlot(container3D, dataset3D, layout3D)

document.getElementById('control-panel').style.visibility = 'visible'
const submitButton = document.querySelector('input[type="submit"]')
const option_span = document.querySelector('input[name="span"]')
const option_band = document.querySelector('input[name="band"]')
const option_cuts = document.querySelector('input[name="cuts"]')
const option_degree = document.querySelectorAll('input[name="degree"]')

function replot () {
  const options = {
    span: +option_span.value,
    band: +option_band.value,
    degree: Array.from(option_degree)
      .filter(radio => radio.checked)[0].value
  }
  const cuts = +option_cuts.value

  const modelRe = new Loess({y: gasData.NOx, x: gasData.E}, options)
  const x_newRe = modelRe.grid([cuts])
  const fitRe = modelRe.predict(x_newRe)

  console.log(fitRe)

  Object.assign(lowerLimit, {
    x: x_newRe.x,
    y: fitRe.fitted.map((yhat, idx) => yhat - fitRe.halfwidth[idx])
  })

  Object.assign(upperLimit, {
    x: x_newRe.x,
    y: fitRe.fitted.map((yhat, idx) => yhat + fitRe.halfwidth[idx])
  })

  Object.assign(fitted2D, {
    x: x_newRe.x,
    y: fitRe.fitted
  })

  Plotly.newPlot(container2D, dataset2D, layout2D)
}

submitButton.addEventListener('click', replot)

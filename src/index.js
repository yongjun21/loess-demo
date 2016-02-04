/* global Plotly */
import Loess from 'loess'
import gasData from '../data/gas.json'

const model = new Loess({y: gasData.NOx, x: gasData.E}, {band: 0.8})
const fit = model.predict()

const container2D = document.getElementById('chart2D')

const layout = {
  hovermode: 'closest'
}

const dataset2D = [
  {
    name: 'Lower limit',
    x: gasData.E,
    y: fit.fitted.map((yhat, idx) => yhat - fit.halfwidth[idx]),
    type: 'scatter',
    mode: 'none',
    fill: 'tozeroy',
    fillcolor: 'rgba(0, 0, 0, 0)'
  }, {
    name: 'Upper limit',
    x: gasData.E,
    y: fit.fitted.map((yhat, idx) => yhat + fit.halfwidth[idx]),
    type: 'scatter',
    mode: 'none',
    fill: 'tonexty',
    fillcolor: 'pink'
  }, {
    name: 'Actual',
    x: gasData.E,
    y: gasData.NOx,
    type: 'scatter',
    mode: 'markers',
    marker: {
      color: 'black',
      size: 4
    }
  }, {
    name: 'Fitted',
    x: gasData.E,
    y: fit.fitted,
    type: 'scatter',
    mode: 'lines',
    line: {
      color: 'black',
      width: 1
    }
  }
]

Plotly.plot(container2D, dataset2D, layout)

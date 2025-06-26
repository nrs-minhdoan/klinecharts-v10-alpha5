import { init } from 'klinecharts';

const chart = init(
  'init-decimalFold-none-chart',
  { decimalFold: { threshold: 1000 } }
)

chart.setPrecision({ price: 10 })

fetch('https://klinecharts.com/datas/kline2.json')
  .then(res => res.json())
  .then(dataList => { chart.applyNewData(dataList); });

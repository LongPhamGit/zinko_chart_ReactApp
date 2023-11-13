/****************************************************************************
* 機能　　　　　　　: 首都圏の総人口の情報を表示する
* 戻り値           : -
* 引数          　 :  なし
* Create          ：2023/11/13 LongPham
'*****************************************************************************/
import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';
import config from './config';

function App() {
  const [populationData, setPopulationData] = useState([]);
  const [chartExists, setChartExists] = useState(false);
  const [boundaryYear, setBoundaryYear] = useState(null);
  //const chartRef = React.createRef();

  useEffect(() => {
    // チャートを作成関数
    const createChart = (id, labels, data1, data2, data3) => {
      const ctx = document.getElementById(id);
      //ctx = chartRef.current.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: '東京',
              data: data1,
              borderColor: 'rgba(255, 0, 0, 1)',
              borderWidth: 2,
              fill: false,
            },
            {
              label: '埼玉県',
              data: data2,
              borderColor: 'rgba(255, 0, 255, 1)',
              borderWidth: 2,
              fill: false,
            },
            {
              label: '千葉県',
              data: data3,
              borderColor: 'rgba(0, 0, 255, 1)',
              borderWidth: 2,
              fill: false,
            },
          ],
        },
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: '年代',
              },
            },
            y: {
              title: {
                display: true,
                text: '総人口',
              },
            },
          },
        },
      });
      setChartExists(true);
    };

    // clean chart func
    const destroyChart = (id) => {
      const ctx = document.getElementById(id);
      const chart = Chart.getChart(ctx);
      if (chart) {
        chart.destroy();
      }
    };

    axios
      .get('https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=13', {
        headers: {
          'X-API-KEY': config.apiKey,
        },
      })
      .then((response1) => {
        if (response1.data.result) {
          const boundaryYear = response1.data.result.boundaryYear;
          setBoundaryYear(boundaryYear); // save boundaryYear to state
          console.log('boundaryYear:', boundaryYear); // print console

          const data1 = response1.data.result.data.find(
            (item) => item.label === '総人口'
          ).data;

          axios
            .get('https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=12', {
              headers: {
                'X-API-KEY': config.apiKey,
              },
            })
            .then((response2) => {
              if (response2.data.result) {
                const data2 = response2.data.result.data.find(
                  (item) => item.label === '総人口'
                ).data;

                axios
                  .get('https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=11', {
                    headers: {
                      'X-API-KEY': config.apiKey,
                    },
                  })
                  .then((response3) => {
                    if (response3.data.result) {
                      const data3 = response3.data.result.data.find(
                        (item) => item.label === '総人口'
                      ).data;

                      const years = data1.map((item) => item.year);
                      const population1 = data1.map((item) => item.value);
                      const population2 = data2.map((item) => item.value);
                      const population3 = data3.map((item) => item.value);

                      // グラフのcache等をクリア
                      //if (chartExists) {
                        destroyChart('populationChart');
                      //}

                      // グラフを制作
                      createChart('populationChart', years, population1, population2, population3);
                    }
                  })
                  .catch((error3) => {
                    console.error('error load data3 : ', error3);
                  });
              }
            })
            .catch((error2) => {
              console.error('error load data2: ', error2);
            });
        }
      })
      .catch((error1) => {
        console.error('error load data1: ', error1);
      });
  }, [chartExists]);

  return (
    <div className="App">
      <header style={{ textAlign: "center" }}>
        <h1>首都圏 (日本)の人口推移</h1>
        <h1>集計年: {boundaryYear}</h1>
      </header>
      
      <canvas id="populationChart" width="100px" height="30px"></canvas>
    </div>
  );
}

export default App;
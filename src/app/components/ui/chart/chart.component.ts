import { Component, ElementRef, EventEmitter, Input, Output, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { Chart, ChartOptions, ChartTypeRegistry, registerables } from 'chart.js';
import { ChartTitle } from '../../../services/chart/chart.service';

Chart.register(...registerables);

let width, height, gradient;
function getGradientBackground(ctx, chartArea) {
  const style = getComputedStyle(document.body);
  const theme = style.getPropertyValue('--theme').replace(/[ \"]/g, '');
  const chartWidth = chartArea.right - chartArea.left;
  const chartHeight = chartArea.bottom - chartArea.top;
  if (gradient === null || width !== chartWidth || height !== chartHeight) {
    width = chartWidth;
    height = chartHeight;
    gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    // gradient.addColorStop(1, '#5963ff88');
    // gradient.addColorStop(0.5, '#5963ff33');
    // gradient.addColorStop(0, '#5963ff19');
    if (theme === 'dark') {
      console.log('here');
      gradient.addColorStop(1, '#383d7d');
      gradient.addColorStop(0.5, '#2e304f');
      gradient.addColorStop(0, '#2a2c3f');
    } else {
      gradient.addColorStop(1, '#c2c5fc');
      gradient.addColorStop(0.5, '#e0e1fb');
      gradient.addColorStop(0, '#e8eafb');
    }
  }

  return gradient;
}

export enum ChartSeries {
  'day' = 'day',
  'week' = 'week',
  'month' = 'month',
  'year' = 'year'
}
@Component({
  selector: 'app-ui-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['../../../../scss/components/ui/chart/chart.component.scss']
})
export class ChartComponent {
  Object = Object;
  @Input() attributes: any = {};
  @Input() type: keyof ChartTypeRegistry = 'line';
  @Input() data = { datasets: [], labels: [] };
  @Input() datas = {};
  @Input() options: ChartOptions = {};
  @Input() design: string;
  @Input() ddSets = [];
  @Input() sets = [];
  @Input() set = '';
  @Input() units = {};
  @Input() layout = 'default';
  tooltipValue: string = '';
  @ViewChild('chart') chartRef: ElementRef;
  @Output('drawn') drawn = new EventEmitter();

  chart = null;
  series: ChartSeries = ChartSeries.day;
  ddExpanded = false;
  chartExpanded = false;

  constructor() {
    Chart.register({
      id: 'my-plugin',
      afterTooltipDraw: (chart, args, options) => {
        if (chart) {
          let x = chart.tooltip.dataPoints[0].element.x;
          let yAxis = chart.scales.y;
          let ctx = chart.ctx;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x, yAxis.bottom + 60);
          ctx.lineTo(x, yAxis.top + 60);
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 1]);
          ctx.strokeStyle = 'rgba(0, 0, 255, 0.3)';
          ctx.stroke();
          ctx.setLineDash([0, 0]);
          ctx.textAlign = 'center';
          if (x >= chart.chartArea.right + -30) {
            ctx.textAlign = 'right';
          } else if (x <= chart.chartArea.left + 30) {
            ctx.textAlign = 'left';
          }
          ctx.font = '14px sans-serif';
          ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--base-font-color-secondary');
          ctx.fillText(chart.tooltip.title[0], x, yAxis.top + 45);
          ctx.restore();
        }
      }
    });
  }

  toggleChartExpand() {
    this.chartExpanded = !this.chartExpanded;
    (this.chartRef.nativeElement as HTMLCanvasElement).parentElement.parentElement.classList.toggle('expanded');
  }

  refreshDDSets(): void {
    this.ddSets = this.sets?.sort(function (a, b) {
      const nameA = a.name.toLowerCase(),
        nameB = b.name.toLowerCase();
      if (nameA > nameB) return -1;
      if (nameA < nameB) return 1;
      return 0;
    });
  }

  draw(): void {
    if (this.set === ChartTitle.totalValueLocked) {
      const data = this.datas[this.series]?.datasets?.find((ds) => ds.label === ChartTitle.totalValueLocked).data;
      if (!data) {
        return;
      }
      this.tooltipValue = parseFloat(parseFloat(data[data.length - 1].toString()).toFixed(2)).toLocaleString();
    } else if (this.set === ChartTitle.XTZtzBTC) {
      const data = this.datas[this.series]?.datasets?.find((ds) => ds.label === ChartTitle.XTZtzBTC).data;
      if (!data) {
        return;
      }
      this.tooltipValue = parseFloat(data[data.length - 1].toString()).toFixed(8);
    } else if (this.set === ChartTitle.tzBTCXTZ) {
      const data = this.datas[this.series]?.datasets?.find((ds) => ds.label === ChartTitle.tzBTCXTZ).data;
      if (!data) {
        return;
      }
      this.tooltipValue = parseFloat(parseFloat(data[data.length - 1].toString()).toFixed(6)).toLocaleString();
    }

    if (this.chartRef?.nativeElement && this.datas[this.series]?.datasets) {
      const ctx = this.chartRef.nativeElement.getContext('2d');
      this.chart?.destroy();
      this.sets = this.data?.datasets.map((set) => ({ name: set.label }));
      this.chart = new Chart(ctx, {
        type: this.type,
        data: this.data,
        options: this.options,
        plugins: []
      });
      this.drawn.emit(null);
    }
  }
  toggleSeries(series): void {
    this.series = series;
    this.data = this.datas[series];
    this.overrideDatasetConfig();
    this.options = this.getChartOptions();
    this.draw();
  }
  toggleSet(set): void {
    this.reset();
    this.overrideDatasetConfig();
    for (let key of Object.keys(this.datas)) {
      for (let i = 0; i < this.datas[key].datasets.length; ++i) {
        if (this.datas[key].datasets[i].label === set) {
          this.datas[key].datasets[i].hidden = false;
          if (set === ChartTitle.XTZtzBTC) {
            this.units = 'tzBTC';
          } else if (set === ChartTitle.tzBTCXTZ) {
            this.units = 'XTZ';
          } else {
            this.toggleSeries(ChartSeries['month']);
            this.units = 'usd';
          }
        } else {
          this.datas[key].datasets[i].hidden = true;
        }
      }
    }
    this.data = this.datas[this.series];
    this.sets = this.data?.datasets.map((set) => ({ name: set.label }));
    this.set = set ?? this.sets[0].name;
    this.refreshDDSets();
    this.options = this.getChartOptions();
    this.draw();
  }
  reset(): void {
    this.ddSets = [];
    this.sets = [];
    this.set = '';
    this.data = null;
  }
  overrideDatasetConfig(): void {
    for (let i = 0; i < this.datas[this.series]?.datasets.length; ++i) {
      this.datas[this.series].datasets[i].pointHoverBorderWidth = this.design === 'mini' && !this.chartExpanded ? 0 : 6;
      this.datas[this.series].datasets[i].pointHitRadius = this.design === 'mini' && !this.chartExpanded ? 0 : 6;
      this.datas[this.series].datasets[i].pointHoverBackgroundColor = this.design === 'mini' && !this.chartExpanded ? '#00000000' : '#5963ff88';
      this.datas[this.series].datasets[i].pointHoverBorderColor = this.design === 'mini' && !this.chartExpanded ? '#00000000' : '#5963ff88';
      this.datas[this.series].datasets[i].pointBackgroundColor = this.design === 'mini' && !this.chartExpanded ? '#00000000' : '#5963ff88';
      this.datas[this.series].datasets[i].backgroundColor = function (context) {
        const chart = context.chart;
        const { ctx, chartArea } = chart;

        if (!chartArea) {
          return null;
        }
        return getGradientBackground(ctx, chartArea);
      };
    }
  }
  getChartOptions(): any {
    let yTickPadding = -102;
    if (this.set === ChartTitle.tzBTCXTZ) {
      yTickPadding = -71;
    } else if (this.set === ChartTitle.totalValueLocked) {
      yTickPadding = -95;
    }
    return {
      layout: {
        padding: 0
      },
      scales: {
        y: {
          beginAtZero: false,
          position: 'right',
          ticks: {
            maxTicksLimit: 5,
            display: this.design === 'mini' && this.chartExpanded === false ? false : true,
            padding: yTickPadding,
            align: 'start',
            font: {
              size: 14,
              weight: 500,
              family: 'Roboto'
            },
            textStrokeColor: '#333',
            z: 1,
            callback: (label, index, ticks) => {
              if (index >= 1 && index < 4) {
                return label < 1 ? label.toFixed(8) : Number(label.toFixed(8).replace(/(\.0+|0+)$/, '')).toLocaleString();
              } else {
                return '';
              }
            }
          },
          grid: {
            drawBorder: false,
            lineWidth: 0
          }
        },
        x: {
          ticks: {
            maxTicksLimit: 0,
            display: false
          },
          grid: {
            drawBorder: false,
            lineWidth: 0
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: false
      },
      hover: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      tooltips: {
        mode: 'index',
        axis: 'x',
        intersect: false
      },
      interaction: {
        intersect: false,
        mode: 'index',
        axis: 'x'
      },
      elements: {
        line: {
          tension: 0.0
        },
        point: {
          radius: 0
        }
      },
      plugins: {
        tooltip: {
          enabled: this.design === 'mini' && !this.chartExpanded ? false : true,
          mode: 'nearest',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.0)',
          titleColor: 'rgba(0, 0, 0, 0.0)',
          bodyColor: 'rgba(0, 0, 0, 0.0)',
          footerColor: 'rgba(0, 0, 0, 0.0)',
          displayColors: false,
          callbacks: {
            label: (item, a, b) => {
              this.tooltipValue =
                item.dataset.data[item.dataIndex] < 1
                  ? item.dataset.data[item.dataIndex].toFixed(8).toLocaleString()
                  : parseFloat(item.dataset.data[item.dataIndex].toFixed(2).replace(/(\.0+|0+)$/, '')).toLocaleString() ?? '';
              return parseFloat(item.dataset.data[item.dataIndex].toFixed(8)).toLocaleString();
            }
          }
        },
        legend: { display: false }
      }
    };
  }
}

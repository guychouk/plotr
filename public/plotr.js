function range(length) {
  return Array.apply(null, Array(length)).map(function(value, index) {
    return index;
  });
}

function createDataset(label, data) {
  const randColor = '#' + Math.random().toString(16).slice(2, 8);
  return {
    data,
    label,
    pointRadius: 0,
    backgroundColor: randColor,
    borderColor: randColor,
  };
}

function parseTsvFile(tsvFile) {
  const lines = tsvFile.split('\n');
  const headers = lines[0].split('\t');
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const d = {};
    const line = lines[i];
    const parts = line.split('\t');
    for (let i = 0; i < headers.length; i++) {
      d[headers[i]] = parts[i];
    }
    data.push(d);
  }
  return data;
}

const customBackgroundColorPlugin = {
  id: 'custom_canvas_background_color',
  beforeDraw: (chart) => {
    const ctx = chart.canvas.getContext('2d');
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  }
};

const lineChart = {
  type: 'line',
  plugins: [customBackgroundColorPlugin],
  options: {
    elements: {
      line: {
        tension: 0.4
      }
    },
    plugins: {
      legend: {
        labels: {
          font: {
            size: 14
          }
        }
      }
    },
    devicePixelRatio: 1.5,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Request',
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Response Time (ms)',
        },
      }
    }
  },
  data: {
    labels: range(1000),
    datasets: [],
  },
};

const canvas = document.getElementById('plot');
const ctx = canvas.getContext('2d');
const chart = new Chart(ctx, lineChart);

const saveAsPng = document.getElementById('save-as-png');
saveAsPng.onclick = function() {
  const img = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = img;
  a.download = 'myChart.png';
  a.click();
}

const clearAll = document.getElementById('clear-all');
clearAll.onclick = function() {
  chart.data.datasets = [];
  chart.update();
};

const fileInput = document.getElementById("file-input");
fileInput.onclick = function() {
  const tmp = document.createElement('input');
  tmp.type = 'file';
  tmp.multiple = true;
  tmp.onchange = function() {
    const files = this.files;
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const d = parseTsvFile(e.target.result);
        chart.data.datasets.push(createDataset(files[i].name, _.map(d, 'ttime')));
        if (chart.data.labels.length === 0) {
          chart.data.labels = range(chart.data.datasets[0].data.length);
        }
        chart.update();
      }
      reader.readAsText(files[i]);
    }
  }
  tmp.click();
};
fileInput.ondragover = function(e) {
  e.preventDefault();
  e.stopPropagation();
  return false;
};
fileInput.ondrop = function(e) {
  e.preventDefault();
  e.stopPropagation();
  const files = e.dataTransfer.files;
  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();
    reader.onload = function(e) {
      chart.data.datasets.push(createDataset(files[i].name, _.map(d, 'ttime')));
      if (chart.data.labels.length === 0) {
        chart.data.labels = range(chart.data.datasets[0].data.length);
      }
      chart.update();
    }
    reader.readAsText(files[i]);
  }
}

function range(length) {
  return Array.apply(null, Array(length)).map(function(value, index) {
    return index;
  });
}

function createDragAndDrop() {
  /* create drag and drop div for input files and connect to input */
  var input = document.createElement('div');
  input.id = 'input';
  input.innerHTML = 'Click or Drag .dat files from Apache benchmark';
  input.style.width = '100%';
  input.style.height = '100%';
  input.style.backgroundColor = '#f0f0f0';
  input.style.border = '1px solid #ccc';
  input.style.borderRadius = '5px';
  input.style.textAlign = 'center';
  input.style.fontFamily = 'Arial';
  input.style.padding = '20px';
  input.style.margin = '20px';
  input.style.cursor = 'pointer';
  input.style.userSelect = 'none';
  input.onclick = function() {
    const tmp = document.createElement('input');
    tmp.type = 'file';
    tmp.multiple = true;
    tmp.onchange = function() {
      const files = this.files;
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = function(e) {
          console.log(e.target, files[i].name);
          const d = parseDat(e.target.result);
          chart.data.datasets.push(createDataset(files[i].name, _.map(d, 'ttime')));
          chart.update();
        }
        reader.readAsText(files[i]);
      }
    }
    tmp.click();
  };
  input.ondragover = function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };
  input.ondrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const d = parseDat(e.target.result);
        chart.data.datasets.push(createDataset(files[i].name, _.map(d, 'ttime')));
        chart.update();
      }
      reader.readAsText(files[i]);
    }
  }
  return input;
}

function randomString(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

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

function parseDat(dat) {
  const lines = dat.split('\n');
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

const plugin = {
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
  plugins: [plugin],
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

// Canvas
const canvas = document.createElement('canvas');
canvas.width = 600;
canvas.height = 600;
const div = document.createElement('div');
div.style.maxWidth = "600px";
div.style.maxHeight = "600px";
div.appendChild(canvas);
document.body.prepend(div);

var ctx = canvas.getContext('2d');
var input = document.createElement('input');
const chart = new Chart(ctx, lineChart);

var saveAsPng = document.createElement('button');
saveAsPng.innerHTML = 'Save as PNG';
saveAsPng.onclick = function() {
  var img = canvas.toDataURL('image/png');
  var a = document.createElement('a');
  a.href = img;
  a.download = 'myChart.png';
  a.click();
}
document.body.prepend(saveAsPng);

var clearAll = document.createElement('button');
clearAll.innerHTML = 'Clear All';
clearAll.onclick = function() {
  chart.data.datasets = [];
  chart.update();
};
document.body.prepend(clearAll);

document.body.prepend(createDragAndDrop());

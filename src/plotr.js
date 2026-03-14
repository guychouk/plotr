function parseTsvFiles(files, callback) {
  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();
    reader.onloadend = (function (file) {
      return _.partial(callback, _, file);
    })(files[i]);
    reader.readAsText(files[i]);
  }
}

function onFileParseUpdateChart(evt, file) {
  const tsvText = evt.target.result;
  const lines = tsvText.split("\n").filter((l) => l !== "");
  const headers = _.head(lines).split("\t");
  const data = _.drop(lines, 1).map((line) =>
    _.zipObject(headers, line.split("\t"))
  );
  const randColor = "#" + Math.random().toString(16).slice(2, 8);
  const dataset = {
    data: _.map(data, "ttime"),
    label: file.name,
    pointRadius: 0,
    borderColor: randColor,
    backgroundColor: randColor,
  };
  chart.data.datasets.push(dataset);
  if (chart.data.labels.length === 0) {
    chart.data.labels = _.range(1, chart.data.datasets[0].data.length);
  }
  chart.update();
}

const customBackgroundColorPlugin = {
  id: "custom_canvas_background_color",
  beforeDraw: (chart) => {
    const ctx = chart.canvas.getContext("2d");
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

const lineChart = {
  type: "line",
  plugins: [customBackgroundColorPlugin],
  options: {
    elements: {
      line: {
        tension: 0.4,
      },
    },
    plugins: {
      legend: {
        labels: {
          font: {
            size: 14,
          },
        },
      },
    },
    devicePixelRatio: 1.5,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Request",
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Response Time (ms)",
        },
      },
    },
  },
  data: {
    labels: _.range(1, 1000),
    datasets: [],
  },
};

const canvas = document.getElementById("plot");
const ctx = canvas.getContext("2d");
const chart = new Chart(ctx, lineChart);

const saveAsPng = document.getElementById("save-as-png");

saveAsPng.onclick = function () {
  const img = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = img;
  a.download = "myChart.png";
  a.click();
};

const clearAll = document.getElementById("clear-all");

clearAll.onclick = function (e) {
  chart.data.datasets = [];
  chart.update();
};

const fileInput = document.getElementById("file-input");

fileInput.onclick = function (e) {
  const tmp = document.createElement("input");
  tmp.type = "file";
  tmp.multiple = true;
  tmp.onchange = function (e) {
    e.preventDefault();
    e.stopPropagation();
    parseTsvFiles(e.target.files, onFileParseUpdateChart);
  };
  tmp.click();
};

fileInput.ondragover = function (e) {
  e.preventDefault();
  e.stopPropagation();
  return false;
};

fileInput.ondrop = function (e) {
  e.preventDefault();
  e.stopPropagation();
  const files = e.dataTransfer.files;
  parseTsvFiles(files, onFileParseUpdateChart);
};

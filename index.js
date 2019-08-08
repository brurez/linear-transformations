const shapes = {
  arrow: [
    [[20], [20], [1]],
    [[100], [20], [1]],
    [[120], [60], [1]],
    [[100], [100], [1]],
    [[20], [100], [1]],
    [[40], [60], [1]]
  ]
};

const shape = shapes.arrow;
let tShape = [shape];

const Transformations = {
  matrices: {
    yReflection(enabled) {
      return enabled ? [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] : this.identity;
    },
    xReflection(enabled) {
      return enabled ? [[1, 0, 0], [0, -1, 0], [0, 0, 1]] : this.identity;
    },
    xScale(amount) {
      return [[amount, 0, 0], [0, 1, 0], [0, 0, 1]];
    },
    yScale(amount) {
      return [[1, 0, 0], [0, amount, 0], [0, 0, 1]];
    },
    xTranslation(amount) {
      return [[1, 0, amount], [0, 1, 0], [0, 0, 1]];
    },
    yTranslation(amount) {
      return [[1, 0, 0], [0, 1, amount], [0, 0, 1]];
    },
    rotation(angle) {
      const sin = Math.sin((angle * 2 * Math.PI) / 360);
      const cos = Math.cos((angle * 2 * Math.PI) / 360);

      return [[cos, -sin, 0], [sin, cos, 0], [0, 0, 1]];
    },
    identity: [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
  },
  compute(params) {
    const { matrices } = this;

    const transformations = [
      "xScale",
      "yScale",
      "xTranslation",
      "yTranslation",
      "rotation",
      "xReflection",
      "yReflection"
    ];

    tShape = [shape];
    let resultMatrix = this.matrices.identity;
    transformations.forEach(trans => {
      resultMatrix = Matrices.multiply(
        matrices[trans](params[trans]),
        resultMatrix
      );
    });
  }
};

const Panel = {
  initialize(element, transformations) {
    this.transformations = transformations;
    this.container = document.querySelector(element);
    this.container.addEventListener("change", this.handleChange.bind(this));
    const resetButton = this.container.querySelector(".resetButton");
    resetButton.addEventListener("click", this.resetState.bind(this));

    this.controls = document.createElement("ul");
    this.container.appendChild(this.controls);

    this.templates.appendDropZone(0, this.controls);

    this.transformations.forEach((trans, index) => {
      this.templates.appendTransControl(trans, index, this.controls);
      this.templates.appendDropZone(index + 1, this.controls);
    });

    this.initialState = this.getState();
  },
  getState() {
    const state = [];
    const inputs = this.container.querySelectorAll("input");
    for (let input of inputs) {
      if (input.type === "checkbox") {
        state.push({ transformation: input.name, param: input.checked });
      } else {
        state.push({ transformation: input.name, param: input.value });
      }
    }
    return state;
  },
  resetState() {
    const state = this.initialState;
    const inputs = this.container.querySelectorAll("input");
    for (let input of inputs) {
      if (input.type === "checkbox") {
        input.checked = state[input.name];
      } else {
        input.value = state[input.name];
      }
    }
    this.handleChange();
  },
  handleChange() {
    const panelState = this.getState();
    Transformations.compute(panelState);
  },
  templates: {
    getIndex(item) {
      let transItems = Array.prototype.slice.call(Panel.controls.children);
      transItems = transItems.filter(i => item.className === i.className);
      return transItems.indexOf(item);
    },
    appendDropZone(index, targetElem) {
      const dropZone = document.createElement("div");
      dropZone.className = "drop-zone";
      dropZone.dataset.index = index;

      dropZone.ondragover = function(e) {
        e.preventDefault();
        dropZone.style.height = "1.6em";
        dropZone.style.border = "1px dashed gray";
      };

      dropZone.ondragleave = function(e) {
        e.preventDefault();
        dropZone.style.height = "0.3em";
        dropZone.style.border = "initial";
      };

      dropZone.ondrop = function(e) {
        e.preventDefault();
        dropZone.style.height = "0.3em";
        dropZone.style.border = "initial";
        const index = e.dataTransfer.getData('text/plain');
        const control = Panel.controls.querySelectorAll('.draggable')[index];
        const dropZoneBellow = control.nextSibling;
        dropZone.after(dropZoneBellow);
        dropZone.after(control);
      };

      targetElem.appendChild(dropZone);
    },
    appendTransControl(trans, index, targetElem) {
      const transItem = document.createElement("li");
      transItem.className = 'draggable';
      transItem.innerHTML = this[trans];
      const handle = transItem.querySelector(".handle");
      const handleColor =
        transItem.dataset.color ||
        `rgb(${parseInt(Math.random() * 255)},${parseInt(
          Math.random() * 255
        )},${parseInt(Math.random() * 255)})`;
      handle.style.backgroundColor = handleColor;
      transItem.dataset.color = handleColor;
      transItem.dataset.index = index;

      handle.onmousedown = function(e) {
        e.target.parentNode.parentNode.setAttribute("draggable", "true");
      };

      handle.onmouseup = function(e) {
        e.target.parentNode.parentNode.setAttribute("draggable", "false");
      };

      transItem.ondragstart = (e) => {
        e.dataTransfer.setData("text/plain", this.getIndex(transItem));
      };

      transItem.ondrag = (e) => {
        transItem.style.display = "none";
      };

      transItem.ondragend = function(e) {
        e.target.setAttribute("draggable", "false");
        transItem.style.display = "block";
      };

      targetElem.appendChild(transItem);
    },
    xScale: `
      <label>
        <span class="handle">&#8597;</span>
        X scale:
        <input
          type="range"
          name="xScale"
          class="xScale"
          min="0.1"
          max="3"
          value="1"
          step="0.1"
        />
      </label>
    `,
    yScale: `
      <label>
        <span class="handle">&#8597;</span>
        Y scale:
        <input
          type="range"
          name="yScale"
          class="yScale"
          min="0.1"
          max="3"
          value="1"
          step="0.1"
        />
      </label>
    `,
    xTranslation: `
      <label>
        <span class="handle">&#8597;</span>
        X trans.:
        <input
          type="range"
          name="xTranslation"
          class="xTranslation"
          min="-200"
          max="200"
          value="0"
        />
      </label>
    `,
    yTranslation: `
      <label>
        <span class="handle">&#8597;</span>
        Y trans.:
        <input
          type="range"
          name="yTranslation"
          class="yTranslation"
          min="-200"
          max="200"
          value="0"
        />
      </label>
    `,
    rotation: `
      <label>
        <span class="handle">&#8597;</span>
        Rotation:
        <input
          type="range"
          name="rotation"
          class="rotation"
          min="0"
          max="360"
          value="0"
        />
      </label>
    `,
    yReflection: `
      <label>
        <span class="handle">&#8597;</span>
        Y axis reflection:
        <input type="checkbox" name="yReflection" class="yReflection" />
      </label>
    `,
    xReflection: `
      <label>
        <span class="handle">&#8597;</span>
        X axis reflection:
        <input type="checkbox" name="xReflection" class="xReflection" />
      </label>
    `
  }
};

function printVertex(s) {
  for (let i = 0; i < s.length; i++) {
    console.table(s[i]);
  }
}

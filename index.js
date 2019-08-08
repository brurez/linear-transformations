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
let transShapes = [];

const Transformations = {
  matrices: {
    yReflection(enabled) {
      return enabled ? [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] : this.identity();
    },
    xReflection(enabled) {
      return enabled ? [[1, 0, 0], [0, -1, 0], [0, 0, 1]] : this.identity();
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
    identity() {
      return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    }
  },
  compute(state) {
    const { matrices } = this;
    transShapes = [{ points: shape }];
    let resultMatrix = this.matrices.identity();
    state.forEach(item => {
      resultMatrix = Matrices.multiply(
        matrices[item.transformation](item.param),
        resultMatrix
      );

      const points = shape.map(point => {
        return Matrices.multiply(resultMatrix, point);
      });

      transShapes.push({ points, color: item.color });
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

    this.templates.appendDropZone(this.controls);

    this.transformations.forEach((trans) => {
      this.templates.appendTransControl(trans, this.controls);
      this.templates.appendDropZone(this.controls);
    });

    const addTransButton = this.container.querySelector('.addTransButton');
    const addTransSelect = this.container.querySelector('.addTransSelect');

    addTransButton.onclick = e => {
      this.templates.appendTransControl(addTransSelect.value, this.controls);
      this.templates.appendDropZone(this.controls);
    };

    this.initialState = this.getState();
    this.handleChange();
  },
  getState() {
    const state = [];
    const inputs = this.container.querySelectorAll("input");
    for (let input of inputs) {
      const color = input.closest('li').dataset.color;
      if (input.type === "checkbox") {
        state.push({ color, transformation: input.name, param: !!input.checked });
      } else {
        state.push({ color, transformation: input.name, param: Number(input.value) });
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
    appendDropZone(targetElem) {
      const dropZone = document.createElement("div");
      dropZone.className = "drop-zone";

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
        const index = e.dataTransfer.getData("text/plain");
        const control = Panel.controls.querySelectorAll(".draggable")[index];
        const dropZoneBellow = control.nextSibling;
        dropZone.after(dropZoneBellow);
        dropZone.after(control);
        Panel.handleChange();
      };

      targetElem.appendChild(dropZone);
    },
    appendTransControl(trans, targetElem) {
      const transItem = document.createElement("li");
      transItem.className = "draggable";
      transItem.innerHTML = this[trans];

      const handle = transItem.querySelector(".handle");
      const remove = transItem.querySelector(".remove");

      remove.onclick = () =>  {
        transItem.remove();
        Panel.handleChange();
      };

      const handleColor =
        transItem.dataset.color ||
        `rgba(${parseInt(Math.random() * 255)},${parseInt(
          Math.random() * 255
        )},${parseInt(Math.random() * 255)},0.7)`;
      handle.style.backgroundColor = handleColor;
      transItem.dataset.color = handleColor;

      handle.onmousedown = function(e) {
        e.target.parentNode.parentNode.setAttribute("draggable", "true");
      };

      handle.onmouseup = function(e) {
        e.target.parentNode.parentNode.setAttribute("draggable", "false");
      };

      transItem.ondragstart = e => {
        e.dataTransfer.setData("text/plain", this.getIndex(transItem));
      };

      transItem.ondrag = e => {
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
        <span class="remove">X</span>
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
        <span class="remove">X</span>
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
        <span class="remove">X</span>
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
        <span class="remove">X</span>
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
        <span class="remove">X</span>
      </label>
    `,
    yReflection: `
      <label>
        <span class="handle">&#8597;</span>
        Y axis reflection:
        <input type="checkbox" name="yReflection" class="yReflection" />
        <span class="remove">X</span>
      </label>
    `,
    xReflection: `
      <label>
        <span class="handle">&#8597;</span>
        X axis reflection:
        <input type="checkbox" name="xReflection" class="xReflection" />
        <span class="remove">X</span>
      </label>
    `
  }
};

function printVertex(s) {
  for (let i = 0; i < s.length; i++) {
    console.table(s[i]);
  }
}

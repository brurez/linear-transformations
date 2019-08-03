const shapes = {
  arrow: [
    [[20], [20], [1]],
    [[100], [20], [1]],
    [[120], [60], [1]],
    [[100], [100], [1]],
    [[20], [100], [1]],
    [[40], [60], [1]],
  ]
};

const shape = shapes.arrow;
let tShape = [...shape];

const Transformations = {
  yReflection: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]],
  xReflection: [[1, 0, 0], [0, -1, 0], [0, 0, 1]],
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
  compute(params) {
    const {
      rotation,
      xReflection,
      yReflection,
      xScale,
      yScale,
      xTranslation,
      yTranslation
    } = params;

    for (let i = 0; i < shape.length; i++) {
      tShape[i] = shape[i];

      // compute scaling
      tShape[i] = Matrices.multiply(
        Transformations.xScale(xScale),
        tShape[i]
      );
      tShape[i] = Matrices.multiply(
        Transformations.yScale(yScale),
        tShape[i]
      );

      // compute translation
      tShape[i] = Matrices.multiply(
        Transformations.xTranslation(xTranslation),
        tShape[i]
      );
      tShape[i] = Matrices.multiply(
        Transformations.yTranslation(yTranslation),
        tShape[i]
      );

      // compute rotation
      tShape[i] = Matrices.multiply(
        Transformations.rotation(rotation),
        tShape[i]
      );

      // compute reflections
      if (yReflection) {
        tShape[i] = Matrices.multiply(
          Transformations.yReflection,
          tShape[i]
        );
      }
      if (xReflection) {
        tShape[i] = Matrices.multiply(
          Transformations.xReflection,
          tShape[i]
        );
      }
    }

    printVertex(tShape);
  }
};

const Panel = {
  initialize(element) {
    this.container = document.querySelector(element);
    this.container.addEventListener(
      "change",
      this.handleChange.bind(this)
    );
    const resetButton = this.container.querySelector(".resetButton");
    resetButton.addEventListener("click", this.resetState.bind(this));
    this.initialState = this.getState();
  },
  getState() {
    const state = {};
    const inputs = this.container.querySelectorAll("input");
    for (let input of inputs) {
      if (input.type === "checkbox") {
        state[input.name] = input.checked;
      } else {
        state[input.name] = input.value;
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
  }
};

function printVertex(s) {
  for (let i = 0; i < s.length; i++) {
    console.table(s[i]);
  }
}